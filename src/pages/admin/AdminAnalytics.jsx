import React, { useEffect, useState } from 'react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/instance';
import {
    AreaChart, Area, BarChart, Bar, LineChart, Line,
    PieChart, Pie, Cell, ComposedChart,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend, ReferenceLine, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, Users, IndianRupee, Package,
    ArrowUpRight, ArrowDownRight, Activity, Download,
    ShoppingBag, Zap, CreditCard, Target, AlertCircle,
    BarChart2, Percent, RefreshCw, Star
} from 'lucide-react';

/* ─────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────── */
const HEX = {
    violet: '#7c3aed',
    emerald: '#059669',
    amber: '#d97706',
    red: '#dc2626',
    blue: '#2563eb',
    pink: '#db2777',
    indigo: '#4338ca',
    teal: '#0d9488',
    sky: '#0284c7',
};
const PIE = [HEX.violet, HEX.emerald, HEX.amber, HEX.blue, HEX.pink, HEX.indigo, HEX.teal];

/* ─────────────────────────────────────────────────
   CUSTOM DARK TOOLTIP
───────────────────────────────────────────────── */
const Tip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const isCount = n => ['Orders', 'Vol', 'Count', 'Users', 'Returning', 'New'].includes(n);
    return (
        <div style={{
            background: 'linear-gradient(135deg,#0f0f1a 0%,#0a0a12 100%)',
            border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 14, padding: '12px 16px', minWidth: 150,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
        }}>
            {label && <p style={{ color: '#52525b', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{label}</p>}
            {payload.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 3, background: p.color }} />
                        <span style={{ color: '#71717a', fontSize: 10, fontWeight: 700 }}>{p.name}</span>
                    </div>
                    <span style={{ color: '#fff', fontSize: 11, fontWeight: 900, fontFamily: 'monospace' }}>
                        {isCount(p.name) ? p.value : `₹${Number(p.value || 0).toLocaleString()}`}
                    </span>
                </div>
            ))}
        </div>
    );
};

/* ─────────────────────────────────────────────────
   SPARKLINE — mini area chart in KPI card
───────────────────────────────────────────────── */
const Spark = ({ data, dk, color }) => {
    if (!data?.length) return <div style={{ height: 36 }} />;
    return (
        <ResponsiveContainer width="100%" height={36}>
            <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                    <linearGradient id={`spk-${dk}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey={dk} stroke={color} strokeWidth={1.5} fill={`url(#spk-${dk})`} dot={false} isAnimationActive={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
};

/* ─────────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────────── */
const Kpi = ({ label, value, sub, color, accent, icon: Icon, spark, dk, trend, trendUp, onClick }) => (
    <div onClick={onClick} style={{
        background: `linear-gradient(135deg, ${accent}10 0%, rgba(255,255,255,0) 60%)`,
        border: `1px solid ${accent}22`,
    }} className={`relative bg-white rounded-2xl p-5 shadow-sm overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200' : ''}`}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg,${accent},${accent}00)` }} />
        <div className="flex justify-between items-start mb-3">
            <div style={{ background: `${accent}15` }} className="p-2 rounded-xl">
                <Icon size={15} style={{ color: accent }} />
            </div>
            {trend && (
                <span style={{ color: trendUp ? '#059669' : '#dc2626', background: trendUp ? '#05966915' : '#dc262615' }} className="flex items-center gap-0.5 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    {trendUp ? <ArrowUpRight size={9} /> : <ArrowDownRight size={9} />}{trend}
                </span>
            )}
        </div>
        <p className="text-[9px] font-black uppercase tracking-[2px] text-zinc-400 mb-1">{label}</p>
        <h3 className="text-[1.7rem] font-black tracking-tighter text-zinc-900 leading-none mb-1">{value}</h3>
        {sub && <p className="text-[9px] text-zinc-400 mb-3">{sub}</p>}
        <Spark data={spark} dk={dk} color={accent} />
    </div>
);

/* ─────────────────────────────────────────────────
   CHART CARD WRAPPER
───────────────────────────────────────────────── */
const Card = ({ title, sub, badge, accent = HEX.violet, children, action }) => (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div style={{ borderTop: `3px solid ${accent}` }} className="px-6 pt-5 pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[2px] text-zinc-900">{title}</h3>
                    {sub && <p className="text-[9px] text-zinc-400 mt-0.5">{sub}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {badge && <span style={{ background: `${accent}12`, color: accent }} className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">{badge}</span>}
                    {action}
                </div>
            </div>
        </div>
        <div className="px-6 pb-6">{children}</div>
    </div>
);

/* ─────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────── */
const Empty = ({ msg = 'No data for this period' }) => (
    <div className="flex flex-col items-center justify-center gap-3" style={{ height: 200 }}>
        <div style={{ background: '#fafafa', border: '1px dashed #e4e4e7', borderRadius: 999, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} className="text-zinc-300" />
        </div>
        <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[2px]">{msg}</p>
    </div>
);

/* ─────────────────────────────────────────────────
   AXIS PROPS (reused)
───────────────────────────────────────────────── */
const ax = { axisLine: false, tickLine: false, tick: { fontSize: 9, fill: '#a1a1aa' } };
const rupee = v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`;

/* ═════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════ */
export default function AdminAnalytics() {
    const { user } = useStore();
    const nav = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState('daily');
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (!user?.token) return;
        setLoading(true);
        api.get(`/orders/admin/stats?timeRange=${range}`)
            .then(r => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
        api.get('/alerts').then(r => setAlerts(r.data)).catch(() => { });
    }, [user, range]);

    const exportCSV = () => {
        const d = stats?.chartData || [];
        if (!d.length) { alert('No data.'); return; }
        const rows = [['Date', 'Revenue', 'Profit', 'Expenses', 'Orders'], ...d.map(r => [r.date, r.sales || 0, r.profit || 0, r.loss || 0, r.orderCount || 0])];
        const url = URL.createObjectURL(new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' }));
        Object.assign(document.createElement('a'), { href: url, download: `analytics_${range}.csv` }).click();
    };

    /* ── Loading ── */
    if (loading) return (
        <div className="flex h-full min-h-96 items-center justify-center">
            <div className="text-center">
                <div className="relative w-12 h-12 mx-auto mb-4">
                    <div style={{ border: '2px solid #7c3aed22', borderRadius: 999 }} className="absolute inset-0" />
                    <div style={{ border: '2px solid #7c3aed', borderTop: '2px solid transparent', borderRadius: 999 }} className="absolute inset-0 animate-spin" />
                </div>
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[4px]">Loading</p>
            </div>
        </div>
    );
    if (!stats) return (
        <div className="flex h-96 items-center justify-center">
            <div className="text-center space-y-2">
                <p className="font-bold text-zinc-500">Could not load analytics data.</p>
                <button onClick={() => window.location.reload()} className="text-violet-600 text-sm underline">Retry</button>
            </div>
        </div>
    );

    /* ── Data ── */
    const cd = stats.chartData || [];
    const statusData = stats.orderStatusDist || [];
    const payData = stats.paymentMethodDist || [];
    const catData = stats.salesByCategory || [];
    const subCat = stats.subcategorySales || [];
    const traffic = stats.trafficSrc || [];
    const topProds = stats.topSellingProducts || [];
    const topCust = stats.topCustomers || [];
    const ret = stats.customerRetention || { new: 0, returning: 0 };

    const totalRev = stats.totalSales || 0;
    const netProfit = cd.reduce((s, d) => s + (d.profit || 0), 0);
    // Use totalExpenses from backend (discounts + shipping + tax)
    const expenses = stats.totalExpenses || cd.reduce((s, d) => s + (d.loss || 0), 0);
    const periodOrders = cd.reduce((s, d) => s + (d.orderCount || 0), 0);
    const avgMargin = cd.length ? (cd.reduce((s, d) => s + (d.profitMargin || 0), 0) / cd.length).toFixed(1) : 0;
    const retPie = (ret.new + ret.returning) > 0 ? [{ name: 'New', value: ret.new }, { name: 'Returning', value: ret.returning }] : [];
    // Per-period stacked expense bars (from individual breakdown fields)
    const profExpData = cd.map(d => ({ date: d.date, Profit: d.profit || 0, Discounts: d.discounts || 0, Shipping: d.shipping || 0, Tax: d.tax || 0, Total: d.loss || 0 }));
    // Top-level expense breakdown for the donut
    const eb = stats.expenseBreakdown || { discounts: 0, shipping: 0, tax: 0 };
    const expPie = Object.entries(eb)
        .map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v || 0 }))
        .filter(e => e.value > 0);
    // Cart intelligence data
    const cartProds = stats.topCartProducts || [];
    const cartStats = stats.cartStats || { activeCarts: 0, abandonedCarts: 0 };
    const cartChartData = cartProds.map(p => ({ name: (p.name || '').slice(0, 18), 'In Cart': p.count || 0, Sold: p.sold || 0 }));
    const avgCartVal = cartProds.length ? Math.round(cartProds.reduce((s, p) => s + (p.price || 0), 0) / cartProds.length) : 0;

    return (
        <div className="space-y-6 pb-16 animate-in fade-in duration-500">

            {/* ══════════════════════════════════
                DARK HERO HEADER
            ══════════════════════════════════ */}
            <div style={{
                background: 'linear-gradient(135deg,#09090b 0%,#18181b 60%,#1c1917 100%)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 20, padding: '28px 32px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-[9px] font-black text-green-400 uppercase tracking-[3px]">Live Analytics</span>
                        </div>
                        <h1 style={{ background: 'linear-gradient(135deg,#fff 30%,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            className="text-4xl font-black italic tracking-tighter leading-none">
                            ANALYTICS
                        </h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mt-1">Complete Business Intelligence</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={exportCSV} style={{ background: 'linear-gradient(135deg,#7c3aed,#6d28d9)', boxShadow: '0 8px 25px rgba(124,58,237,0.4)' }}
                            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition">
                            <Download size={12} /> Export
                        </button>
                        <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }} className="flex items-center gap-1">
                            {['daily', 'weekly', 'monthly', 'yearly'].map(r => (
                                <button key={r} onClick={() => setRange(r)} style={range === r ? { background: 'rgba(124,58,237,0.8)', color: '#fff', boxShadow: '0 4px 12px rgba(124,58,237,0.4)' } : { color: '#71717a' }}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition">
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Inline hero stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {[
                        { l: 'Revenue', v: `₹${totalRev.toLocaleString()}`, c: '#7c3aed' },
                        { l: 'Net Profit', v: `₹${netProfit.toLocaleString()}`, c: '#059669' },
                        { l: 'Orders', v: stats.totalOrders || 0, c: '#2563eb' },
                        { l: 'Profit Margin', v: `${avgMargin}%`, c: '#d97706' },
                    ].map((s, i) => (
                        <div key={i}>
                            <p style={{ color: s.c, fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</p>
                            <p style={{ color: '#fff', fontSize: 22, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>{s.v}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ALERTS */}
            {alerts.length > 0 && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px' }} className="flex items-center gap-3">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <p className="text-sm font-bold text-red-700 flex-1">{alerts.length} alert{alerts.length > 1 ? 's' : ''} need attention</p>
                    <button onClick={() => nav('/admin/products')} className="text-[10px] font-black text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition">View</button>
                </div>
            )}

            {/* ══════════════════════════════════
                KPI CARDS WITH SPARKLINES
            ══════════════════════════════════ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Kpi label="Total Revenue" value={`₹${totalRev.toLocaleString()}`} sub={`Today ₹${(stats.todaySales || 0).toLocaleString()}`} color="violet" accent={HEX.violet} icon={IndianRupee} spark={cd} dk="sales" trend="Gross" trendUp onClick={() => nav('/admin/analytics/revenue')} />
                <Kpi label="Net Profit" value={`₹${netProfit.toLocaleString()}`} sub={`${avgMargin}% margin`} color="emerald" accent={HEX.emerald} icon={TrendingUp} spark={cd} dk="profit" trend="Gain" trendUp={netProfit > 0} onClick={() => nav('/admin/analytics/revenue')} />
                <Kpi label="Expenses" value={`₹${expenses.toLocaleString()}`} sub="Discounts + Shipping + Tax" color="amber" accent={HEX.amber} icon={Target} spark={cd} dk="loss" trend="Cost" trendUp={false} />
                <Kpi label="Period Orders" value={periodOrders} sub={`${stats.totalOrders || 0} all time`} color="blue" accent={HEX.blue} icon={ShoppingBag} spark={cd} dk="orderCount" trend="Volume" trendUp onClick={() => nav('/admin/analytics/orders')} />
                <Kpi label="Total Users" value={stats.totalUsers || 0} sub={`+${stats.newUsers || 0} new`} color="pink" accent={HEX.pink} icon={Users} spark={stats.userGrowth || []} dk="count" trend="Growth" trendUp onClick={() => nav('/admin/analytics/users')} />
            </div>

            {/* ══════════════════════════════════
                REVENUE TREND — AREA CHART
            ══════════════════════════════════ */}
            <Card title="Total Revenue" sub={`Area trend · ${cd.length} data points · ${range}`} badge={`₹${totalRev.toLocaleString()}`} accent={HEX.violet}>
                {cd.length === 0 ? <Empty /> : (
                    <>
                        <ResponsiveContainer width="100%" height={260}>
                            <AreaChart data={cd} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gAreaRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={HEX.violet} stopOpacity={0.35} />
                                        <stop offset="100%" stopColor={HEX.violet} stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="date" {...ax} dy={6} />
                                <YAxis {...ax} tickFormatter={rupee} />
                                <Tooltip content={<Tip />} />
                                <ReferenceLine y={totalRev / (cd.length || 1)} stroke={HEX.violet} strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'Avg', position: 'insideTopRight', fontSize: 8, fill: HEX.violet }} />
                                <Area type="monotone" dataKey="sales" name="Revenue" stroke={HEX.violet} strokeWidth={2.5} fill="url(#gAreaRev)" activeDot={{ r: 5, fill: HEX.violet, stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                        <div style={{ borderTop: '1px solid #fafafa' }} className="pt-4 mt-2 grid grid-cols-3 gap-4">
                            {[['Peak', `₹${Math.max(...cd.map(d => d.sales || 0)).toLocaleString()}`], [`Avg/${range === 'daily' ? 'Day' : range === 'weekly' ? 'Wk' : range === 'monthly' ? 'Mo' : 'Yr'}`, `₹${Math.round(totalRev / (cd.length || 1)).toLocaleString()}`], ['Total', `₹${totalRev.toLocaleString()}`]].map(([l, v], i) => (
                                <div key={i} className="text-center">
                                    <p className="text-[8px] font-black uppercase tracking-wider text-zinc-400">{l}</p>
                                    <p className="text-sm font-black text-zinc-900">{v}</p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>

            {/* ══════════════════════════════════
                PROFIT vs EXPENSES GROUPED BAR
            ══════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Expenses Breakdown" sub="Stacked bar: Discounts · Shipping · Tax per period" badge={`Total ₹${expenses.toLocaleString()}`} accent={HEX.amber}>
                    {profExpData.length === 0 ? <Empty msg="No expense data" /> : (
                        <>
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={profExpData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                    <XAxis dataKey="date" {...ax} dy={6} />
                                    <YAxis {...ax} tickFormatter={rupee} />
                                    <Tooltip content={<Tip />} />
                                    <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 8 }} iconType="circle" />
                                    <Bar dataKey="Discounts" stackId="exp" fill={HEX.amber} radius={[0, 0, 0, 0]} barSize={14} />
                                    <Bar dataKey="Shipping" stackId="exp" fill={HEX.sky} radius={[0, 0, 0, 0]} barSize={14} />
                                    <Bar dataKey="Tax" stackId="exp" fill={HEX.pink} radius={[4, 4, 0, 0]} barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                            {/* Summary row */}
                            <div style={{ borderTop: '1px solid #fafafa' }} className="pt-3 mt-2 grid grid-cols-3 gap-3">
                                {[
                                    ['Discounts', eb.discounts, HEX.amber],
                                    ['Shipping', eb.shipping, HEX.sky],
                                    ['Tax', eb.tax, HEX.pink],
                                ].map(([l, v, c], i) => (
                                    <div key={i} className="text-center">
                                        <p style={{ fontSize: 8, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>{l}</p>
                                        <p style={{ fontSize: 15, fontWeight: 900, color: '#09090b' }}>₹{(v || 0).toLocaleString()}</p>
                                        <p style={{ fontSize: 8, color: '#a1a1aa', marginTop: 1 }}>{expenses > 0 ? ((v / expenses) * 100).toFixed(1) : 0}%</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Card>

                {/* ORDER VOLUME COLUMN */}
                <Card title="Order Volume" sub="Column chart per period" badge={`${periodOrders} orders`} accent={HEX.blue}>
                    {cd.length === 0 ? <Empty /> : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={cd} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gOrders" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={HEX.blue} /><stop offset="100%" stopColor={HEX.blue} stopOpacity={0.5} /></linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                                <XAxis dataKey="date" {...ax} dy={6} />
                                <YAxis {...ax} allowDecimals={false} />
                                <Tooltip content={<Tip />} />
                                <Bar dataKey="orderCount" name="Orders" fill="url(#gOrders)" radius={[5, 5, 0, 0]} barSize={18}
                                    label={{ position: 'top', formatter: v => v > 0 ? v : '', fontSize: 9, fill: '#71717a', fontWeight: 700 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* ══════════════════════════════════
                ORDER STATUS DONUT + PAYMENT PIE
            ══════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Order Status Donut */}
                <Card title="Order Status" sub="Donut chart breakdown" badge={`${stats.totalOrders || 0} total`} accent={HEX.violet}>
                    {statusData.length === 0 ? <Empty msg="No orders yet" /> : (
                        <div className="flex gap-5 items-center">
                            <div style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
                                <ResponsiveContainer width={180} height={180}>
                                    <PieChart>
                                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={84} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                                            {statusData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [v + ' orders', n]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                    <span style={{ fontSize: 26, fontWeight: 900, color: '#09090b', lineHeight: 1 }}>{stats.totalOrders || 0}</span>
                                    <span style={{ fontSize: 8, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 2 }}>total</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                {statusData.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: PIE[i % PIE.length], flexShrink: 0 }} />
                                            <span className="text-[10px] font-bold text-zinc-700">{s.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 56, height: 5, background: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{ width: `${(s.value / (stats.totalOrders || 1)) * 100}%`, height: '100%', background: PIE[i % PIE.length], borderRadius: 9999 }} />
                                            </div>
                                            <span className="text-[11px] font-black text-zinc-900 w-5 text-right tabular-nums">{s.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Payment Methods Pie */}
                <Card title="Payment Methods" sub="Pie chart by transaction volume" accent={HEX.blue}>
                    {payData.length === 0 ? <Empty msg="No payment data" /> : (
                        <div className="flex gap-4 items-center">
                            <ResponsiveContainer width="55%" height={180}>
                                <PieChart>
                                    <Pie data={payData} cx="50%" cy="50%" innerRadius={0} outerRadius={82} paddingAngle={3} dataKey="amount" stroke="none"
                                        label={({ percent }) => percent > 0.07 ? `${(percent * 100).toFixed(0)}%` : ''} labelLine={false}>
                                        {payData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, 'Volume']} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-3">
                                {payData.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: PIE[i % PIE.length] }} />
                                            <span className="text-[10px] font-bold text-zinc-700">{p.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[11px] font-black text-zinc-900">₹{(p.amount || 0).toLocaleString()}</p>
                                            <p className="text-[9px] text-zinc-400">{p.value} txns</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* ══════════════════════════════════
                SALES BY CATEGORY (Pie) + SUBCATEGORY (Bar)
            ══════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Revenue by Category" sub="Pie chart breakdown" accent={HEX.pink}>
                    {catData.length === 0 ? <Empty msg="No category data" /> : (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={catData} cx="50%" cy="46%" outerRadius={95} paddingAngle={3} dataKey="value" stroke="none"
                                    label={({ name, percent }) => percent > 0.06 ? `${name} ${(percent * 100).toFixed(0)}%` : ''} labelLine={{ stroke: '#e4e4e7', strokeWidth: 1 }}>
                                    {catData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                                </Pie>
                                <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                <Card title="Subcategory Performance" sub="Horizontal bar chart" accent={HEX.indigo}>
                    {subCat.length === 0 ? <Empty msg="No subcategory data" /> : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={subCat} layout="vertical" margin={{ left: 0, right: 36, top: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gSubH" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor={HEX.violet} /><stop offset="100%" stopColor={HEX.indigo} />
                                    </linearGradient>
                                </defs>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" {...ax} width={80} tick={{ fontSize: 9, fontWeight: 700, fill: '#3f3f46' }} />
                                <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: 10, fontSize: 11 }} cursor={{ fill: '#fafafa' }} />
                                <Bar dataKey="value" name="Revenue" fill="url(#gSubH)" radius={[0, 6, 6, 0]} barSize={20}
                                    label={{ position: 'right', formatter: v => `₹${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`, fontSize: 9, fill: '#71717a', fontWeight: 700 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* ══════════════════════════════════
                RETENTION DONUT + TRAFFIC PIE
            ══════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Customer Retention" sub="Donut · new vs returning buyers" accent={HEX.emerald}>
                    {retPie.length === 0 ? <Empty msg="No retention data" /> : (
                        <>
                            <div style={{ position: 'relative', height: 190 }}>
                                <ResponsiveContainer width="100%" height={190}>
                                    <PieChart>
                                        <Pie data={retPie} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={6} dataKey="value" startAngle={90} endAngle={-270} stroke="none">
                                            <Cell fill={HEX.emerald} /><Cell fill={HEX.blue} />
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [v + ' customers', n]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                    <span style={{ fontSize: 24, fontWeight: 900, color: '#09090b', lineHeight: 1 }}>{ret.new + ret.returning}</span>
                                    <span style={{ fontSize: 8, fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 2 }}>customers</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div style={{ background: '#0596690d', border: '1px solid #05966920', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: '#059669', lineHeight: 1 }}>{ret.new}</p>
                                    <p style={{ fontSize: 8, fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>New</p>
                                </div>
                                <div style={{ background: '#2563eb0d', border: '1px solid #2563eb20', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
                                    <p style={{ fontSize: 24, fontWeight: 900, color: '#2563eb', lineHeight: 1 }}>{ret.returning}</p>
                                    <p style={{ fontSize: 8, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 4 }}>Returning</p>
                                </div>
                            </div>
                        </>
                    )}
                </Card>

                <Card title="Traffic Sources" sub="Pie chart · order origin" accent={HEX.teal}>
                    {traffic.length === 0 ? <Empty msg="No traffic data" /> : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={traffic} cx="50%" cy="47%" innerRadius={50} outerRadius={95} paddingAngle={4} dataKey="value" stroke="none"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#e4e4e7', strokeWidth: 1 }}>
                                    {traffic.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                                </Pie>
                                <Tooltip formatter={(v, n) => [v + ' orders', n]} contentStyle={{ borderRadius: 10, fontSize: 11 }} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </Card>
            </div>

            {/* ══════════════════════════════════
                TOP PRODUCTS + TOP CUSTOMERS
            ══════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Top Products" sub="Ranked by units sold" accent={HEX.amber} action={<button onClick={() => nav('/admin/products')} style={{ color: HEX.amber, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>All →</button>}>
                    {topProds.length === 0 ? <Empty msg="No sales yet" /> : (
                        <div className="space-y-3">
                            {topProds.map((p, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition">
                                    <div style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, flexShrink: 0, background: i === 0 ? HEX.amber : i === 1 ? '#a1a1aa' : i === 2 ? '#cd7c22' : '#f4f4f5', color: i < 3 ? '#fff' : '#71717a' }}>
                                        {i + 1}
                                    </div>
                                    {p.image && <img src={p.image} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: '#fafafa', border: '1px solid #f4f4f5', flexShrink: 0 }} />}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-zinc-900 truncate">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div style={{ flex: 1, height: 4, background: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{ width: `${(p.sold / (topProds[0]?.sold || 1)) * 100}%`, height: '100%', background: `linear-gradient(90deg,${HEX.amber},${HEX.red})`, borderRadius: 9999 }} />
                                            </div>
                                            <span style={{ fontSize: 9, fontWeight: 800, color: '#71717a', flexShrink: 0 }}>{p.sold} sold</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title="Top Spenders" sub="Customers by lifetime value" accent={HEX.indigo} action={<button onClick={() => nav('/admin/analytics/users')} style={{ color: HEX.indigo, fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>All →</button>}>
                    {topCust.length === 0 ? <Empty msg="No spend data" /> : (
                        <div className="space-y-3">
                            {topCust.slice(0, 5).map((c, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-50 transition">
                                    <div style={{ width: 26, height: 26, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, flexShrink: 0, background: i === 0 ? HEX.amber : i === 1 ? '#a1a1aa' : i === 2 ? '#cd7c22' : '#f4f4f5', color: i < 3 ? '#fff' : '#71717a' }}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-bold text-zinc-900 truncate">{c.name || 'Unknown'}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <div style={{ flex: 1, height: 4, background: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}>
                                                <div style={{ width: `${(c.totalSpend / (topCust[0]?.totalSpend || 1)) * 100}%`, height: '100%', background: `linear-gradient(90deg,${HEX.indigo},${HEX.violet})`, borderRadius: 9999 }} />
                                            </div>
                                            <span style={{ fontSize: 9, fontWeight: 800, color: '#71717a', flexShrink: 0 }}>₹{(c.totalSpend || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <span style={{ fontSize: 9, color: '#a1a1aa', flexShrink: 0 }}>{c.orderCount} orders</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* ══════════════════════════════════
                CART INTELLIGENCE
            ══════════════════════════════════ */}
            <Card
                title="Cart Intelligence"
                sub="Top carted products · cart-to-purchase conversion"
                badge={`${cartStats.activeCarts || 0} active carts`}
                accent={HEX.teal}
            >
                {/* KPI strip */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                    {[
                        ['Active Carts', cartStats.activeCarts || 0, HEX.teal, 'Users with items in cart'],
                        ['Abandoned Est.', cartStats.abandonedCarts || 0, HEX.amber, 'Est. carts inactive >24h'],
                        ['Avg Item Price', `₹${avgCartVal.toLocaleString()}`, HEX.violet, 'Avg price of top-carted items'],
                    ].map(([l, v, c, hint], i) => (
                        <div key={i} style={{ background: `${c}08`, border: `1px solid ${c}18`, borderRadius: 14, padding: '14px 16px' }}>
                            <p style={{ fontSize: 8, fontWeight: 800, color: c, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>{l}</p>
                            <p style={{ fontSize: 22, fontWeight: 900, color: '#09090b', lineHeight: 1 }}>{v}</p>
                            <p style={{ fontSize: 8, color: '#a1a1aa', marginTop: 3 }}>{hint}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Grouped bar: In Cart vs Sold */}
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Cart Count vs Units Sold</p>
                        {cartProds.length === 0 ? <Empty msg="No cart data" /> : (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={cartChartData} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gCart" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={HEX.teal} /><stop offset="100%" stopColor={HEX.teal} stopOpacity={0.7} /></linearGradient>
                                        <linearGradient id="gSold" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={HEX.emerald} /><stop offset="100%" stopColor={HEX.emerald} stopOpacity={0.7} /></linearGradient>
                                    </defs>
                                    <XAxis type="number" {...ax} tickFormatter={v => v} />
                                    <YAxis type="category" dataKey="name" {...ax} width={90} tick={{ fontSize: 9, fill: '#71717a', fontWeight: 700 }} />
                                    <Tooltip content={<Tip />} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700 }} />
                                    <Bar dataKey="In Cart" fill="url(#gCart)" radius={[0, 4, 4, 0]} barSize={10} />
                                    <Bar dataKey="Sold" fill="url(#gSold)" radius={[0, 4, 4, 0]} barSize={10} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Conversion leaderboard */}
                    <div>
                        <p style={{ fontSize: 9, fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 }}>Conversion Rate per Product</p>
                        {cartProds.length === 0 ? <Empty msg="No cart data" /> : (
                            <div className="space-y-3">
                                {cartProds.map((p, i) => {
                                    const rate = p.conversionRate || 0;
                                    const color = rate >= 60 ? HEX.emerald : rate >= 30 ? HEX.amber : HEX.red;
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            {/* Rank */}
                                            <span style={{ width: 18, fontSize: 9, fontWeight: 900, color: '#a1a1aa', flexShrink: 0, textAlign: 'right' }}>#{i + 1}</span>
                                            {/* Product image */}
                                            {p.image && (
                                                <img src={p.image} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                            )}
                                            {/* Name + bar */}
                                            <div className="flex-1 min-w-0">
                                                <p style={{ fontSize: 10, fontWeight: 700, color: '#09090b', marginBottom: 3 }} className="truncate">{p.name}</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div style={{ flex: 1, height: 5, background: '#f4f4f5', borderRadius: 9999, overflow: 'hidden' }}>
                                                        <div style={{ width: `${Math.min(rate, 100)}%`, height: '100%', background: color, borderRadius: 9999, transition: 'width 0.6s ease' }} />
                                                    </div>
                                                    <span style={{ fontSize: 9, fontWeight: 900, color: color, flexShrink: 0, minWidth: 32 }}>{rate}%</span>
                                                </div>
                                                <p style={{ fontSize: 8, color: '#a1a1aa', marginTop: 2 }}>
                                                    {p.count} in carts · {p.sold} sold · {p.users} user{p.users !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            {/* ══════════════════════════════════
                COMBINED COMPOSEDCHART (bottom)
            ══════════════════════════════════ */}
            <Card title="Combined Overview" sub="ComposedChart · Revenue (area) + Profit (line) + Orders (bar)" accent={HEX.violet}>
                {cd.length === 0 ? <Empty /> : (
                    <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={cd} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gCombA" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={HEX.violet} stopOpacity={0.2} />
                                    <stop offset="100%" stopColor={HEX.violet} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis dataKey="date" {...ax} dy={6} />
                            <YAxis yAxisId="l" {...ax} tickFormatter={rupee} />
                            <YAxis yAxisId="r" orientation="right" {...ax} allowDecimals={false} />
                            <Tooltip content={<Tip />} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: 12 }} />
                            <Area yAxisId="l" type="monotone" dataKey="sales" name="Revenue" stroke={HEX.violet} strokeWidth={2} fill="url(#gCombA)" />
                            <Line yAxisId="l" type="monotone" dataKey="profit" name="Profit" stroke={HEX.emerald} strokeWidth={2} dot={false} />
                            <Bar yAxisId="r" dataKey="orderCount" name="Vol" fill={HEX.blue} opacity={0.2} radius={[3, 3, 0, 0]} barSize={12} />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </Card>

        </div>
    );
}
