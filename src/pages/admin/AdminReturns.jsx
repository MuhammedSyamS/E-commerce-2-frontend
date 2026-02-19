import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { RefreshCw, Search, Filter, Eye, Truck, Check, X, AlertCircle } from 'lucide-react';
import AlertModal from '../../components/ui/AlertModal';

const AdminReturns = () => {
    const { user } = useStore();
    const [returns, setReturns] = useState([]);
    const [filteredReturns, setFilteredReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const [viewMedia, setViewMedia] = useState(null);

    const [alertState, setAlertState] = useState({ show: false, title: '', message: '', type: 'info' });
    const showAlert = (title, message, type = 'info') => {
        setAlertState({ show: true, title, message, type });
    };

    const fetchReturns = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/returns/admin', config);
            setReturns(data);
            setFilteredReturns(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
            showAlert('Error', 'Failed to fetch returns data', 'error');
        }
    };

    useEffect(() => {
        fetchReturns();
    }, [user.token]);

    useEffect(() => {
        let result = returns;
        if (activeTab !== 'All') {
            result = result.filter(r => r.status === activeTab);
        }
        if (searchTerm) {
            result = result.filter(r =>
                r.order?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredReturns(result);
    }, [activeTab, searchTerm, returns]);

    const [rejectModal, setRejectModal] = useState({ show: false, returnId: null, reason: '' });

    const handleAction = async (id, action, extraData = {}) => {
        if (action === 'Reject') {
            setRejectModal({ show: true, returnId: id, reason: '' });
            return;
        }

        if (!window.confirm(`Are you sure you want to ${action}?`)) return;

        await executeAction(id, action, extraData);
    };

    const confirmReject = async () => {
        if (!rejectModal.returnId || !rejectModal.reason) return;
        await executeAction(rejectModal.returnId, 'Reject', { adminComment: rejectModal.reason });
        setRejectModal({ show: false, returnId: null, reason: '' });
    };

    const executeAction = async (id, action, extraData = {}) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            let status = '';

            if (action === 'Approve') status = 'Approved';
            if (action === 'Reject') status = 'Rejected';
            if (action === 'Schedule Pickup') status = 'Pickup Scheduled';
            if (action === 'Mark Picked Up') status = 'Picked Up';
            if (action === 'Mark Received') status = 'QC Pending'; // Auto to QC
            if (action === 'Pass QC') status = 'QC Passed';
            if (action === 'Fail QC') status = 'QC Failed';

            if (status) {
                await axios.put(`/api/returns/${id}/status`, { status, ...extraData }, config);
            } else if (action === 'Resolve') {
                await axios.put(`/api/returns/${id}/resolve`, {}, config);
            }

            fetchReturns();
            showAlert('Success', `${action} completed successfully`, 'success');
        } catch (error) {
            const msg = error.response?.data?.message || 'Action failed';
            showAlert('Action Failed', msg, 'error');
        }
    };

    const tabs = ['All', 'Requested', 'Approved', 'Pickup Scheduled', 'QC Pending', 'QC Passed', 'QC Failed', 'Refund Completed', 'Replacement Sent', 'Rejected'];
    const toggleMediaKey = (key) => {
        // Simple distinct locking if needed, else just use activeTab logic
    }

    const getMediaUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Backend runs on port 5000 in dev
        return `${path}`;
    };

    return (
        <div className="p-8 pt-24 min-h-screen max-w-[1600px] mx-auto relative bg-zinc-50/50">
            <AlertModal
                isOpen={alertState.show}
                onClose={() => setAlertState({ ...alertState, show: false })}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
            {/* REJECTION MODAL */}
            {rejectModal.show && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-red-600">Reject Return Request</h3>
                            <button onClick={() => setRejectModal({ show: false, returnId: null, reason: '' })} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <p className="text-sm text-zinc-500 mb-4">
                            Please provide a reason for rejection. This will be sent to the customer via email.
                        </p>

                        <textarea
                            className="w-full h-32 p-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-red-500 transition-colors resize-none mb-4"
                            placeholder="Enter rejection reason (e.g., mismatched item, policy violation)..."
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                        />

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setRejectModal({ show: false, returnId: null, reason: '' })}
                                className="px-4 py-2 bg-zinc-100 text-zinc-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={!rejectModal.reason.trim()}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MEDIA VIEWER MODAL */}
            {viewMedia && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={() => setViewMedia(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black uppercase tracking-tighter">Return Proofs</h3>
                            <button onClick={() => setViewMedia(null)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        {(!viewMedia.images || viewMedia.images.length === 0) ? (
                            <div className="text-center py-12 text-zinc-400">No media uploaded</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {viewMedia.images.map((url, idx) => {
                                    const isVideo = url.match(/\.(mp4|mov|avi|webm|mkv)$/i);
                                    const fullUrl = getMediaUrl(url);
                                    return (
                                        <div key={idx} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-md">
                                            {isVideo ? (
                                                <video
                                                    src={fullUrl}
                                                    controls
                                                    playsInline
                                                    className="w-full h-64 object-contain bg-black"
                                                />
                                            ) : (
                                                <img src={fullUrl} alt="proof" className="w-full h-64 object-contain bg-black" />
                                            )}
                                            <div className="p-2 bg-white text-[10px] font-mono text-center border-t border-zinc-200 truncate">
                                                {url.split(/[/\\]/).pop()}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button onClick={() => setViewMedia(null)} className="px-6 py-2 bg-black text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors">Close Viewer</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
                        <RefreshCw size={24} /> Returns Management
                    </h1>
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">
                        Handle Returns & Exchanges
                    </p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search Order ID / Email"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-black transition-colors w-64 uppercase placeholder:normal-case"
                    />
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab ? 'bg-black text-white shadow-lg scale-105' : 'bg-white text-zinc-500 hover:bg-zinc-100 hover:text-black'
                            }`}
                    >
                        {tab} <span className="opacity-50 ml-1">({returns.filter(r => tab === 'All' ? true : r.status === tab).length})</span>
                    </button>
                ))}
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                        <tr>
                            {['Sl No', 'Order / Date', 'Customer', 'Product', 'Proof', 'Type / Reason', 'Status', 'Logistics', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-zinc-400">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {loading ? (
                            <tr><td colSpan="9" className="text-center py-8">Loading Returns...</td></tr>
                        ) : filteredReturns.length === 0 ? (
                            <tr><td colSpan="9" className="text-center py-8 text-zinc-400">No returns found</td></tr>
                        ) : (
                            filteredReturns.map((ret, index) => (
                                <tr key={ret._id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-xs text-zinc-500">#{index + 1}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-xs">{ret.order?._id.slice(-6)}</div>
                                        <div className="text-[10px] text-zinc-400">{new Date(ret.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-xs">{ret.user?.firstName}</div>
                                        <div className="text-[10px] text-zinc-400">{ret.user?.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded border border-zinc-100 bg-zinc-50 flex items-center justify-center overflow-hidden">
                                                {ret.orderItem.image ? (
                                                    <img src={ret.orderItem.image} alt="" className="w-full h-full object-cover" />
                                                ) : <Package size={16} className="text-zinc-300" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[10px] uppercase line-clamp-1 w-32">{ret.orderItem.name}</div>
                                                <div className="text-[9px] text-zinc-400">Qty: {ret.orderItem.qty}</div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* PROOF COLUMN */}
                                    <td className="px-6 py-4">
                                        {ret.images && ret.images.length > 0 ? (
                                            <button
                                                onClick={() => setViewMedia(ret)}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-black hover:text-white transition-colors rounded-lg group/btn"
                                            >
                                                <Eye size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-wide">
                                                    View ({ret.images.length})
                                                </span>
                                            </button>
                                        ) : (
                                            <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest">No Proof</span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${ret.type === 'Exchange' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                            {ret.type}
                                        </span>
                                        {ret.type === 'Exchange' && ret.requestedVariant && (
                                            <div className="mt-1 flex flex-col">
                                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Requested:</span>
                                                <span className="text-[10px] font-black uppercase text-purple-600">{ret.requestedVariant.size} {ret.requestedVariant.color && `/ ${ret.requestedVariant.color}`}</span>
                                            </div>
                                        )}
                                        <div className="mt-1 text-[10px] font-medium text-zinc-600">{ret.reason}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-zinc-100 rounded text-[9px] font-bold uppercase tracking-wide">
                                            {ret.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {ret.pickupDetails?.courier ? (
                                            <div className="text-[10px]">
                                                <div className="font-bold text-zinc-600">{ret.pickupDetails.courier}</div>
                                                <div className="text-zinc-400">{ret.pickupDetails.trackingId}</div>
                                            </div>
                                        ) : <span className="text-[10px] text-zinc-300">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 w-32">
                                            {/* DYNAMIC ACTIONS */}
                                            {ret.status === 'Requested' && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleAction(ret._id, 'Approve')} className="flex-1 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase hover:bg-green-100 rounded">Approve</button>
                                                    <button onClick={() => handleAction(ret._id, 'Reject')} className="flex-1 py-1 bg-red-50 text-red-600 text-[9px] font-bold uppercase hover:bg-red-100 rounded">Reject</button>
                                                </div>
                                            )}
                                            {ret.status === 'Approved' && (
                                                <button onClick={() => handleAction(ret._id, 'Schedule Pickup', { pickupDetails: { courier: 'FedEx', trackingId: `TRK-${Date.now()}` } })} className="py-1 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase hover:bg-blue-100 rounded">Schedule Pickup</button>
                                            )}
                                            {ret.status === 'Pickup Scheduled' && (
                                                <button onClick={() => handleAction(ret._id, 'Mark Picked Up')} className="py-1 bg-blue-50 text-blue-600 text-[9px] font-bold uppercase hover:bg-blue-100 rounded">Confirm Pickup</button>
                                            )}
                                            {(ret.status === 'Picked Up' || ret.status === 'In Transit') && (
                                                <button onClick={() => handleAction(ret._id, 'Mark Received')} className="py-1 bg-purple-50 text-purple-600 text-[9px] font-bold uppercase hover:bg-purple-100 rounded">Receive & QC</button>
                                            )}
                                            {(ret.status === 'Received' || ret.status === 'QC Pending') && (
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleAction(ret._id, 'Pass QC')} className="flex-1 py-1 bg-green-50 text-green-600 text-[9px] font-bold uppercase hover:bg-green-100 rounded">Pass QC</button>
                                                    <button onClick={() => handleAction(ret._id, 'Fail QC')} className="flex-1 py-1 bg-red-50 text-red-600 text-[9px] font-bold uppercase hover:bg-red-100 rounded">Fail QC</button>
                                                </div>
                                            )}
                                            {ret.status === 'QC Passed' && (
                                                <button onClick={() => handleAction(ret._id, 'Resolve')} className="py-1 bg-green-600 text-white text-[9px] font-bold uppercase hover:bg-green-700 rounded shadow-lg shadow-green-200">
                                                    Resolve ({ret.type === 'Return' ? 'Refund' : 'Replace'})
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminReturns;
