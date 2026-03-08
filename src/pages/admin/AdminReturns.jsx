import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/instance';
import { 
    RefreshCw, Search, Eye, Truck, Check, X, 
    AlertCircle, Camera, User, ShoppingBag, 
    ArrowRight, ChevronLeft, ChevronRight, 
    FileText, ShieldCheck, ShieldAlert, History,
    ChevronDown, Package, CheckCircle2, XCircle, Play
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveMediaURL } from '../../utils/mediaUtils';

const AdminReturns = () => {
    const { addToast } = useToast();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [processingId, setProcessingId] = useState(null);
    const [viewMedia, setViewMedia] = useState(null);

    const fetchReturns = useCallback(async (p = page, search = searchTerm, status = activeTab) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/returns/admin`, {
                params: {
                    page: p,
                    pageSize: 15,
                    keyword: search,
                    status: status === 'all' ? undefined : status
                }
            });
            setReturns(data.returns || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
            setPage(data.page || 1);
        } catch (err) {
            addToast("Failed to fetch returns data", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast, activeTab, searchTerm, page]);

    useEffect(() => {
        fetchReturns(1);
    }, [fetchReturns]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchReturns(1, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleAction = async (id, status, extraData = {}) => {
        setProcessingId(id);
        try {
            await api.put(`/returns/${id}/status`, { status, ...extraData });
            addToast(`Updated: ${status}`, "success");
            setReturns(prev => prev.map(r => r._id === id ? { ...r, status, ...extraData } : r));
        } catch (err) {
            addToast(err.response?.data?.message || "Action failed", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const resolveReturn = async (id, type) => {
        setProcessingId(id);
        try {
            await api.put(`/returns/${id}/resolve`, {});
            addToast(`Success: ${type === 'Return' ? 'Refunded' : 'Exchanged'}`, "success");
            fetchReturns();
        } catch (err) {
            addToast(err.response?.data?.message || "Resolution failed", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const StatusBadge = ({ status }) => {
        const styles = {
            'Requested': 'bg-amber-50 text-amber-600 border-amber-100',
            'Approved': 'bg-blue-50 text-blue-600 border-blue-100',
            'Pickup Scheduled': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'Picked Up': 'bg-sky-50 text-sky-600 border-sky-100',
            'QC Pending': 'bg-purple-50 text-purple-600 border-purple-100',
            'QC Passed': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'QC Failed': 'bg-rose-50 text-rose-600 border-rose-100',
            'Refund Completed': 'bg-zinc-900 text-white border-zinc-900',
            'Replacement Sent': 'bg-zinc-900 text-white border-zinc-900',
            'Rejected': 'bg-zinc-100 text-zinc-400 border-zinc-200',
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${styles[status] || styles['Requested']}`}>
                {status}
            </span>
        );
    };

    const tabs = ['all', 'Requested', 'Approved', 'QC Pending', 'QC Passed', 'Refund Completed', 'Replacement Sent', 'Rejected'];

    return (
        <div className="p-8 bg-[#fbfbfb] min-h-screen relative font-sans">
            {/* Header */}
            <header className="max-w-[1500px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200">
                            <RefreshCw className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                            Reverse <span className="text-zinc-300">Desk</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Claim Reconciliation & Logistics</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={14} />
                        <input
                            placeholder="Find Claim ID, Order, Client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-zinc-200 pl-11 pr-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest w-72 focus:ring-4 ring-zinc-50 focus:border-black outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => { fetchReturns(); addToast("Syncing Database...", "info"); }}
                        className="p-3.5 bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-black hover:border-black transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-[1500px] mx-auto">
                <div className="flex gap-1.5 p-1 bg-zinc-900/5 rounded-2xl border border-white mb-8 overflow-x-auto no-scrollbar max-w-max">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setPage(1); }}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:bg-white hover:text-black'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-16 text-center"></th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Unit Info</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Claim Logic</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status Ops</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Direct Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={`skeleton-r-${i}`}>
                                                <td colSpan="5" className="p-8">
                                                    <div className="h-14 bg-zinc-50 animate-pulse rounded-2xl w-full" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : returns.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-32 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200">
                                                        <RefreshCw size={32} />
                                                    </div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Zero active claims found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : returns.map((r) => (
                                        <React.Fragment key={r._id}>
                                            <motion.tr 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`transition-colors group ${expandedRows.has(r._id) ? 'bg-zinc-50 shadow-inner' : 'hover:bg-zinc-50/50'}`}
                                            >
                                                <td className="p-6 text-center">
                                                    <button 
                                                        onClick={() => toggleRow(r._id)}
                                                        className={`p-2 rounded-xl border border-zinc-100 bg-white shadow-sm transition-all ${expandedRows.has(r._id) ? 'rotate-180 bg-black text-white border-black' : 'text-zinc-400 hover:text-black hover:border-black'}`}
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-200/50">
                                                            <img src={resolveMediaURL(r.orderItem?.image)} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <div className="font-black text-xs uppercase tracking-tight">#{r._id.slice(-8)}</div>
                                                            <div className="text-[9px] text-zinc-400 font-bold uppercase mt-1 tracking-widest">{r.type}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="font-bold text-[11px] text-zinc-900 group-hover:text-black transition-colors">"{r.reason}"</div>
                                                    <div className="text-[9px] text-zinc-400 font-bold uppercase mt-1 italic">ORD-{r.order?._id.slice(-8)} • {r.user?.email}</div>
                                                </td>
                                                <td className="p-6">
                                                    <StatusBadge status={r.status} />
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 group-hover:opacity-100 opacity-60 transition-opacity">
                                                        {/* Dynamic Direct Actions */}
                                                        {r.status === 'Requested' && (
                                                            <>
                                                                <button onClick={() => handleAction(r._id, 'Approve')} className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Approve Request">
                                                                    <Check size={14} />
                                                                </button>
                                                                <button onClick={() => handleAction(r._id, 'Rejected')} className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Reject Request">
                                                                    <X size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {r.status === 'QC Pending' && (
                                                            <>
                                                                <button onClick={() => handleAction(r._id, 'QC Passed')} className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Pass QC">
                                                                    <CheckCircle2 size={14} />
                                                                </button>
                                                                <button onClick={() => handleAction(r._id, 'QC Failed')} className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Fail QC">
                                                                    <XCircle size={14} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {r.status === 'QC Passed' && (
                                                            <button onClick={() => resolveReturn(r._id, r.type)} className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg" title="Final Resolution">
                                                                Resolve <ArrowRight size={12} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => {
                                                                const allMedia = (r.images || []).map(url => ({
                                                                    type: (url.match(/\.(mp4|mov|avi|mkv|webm)$/i) || url.startsWith('data:video/')) ? 'video' : 'image',
                                                                    url: url
                                                                }));
                                                                setViewMedia(allMedia);
                                                            }} 
                                                            className="p-2.5 bg-white border border-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm" 
                                                            title="Proof Evidence"
                                                        >
                                                            <Camera size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>

                                            {/* Sub-row Expansion */}
                                            <AnimatePresence>
                                                {expandedRows.has(r._id) && (
                                                    <motion.tr 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-zinc-50/50"
                                                    >
                                                        <td colSpan="5" className="p-0 overflow-hidden">
                                                            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                                {/* Column 1: Item & Details */}
                                                                <div className="space-y-6">
                                                                    <div>
                                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                                                            <Package size={12} /> SKU Integrity
                                                                        </h4>
                                                                        <div className="p-4 bg-white border border-zinc-100 rounded-[2rem] shadow-sm">
                                                                            <p className="text-xs font-black uppercase italic leading-tight">{r.orderItem?.name}</p>
                                                                            <p className="text-[9px] text-zinc-400 font-bold uppercase mt-2">
                                                                                REF: {r.orderItem?.itemId} • QTY: {r.orderItem?.qty}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                                                            <History size={12} /> Claim Comment
                                                                        </h4>
                                                                        <p className="text-xs text-zinc-600 font-medium bg-white p-4 rounded-[2rem] border border-zinc-100 leading-relaxed italic">
                                                                            "{r.comment || 'No additional commentary provided by client.'}"
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Column 2: Evidence */}
                                                                <div className="space-y-6">
                                                                    <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                                                        <Camera size={12} /> Proof Evidence
                                                                    </h4>
                                                                    {r.images && r.images.length > 0 ? (
                                                                        <div className="grid grid-cols-3 gap-3">
                                                                            {/* Videos first */}
                                                                            {r.images.filter(url => url.match(/\.(mp4|mov|avi|mkv|webm)$/i) || url.startsWith('data:video/')).map((vid, i) => (
                                                                                <div key={`v-${i}`} onClick={() => setViewMedia([{type: 'video', url: vid}])} className="aspect-square bg-black rounded-2xl overflow-hidden border border-zinc-100 hover:scale-105 transition-transform cursor-zoom-in relative">
                                                                                    <video src={resolveMediaURL(vid)} className="w-full h-full object-cover opacity-60" />
                                                                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                                        <Play size={16} fill="white" className="text-white" />
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                            {/* Images */}
                                                                            {r.images.filter(url => !url.match(/\.(mp4|mov|avi|mkv|webm)$/i) && !url.startsWith('data:video/')).map((img, i) => (
                                                                                <div key={`i-${i}`} onClick={() => setViewMedia([{type: 'image', url: img}])} className="aspect-square bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:scale-105 transition-transform cursor-zoom-in">
                                                                                    <img src={resolveMediaURL(img)} alt="" className="w-full h-full object-cover" />
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="p-8 border-2 border-dashed border-zinc-200 rounded-[2rem] text-center">
                                                                            <AlertCircle size={20} className="mx-auto text-zinc-200 mb-2" />
                                                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No Visual Assets</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Column 3: Identity & Logistics */}
                                                                <div className="space-y-6">
                                                                    <div className="p-6 bg-zinc-900 text-white rounded-[2.5rem] shadow-xl shadow-zinc-200">
                                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                                                                            <User size={12} /> Client Profile
                                                                        </h4>
                                                                        <p className="text-xs font-black mb-1">{r.user?.firstName} {r.user?.lastName}</p>
                                                                        <p className="text-[10px] text-zinc-400 font-medium truncate">{r.user?.email}</p>
                                                                        <div className="mt-6 pt-6 border-t border-white/10">
                                                                            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Internal Ref</p>
                                                                            <p className="text-[10px] font-mono text-zinc-300">BATCH-CL-RTN-{r._id.slice(-6).toUpperCase()}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                )}
                                            </AnimatePresence>
                                        </React.Fragment>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-8 bg-zinc-50/50 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                            Reverse Log: <span className="text-zinc-900">{total} CLAIMS</span> • Page {page} / {pages}
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                                className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-zinc-50 transition-all shadow-sm"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(pages, p + 1))}
                                disabled={page === pages || loading}
                                className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:scale-[1.05] active:scale-95 transition-all shadow-lg shadow-black/10"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Media Viewer */}
            <AnimatePresence>
                {viewMedia && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setViewMedia(null)}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-8"
                    >
                        <button className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
                            <X size={24} />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full" onClick={e => e.stopPropagation()}>
                            {viewMedia.map((media, i) => {
                                // Backward compatibility check: if media is just a string, assume image
                                const type = typeof media === 'string' ? 'image' : media.type;
                                const url = typeof media === 'string' ? media : media.url;
                                
                                return (
                                    <motion.div 
                                        key={i}
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="aspect-square bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 group relative"
                                    >
                                        {type === 'video' ? (
                                            <video src={resolveMediaURL(url)} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <img src={resolveMediaURL(url)} alt="" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminReturns;
