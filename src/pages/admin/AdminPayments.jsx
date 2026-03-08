import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/instance';
import { 
    Search, IndianRupee, CreditCard, RotateCcw, CheckCircle, 
    ArrowDownUp, RefreshCw, Clock, Download, 
    ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, 
    Calendar, TrendingUp, AlertTriangle, ChevronDown, ChevronUp, FileText
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminPayments = () => {
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const [stats, setStats] = useState({
        grossRevenue: 0,
        netRevenue: 0,
        pending: 0,
        refunded: 0,
        failed: 0,
        transactions: 0
    });

    const fetchPayments = useCallback(async (p = page, search = searchTerm, status = filter) => {
        setLoading(true);
        try {
            const { data } = await api.get(`/orders/admin/all`, {
                params: {
                    page: p,
                    pageSize: 15,
                    keyword: search,
                    status: (status === 'paid' || status === 'pending') ? undefined : (status === 'all' ? undefined : status),
                    isPaid: status === 'paid' ? 'true' : (status === 'pending' ? 'false' : undefined)
                }
            });
            setOrders(data.orders || []);
            setPages(data.pages || 1);
            setTotal(data.total || 0);
            setPage(data.page || 1);
        } catch (err) {
            addToast("Failed to fetch ledger", "error");
        } finally {
            setLoading(false);
        }
    }, [addToast, filter, searchTerm, page]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/orders/admin/stats');
            setStats({
                grossRevenue: data.totalRevenue || 0,
                netRevenue: data.netRevenue || (data.totalRevenue - (data.refundedAmount || 0)),
                pending: data.pendingRevenue || 0,
                refunded: data.refundedAmount || 0,
                failed: data.failedAmount || 0,
                transactions: data.totalOrders || 0
            });
        } catch (err) {
            console.error("Stats Error", err);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchPayments(1);
    }, [fetchStats, fetchPayments]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchPayments(1, searchTerm);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    const handleAction = async (id, action) => {
        try {
            if (action === 'delete') {
                await api.delete(`/orders/${id}`);
                addToast("Entry purged", "success");
            } else {
                const endpoint = action === 'pay' ? 'pay' : 'refund';
                await api.put(`/orders/${id}/${endpoint}`, {});
                addToast(`Capital ${action === 'pay' ? 'Verified' : 'Refunded'}`, "success");
            }
            fetchPayments();
            fetchStats();
        } catch (err) {
            addToast(`Action failed: ${action}`, "error");
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            addToast("Receipt downloading...", "success");
        } catch (err) {
            addToast("Failed to download receipt", "error");
        }
    };

    const toggleRow = (id) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const StatusBadge = ({ status, isPaid }) => {
        if (status === 'Returned' || status === 'Refunded') {
            return <div className="flex items-center gap-1.5 text-rose-500 font-black text-[9px] uppercase italic tracking-widest"><RotateCcw size={10} /> Refunded</div>;
        }
        if (isPaid) {
            return <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[9px] uppercase italic tracking-widest"><CheckCircle size={10} /> Verified</div>;
        }
        return <div className="flex items-center gap-1.5 text-amber-500 font-black text-[9px] uppercase italic tracking-widest"><Clock size={10} /> Pending Inflow</div>;
    };

    return (
        <div className="p-8 bg-[#fbfbfb] min-h-screen relative font-sans">
            {/* Header */}
            <header className="max-w-[1500px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center shadow-xl shadow-zinc-200">
                            <IndianRupee className="text-white" size={20} />
                        </div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">
                            Treasury <span className="text-zinc-300">Control</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-400">Enterprise Capital Reconciliation</p>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={14} />
                        <input
                            placeholder="Find Trans-ID, Alias, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white border border-zinc-200 pl-11 pr-6 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest w-72 focus:ring-4 ring-zinc-50 focus:border-black outline-none transition-all shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={() => { fetchPayments(); fetchStats(); addToast("Syncing Ledger...", "info"); }}
                        className="p-3.5 bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-black hover:border-black transition-all shadow-sm active:scale-95"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                    <button 
                        onClick={async () => {
                            try {
                                addToast("Generating Audit Report...", "info");
                                const response = await api.get('/orders/admin/report', { responseType: 'blob' });
                                const url = window.URL.createObjectURL(new Blob([response.data]));
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'audit-ledger.pdf');
                                document.body.appendChild(link);
                                link.click();
                                link.remove();
                                addToast("Audit Report Ready", "success");
                            } catch (err) {
                                addToast("Failed to generate report", "error");
                            }
                        }}
                        className="flex items-center gap-2 px-6 py-3.5 bg-black text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-xl shadow-black/10 hover:shadow-black/20 hover:scale-[1.02] transition-all"
                    >
                        <Download size={14} /> Audit Report
                    </button>
                </div>
            </header>

            {/* KPI Engine */}
            <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: 'Settled Capital', val: stats.netRevenue, icon: TrendingUp, color: 'zinc' },
                    { label: 'Pending Inflow', val: stats.pending, icon: Clock, color: 'amber' },
                    { label: 'Reverse Capital', val: stats.refunded, icon: RotateCcw, color: 'rose' },
                    { label: 'Trans Volume', val: stats.transactions, icon: CreditCard, color: 'zinc', isCount: true }
                ].map((kpi, idx) => (
                    <motion.div 
                        key={idx}
                        className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className="relative z-10">
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{kpi.label}</p>
                            <div className="text-2xl font-black mt-1">
                                {kpi.isCount ? '' : '₹'}{kpi.val.toLocaleString()}
                            </div>
                        </div>
                        <kpi.icon size={40} className="absolute top-6 right-6 text-zinc-50 group-hover:text-zinc-100 transition-colors" strokeWidth={2.5} />
                    </motion.div>
                ))}
            </div>

            {/* Table Section */}
            <div className="max-w-[1500px] mx-auto">
                <div className="flex gap-1.5 p-1 bg-zinc-900/5 rounded-2xl border border-white mb-8 overflow-x-auto no-scrollbar max-w-max">
                    {['all', 'paid', 'pending', 'refunded'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setFilter(f); setPage(1); }}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filter === f ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:bg-white hover:text-black'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-16 text-center"></th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Ledger Entry</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Entity</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Valuation</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Settle Status</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Direct Act</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={`skeleton-p-${i}`}>
                                                <td colSpan="6" className="p-8">
                                                    <div className="h-14 bg-zinc-50 animate-pulse rounded-2xl w-full" />
                                                </td>
                                            </tr>
                                        ))
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
                                                    <div className="font-black text-xs uppercase tracking-tight">#{o._id.slice(-10)}</div>
                                                    <div className="text-[9px] text-zinc-400 font-bold uppercase mt-1 tracking-widest italic">{o.paymentMethod}</div>
                                                </td>
                                                <td className="p-6">
                                                    <div className="font-bold text-xs">{o.user?.firstName || 'Guest-Client'}</div>
                                                    <div className="text-[10px] text-zinc-400 mt-0.5 lowercase">{o.user?.email || 'N/A'}</div>
                                                </td>
                                                <td className="p-6 font-black text-xs text-zinc-900">₹{o.totalPrice.toLocaleString()}</td>
                                                <td className="p-6">
                                                    <StatusBadge status={o.orderStatus} isPaid={o.isPaid} />
                                                </td>
                                                <td className="p-6 text-right">
                                                    <div className="flex justify-end gap-2 group-hover:opacity-100 opacity-60 transition-opacity">
                                                        {!o.isPaid && o.orderStatus !== 'Cancelled' && (
                                                            <button onClick={() => handleAction(o._id, 'pay')} className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title="Verify Capital">
                                                                <CheckCircle size={14} />
                                                            </button>
                                                        )}
                                                        {o.isPaid && o.orderStatus !== 'Refunded' && (
                                                            <button onClick={() => handleAction(o._id, 'refund')} className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" title="Process Refund">
                                                                <RotateCcw size={14} />
                                                            </button>
                                                        )}
                                                        {o.isPaid && (
                                                            <button 
                                                                onClick={() => downloadInvoice(o._id)}
                                                                className="p-2.5 bg-zinc-50 text-zinc-600 border border-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                                                                title="Download Receipt"
                                                            >
                                                                <FileText size={14} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => window.open(`/order/${o._id}`, '_blank')}
                                                            className="p-2.5 bg-white border border-zinc-100 rounded-xl hover:bg-black hover:text-white transition-all shadow-sm"
                                                            title="Audit Trans"
                                                        >
                                                            <ExternalLink size={14} />
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
                                                        className="bg-zinc-50/30 shadow-inner"
                                                    >
                                                        <td colSpan="6" className="p-10">
                                                            <div className="flex flex-col md:flex-row gap-12 items-start justify-between">
                                                                <div className="flex-1">
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Internal Audit Data</p>
                                                                    <div className="grid grid-cols-2 gap-8">
                                                                        <div>
                                                                            <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Gateway Ref</p>
                                                                            <p className="text-[10px] font-mono font-black">{o.paymentResult?.id || 'NO-GATEWAY-ID'}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mb-1">Timestamp</p>
                                                                            <p className="text-[10px] font-black uppercase">{new Date(o.createdAt).toLocaleString()}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="w-px h-12 bg-zinc-200 hidden md:block" />
                                                                <div className="flex-1">
                                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Capital Allocation</p>
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-2xl font-black">₹{o.totalPrice.toLocaleString()}</span>
                                                                        <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Settle-Ready</span>
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
                            Ledger Summary: <span className="text-zinc-900">{total} TRANS</span> • Page {page} / {pages}
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
        </div>
    );
};

export default AdminPayments;
