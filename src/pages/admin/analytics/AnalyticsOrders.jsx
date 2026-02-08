import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import axios from 'axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Package, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AnalyticsOrders = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/orders/admin/stats`, config);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setLoading(false);
            }
        };
        if (user?.token) fetchStats();
    }, [user]);

    if (!user) return <div className="p-8 text-center">Please log in.</div>;
    if (!stats && loading) return <div className="p-8 text-center text-zinc-500 animate-pulse">Loading analytics...</div>;
    if (!stats && !loading) return <div className="p-8 text-center text-red-500">Failed to load data.</div>;

    const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <button onClick={() => navigate('/admin/analytics')} className="flex items-center gap-2 text-zinc-500 hover:text-black mb-4">
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900">ORDER OPERATIONS<span className="text-amber-500">.</span></h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Fulfillment & Status Reports</p>
                </div>
            </div>

            {/* 1. ORDER STATUS PIE + DETAILS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col h-[500px]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Global Order Status</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats?.orderStatusDist || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                                {stats?.orderStatusDist?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend layout="vertical" align="right" verticalAlign="middle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col h-[500px]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Problematic Orders</h3>
                    <div className="space-y-4">
                        <div className="p-6 bg-red-50 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-red-100 p-3 rounded-xl text-red-600">
                                    <RefreshCw />
                                </div>
                                <div>
                                    <h4 className="font-black text-red-900 text-xl">{stats?.refundRequests || 0}</h4>
                                    <p className="text-red-700 text-xs font-bold uppercase">Return Requests</p>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-white text-red-600 font-bold text-xs rounded-lg shadow-sm">Review</button>
                        </div>

                        <div className="p-6 bg-orange-50 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                                    <RefreshCw />
                                </div>
                                <div>
                                    <h4 className="font-black text-orange-900 text-xl">{stats?.failedPayments || 0}</h4>
                                    <p className="text-orange-700 text-xs font-bold uppercase">Failed Payments</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-zinc-50 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-zinc-200 p-3 rounded-xl text-zinc-600">
                                    <Package />
                                </div>
                                <div>
                                    <h4 className="font-black text-zinc-900 text-xl">{stats?.avgDeliveryDays || 0} <span className="text-sm text-zinc-400">days</span></h4>
                                    <p className="text-zinc-500 text-xs font-bold uppercase">Avg. Delivery Time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. VOLUME TREND */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 h-[400px]">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Daily Order Volume</h3>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.chartData || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip cursor={{ fill: 'transparent' }} />
                        <Bar dataKey="orderCount" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Orders" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

        </div>
    );
};

export default AnalyticsOrders;
