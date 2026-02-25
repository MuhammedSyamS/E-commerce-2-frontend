import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { Clock, Shield, AlertTriangle, User, FileText, ShoppingBag } from 'lucide-react';

const AdminLogs = () => {
    const { user } = useStore();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get('/users/logs');
                setLogs(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchLogs();
    }, [user.token]);

    const getIcon = (action) => {
        if (action.includes('DELETE')) return <AlertTriangle size={14} className="text-red-500" />;
        if (action.includes('UPDATE')) return <FileText size={14} className="text-blue-500" />;
        if (action.includes('ORDER')) return <ShoppingBag size={14} className="text-purple-500" />;
        return <Shield size={14} className="text-zinc-400" />;
    };

    if (loading) return <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading History...</div>;

    return (
        <div>
            <div className="mb-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Security & Audit</p>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Activity <span className="text-zinc-300">Logs</span></h1>
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                <th className="px-8 py-6">Timestamp</th>
                                <th className="px-8 py-6">Admin / User</th>
                                <th className="px-8 py-6">Action</th>
                                <th className="px-8 py-6">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {logs.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-xs text-zinc-400 uppercase">No recent activity</td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-zinc-400">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-400 text-[10px]">
                                                {log.user?.firstName?.[0] || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold uppercase">{log.user?.firstName} {log.user?.lastName}</div>
                                                <div className="text-[9px] text-zinc-300 font-mono">{log.ipAddress || 'IP Hidden'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                                {getIcon(log.action)}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-wider">{log.action.replace(/_/g, ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-xs text-zinc-500 font-medium">
                                        {log.details || '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLogs;
