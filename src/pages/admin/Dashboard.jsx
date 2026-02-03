import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { IndianRupee, Package, TrendingUp, Truck, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useStore();
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        recentOrders: [],
        lowStockProducts: []
    });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        // REDIRECT MANAGERS AWAY FROM DASHBOARD if they have specific roles
        if (user && !user.isAdmin && user.role !== 'admin') {
            if (user.permissions?.includes('manage_products') && !user.permissions?.includes('view_dashboard')) {
                navigate('/admin/products');
                return;
            }
        }

        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Using the same endpoint, just ignoring chart data
                const { data } = await axios.get('http://localhost:5000/api/orders/admin/stats', config);
                setStats(data);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Error", err);
                setLoading(false);
            }
        };

        if (user?.token) fetchStats();
    }, [user, navigate]);

    if (loading) return <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Overview...</div>;

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex justify-between items-end">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Overview</p>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">Business <span className="text-zinc-300">Performance</span></h1>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full shadow-lg cursor-pointer hover:bg-zinc-800 transition" onClick={() => navigate('/admin/analytics')}>
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest">Live System</span>
                </div>
            </div>

            {/* METRICS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatSimple title="Revenue" value={`₹${stats?.totalSales?.toLocaleString()}`} icon={IndianRupee} />
                <StatSimple title="Orders" value={stats?.totalOrders} icon={Package} />
                <StatSimple title="Users" value={stats?.totalUsers} icon={TrendingUp} />
                <StatSimple title="Avg. Delivery" value={`${stats?.avgDeliveryDays || 0} Days`} icon={Truck} />
            </div>

            {/* RECENT ORDERS & ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* RECENT ORDERS (2/3) */}
                <div className="lg:col-span-2 bg-white border border-zinc-100 p-8 rounded-3xl">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Recent Activity</h3>
                        <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-black uppercase text-purple-600 hover:text-purple-700">View All</button>
                    </div>
                    <div className="space-y-4">
                        {stats.recentOrders?.map(o => (
                            <div key={o._id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition cursor-pointer" onClick={() => navigate(`/admin/orders`)}>
                                <div>
                                    <p className="text-xs font-bold uppercase">#{o._id.slice(-6)}</p>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{o.user?.firstName} {o.user?.lastName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black">₹{o.totalPrice.toLocaleString()}</p>
                                    <p className="text-[9px] text-zinc-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                        {stats.recentOrders?.length === 0 && <p className="text-xs text-zinc-400 italic">No recent orders found.</p>}
                    </div>
                </div>

                {/* LOW STOCK ACTION ALERTS (1/3) */}
                <div className="bg-white border border-zinc-100 p-8 rounded-3xl">
                    <div className="flex items-center gap-2 mb-8">
                        <AlertCircle size={18} className="text-red-500" />
                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">Action Required</h3>
                    </div>
                    <div className="space-y-4">
                        {stats.lowStockProducts?.map(p => (
                            <div key={p._id} className="flex items-center justify-between p-3 border border-red-100 bg-red-50/50 rounded-lg">
                                <div>
                                    <p className="text-xs font-bold truncate w-32">{p.name}</p>
                                    <button onClick={() => navigate('/admin/products')} className="text-[9px] text-red-500 font-black underline mt-1">Restock</button>
                                </div>
                                <span className="text-xs font-black text-red-600 bg-white px-2 py-1 rounded shadow-sm">{p.stock}</span>
                            </div>
                        ))}
                        {stats.lowStockProducts?.length === 0 && (
                            <div className="text-center py-12 text-zinc-400 text-xs">
                                <p>Everything looks good.</p>
                                <p className="mt-2 text-[10px] opacity-70">No immediate actions required.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatSimple = ({ title, value, icon: Icon }) => (
    <div className="bg-white border border-zinc-100 p-6 rounded-2xl flex items-center gap-4 hover:shadow-lg transition-all">
        <div className="p-3 bg-zinc-50 rounded-xl text-black">
            <Icon size={20} />
        </div>
        <div>
            <h3 className="text-2xl font-black tracking-tighter text-zinc-900">{value}</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{title}</p>
        </div>
    </div>
);

export default Dashboard;
