import React, { useEffect, useState } from 'react';
import { useStore } from '../../../store/useStore';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import { Users, ArrowLeft, Trophy, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
                // Fetch stats with a long range to get good user growth data
                const { data } = await axios.get(`/api/orders/admin/stats?timeRange=yearly`, config);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setLoading(false);
            }
        };
        if (user?.token) fetchStats();
    }, [user]);

    if (!stats && loading) return <div className="p-8 text-center">Loading...</div>;

    const downloadReport = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                responseType: 'blob'
            };
            const { data } = await axios.get(`/api/reports/users/pdf`, config);
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `SLOOK_User_Report.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <button onClick={() => navigate('/admin/analytics')} className="flex items-center gap-2 text-zinc-500 hover:text-black mb-4">
                <ArrowLeft size={16} /> Back to Dashboard
            </button>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900">USER INSIGHTS<span className="text-blue-500">.</span></h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Growth & Customer Loyalty</p>
                </div>
                <button
                    onClick={downloadReport}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-900 text-white hover:bg-black transition shadow-lg shadow-zinc-200"
                >
                    <Download size={14} /> Download PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. USER GROWTH CHART */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 h-[400px]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">User Acquisition Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats?.userGrowth || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. TOP CUSTOMERS LIST */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 flex flex-col h-[400px]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={16} /> Top Spenders
                    </h3>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        {stats?.topCustomers?.map((customer, i) => (
                            <div key={i} className="flex items-center justify-between py-3 border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition px-2 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${i < 3 ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900">{customer.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-zinc-400">{customer.email}</p>
                                            <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-1.5 rounded uppercase">{customer.orderCount} Orders</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-mono text-sm font-black text-zinc-900">₹{customer.totalSpend.toLocaleString()}</p>
                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Avg: ₹{customer.avgOrderValue}</p>
                                </div>
                            </div>
                        ))}
                        {(!stats?.topCustomers || stats.topCustomers.length === 0) && (
                            <p className="text-zinc-400 text-sm text-center mt-10">No data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* 3. NEW RETURNS VS NEW CUSTOMERS COMPARISON (DUMMY/MOCK IF NEEDED or REUSE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-4">Retention Rate</h3>
                    <div className="flex items-center gap-4">
                        <div className="h-40 w-40 rounded-full border-[12px] border-blue-500 flex items-center justify-center">
                            <span className="text-2xl font-black">{stats?.customerRetention?.returning || 0}</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-zinc-900">Returning</p>
                            <p className="text-zinc-500 text-sm">Customers made {'>'}1 order</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-4">New Acquisitions</h3>
                    <div className="flex items-center gap-4">
                        <div className="h-40 w-40 rounded-full border-[12px] border-green-500 flex items-center justify-center">
                            <span className="text-2xl font-black">{stats?.customerRetention?.new || 0}</span>
                        </div>
                        <div>
                            <p className="text-3xl font-black text-zinc-900">New</p>
                            <p className="text-zinc-500 text-sm">First time buyers</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AnalyticsUsers;
