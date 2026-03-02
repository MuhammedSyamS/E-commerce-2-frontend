import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { Package, Truck, Check, Eye, Trash2, AlertCircle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const AdminOrders = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchOrders = async (p = page) => {
        try {
            // Add timestamp to prevent caching
            const { data } = await api.get(`/orders/admin/all?page=${p}&t=${Date.now()}`);
            setOrders(data.orders);
            setPages(data.pages);
            setTotal(data.total);
            setPage(data.page);
        } catch (err) {
            console.error("Orders Error", err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-Refresh every 30 seconds
    useEffect(() => {
        if (!user.token) return;
        fetchOrders(); // Initial
        const interval = setInterval(fetchOrders, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [user.token]);

    const [activeTab, setActiveTab] = useState('All');

    // TRACKING MODAL STATE
    const [trackingModal, setTrackingModal] = useState({ open: false, orderId: null });
    const [trackingData, setTrackingData] = useState({ partner: '', trackingId: '' });

    // REQUEST MODAL STATE
    const [requestModal, setRequestModal] = useState({ open: false, orderId: null, itemId: null, request: null, itemName: '', mode: 'review' }); // mode: review, logistics, qc, resolve
    const [adminComment, setAdminComment] = useState("");
    const [logisticsData, setLogisticsData] = useState({ pickupDate: '', courier: '', trackingId: '' });

    const handleReturnAction = async (endpoint, payload) => {
        try {
            await api.put(`/orders/${requestModal.orderId}/return/${requestModal.itemId}/${endpoint}`, payload);

            addToast("Update Successful", "success");
            setRequestModal({ open: false, orderId: null, itemId: null, request: null, itemName: '', mode: 'review' });
            setAdminComment("");
            setLogisticsData({ pickupDate: '', courier: '', trackingId: '' });
            fetchOrders();
        } catch (error) {
            addToast(error.response?.data?.message || "Action Failed", "error");
        }
    };

    const handleStatusChange = (orderId, newStatus) => {
        if (newStatus === 'Shipped') {
            setTrackingModal({ open: true, orderId });
        } else {
            updateStatus(orderId, newStatus);
        }
    };

    const confirmShipment = async () => {
        if (!trackingData.partner || !trackingData.trackingId) {
            addToast("Please enter Tracking Details", "error");
            return;
        }
        await updateStatus(trackingModal.orderId, 'Shipped', trackingData);
        setTrackingModal({ open: false, orderId: null });
        setTrackingData({ partner: '', trackingId: '' });
    };

    const updateStatus = async (id, status, extraData = {}) => {
        try {
            await api.put(`/orders/${id}/status`, { status, ...extraData });
            fetchOrders();
            addToast(`Order marked as ${status}`, "success");
        } catch (err) {
            addToast("Status update failed", "error");
        }
    };
    const deleteOrder = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            await api.delete(`/orders/${id}`);
            setOrders(orders.filter(o => o._id !== id));
            addToast("Order deleted", "success");
        } catch (err) {
            addToast("Delete failed", "error");
        }
    };

    const tabs = ['All', 'Return Requests', 'Exchange Requests', 'Pending', 'Processing', 'Confirmed', 'Dispatched', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Exchanged'];

    const filteredOrders = orders.filter(order => {
        // Fallback for older orders without explicit status
        const s = order.orderStatus || (order.isDelivered ? 'Delivered' : order.isDispatched ? 'Shipped' : 'Pending');

        if (activeTab === 'Return Requests') {
            return order.orderItems?.some(i => i.returnRequest?.status === 'Pending' && i.returnRequest?.type === 'Return');
        }
        if (activeTab === 'Exchange Requests') {
            return order.orderItems?.some(i => i.returnRequest?.status === 'Pending' && i.returnRequest?.type === 'Exchange');
        }

        if (activeTab === 'All') return true;
        return s === activeTab;
    });

    return (
        <div className="relative">
            {/* RETURN MANAGEMENT MODAL */}
            {requestModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-zinc-100 rounded-full text-zinc-800"><Truck size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase">Manage Return</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                    {requestModal.mode.toUpperCase()} STAGE - {requestModal.itemName}
                                </p>
                            </div>
                        </div>

                        {/* MODE: REVIEW (Approve/Reject) */}
                        {requestModal.mode === 'review' && (
                            <>
                                <div className="space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6">
                                    <p className="text-xs font-bold"><span className="text-zinc-400 uppercase text-[10px] mr-2">Reason:</span> {requestModal.request?.reason}</p>
                                    <p className="text-sm italic text-zinc-600">"{requestModal.request?.comment}"</p>
                                </div>
                                <textarea
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 mb-6 text-sm outline-none resize-none h-20"
                                    placeholder="Admin Comment..."
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                />
                                <div className="flex gap-3">
                                    <button onClick={() => handleReturnAction('action', { action: 'Reject', adminComment })} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100">Reject</button>
                                    <button onClick={() => handleReturnAction('action', { action: 'Approve', adminComment })} className="flex-1 py-3 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform">Approve</button>
                                </div>
                            </>
                        )}

                        {/* MODE: LOGISTICS (Schedule Pickup) */}
                        {requestModal.mode === 'logistics' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-zinc-400">Courier Name</label>
                                    <input className="w-full bg-zinc-50 rounded-xl px-4 py-3 font-bold text-sm" placeholder="e.g. FedEx" value={logisticsData.courier} onChange={e => setLogisticsData({ ...logisticsData, courier: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-zinc-400">Tracking ID</label>
                                    <input className="w-full bg-zinc-50 rounded-xl px-4 py-3 font-bold text-sm" placeholder="TRK123..." value={logisticsData.trackingId} onChange={e => setLogisticsData({ ...logisticsData, trackingId: e.target.value })} />
                                </div>
                                <button onClick={() => handleReturnAction('logistics', { status: 'Pickup Scheduled', ...logisticsData })} className="w-full py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest mt-4">Schedule Pickup</button>
                            </div>
                        )}

                        {/* MODE: QC (Quality Check) */}
                        {requestModal.mode === 'qc' && (
                            <>
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-xs font-medium mb-6">
                                    Verify the item condition. If accepted, you can proceed to Refund/Replacement.
                                </div>
                                <textarea className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 mb-6 text-sm outline-none h-20" placeholder="QC Observations..." value={adminComment} onChange={e => setAdminComment(e.target.value)} />
                                <div className="flex gap-3">
                                    <button onClick={() => handleReturnAction('qc', { qcStatus: 'QC Failed', comment: adminComment })} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase text-[10px] tracking-widest">Fail QC</button>
                                    <button onClick={() => handleReturnAction('qc', { qcStatus: 'QC Passed', comment: adminComment })} className="flex-1 py-3 bg-green-50 text-green-600 rounded-xl font-black uppercase text-[10px] tracking-widest">Pass QC</button>
                                </div>
                            </>
                        )}

                        {/* MODE: RESOLVE (Refund/Replace) */}
                        {requestModal.mode === 'resolve' && (
                            <div className="text-center">
                                <div className="mb-6">
                                    <h4 className="text-lg font-bold">Ready to Resolve?</h4>
                                    <p className="text-zinc-500 text-sm">Action: <span className="font-black uppercase">{requestModal.request?.type}</span></p>
                                </div>
                                <button onClick={() => handleReturnAction('resolve', {})} className="w-full py-4 bg-black text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl animate-pulse">
                                    {requestModal.request?.type === 'Return' ? 'Process Refund' : 'Send Replacement'}
                                </button>
                            </div>
                        )}

                        <button onClick={() => setRequestModal({ ...requestModal, open: false })} className="w-full mt-4 text-[10px] font-bold uppercase text-zinc-400 hover:text-black">Cancel</button>
                    </div>
                </div>
            )}

            {/* TRACKING MODAL */}
            {trackingModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-zinc-50 rounded-full"><Truck size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase">Ship Order</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Enter Tracking Details</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-zinc-400">Delivery Partner</label>
                                <input
                                    type="text"
                                    placeholder="e.g. FedEx, BlueDart"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 ring-black transition-all"
                                    value={trackingData.partner}
                                    onChange={(e) => setTrackingData({ ...trackingData, partner: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-zinc-400">Tracking ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. TRK123456789"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 ring-black transition-all"
                                    value={trackingData.trackingId}
                                    onChange={(e) => setTrackingData({ ...trackingData, trackingId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setTrackingModal({ open: false, orderId: null })}
                                className="flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmShipment}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-lg shadow-black/20"
                            >
                                Confirm Shipment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-end mb-8">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Logistics</p>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">Order <span className="text-zinc-300">Management</span></h1>
                </div>
                <button
                    onClick={() => { setLoading(true); fetchOrders(); addToast("Refreshing...", "info"); }}
                    className="p-3 bg-zinc-100 text-zinc-600 rounded-full hover:bg-black hover:text-white transition shadow-sm active:scale-90"
                    title="Refresh Data"
                >
                    <Truck size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-8 border-b border-zinc-100 pb-1 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-black text-white'
                            : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
                            }`}
                    >
                        {tab}
                        <span className="ml-2 opacity-50 text-[8px]">
                            {/* Simple Count Badge */}
                            ({(orders || []).filter(o => {
                                const s = o.orderStatus || (o.isDelivered ? 'Delivered' : o.isDispatched ? 'Shipped' : 'Pending');
                                if (tab === 'Return Requests') return o.orderItems?.some(i => i.returnRequest?.status === 'Pending' && i.returnRequest?.type === 'Return');
                                if (tab === 'Exchange Requests') return o.orderItems?.some(i => i.returnRequest?.status === 'Pending' && i.returnRequest?.type === 'Exchange');
                                if (tab === 'All') return true;
                                return s === tab;
                            }).length})
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                <th className="px-4 py-4 md:px-8 md:py-6">Order ID</th>
                                <th className="px-4 py-4 md:px-8 md:py-6">Items</th> {/* Added Items Column */}
                                <th className="px-4 py-4 md:px-8 md:py-6">Customer</th>
                                <th className="px-4 py-4 md:px-8 md:py-6">Date</th>
                                <th className="px-4 py-4 md:px-8 md:py-6">Total</th>
                                <th className="px-4 py-4 md:px-8 md:py-6">Payment</th>
                                <th className="px-4 py-4 md:px-8 md:py-6">Status</th>
                                <th className="px-4 py-4 md:px-8 md:py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {(orders || []).filter(o => activeTab === 'All' || o.orderStatus === activeTab).map(order => (
                                <tr key={order._id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-4 py-4 md:px-8 md:py-6 font-mono text-xs text-zinc-500">#{order._id.slice(-6)}</td>

                                    {/* Items Summary */}
                                    {/* Items Summary - Detailed List */}
                                    <td className="px-4 py-4 md:px-8 md:py-6">
                                        <div className="flex flex-col gap-1">
                                            {order.orderItems?.map((item, idx) => (
                                                <div key={idx} className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase truncate max-w-[200px] text-zinc-700">
                                                        {item.qty}x {item.name}
                                                    </span>
                                                    {item.selectedVariant && (
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">
                                                            {item.selectedVariant.size} {item.selectedVariant.color && `/ ${item.selectedVariant.color}`}
                                                        </span>
                                                    )}
                                                    {/* Item Status Badge */}
                                                    {item.status && item.status !== 'Ordered' && item.status !== 'Delivered' && (
                                                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded w-fit ${item.status.includes('Returned') ? 'bg-red-100 text-red-600' :
                                                            item.status.includes('Exchanged') ? 'bg-blue-100 text-blue-600' :
                                                                item.status.includes('Requested') ? 'bg-yellow-100 text-yellow-600' :
                                                                    'bg-zinc-100 text-zinc-500'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    )}
                                                    {/* Replacement Link Hint */}
                                                    {item.returnRequest?.adminComment && item.returnRequest.adminComment.includes('Replacement Order #') && (
                                                        <span className="text-[8px] text-zinc-400 font-mono mt-0.5">
                                                            ↳ {item.returnRequest.adminComment.split('(')[1]?.replace(')', '') || ''}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </td>

                                    <td className="px-4 py-4 md:px-8 md:py-6">
                                        <div className="text-xs font-bold uppercase">{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</div>
                                        <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wide">{order.user?.email || 'No Email'}</div>
                                        {order.orderNote && (
                                            <div className="mt-2 flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded w-max">
                                                <AlertCircle size={10} />
                                                <span className="text-[9px] font-black uppercase tracking-tight">HAS NOTE</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 md:px-8 md:py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-4 md:px-8 md:py-6 text-sm font-black text-zinc-800">₹{(order.totalPrice || 0).toLocaleString()}</td>
                                    <td className="px-4 py-4 md:px-8 md:py-6">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {order.isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                            <span className="text-[8px] font-mono text-zinc-400 uppercase">{order.paymentMethod || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 md:px-8 md:py-6">
                                        <div className="flex flex-col gap-2">
                                            {/* LIFECYCLE ACTION BUTTONS */}
                                            {order.orderItems?.map(item => {
                                                const rStatus = item.returnRequest?.status;
                                                if (!rStatus) return null;

                                                const actionButton = (label, mode, color = 'zinc', icon = null) => (
                                                    <button
                                                        key={item._id}
                                                        onClick={() => setRequestModal({
                                                            open: true,
                                                            orderId: order._id,
                                                            itemId: item._id,
                                                            request: item.returnRequest,
                                                            itemName: item.name,
                                                            mode: mode
                                                        })}
                                                        className={`w-full py-2 bg-${color}-50 text-${color}-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-${color}-100 border border-${color}-100 flex items-center justify-center gap-1 mb-1`}
                                                    >
                                                        {icon} {label}
                                                    </button>
                                                );

                                                const directAction = (label, status, color = 'blue') => (
                                                    <button
                                                        key={item._id}
                                                        onClick={() => handleReturnAction('logistics', { status })} // Assuming direct logistics update
                                                        onMouseEnter={() => { setRequestModal({ ...requestModal, orderId: order._id, itemId: item._id }); }} // Hack to set ID for handleReturnAction
                                                        className={`w-full py-2 bg-${color}-50 text-${color}-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-${color}-100 border border-${color}-100 mb-1`}
                                                    >
                                                        {label}
                                                    </button>
                                                );

                                                /* NOTE: Direct calls need context. Using Modal setter to prep context is safer for now, or updating handleReturnAction to take IDs.
                                                   Better: Use the modal for everything or pass IDs to handleReturnAction. 
                                                   Let's use the modal for everything OR inline async calls.
                                                   The `handleReturnAction` uses `requestModal` state for IDs. So we MUST set state first.
                                                */

                                                if (rStatus === 'Pending') return actionButton(`Review ${item.returnRequest.type || 'Return'}`, 'review', 'red', <AlertCircle size={10} />);

                                                if (rStatus === 'Approved') return actionButton('Schedule Pickup', 'logistics', 'orange', <Truck size={10} />);

                                                if (rStatus === 'Pickup Scheduled') return (
                                                    <button key={item._id} onClick={() => {
                                                        api.put(`/orders/${order._id}/return/${item._id}/logistics`, { status: 'Picked Up' }).then(fetchOrders);
                                                    }} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest mb-1">Mark Picked Up</button>
                                                );

                                                if (rStatus === 'Picked Up') return (
                                                    <button key={item._id} onClick={() => {
                                                        api.put(`/orders/${order._id}/return/${item._id}/logistics`, { status: 'Received' }).then(fetchOrders);
                                                    }} className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest mb-1">Mark Received</button>
                                                );

                                                if (rStatus === 'Received' || rStatus === 'QC Pending') return actionButton('Start QC', 'qc', 'purple', <Eye size={10} />);

                                                if (rStatus === 'QC Passed') return actionButton(`Resolve (${item.returnRequest.type || 'Return'})`, 'resolve', 'green', <Check size={10} />);

                                                return null;
                                            })}

                                            <div className="relative group/status w-fit">
                                                <select
                                                    value={order.orderStatus || (order.isDelivered ? 'Delivered' : order.isDispatched ? 'Shipped' : 'Pending')}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none border border-transparent hover:border-zinc-200 transition-all ${(order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned') ? 'bg-red-50 text-red-600' :
                                                        order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                            order.orderStatus === 'Shipped' ? 'bg-purple-50 text-purple-600' :
                                                                'bg-zinc-100 text-zinc-600'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Dispatched">Dispatched</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Returned">Returned</option>
                                                    <option value="Exchanged">Exchanged</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <Check size={12} className="opacity-50" />
                                                </div>
                                            </div>
                                            {order.trackingId && (
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md w-fit">
                                                    <Truck size={10} />
                                                    <span>{order.deliveryPartner}: {order.trackingId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 md:px-8 md:py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const response = await api.get(`/orders/${order._id}/invoice`, {
                                                            responseType: 'blob'
                                                        });
                                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `invoice-${order._id}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (err) {
                                                        addToast("Failed to download invoice", "error");
                                                    }
                                                }}
                                                className="p-2 bg-white border border-zinc-100 rounded-lg hover:border-black transition-colors"
                                                title="Download Invoice"
                                            >
                                                <FileText size={14} />
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    try {
                                                        const response = await api.get(`/orders/${order._id}/manifest`, {
                                                            responseType: 'blob'
                                                        });
                                                        const url = window.URL.createObjectURL(new Blob([response.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `manifest-${order._id}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        link.remove();
                                                    } catch (err) {
                                                        addToast("Failed to download manifest", "error");
                                                    }
                                                }}
                                                className="p-2 bg-white border border-zinc-100 rounded-lg hover:border-black transition-colors text-amber-600 hover:bg-amber-50"
                                                title="Download Shipping Manifest"
                                            >
                                                <Truck size={14} />
                                            </button>

                                            <Link to={`/order/${order._id}`} className="p-2 bg-white border border-zinc-100 rounded-lg hover:border-black transition-colors" title="View Details">
                                                <Eye size={14} />
                                            </Link>

                                            {/* Delete for Cancelled/Returned or cleanup */}
                                            {['Cancelled', 'Returned'].includes(order.orderStatus) && (
                                                <button onClick={() => deleteOrder(order._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete Record">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION CONTROLS */}
                {pages > 1 && (
                    <div className="bg-zinc-50 border-t border-zinc-100 px-8 py-4 flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                            Showing page {page} of {pages} ({total} Orders)
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setPage(page - 1); fetchOrders(page - 1); }}
                                disabled={page === 1}
                                className="px-4 py-2 bg-white border border-zinc-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => { setPage(page + 1); fetchOrders(page + 1); }}
                                disabled={page === pages}
                                className="px-4 py-2 bg-black text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
