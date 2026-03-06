import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/instance';
import { 
    Package, Truck, Check, Eye, Trash2, AlertCircle, 
    FileText, Search, Filter, ChevronLeft, ChevronRight, 
    X, ExternalLink, Clock, CheckCircle2, ShoppingBag,
    MapPin, CreditCard, User, History, Download, RefreshCw,
    ChevronDown, ChevronUp, MoreHorizontal
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminOrders = () => {
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [statusUpdating, setStatusUpdating] = useState(null);
    const [shippingModal, setShippingModal] = useState({ show: false, orderId: null, status: null, partner: '', tracking: '' });

    const fetchOrders = useCallback(async (p = page, search = searchTerm, status = activeTab) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/orders/admin/all`, {
                params: {
                    page: p,
                    pageSize: 15,
                    keyword: search,
                    status: status === 'all' ? undefined : status
                }
            });
            setOrders(data.orders || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
            setPage(data.page || 1);
        } catch (err) {
            addToast("Failed to fetch orders", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast, activeTab, searchTerm, page]);

    useEffect(() => {
        fetchOrders(1);
    }, [fetchOrders]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders(1, searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const handleStatusChange = async (orderId, newStatus, logistics = {}) => {
        if ((newStatus === 'Shipped' || newStatus === 'Dispatched') && !logistics.partner) {
            setShippingModal({ show: true, orderId, status: newStatus, partner: '', tracking: '' });
            return;
        }

        setStatusUpdating(orderId);
        try {
            await api.put(`/orders/${orderId}/status`, { 
                status: newStatus,
                deliveryPartner: logistics.partner,
                trackingId: logistics.tracking
            });
            addToast(`Order marked as ${newStatus}`, "success");
            setOrders(prev => prev.map(o => o._id === orderId ? { 
                ...o, 
                orderStatus: newStatus,
                deliveryPartner: logistics.partner || o.deliveryPartner,
                trackingId: logistics.tracking || o.trackingId
            } : o));
            setShippingModal({ show: false, orderId: null, status: null, partner: '', tracking: '' });
        } catch (err) {
            addToast("Status update failed", "error");
        } finally {
            setStatusUpdating(null);
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            addToast("Failed to download invoice", "error");
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
            'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
            'Processing': 'bg-blue-50 text-blue-600 border-blue-100',
            'Confirmed': 'bg-indigo-50 text-indigo-600 border-indigo-100',
            'Shipped': 'bg-purple-50 text-purple-600 border-purple-100',
            'Delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'Cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
            'Returned': 'bg-zinc-100 text-zinc-600 border-zinc-200',
            'Exchanged': 'bg-indigo-50 text-indigo-600 border-indigo-100', // NEW
        };
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status] || styles['Pending']}`}>
                {status}
            </span>
        );
    };

    const tabs = ['all', 'Pending', 'Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Exchanged'];

    return (
        <div className="p-8 bg-[#fbfbfb] min-h-screen relative font-sans">
            {/* Header */}
            <header className="max-w-[1500px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200">
                            <Package className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                            Order <span className="text-zinc-300">Manager</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">High-Efficiency Fulfillment Control</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={14} />
                        <input
                            placeholder="Search Orders, Names..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-zinc-200 pl-11 pr-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest w-72 focus:ring-4 ring-zinc-50 focus:border-black outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => { fetchOrders(); addToast("Syncing Database...", "info"); }}
                        className="p-3.5 bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-black hover:border-black transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3.5 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] transition-all">
                        <Download size={14} /> Export
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
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Customer</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Lifecycle Control</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Operations</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={`skeleton-o-${i}`}>
                                                <td colSpan="6" className="p-8">
                                                    <div className="h-14 bg-zinc-50 animate-pulse rounded-2xl w-full" />
                                                </td>
                                            </tr>
                                        ))
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="p-32 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center text-zinc-200">
                                                        <ShoppingBag size={32} />
                                                    </div>
                                                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">No active orders</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : orders.map((o) => (
                                        <React.Fragment key={o._id}>
                                            <motion.tr 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`transition-colors group ${expandedRows.has(o._id) ? 'bg-zinc-50/80 shadow-inner' : 'hover:bg-zinc-50/50'}`}
                                            >
                                                <td className="p-6 text-center">
                                                    <button 
                                                        onClick={() => toggleRow(o._id)}
                                                        className={`p-2 rounded-xl border border-zinc-100 bg-white shadow-sm transition-all ${expandedRows.has(o._id) ? 'rotate-180 bg-black text-white border-black' : 'text-zinc-400 hover:text-black hover:border-black'}`}
                                                    >
                                                        <ChevronDown size={14} />
                                                    </button>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-xs uppercase tracking-tight text-zinc-900">#SLK-{o._id.slice(-8)}</span>
                                                        <span className="text-[9px] text-zinc-400 font-bold uppercase mt-1 italic">{new Date(o.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="font-bold text-xs text-zinc-900 uppercase">{o.user?.firstName} {o.user?.lastName}</div>
                                                    <div className="text-[9px] text-zinc-900 font-black mt-1 uppercase tracking-tighter">{o.user?.phone || 'No Number'}</div>
                                                    <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wide">{o.user?.email || 'No Email'}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="font-black text-xs text-zinc-900">₹{o.totalPrice.toLocaleString()}</div>
                                                    <div className={`text-[8px] font-black uppercase tracking-widest mt-1 ${o.isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {o.isPaid ? 'Prepaid / Verified' : o.paymentMethod === 'COD' ? 'Cash On Delivery' : 'Unpaid Entry'}
                                                    </div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            disabled={statusUpdating === o._id}
                                                            value={o.orderStatus}
                                                            onChange={(e) => handleStatusChange(o._id, e.target.value)}
                                                            className="bg-white border border-zinc-200 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-xl outline-none focus:border-black transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-50"
                                                        >
                                                            {['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Exchanged'].map(s => (
                                                                <option key={s} value={s}>{s}</option>
                                                            ))}
                                                        </select>
                                                        {statusUpdating === o._id && <RefreshCw size={12} className="animate-spin text-zinc-400" />}
                                                    </div>
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 group-hover:opacity-100 opacity-60 transition-opacity">
                                                        <button 
                                                            onClick={() => downloadInvoice(o._id)}
                                                            className="p-2.5 bg-white border border-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                                                            title="Get Invoice"
                                                        >
                                                            <FileText size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => window.open(`/order/${o._id}`, '_blank')}
                                                            className="p-2.5 bg-white border border-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                                                            title="Full Audit"
                                                        >
                                                            <Eye size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>

                                            {/* Sub-row Expansion */}
                                            <AnimatePresence>
                                                {expandedRows.has(o._id) && (
                                                    <motion.tr 
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="bg-zinc-50/50"
                                                    >
                                                        <td colSpan="6" className="p-0 overflow-hidden">
                                                            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                                {/* SKU Breakdown */}
                                                                <div>
                                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                                                        <ShoppingBag size={12} /> SKUs in Shipment
                                                                    </h4>
                                                                    <div className="space-y-2">
                                                                        {o.orderItems?.map((item, idx) => (
                                                                            <div key={idx} className="flex items-center gap-4 p-3 bg-white border border-zinc-100 rounded-2xl">
                                                                                <div className="w-12 h-12 bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200/50">
                                                                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                                                                </div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-[11px] font-black uppercase truncate italic">{item.name}</p>
                                                                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                                                                                        {item.selectedVariant?.size} / {item.selectedVariant?.color} • QTY: {item.qty}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="font-black text-[10px] text-zinc-900">₹{item.price.toLocaleString()}</div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Logistics & Intelligence */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <div className="p-6 bg-zinc-900 text-white rounded-[2rem] shadow-xl shadow-zinc-200">
                                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
                                                                            <MapPin size={12} /> Target Logistics
                                                                        </h4>
                                                                        <p className="text-[10px] font-bold italic uppercase leading-relaxed text-zinc-300">
                                                                            {o.shippingAddress?.address}<br/>
                                                                            {o.shippingAddress?.city}, {o.shippingAddress?.postalCode}<br/>
                                                                            {o.shippingAddress?.state}
                                                                        </p>
                                                                    </div>
                                                                    <div className="p-6 bg-white border border-zinc-100 rounded-[2rem] flex flex-col justify-between">
                                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                                            <Truck size={12} /> Logistics Data
                                                                        </h4>
                                                                        <div className="mt-4">
                                                                            <div className="text-xs font-black uppercase tracking-tighter">
                                                                                {o.deliveryPartner || 'Carrier Pending'}
                                                                            </div>
                                                                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                                                                Track: {o.trackingId || 'Not Generated'}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-6 bg-white border border-zinc-100 rounded-[2rem] flex flex-col justify-between">
                                                                        <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                                                            <CreditCard size={12} /> Gate Data
                                                                        </h4>
                                                                        <div className="mt-4">
                                                                            <div className="text-xs font-black uppercase tracking-tighter">Pay-UID: {o.paymentResult?.id || 'N/A'}</div>
                                                                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                                                                {o.paymentMethod} • Internal-ID #{o._id.slice(-6)}
                                                                            </div>
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
                            Fulfillment Log: <span className="text-zinc-900">{total} ACTIVE</span> • Page {page} / {pages}
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

            {/* Shipping Info Modal */}
            <AnimatePresence>
                {shippingModal.show && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShippingModal({ show: false, orderId: null, status: null, partner: '', tracking: '' })}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl overflow-hidden border border-zinc-100"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200">
                                    <Truck className="text-white" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter">Shipping <span className="text-zinc-400">Logistics</span></h3>
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mt-0.5">Enter carrier details to confirm shipment</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-zinc-400">Carrier / Partner</label>
                                    <input 
                                        autoFocus
                                        placeholder="e.g. BlueDart, Delhivery, EcomExpress"
                                        value={shippingModal.partner}
                                        onChange={(e) => setShippingModal(prev => ({ ...prev, partner: e.target.value }))}
                                        className="w-full bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:border-black focus:ring-4 ring-zinc-50 transition-all placeholder:text-zinc-300"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-zinc-400">Tracking Number / AWB</label>
                                    <input 
                                        placeholder="Enter shipment tracking ID"
                                        value={shippingModal.tracking}
                                        onChange={(e) => setShippingModal(prev => ({ ...prev, tracking: e.target.value }))}
                                        className="w-full bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-wider outline-none focus:border-black focus:ring-4 ring-zinc-50 transition-all placeholder:text-zinc-300"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => setShippingModal({ show: false, orderId: null, status: null, partner: '', tracking: '' })}
                                        className="flex-1 px-6 py-4 bg-zinc-100 text-zinc-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 hover:text-black transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => handleStatusChange(shippingModal.orderId, shippingModal.status, { partner: shippingModal.partner, tracking: shippingModal.tracking })}
                                        disabled={!shippingModal.partner || !shippingModal.tracking}
                                        className="flex-[1.5] px-6 py-4 bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 disabled:shadow-none"
                                    >
                                        Confirm Shipment
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;
