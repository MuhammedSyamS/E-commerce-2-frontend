import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, ArrowLeft, Trophy, Download, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EmptyChart = ({ message = 'No data available' }) => (
    <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <Activity size={18} className="text-zinc-300" />
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{message}</p>
    </div>
);

const AnalyticsUsers = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/admin/stats?timeRange=monthly`, config);
                setStats(data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) fetchStats();
    }, [user]);

    const downloadCSV = () => {
        const customers = stats?.topCustomers || [];
        if (!customers.length) {
            alert('No customer data to export.');
            return;
        }
        const headers = ['Rank', 'Name', 'Email', 'Total Spend', 'Orders', 'Avg Order Value'];
        const rows = customers.map((c, i) => [
            i + 1,
            `"${c.name}"`,
            `"${c.email}"`,
            c.totalSpend || 0,
            c.orderCount || 0,
            c.avgOrderValue || 0
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `top_customers_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading User Data...</p>
            </div>
        </div>
    );

    const userGrowth = stats?.userGrowth || [];
    const topCustomers = stats?.topCustomers || [];
    const retention = stats?.customerRetention || { new: 0, returning: 0 };
    const totalCustomers = retention.new + retention.returning;
    const retentionRate = totalCustomers > 0 ? Math.round((retention.returning / totalCustomers) * 100) : 0;
    const retentionData = totalCustomers > 0
        ? [{ name: 'New', value: retention.new }, { name: 'Returning', value: retention.returning }]
        : [];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-zinc-100 pb-6">
                <div>
                    <button onClick={() => navigate('/admin/analytics')} className="flex items-center gap-2 text-zinc-400 hover:text-black text-xs font-bold uppercase tracking-widest mb-3 transition">
                        <ArrowLeft size={13} /> Back to Analytics
                    </button>
                    <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900">
                        USER INSIGHTS<span className="text-blue-500">.</span>
                    </h1>
                    <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-widest mt-1 flex items-center gap-1.5">
                        <Users size={11} className="text-blue-500" /> Growth & Customer Loyalty
                    </p>
                </div>
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition self-start md:self-auto"
                >
                    <Download size={12} /> Export Top Customers
                </button>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats?.totalUsers || 0, up: true, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'New Customers', value: retention.new, up: true, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Returning', value: retention.returning, up: true, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Retention Rate', value: `${retentionRate}%`, up: retentionRate > 30, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-100">
                        <div className="flex justify-between items-start mb-3">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${kpi.color}`}>{kpi.label}</p>
                            <div className={`flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full ${kpi.up ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                                {kpi.up ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}
                            </div>
                        </div>
                        <p className="text-2xl font-black text-zinc-900 tracking-tighter">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* User Growth + Top Customers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Growth Line Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-5">User Acquisition Trend (Monthly)</h3>
                    <div>
                        {userGrowth.length === 0 ? (
                            <EmptyChart message="No user growth data yet" />
                        ) : (
                            <ResponsiveContainer width="100%" height={280}>
                                <LineChart data={userGrowth} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa' }} dy={8} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#a1a1aa' }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #f4f4f5', fontSize: '11px' }}
                                        formatter={(v) => [v, 'New Users']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="New Users"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Top Customers */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-4 flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-500" /> Top Spenders
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {topCustomers.length === 0 ? (
                            <div className="h-full min-h-[200px]"><EmptyChart message="No paid orders yet" /></div>
                        ) : topCustomers.map((c, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-50 transition">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-zinc-300 text-zinc-700' : i === 2 ? 'bg-orange-300 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 truncate">{c.name || 'Unknown'}</p>
                                    <p className="text-[10px] text-zinc-400 truncate">{c.email}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-xs font-black text-zinc-900">₹{(c.totalSpend || 0).toLocaleString()}</p>
                                    <p className="text-[9px] text-zinc-400">{c.orderCount} orders</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Retention Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Retention Pie */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-5">Retention Breakdown</h3>
                    <div>
                        {retentionData.length === 0 ? (
                            <EmptyChart message="No retention data" />
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie data={retentionData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                        <Cell fill="#10b981" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip formatter={(v, n) => [v + ' customers', n]} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Stat Cards for retention */}
                <div className="grid grid-cols-1 gap-4 content-center">
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-black text-emerald-600">{retention.new}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-zinc-900">New Customers</p>
                            <p className="text-zinc-500 text-sm">First-time buyers</p>
                        </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-center gap-6">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-black text-blue-600">{retention.returning}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-zinc-900">Returning Customers</p>
                            <p className="text-zinc-500 text-sm">Made more than 1 order · Retention: <span className="font-bold text-zinc-800">{retentionRate}%</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsUsers;
