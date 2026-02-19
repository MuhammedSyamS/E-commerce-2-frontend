import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { Search, IndianRupee, CreditCard, RotateCcw, CheckCircle, ArrowDownUp, RefreshCw, Clock } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminPayments = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, pending, paid, refunded

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Using existing getAllOrders logic, we will filter client-side for now
            // API returns { orders: [], page, ... } now
            const { data } = await axios.get('/api/orders/admin/all?pageSize=1000', config); // Fetch all for stats
            setOrders(data.orders || []);
        } catch (err) {
            addToast("Failed to fetch payments", "error");
        } finally {
            setLoading(false);
        }
    };

    // --- CONFIRMATION MODAL STATE ---
    const [confirmModal, setConfirmModal] = useState({ show: false, id: null, action: null });

    const initiateAction = (id, action) => {
        setConfirmModal({ show: true, id, action });
    };

    const handleConfirmAction = async () => {
        const { id, action } = confirmModal;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = action === 'pay' ? 'pay' : 'refund';
            const { data } = await axios.put(`/api/orders/${id}/${endpoint}`, {}, config);

            // Update local state
            setOrders(orders.map(o => o._id === id ? data : o));
            addToast(`Transaction ${action === 'pay' ? 'Verified' : 'Refunded'} Successfully`, "success");
        } catch (err) {
            addToast(`Failed to ${action} transaction`, "error");
        } finally {
            setConfirmModal({ show: false, id: null, action: null });
        }
    };

    // Calculate Stats
    // Calculate Stats
    const stats = {
        grossRevenue: orders.reduce((acc, o) => acc + (o.isPaid ? o.totalPrice : 0), 0),
        netRevenue: orders.reduce((acc, o) => acc + (o.isPaid && o.orderStatus !== 'Returned' && o.orderStatus !== 'Refunded' ? o.totalPrice : 0), 0),
        pending: orders.reduce((acc, o) => acc + (!o.isPaid && o.orderStatus !== 'Cancelled' ? o.totalPrice : 0), 0),
        refunded: orders.reduce((acc, o) => acc + ((o.orderStatus === 'Returned' || o.orderStatus === 'Refunded') ? o.totalPrice : 0), 0),
        failed: orders.reduce((acc, o) => acc + (o.orderStatus === 'Failed' || (o.orderStatus === 'Cancelled' && o.paymentMethod !== 'COD') ? o.totalPrice : 0), 0),
        transactions: orders.filter(o => o.isPaid).length
    };

    // Filter Logic
    const filteredOrders = orders.filter(o =>
        (o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user?.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filter === 'all' ||
            (filter === 'paid' && o.isPaid) ||
            (filter === 'pending' && !o.isPaid) ||
            (filter === 'refunded' && (o.orderStatus === 'Returned' || o.orderStatus === 'Refunded')) ||
            (filter === 'cancelled' && (o.orderStatus === 'Cancelled' || o.orderStatus === 'Failed')))
    );

    return (
        <div className="p-8 min-h-screen">
            {/* HEAD */}
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">Financial <span className="text-zinc-400">Overview</span></h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Revenue & Transaction Monitoring</p>
                </div>

                <div className="flex gap-4">
                    <button onClick={fetchPayments} className="p-3 bg-white rounded-full shadow-sm hover:bg-zinc-100 text-zinc-400 hover:text-black transition">
                        <RefreshCw size={18} />
                    </button>
                    <div className="relative">
                        <input
                            placeholder="Search Trans ID / Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-zinc-200 pl-10 pr-4 py-3 rounded-full text-xs font-bold uppercase tracking-widest w-64 focus:border-black outline-none"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={14} />
                    </div>
                </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {/* 1. Net Revenue */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition text-green-600">
                        <IndianRupee size={100} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Net Revenue</div>
                    <div className="text-3xl font-black tracking-tighter text-zinc-900">₹{stats.netRevenue.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 mt-2">After Refunds</div>
                </div>

                {/* 2. Pending */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition text-yellow-600">
                        <ArrowDownUp size={100} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Pending / COD</div>
                    <div className="text-3xl font-black tracking-tighter text-yellow-600">₹{stats.pending.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-yellow-400 mt-2">Expected Inflow</div>
                </div>

                {/* 3. Refunded (Loss) */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition text-red-600">
                        <RotateCcw size={100} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Refunded / Returns</div>
                    <div className="text-3xl font-black tracking-tighter text-red-500">₹{stats.refunded.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-red-300 mt-2">Processed Refunds</div>
                </div>

                {/* 4. Failed / Loss */}
                <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm relative overflow-hidden group hover:shadow-lg transition">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition text-zinc-600">
                        <CreditCard size={100} />
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Failed / Cancelled</div>
                    <div className="text-3xl font-black tracking-tighter text-zinc-500">₹{stats.failed.toLocaleString()}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-300 mt-2">Lost Opportunity</div>
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {['all', 'paid', 'pending', 'refunded', 'cancelled'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition whitespace-nowrap ${filter === f ? 'bg-black text-white' : 'bg-white text-zinc-400 hover:bg-zinc-50'
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction ID</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">User</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Method</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                        {loading ? (
                            <tr><td colSpan="6" className="p-12 text-center text-xs font-bold uppercase text-zinc-400">Loading Transactions...</td></tr>
                        ) : filteredOrders.map(o => (
                            <tr key={o._id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="p-6">
                                    <div className="font-bold text-xs uppercase font-mono">#{o._id.slice(-8)}</div>
                                    <div className="text-[9px] text-zinc-300 font-bold uppercase mt-1">{new Date(o.createdAt).toLocaleDateString()}</div>
                                </td>
                                <td className="p-6">
                                    <div className="font-bold text-xs">{o.user?.firstName} {o.user?.lastName}</div>
                                    <div className="text-[9px] text-zinc-400">{o.user?.email}</div>
                                </td>
                                <td className="p-6 p-font-mono font-bold text-sm">
                                    ₹{o.totalPrice.toLocaleString()}
                                </td>
                                <td className="p-6">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-500 px-2 py-1 rounded">
                                        {o.paymentMethod}
                                    </span>
                                </td>
                                <td className="p-6">
                                    {o.orderStatus === 'Returned' ? (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            <RotateCcw size={10} /> Refunded
                                        </span>
                                    ) : o.isPaid ? (
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                <CheckCircle size={10} /> Paid
                                            </span>
                                            {o.paidAt && <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-wider pl-1">{new Date(o.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                        </div>
                                    ) : (
                                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                            <Clock size={10} /> Pending
                                        </span>
                                    )}
                                </td>
                                <td className="p-6 text-right space-x-2">
                                    {!o.isPaid && o.orderStatus !== 'Cancelled' && (
                                        <button
                                            onClick={() => initiateAction(o._id, 'pay')}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition"
                                        >
                                            <CheckCircle size={12} /> Verify
                                        </button>
                                    )}
                                    {o.isPaid && o.orderStatus !== 'Returned' && (
                                        <button
                                            onClick={() => initiateAction(o._id, 'refund')}
                                            className="inline-flex items-center gap-2 px-3 py-2 border border-zinc-200 text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition"
                                        >
                                            <RotateCcw size={12} /> Refund
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* CONFIRMATION MODAL */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl animate-in zoom-in-95">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${confirmModal.action === 'pay' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            {confirmModal.action === 'pay' ? <CheckCircle size={24} /> : <RotateCcw size={24} />}
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tighter mb-2 italic text-center">
                            {confirmModal.action === 'pay' ? 'Verify Payment?' : 'Refund Order?'}
                        </h3>
                        <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wide mb-8">
                            {confirmModal.action === 'pay'
                                ? "Confirm this payment has been received?"
                                : "This will process a refund for this order."}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setConfirmModal({ show: false, id: null, action: null })}
                                className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-zinc-200 hover:bg-zinc-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`py-4 rounded-xl font-black text-white uppercase text-[10px] tracking-widest shadow-lg transition ${confirmModal.action === 'pay'
                                    ? 'bg-black hover:bg-zinc-800 shadow-zinc-200'
                                    : 'bg-red-500 hover:bg-red-600 shadow-red-200'}`}
                            >
                                {confirmModal.action === 'pay' ? 'Yes, Verify' : 'Confirm Refund'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
