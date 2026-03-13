import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import api from '../../../api/instance';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#6366f1'];

const EmptyChart = ({ message = 'No data available' }) => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <Activity size={18} className="text-zinc-300" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{message}</p>
    </div>
);

const AnalyticsOrders = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('daily');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/orders/admin/stats?timeRange=${timeRange}`);
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) fetchStats();
    }, [user, timeRange]);

    const downloadCSV = async () => {
        try {
            addToast('Preparing Export...', 'info');
            // api instance already has base URL with /api prefix, so just use /orders/admin/all
            const { data } = await api.get(`/orders/admin/all?pageSize=10000`);

            if (!data.orders?.length) {
                addToast('No orders to export', 'error');
                return;
            }

            const escape = (text) => {
                if (text === null || text === undefined) return '';
                return `"${String(text).replace(/"/g, '""')}"`;
            };

            const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Payment', 'Method'];
            const rows = data.orders.map(o => [
                escape(o._id),
                escape(new Date(o.createdAt).toLocaleDateString()),
                escape(o.user ? `${o.user.firstName} ${o.user.lastName}` : 'Guest'),
                escape(o.user?.email || ''),
                escape(o.orderItems?.length || 0),
                escape(o.totalPrice),
                escape(o.orderStatus || (o.isDelivered ? 'Delivered' : 'Pending')),
                escape(o.isPaid ? 'Paid' : 'Unpaid'),
                escape(o.paymentMethod)
            ]);

            const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Order_Export_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            addToast('Export Complete ✓', 'success');
        } catch (error) {
            console.error('Export Failed:', error);
            addToast('Failed to export orders', 'error');
        }
    };

    if (!user) return <div className="p-8 text-center text-zinc-400">Please log in.</div>;
    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Order Data...</p>
            </div>
        </div>
    );
    if (!stats) return <div className="p-8 text-center text-red-500">Failed to load order data.</div>;

    const orderStatusDist = stats.orderStatusDist || [];
    const chartData = stats.chartData || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-zinc-100 pb-6">
                <div>
                    <button onClick={() => navigate('/admin/analytics')} className="flex items-center gap-2 text-zinc-400 hover:text-black text-xs font-bold uppercase tracking-widest mb-3 transition">
                        <ArrowLeft size={13} /> Back to Analytics
                    </button>
                    <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900">
                        ORDER OPS<span className="text-amber-500">.</span>
                    </h1>
                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                        <Truck size={11} className="text-amber-500" /> Fulfillment & Status Reports
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition"
                    >
                        <Download size={12} /> Export Orders CSV
                    </button>
                    <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                        {['daily', 'weekly', 'monthly'].map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${timeRange === r ? 'bg-black text-white shadow' : 'text-zinc-500 hover:text-black hover:bg-zinc-200'}`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: stats.totalOrders || 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Delivered', value: orderStatusDist.find(d => d.name === 'Delivered')?.value || 0, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Return Requests', value: stats.refundRequests || 0, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Avg. Delivery', value: `${stats.avgDeliveryDays || 0}d`, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${kpi.color} mb-2`}>{kpi.label}</p>
                        <p className="text-2xl font-black text-zinc-900 tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Order Status Pie + Problematic Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Donut */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Order Status Distribution</h3>
                        <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">{stats.totalOrders || 0} Total</span>
                    </div>
                    <div>
                        {orderStatusDist.length === 0 ? (
                            <EmptyChart message="No order status data" />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={orderStatusDist}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        label={({ name, percent }) => percent > 0.04 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                        labelLine={false}
                                    >
                                        {orderStatusDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v + ' orders', n]} />
                                    <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Problematic Orders */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-5 flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-500" /> Order Issues
                    </h3>
                    <div className="space-y-4 flex-1">
                        <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-3 rounded-xl text-red-600 flex-shrink-0">
                                    <RefreshCw size={18} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-red-900">{stats.refundRequests || 0}</h4>
                                    <p className="text-red-700 text-[10px] font-bold uppercase tracking-wider">Return / Refund Requests</p>
                                </div>
                            </div>
                            <button onClick={() => navigate('/admin/returns')} className="px-4 py-2 bg-white text-red-600 font-bold text-xs rounded-xl shadow-sm hover:bg-red-50 border border-red-100 transition">
                                Review
                            </button>
                        </div>

                        <div className="p-5 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-100 p-3 rounded-xl text-orange-600 flex-shrink-0">
                                    <AlertTriangle size={18} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-orange-900">{stats.failedPayments || 0}</h4>
                                    <p className="text-orange-700 text-[10px] font-bold uppercase tracking-wider">Failed / Cancelled Payments</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center gap-4">
                            <div className="bg-zinc-200 p-3 rounded-xl text-zinc-600 flex-shrink-0">
                                <Truck size={18} />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-zinc-900">{stats.avgDeliveryDays || 0} <span className="text-sm text-zinc-400 font-normal">days</span></h4>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Avg. Delivery Time</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Order Volume Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Order Volume Trend</h3>
                    <span className="text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-lg">
                        {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} view · {chartData.length} data points
                    </span>
                </div>
                <div>
                    {chartData.length === 0 ? (
                        <EmptyChart message={`No order data in ${timeRange} view`} />
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa' }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa' }} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: '#fafafa' }}
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', fontSize: '11px' }}
                                    formatter={(v) => [v, 'Orders']}
                                />
                                <Bar dataKey="orderCount" name="Orders" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                {/* Revenue vs Orders secondary insight */}
                {chartData.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-50 flex items-center gap-6 text-xs text-zinc-500">
                        <span>Total orders this period: <strong className="text-zinc-900">{chartData.reduce((s, d) => s + (d.orderCount || 0), 0)}</strong></span>
                        <span>Total revenue: <strong className="text-zinc-900">₹{chartData.reduce((s, d) => s + (d.sales || 0), 0).toLocaleString()}</strong></span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsOrders;
