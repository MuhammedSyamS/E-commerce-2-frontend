import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { IndianRupee, ArrowLeft, Download, Activity, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#6366f1'];

const EmptyChart = ({ message = 'No data for this period' }) => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <Activity size={18} className="text-zinc-300" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{message}</p>
    </div>
);

const AnalyticsRevenue = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('daily');

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/admin/stats?timeRange=${timeRange}`, config);
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) fetchStats();
    }, [user, timeRange]);

    const downloadCSV = () => {
        const chartData = stats?.chartData || [];
        if (!chartData.length) {
            alert('No data to export for this period.');
            return;
        }
        const headers = ['Date', 'Revenue', 'Profit', 'Expenses', 'Margin %'];
        const rows = chartData.map(d => [d.date, d.sales || 0, d.profit || 0, d.loss || 0, d.profitMargin || 0]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `revenue_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Revenue Data...</p>
            </div>
        </div>
    );

    const chartData = stats?.chartData || [];
    const salesByCategory = stats?.salesByCategory || [];
    const subcategorySales = stats?.subcategorySales || [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-zinc-100 pb-6">
                <div>
                    <button onClick={() => navigate('/admin/analytics')} className="flex items-center gap-2 text-zinc-400 hover:text-black text-xs font-bold uppercase tracking-widest mb-3 transition">
                        <ArrowLeft size={13} /> Back to Analytics
                    </button>
                    <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900">
                        REVENUE<span className="text-emerald-500">.</span>
                    </h1>
                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                        <TrendingUp size={11} className="text-emerald-500" /> Deep Dive into Financial Performance
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        onClick={downloadCSV}
                        className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition"
                    >
                        <Download size={12} /> Export CSV
                    </button>
                    <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                        {['daily', 'weekly', 'monthly', 'yearly'].map((r) => (
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
                    { label: 'Total Revenue', value: `₹${(stats?.totalSales || 0).toLocaleString()}`, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Net Profit', value: `₹${chartData.reduce((s, d) => s + (d.profit || 0), 0).toLocaleString()}`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Total Discounts', value: `₹${(stats?.totalDiscounts || 0).toLocaleString()}`, color: 'text-red-500', bg: 'bg-red-50' },
                    { label: 'Today\'s Sales', value: `₹${(stats?.todaySales || 0).toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${kpi.color} mb-2`}>{kpi.label}</p>
                        <p className="text-2xl font-black text-zinc-900 tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* 1. Revenue & Profit Margin Area Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Revenue & Profit Margin</h3>
                    {(stats?.totalDiscounts || 0) > 0 && (
                        <div className="bg-red-50 border border-red-100 px-3 py-1 rounded-full text-[10px] font-black text-red-600 uppercase tracking-wider">
                            Discount Impact: ₹{stats.totalDiscounts.toLocaleString()}
                        </div>
                    )}
                </div>
                <div>
                    {chartData.length === 0 ? (
                        <EmptyChart message={`No revenue data in ${timeRange} view`} />
                    ) : (
                        <ResponsiveContainer width="100%" height={320}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa' }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa' }} tickFormatter={v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                    formatter={(value, name) => [
                                        name === 'Margin %' ? `${value}%` : `₹${Number(value).toLocaleString()}`,
                                        name
                                    ]}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="sales" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad2)" />
                                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#3b82f6" strokeWidth={2} fill="url(#profitGrad)" strokeDasharray="5 5" />
                                <Area type="monotone" dataKey="profitMargin" name="Margin %" stroke="#f59e0b" strokeWidth={1.5} fill="none" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* 2. Sales by Category & Subcategory */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Pie */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-5">Sales by Category</h3>
                    <div className="h-[280px]">
                        {salesByCategory.length === 0 ? (
                            <EmptyChart message="No category sales data" />
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={salesByCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={4}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {salesByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Subcategory Bar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-5">Subcategory Performance</h3>
                    <div className="h-[280px]">
                        {subcategorySales.length === 0 ? (
                            <EmptyChart message="No subcategory breakdown" />
                        ) : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={subcategorySales} layout="vertical" margin={{ left: 10, right: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="#f4f4f5" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={90} tick={{ fontSize: 9, fontWeight: 'bold', fill: '#52525b' }} />
                                    <Tooltip cursor={{ fill: '#fafafa' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']} />
                                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 5, 5, 0]} barSize={18} name="Revenue" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsRevenue;
