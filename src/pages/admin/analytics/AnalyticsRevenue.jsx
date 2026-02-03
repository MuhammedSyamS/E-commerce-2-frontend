import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { IndianRupee, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
                const { data } = await axios.get(`http://localhost:5000/api/orders/admin/stats?timeRange=${timeRange}`, config);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setLoading(false);
            }
        };
        if (user?.token) fetchStats();
    }, [user, timeRange]);

    if (!stats && loading) return <div className="p-8 text-center">Loading...</div>;

    const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#6366f1'];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <button onClick={() => navigate('/admin/analytics')} className="flex items-center gap-2 text-zinc-500 hover:text-black mb-4">
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900">REVENUE ANALYTICS<span className="text-green-500">.</span></h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Deep Dive into Financial Performance</p>
                </div>
                <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                    {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${timeRange === range
                                ? 'bg-black text-white shadow-md'
                                : 'text-zinc-500 hover:text-black hover:bg-zinc-200'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. SALES BY CATEGORY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col h-[400px]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Sales by Category</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats?.salesByCategory || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {stats?.salesByCategory?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col h-[400px]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Category Performance (Bar)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.salesByCategory || []} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10 }} />
                            <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. REVENUE TREND DETAIL */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 h-[500px]">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Detailed Revenue Stream</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.chartData || []}>
                        <defs>
                            <linearGradient id="colorSales2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales2)" name="Revenue" />
                        <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={0} strokeDasharray="5 5" name="Profit" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default AnalyticsRevenue;
