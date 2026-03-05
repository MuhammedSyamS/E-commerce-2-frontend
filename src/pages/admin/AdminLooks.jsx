import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { Check, X, Trash2, Camera, User, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLooks = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [looks, setLooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

    const MOCK_LOOKS = [
        {
            _id: 'mock-1',
            image: "https://images.pexels.com/photos/9461772/pexels-photo-9461772.jpeg?auto=compress&cs=tinysrgb&w=800",
            caption: "The 2026 Collection - Modern Essentials",
            user: { firstName: "Julian", lastName: "S.", email: "julian@example.com" },
            likes: [],
            status: 'pending',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'mock-2',
            image: "https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=800",
            caption: "Urban Living - Curated Design",
            user: { firstName: "Elena", lastName: "R.", email: "elena@example.com" },
            likes: [],
            status: 'approved',
            createdAt: new Date().toISOString()
        }
    ];

    const fetchLooks = async () => {
        try {
            const { data } = await api.get('/looks/admin');
            setLooks(data && data.length > 0 ? data : MOCK_LOOKS);
        } catch (err) {
            console.error("Fetch Looks Error:", err);
            addToast("Failed to fetch community looks", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLooks();
    }, []);

    const handleStatusUpdate = async (lookId, newStatus) => {
        try {
            await api.patch(`/looks/${lookId}/status`, { status: newStatus });
            addToast(`Look marked as ${newStatus}`, "success");
            setLooks(prev => prev.map(l => l._id === lookId ? { ...l, status: newStatus } : l));
        } catch (err) {
            addToast("Status update failed", "error");
        }
    };

    const handleDelete = async (lookId) => {
        if (!window.confirm("Delete this look permanently?")) return;
        try {
            await api.delete(`/looks/${lookId}`);
            addToast("Look deleted", "success");
            setLooks(prev => prev.filter(l => l._id !== lookId));
        } catch (err) {
            addToast("Delete failed", "error");
        }
    };

    const filteredLooks = looks.filter(l => filter === 'all' || l.status === filter);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-2xl font-black uppercase italic">Lookbook <span className="text-zinc-300">Management</span></h2>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2 px-1 border-l-2 border-amber-500">
                        Curation & Content Moderation
                    </p>
                </div>

                <div className="flex gap-2 bg-white p-1 rounded-2xl border border-zinc-100 shadow-sm">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-black text-white' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* GRID */}
            {filteredLooks.length === 0 ? (
                <div className="bg-white rounded-[2rem] p-20 text-center border border-dashed border-zinc-200">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-300">
                        <Camera size={32} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight">No looks found</h3>
                    <p className="text-zinc-400 text-xs mt-2">Looks matching your filter will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <AnimatePresence mode='popLayout'>
                        {filteredLooks.map((look) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={look._id}
                                className="bg-white rounded-[2rem] overflow-hidden border border-zinc-100 shadow-xl hover:shadow-2xl transition-all group"
                            >
                                {/* IMAGE */}
                                <div className="aspect-[4/5] relative overflow-hidden">
                                    <img src={look.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-lg ${look.status === 'approved' ? 'bg-emerald-500/90 text-white' :
                                            look.status === 'rejected' ? 'bg-red-500/90 text-white' :
                                                'bg-amber-500/90 text-white'
                                            }`}>
                                            {look.status}
                                        </div>
                                    </div>
                                </div>

                                {/* CONTENT */}
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center overflow-hidden border border-zinc-200">
                                            {look.user?.avatar ? <img src={look.user.avatar} className="w-full h-full object-cover" alt="" /> : <User size={18} className="text-zinc-400" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-tight truncate">
                                                {look.user?.firstName} {look.user?.lastName}
                                            </p>
                                            <p className="text-[9px] text-zinc-400 truncate">{look.user?.email}</p>
                                        </div>
                                    </div>

                                    <div className="bg-zinc-50 rounded-2xl p-4 min-h-[60px]">
                                        <p className="text-[10px] text-zinc-600 font-medium leading-relaxed italic">"{look.caption}"</p>
                                    </div>

                                    <div className="flex items-center justify-between text-[9px] text-zinc-400 font-bold uppercase tracking-widest px-1">
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(look.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1.5 text-zinc-800"><CheckCircle2 size={12} className="text-emerald-500" /> {look.likes?.length || 0} Likes</span>
                                    </div>

                                    {/* ACTIONS */}
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        {look.status === 'pending' || look.status === 'rejected' ? (
                                            <button
                                                onClick={() => handleStatusUpdate(look._id, 'approved')}
                                                className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                            >
                                                <Check size={14} /> Approve
                                            </button>
                                        ) : null}

                                        {look.status === 'pending' || look.status === 'approved' ? (
                                            <button
                                                onClick={() => handleStatusUpdate(look._id, 'rejected')}
                                                className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                            >
                                                <X size={14} /> Reject
                                            </button>
                                        ) : null}

                                        <button
                                            onClick={() => handleDelete(look._id)}
                                            className="col-span-2 flex items-center justify-center gap-2 py-3 bg-zinc-50 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
                                        >
                                            <Trash2 size={14} /> Delete Look
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AdminLooks;
