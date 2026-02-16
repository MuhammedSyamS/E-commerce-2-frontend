import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { BarChart, Users, IndianRupee, Download, Calendar, TrendingUp, ShoppingBag, Package, PieChart } from 'lucide-react';

const AdminReports = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [reportData, setReportData] = useState(null);
    const [userGrowth, setUserGrowth] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchReports();
    }, [timeRange]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            // Parallel fetch
            const [salesRes, usersRes] = await Promise.all([
                axios.get(`/api/reports/sales?range=${timeRange}`, config),
                axios.get(`/api/reports/users`, config)
            ]);

            setReportData(salesRes.data); // { timeline, summary, topProducts, categoryStats }
            setUserGrowth(usersRes.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const exportCSV = () => {
        if (!reportData?.timeline) return addToast("No data to export", "error");
        const headers = "Date,Revenue,Orders";
        const rows = reportData.timeline.map(d => `${d._id},${d.revenue},${d.orders}`).join('\n');
        const csvContent = "data:text/csv;charset=utf-8," + encodeURI(headers + '\n' + rows);
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "sales_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper for CSS Chart
    const getMax = (arr, key) => Math.max(...arr.map(o => o[key] || 0), 1);

    if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50 font-black uppercase tracking-widest text-[10px]">Generating Financial Reports...</div>;

    const { timeline = [], summary = {}, topProducts = [], categoryStats = [] } = reportData || {};

    return (
        <div>
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Business Intelligence</p>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">Performance <span className="text-zinc-300">Report</span></h1>
                </div>

                <div className="flex gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-white border border-zinc-200 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide outline-none cursor-pointer hover:border-black transition-colors shadow-sm"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                    <button onClick={exportCSV} className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center gap-2 hover:bg-zinc-800 transition shadow-sm">
                        <Download size={14} /> Export
                    </button>
                </div>
            </div>

            {/* 1. KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-black text-emerald-600">₹{summary.totalRevenue?.toLocaleString()}</h3>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-full text-emerald-600">
                        <IndianRupee size={24} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Orders</p>
                        <h3 className="text-3xl font-black">{summary.totalOrders}</h3>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-full text-blue-600">
                        <ShoppingBag size={24} />
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Avg. Order Value</p>
                        <h3 className="text-3xl font-black">₹{Math.round(summary.avgOrderValue || 0).toLocaleString()}</h3>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-full text-purple-600">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* 2. MAIN REVENUE CHART */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <IndianRupee size={20} /> Revenue Trend
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Growth over selected period</p>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-2">
                        {timeline.length === 0 ? <p className="w-full text-center text-xs text-zinc-300">No data available</p> :
                            timeline.map((d, i) => {
                                const height = (d.revenue / getMax(timeline, 'revenue')) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                                        <div
                                            className="w-full bg-zinc-900 rounded-t-sm hover:bg-emerald-500 transition-colors duration-300 min-h-[4px]"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        <div className="absolute bottom-full mb-2 bg-black text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                                            ₹{d.revenue.toLocaleString()} <br /> <span className="text-zinc-400">{d._id}</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div className="border-t border-zinc-100 pt-2 flex justify-between text-[9px] font-bold text-zinc-400 mt-2">
                        <span>{timeline[0]?._id}</span>
                        <span>{timeline[timeline.length - 1]?._id}</span>
                    </div>
                </div>

                {/* 3. CATEGORY BREAKDOWN */}
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                            <PieChart size={20} /> Top Categories
                        </h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">By Revenue</p>
                    </div>

                    <div className="space-y-4">
                        {categoryStats.length === 0 ? <p className="text-center text-xs text-zinc-300 py-10">No Sales Data</p> :
                            categoryStats.slice(0, 5).map((cat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                                        <span>{cat._id}</span>
                                        <span>₹{cat.revenue.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-black h-full rounded-full"
                                            style={{ width: `${(cat.revenue / summary.totalRevenue) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            {/* 4. TOP PRODUCTS & USER GROWTH ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* TOP PRODUCTS */}
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Package size={20} /> Top Selling Products
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">By Units Sold</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {topProducts.length === 0 ? <p className="text-center text-xs text-zinc-300 py-10">No Sales Data</p> :
                            topProducts.map((p, i) => (
                                <div key={i} className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg font-black text-black/20 w-6">#{i + 1}</span>
                                        <span className="text-xs font-bold uppercase truncate max-w-[150px]">{p.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-black">{p.qty} Sold</p>
                                        <p className="text-[10px] text-zinc-400 font-bold">₹{p.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* USER GROWTH */}
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                                <Users size={20} /> User Acquisition
                            </h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">New Signups Trend</p>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-2">
                        {userGrowth.length === 0 ? <p className="w-full text-center text-xs text-zinc-300">No data available</p> :
                            userGrowth.map((d, i) => {
                                const height = (d.count / getMax(userGrowth, 'count')) * 100;
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                                        <div
                                            className="w-full bg-zinc-200 rounded-t-sm hover:bg-blue-600 transition-colors duration-300 min-h-[4px]"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        <div className="absolute bottom-full mb-2 bg-black text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                            {d.count} Users <br /> {d._id}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div className="border-t border-zinc-100 pt-2 flex justify-between text-[9px] font-bold text-zinc-400 mt-2">
                        <span>{userGrowth[0]?._id}</span>
                        <span>{userGrowth[userGrowth.length - 1]?._id}</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AdminReports;
