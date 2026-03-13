import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { IndianRupee, Package, TrendingUp, Truck, AlertCircle, ShoppingCart, UserPlus, Star, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const Dashboard = () => {
    const { user } = useStore();
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        recentOrders: [],
        lowStockProducts: [],
        cartStats: { activeCarts: 0, abandonedCarts: 0, recoveryRate: '0%' },
        topCartProducts: [],
        recentReviews: [],
        newUsers: []
    });
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        if (user && !user.isAdmin && user.role !== 'admin') {
            if (user.permissions?.includes('manage_products') && !user.permissions?.includes('view_dashboard')) {
                navigate('/admin/products');
                return;
            }
        }

        const fetchStats = async () => {
            try {
                const { data } = await api.get(`/orders/admin/stats?t=${Date.now()}`);
                setStats(data);
                setLoading(false);
            } catch (err) {
                console.error("Dashboard Error", err);
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchStats();
            const interval = setInterval(fetchStats, 15000);
            return () => clearInterval(interval);
        }
    }, [user, navigate]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* HEADER - COMPACT MNC STYLE */}
            <div className="flex justify-between items-end border-b border-zinc-200 pb-4">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter text-zinc-900">Executive <span className="text-zinc-400">Overview</span></h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">Real-time Enterprise Data</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded text-[10px] font-bold uppercase tracking-widest">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Live
                    </span>
                </div>
            </div>

            {/* ROW 1: CORE KPI CARDS (4 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Gross Revenue"
                    value={`₹${stats?.totalSales?.toLocaleString()}`}
                    icon={IndianRupee}
                    trend="+12%"
                    trendUp={true}
                    color="black"
                />
                <KPICard
                    title="Total Orders"
                    value={stats?.totalOrders}
                    icon={Package}
                    trend="+8%"
                    trendUp={true}
                />
                <KPICard
                    title="Active Carts"
                    value={stats?.cartStats?.activeCarts || 0}
                    icon={ShoppingCart}
                    trend="High Demand"
                    trendUp={true}
                    highlight={true}
                />
                <KPICard
                    title="Total Users"
                    value={stats?.totalUsers}
                    icon={UserPlus}
                    trend="+5%"
                    trendUp={true}
                />
            </div>

            {/* ROW 2: TOP CART PRODUCTS (Horizontal Grid) */}
            {/* "When a product is carted by many users that want to show in top then next and next" */}
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-zinc-900" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">High Demand Products (In Carts Now)</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {stats.topCartProducts?.length > 0 ? (
                        stats.topCartProducts.map((p, i) => (
                            <div key={i} className="group relative bg-zinc-50 hover:bg-zinc-100 border border-zinc-100 rounded-lg p-3 transition-all">
                                <div className="absolute top-2 right-2 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    #{i + 1}
                                </div>
                                <div className="h-24 w-full bg-white rounded-md mb-3 overflow-hidden">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                </div>
                                <p className="text-[10px] font-bold truncate mb-1">{p.name}</p>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs font-black">₹{p.price}</p>
                                    <p className="text-[9px] font-bold text-red-500">{p.count} Carts</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-xs text-zinc-400 italic">
                            Waiting for cart data synchronization...
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 3: RECENT TRANSACTIONS (Full Width Table) */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900">Recent Transactions</h3>
                    <button onClick={() => navigate('/admin/orders')} className="text-[10px] font-bold uppercase text-blue-600 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                                <th className="p-4">ID</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Items</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 text-xs text-zinc-700">
                            {stats.recentOrders?.map(o => (
                                <tr key={o._id} onClick={() => navigate(`/order/${o._id}`)} className="hover:bg-blue-50/50 cursor-pointer transition">
                                    <td className="p-4 font-mono font-bold">#{o._id.slice(-6)}</td>
                                    <td className="p-4 text-zinc-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 font-bold">{o.user?.firstName} {o.user?.lastName}</td>
                                    <td className="p-4 text-zinc-500">View Order</td>
                                    <td className="p-4 font-mono font-bold">₹{o.totalPrice.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${o.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {o.isPaid ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ROW 4: ANALYTICS + REVIEWS + ALERTS (Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 4a. Latest Reviews */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-4 flex items-center gap-2">
                        <Star size={14} className="text-yellow-500" /> Latest Feedback
                    </h3>
                    <div className="space-y-3">
                        {stats.recentReviews?.map((r, i) => (
                            <div key={i} className="border-b border-zinc-50 last:border-0 pb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold">{r.user}</span>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={8} className={idx < r.rating ? "fill-current" : "text-zinc-200 fill-zinc-200"} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-[10px] text-zinc-600 italic">"{r.comment}"</p>
                                <p className="text-[9px] text-zinc-400 mt-1">{r.productName}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4b. Cart Funnel Stats */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 mb-4 flex items-center gap-2">
                        <Activity size={14} className="text-blue-500" /> Cart Funnel
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-zinc-50 rounded">
                            <span className="text-[10px] font-bold uppercase text-zinc-500">Active Sessions</span>
                            <span className="text-lg font-black">{stats?.cartStats?.activeCarts || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                            <span className="text-[10px] font-bold uppercase text-red-500">Abandoned</span>
                            <span className="text-lg font-black text-red-600">{stats?.cartStats?.abandonedCarts || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                            <span className="text-[10px] font-bold uppercase text-green-600">Recovery Rate</span>
                            <span className="text-lg font-black text-green-700">{stats?.cartStats?.recoveryRate || '0%'}</span>
                        </div>
                    </div>
                </div>

                {/* 4c. Stock Alerts */}
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-xs font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                        <AlertCircle size={14} /> Inventory Alerts
                    </h3>
                    <div className="space-y-2">
                        {stats.lowStockProducts?.map(p => (
                            <div key={p._id} className="flex justify-between items-center text-[10px] p-2 hover:bg-red-50 rounded transition">
                                <span className="font-bold truncate">{p.name}</span>
                                <span className="font-mono text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded">
                                    {p.countInStock || p.stock} Left
                                </span>
                            </div>
                        ))}
                        {stats.lowStockProducts?.length === 0 && (
                            <p className="text-[10px] text-zinc-400 italic text-center py-4">High inventory levels maintained.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const KPICard = ({ title, value, icon: Icon, trend, trendUp, color, highlight }) => (
    <div className={`p-6 rounded-xl border shadow-sm transition-all hover:shadow-md ${color === 'black' ? 'bg-black text-white border-black' : 'bg-white text-zinc-900 border-zinc-200'
        } ${highlight ? 'ring-2 ring-blue-500' : ''}`}>
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${color === 'black' ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                <Icon size={18} className={color === 'black' ? 'text-white' : 'text-zinc-600'} />
            </div>
            {trend && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${trendUp
                    ? (color === 'black' ? 'bg-zinc-900 text-green-400' : 'bg-green-50 text-green-600')
                    : 'bg-red-50 text-red-600'
                    }`}>
                    {trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trend}
                </span>
            )}
        </div>
        <div>
            <h3 className="text-3xl font-black tracking-tighter mb-1">{value}</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${color === 'black' ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {title}
            </p>
        </div>
    </div>
);

export default Dashboard;
