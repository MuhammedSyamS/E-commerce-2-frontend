import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend, ComposedChart
} from 'recharts';
import {
    TrendingUp, Users, ShoppingBag, IndianRupee, Package, AlertCircle,
    ArrowUpRight, ArrowDownRight, Activity, Calendar, Truck, BarChart2, Download
} from 'lucide-react';

const AdminAnalytics = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly'

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Pass timeRange to backend
                const { data } = await axios.get(`/api/orders/admin/stats?timeRange=${timeRange}`, config);
                setStats(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setLoading(false);
            }
        };
        if (user?.token) fetchStats();
    }, [user, timeRange]);

    const downloadReport = () => {
        if (!stats) return;

        const headers = ["Date", "Revenue", "Profit", "Expenses", "Orders"];
        const rows = stats.chartData.map(d => [
            d.date,
            d.sales,
            d.profit,
            d.loss,
            d.orderCount
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `analytics_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // COLORS
    const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    const PAYMENT_COLORS = ['#18181b', '#3f3f46', '#71717a'];

    // Safe Data Defaults
    const chartData = stats?.chartData || [];
    const statusData = stats?.orderStatusDist || [];
    const paymentData = stats?.paymentMethodDist || [];
    const trafficData = stats?.trafficSrc || [];
    const retentionData = stats?.customerRetention ? [
        { name: 'New Customers', value: stats.customerRetention.new },
        { name: 'Returning', value: stats.customerRetention.returning }
    ] : [];

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black text-white p-3 rounded-lg shadow-xl border border-zinc-800 text-xs z-50">
                    <p className="font-bold mb-2 border-b border-zinc-800 pb-1">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="flex items-center justify-between gap-4 mb-1">
                            <span>{entry.name}:</span>
                            <span className="font-mono font-bold">₹{entry.value.toLocaleString()}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    if (!user) return <div className="p-8 text-center">Please log in.</div>;
    if (!stats && loading) return <div className="flex h-96 items-center justify-center text-zinc-400 font-mono text-xs animate-pulse">LOADING ANALYTICS ENGINE...</div>;
    if (!stats && !loading) return <div className="flex h-96 items-center justify-center text-red-500 font-mono text-xs">FAILED TO LOAD ANALYTICS DATA.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">

            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-zinc-100 pb-6">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-zinc-900">ANALYTICS<span className="text-purple-600">.</span></h1>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                        <Activity size={14} className="text-green-500" /> Advanced Financial Reports
                    </p>
                </div>

                {/* TIME RANGE SELECTOR */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={downloadReport}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition"
                    >
                        <Download size={14} /> Download Report
                    </button>
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
            </div>

            {/* 1. KEY METRICS ROW (Summary for Selected Period) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => navigate('/admin/analytics/revenue')} className="cursor-pointer">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${stats?.totalSales?.toLocaleString()}`}
                        icon={IndianRupee}
                        trend="Gross Income"
                        trendUp={true}
                        color="text-purple-600"
                        bg="bg-purple-50"
                    />
                </div>
                {/* Net Profit - Also goes to Revenue Page */}
                <div onClick={() => navigate('/admin/analytics/revenue')} className="cursor-pointer">
                    <StatCard
                        title="Net Profit"
                        value={`₹${chartData.reduce((acc, d) => acc + (d.profit || 0), 0).toLocaleString()}`}
                        icon={TrendingUp}
                        trend="Est. Margin"
                        trendUp={true}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                </div>
                {/* Expenses - Also goes to Revenue/Orders Page (Maybe Orders for Costs or Revenue for Breakdown?) */}
                <div onClick={() => navigate('/admin/analytics/revenue')} className="cursor-pointer">
                    <StatCard
                        title="Total Expenses"
                        value={`₹${chartData.reduce((acc, d) => acc + (d.loss || 0), 0).toLocaleString()}`}
                        icon={BarChart2}
                        trend="COGS"
                        trendUp={false}
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                </div>
                <div onClick={() => navigate('/admin/marketing')} className="cursor-pointer">
                    <StatCard
                        title="Total Discounts"
                        value={`₹${stats?.totalDiscounts?.toLocaleString()}`}
                        icon={Package}
                        trend="Savings Given"
                        trendUp={false}
                        color="text-red-600"
                        bg="bg-red-50"
                    />
                </div>
                <div onClick={() => navigate('/admin/marketing')} className="cursor-pointer">
                    <StatCard
                        title="Referral Revenue"
                        value={`₹${stats?.referralRevenue?.toLocaleString()}`}
                        icon={Users}
                        trend="Growth Engine"
                        trendUp={true}
                        color="text-pink-600"
                        bg="bg-pink-50"
                    />
                </div>
            </div>

            {/* LINK FOR USERS ANALYTICS */}
            <div className="flex justify-end">
                <button
                    onClick={() => navigate('/admin/analytics/users')}
                    className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-black transition uppercase tracking-widest"
                >
                    View User Insights <ArrowUpRight size={16} />
                </button>
            </div>

            {/* 2. MAIN CHARTS - NEW LAYOUT */}
            <div className="space-y-6">

                {/* A. REVENUE & PROFIT MIXED CHART */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col h-[400px]">
                    <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 flex justify-between items-center">
                        Revenue vs Profit
                        <span className="text-[10px] text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
                            {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Performance
                        </span>
                    </h3>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a1a1aa' }}
                                    dy={10}
                                    tickFormatter={(val) => {
                                        // Format Date based on range
                                        if (timeRange === 'monthly') return val; // 2023-10
                                        if (timeRange === 'yearly') return val; // 2023
                                        const d = new Date(val);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a1a1aa' }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#a1a1aa' }}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} iconType="circle" />

                                {/* Revenue Area */}
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    name="Revenue"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                                {/* Profit Bar */}
                                <Bar dataKey="profit" name="Net Profit" barSize={20} fill="#10b981" radius={[4, 4, 0, 0]} />
                                {/* Expense Line */}
                                <Line type="monotone" dataKey="loss" name="Expenses" stroke="#ef4444" strokeWidth={2} dot={false} />
                                {/* Order Count Line */}
                                <Line yAxisId="right" type="monotone" dataKey="orderCount" name="Order Vol" stroke="#3b82f6" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* B. SECONDARY CHARTS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[350px]">

                    {/* 1. ORDER STATUS (DONUT + DETAILED LIST) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col md:col-span-2 lg:col-span-1">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6 flex justify-between items-center">
                            Order Statuses
                            <span className="text-[10px] bg-zinc-100 text-zinc-500 px-2 py-1 rounded-full">{stats?.totalOrders} Orders</span>
                        </h3>

                        <div className="flex flex-col gap-6">
                            {/* CHART */}
                            <div className="h-[200px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="60%"
                                            outerRadius="80%"
                                            paddingAngle={5}
                                            dataKey="value"
                                            label={({ percent }) => percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-black text-zinc-900">{stats?.totalOrders}</span>
                                    <span className="text-[9px] font-bold uppercase text-zinc-400">Total</span>
                                </div>
                            </div>

                            {/* DETAILED STATUS LIST */}
                            <div className="grid grid-cols-2 gap-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                {['Pending', 'Confirmed', 'Processing', 'Handed Over', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Refunded', 'Failed'].map((status, i) => {
                                    const match = statusData.find(d => d.name === status);
                                    const count = match ? match.value : 0;
                                    const color = count > 0 ? COLORS[i % COLORS.length] : '#e4e4e7'; // Grey if 0

                                    return (
                                        <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-100">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                                <span className={`text-[10px] font-bold uppercase ${count > 0 ? 'text-zinc-700' : 'text-zinc-400'}`}>{status}</span>
                                            </div>
                                            <span className={`text-xs font-black ${count > 0 ? 'text-zinc-900' : 'text-zinc-300'}`}>{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 2. PAYMENT METHODS (BAR - NOW WITH VOLUME) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Payment Volume</h3>
                        <div className="flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={paymentData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f4f4f5" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f4f4f5' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-black text-white p-2 rounded text-xs">
                                                        <p className="font-bold">{data.name}</p>
                                                        <p>Vol: ₹{data.amount?.toLocaleString()}</p>
                                                        <p>Txns: {data.value}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="amount" fill="#18181b" radius={[0, 4, 4, 0]} barSize={20} name="Volume" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. TRAFFIC SOURCES (NEW) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Traffic Sources</h3>
                        <div className="flex-1 min-h-0 relative flex items-center justify-center">
                            {trafficData && trafficData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={trafficData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {trafficData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">No Traffic Data</p>
                            )}
                        </div>
                    </div>

                    {/* 4. CUSTOMER RETENTION (NEW) */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900 mb-6">Retention</h3>
                        <div className="flex-1 min-h-0 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={retentionData}
                                        cx="50%"
                                        cy="50%"
                                        dataKey="value"
                                        outerRadius={60}
                                    >
                                        {retentionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#3b82f6'} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color, bg }) => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 transition hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${bg} ${color}`}>
                    <Icon size={20} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                        {trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
                <h2 className="text-3xl font-black tracking-tighter text-zinc-900">{value}</h2>
            </div>
        </div>
    );
};

export default AdminAnalytics;
