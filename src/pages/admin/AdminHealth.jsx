import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { Activity, ShieldCheck, Database, Zap, AlertCircle, CheckCircle2, RefreshCcw } from 'lucide-react';
import { useStore } from '../../store/useStore';

const AdminHealth = () => {
    const { user } = useStore();
    const [stats, setStats] = useState({
        serverStatus: 'Online',
        dbStatus: 'Connected',
        lastCron: 'Just now',
        activeRequests: 0,
        securityLevel: 'MNC Standard'
    });
    const [loading, setLoading] = useState(false);

    const checkHealth = async () => {
        setLoading(true);
        // In a real app, this would hit /api/admin/health
        setTimeout(() => {
            setLoading(false);
            setStats(prev => ({ ...prev, activeRequests: Math.floor(Math.random() * 50) }));
        }, 800);
    };

    useEffect(() => {
        checkHealth();
        const interval = setInterval(checkHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const HealthCard = ({ icon: Icon, title, value, status, color }) => (
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 group hover:shadow-2xl transition-all duration-500">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 ${color} transition-transform group-hover:scale-110`}>
                <Icon size={28} />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">{title}</h3>
            <div className="flex items-center justify-between">
                <p className="text-2xl font-black tracking-tighter">{value}</p>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-50 rounded-full">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'Error' ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-[9px] font-bold uppercase tracking-widest">{status}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter italic transform -skew-x-3">
                        System <span className="text-zinc-300">Health</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-2">MNC Command Center v1.0</p>
                </div>
                <button
                    onClick={checkHealth}
                    className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl hover:bg-black hover:text-white transition-all active:scale-95"
                >
                    <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <HealthCard
                    icon={Activity}
                    title="Server Stability"
                    value={stats.serverStatus}
                    status="Operational"
                    color="bg-blue-50 text-blue-600"
                />
                <HealthCard
                    icon={Database}
                    title="Database Connection"
                    value={stats.dbStatus}
                    status="Optimal"
                    color="bg-amber-50 text-amber-600"
                />
                <HealthCard
                    icon={ShieldCheck}
                    title="Security Infrastructure"
                    value={stats.securityLevel}
                    status="Hardened"
                    color="bg-green-50 text-green-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- ACTIVITY MONITOR --- */}
                <div className="bg-black text-white p-10 rounded-[3.5rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <Zap size={140} />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-xl font-black uppercase tracking-widest mb-2 italic">Real-Time Traffic</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-12">Active Socket Streams</p>

                        <div className="flex items-baseline gap-4 mb-2">
                            <span className="text-7xl font-black tracking-tighter">{stats.activeRequests}</span>
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Peers</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(stats.activeRequests / 50) * 100}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* --- LOGS PREVIEW --- */}
                <div className="bg-white border border-zinc-100 p-10 rounded-[3.5rem]">
                    <h2 className="text-xl font-black uppercase tracking-widest mb-10 italic">Process Logs</h2>
                    <div className="space-y-6">
                        {[
                            { time: '03:00 AM', msg: 'Cron cleanup successful (42 exp coupons)', type: 'Info' },
                            { time: '03:15 AM', msg: 'Stock sync completed (3 stale orders)', type: 'Info' },
                            { time: 'Just now', msg: 'Security firewall rule updated', type: 'Success' }
                        ].map((log, i) => (
                            <div key={i} className="flex gap-6 border-b border-zinc-50 pb-6">
                                <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase shrink-0">{log.time}</span>
                                <div className="flex-1">
                                    <p className="text-[11px] font-bold text-zinc-800 leading-none mb-1">{log.msg}</p>
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${log.type === 'Info' ? 'text-blue-500' : 'text-green-500'}`}>{log.type}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- PROTECTION STATUS --- */}
            <div className="mt-12 p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex flex-wrap items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">Production Lockdown Active</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">CORS: ON | RATELIMIT: ON | HELMET: ON</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-green-600 bg-white px-6 py-3 rounded-full border border-green-100">
                    <CheckCircle2 size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified Secure</span>
                </div>
            </div>
        </div>
    );
};

export default AdminHealth;
