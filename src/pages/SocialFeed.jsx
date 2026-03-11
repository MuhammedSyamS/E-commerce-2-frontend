import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, X, Plus, ChevronRight, User, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/instance';
import { resolveMediaURL } from '../utils/mediaUtils';
import Price from '../components/Price';
import { useToast } from '../context/ToastContext';

const MOCK_LOOKS = [];

const SocialFeed = () => {
    const navigate = useNavigate();
    const { user, addToCart, toggleCart } = useStore();
    const { success } = useToast();
    const [looks, setLooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeLook, setActiveLook] = useState(null);

    const handleAddFullLook = (look) => {
        if (!look.products?.length) return;

        look.products.forEach(prod => {
            addToCart({
                ...prod,
                quantity: 1,
                selectedVariant: null
            });
        });
        success("Full Look Added to Bag! ✨");
    };

    const handleToggleLike = async (lookId) => {
        if (!user) {
            success("Please login to like styles! 💖");
            return;
        }
        try {
            const { data } = await api.post(`/looks/${lookId}/like`);
            setLooks(prev => prev.map(l =>
                l._id === lookId ? { ...l, likes: data.likes } : l
            ));
            if (activeLook && activeLook._id === lookId) {
                setActiveLook(prev => ({ ...prev, likes: data.likes }));
            }
        } catch (err) {
            console.error('Like toggle failed:', err);
        }
    };

    useEffect(() => {
        const fetchLooks = async () => {
            try {
                const { data } = await api.get('/looks');
                // Ensure data is mapped correctly if the backend returns different structure
                const mappedData = (data || []).map(l => {
                    const u = l.user;
                    const displayHandle = (u ? `${u.firstName} ${u.lastName}`.trim() : l.userName) || "House Stylist";
                    return {
                        ...l,
                        displayHandle,
                        formattedHandle: displayHandle.toLowerCase().replace(/\s+/g, '')
                    };
                });
                setLooks(mappedData);
            } catch (err) {
                console.error('Error fetching looks:', err);
                // setLooks(MOCK_LOOKS);
                setLooks([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLooks();
    }, []);

    const LookModal = ({ look, onClose }) => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-10 bg-black/95 backdrop-blur-xl"
        >
            <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 text-white hover:rotate-90 transition-transform duration-300 z-[120] bg-black/40 md:bg-white p-2 md:p-4 rounded-full border border-white/20 md:border-zinc-200 md:text-black shadow-2xl">
                <X size={24} className="md:w-8 md:h-8" />
            </button>
            <div className="absolute top-4 left-4 z-[120] md:hidden">
                <button onClick={onClose} className="flex items-center gap-2 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest">
                    <ChevronRight size={16} className="rotate-180" /> Back
                </button>
            </div>

            <div className="bg-white w-full max-w-6xl max-h-[95vh] md:max-h-[85vh] md:h-full rounded-t-[2.5rem] md:rounded-[3rem] overflow-y-auto no-scrollbar md:overflow-hidden flex flex-col md:flex-row shadow-2xl relative">
                {/* IMAGE SIDE */}
                <div className="relative w-full aspect-[4/5] md:aspect-auto md:flex-1 bg-zinc-950 overflow-hidden group flex-shrink-0 flex items-center justify-center max-h-[60vh] md:max-h-none">
                    <img src={resolveMediaURL(look.image)} className="w-full h-full object-contain md:object-cover" alt="" />
                    <div className="absolute inset-0 pointer-events-none md:pointer-events-auto">
                        {look.products.map(prod => (
                            <div
                                key={prod._id}
                                className="absolute w-8 h-8 bg-zinc-900 shadow-xl rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-transform group/tag pointer-events-auto"
                                style={{ left: `${prod.x}%`, top: `${prod.y}%` }}
                            >
                                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white text-black p-3 rounded-2xl shadow-2xl opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none min-w-[150px] md:min-w-[180px]">
                                    <div className="flex gap-3 items-center">
                                        <img src={resolveMediaURL(prod.image)} className="w-8 h-10 md:w-10 md:h-12 object-cover rounded-lg" alt="" />
                                        <div>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-tighter truncate">{prod.name}</p>
                                            <Price amount={prod.price} className="text-[10px] md:text-[11px] font-bold text-zinc-500" />
                                        </div>
                                    </div>
                                </div>
                                <div className="w-2 h-2 bg-white rounded-full animate-ping absolute" />
                                <ShoppingBag size={14} className="text-white relative z-10" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* DETAILS SIDE */}
                <div className="w-full md:w-[400px] flex flex-col p-6 md:p-8 bg-white flex-shrink-0 min-h-[400px] md:min-h-0">
                    <div className="flex items-center gap-3 mb-8 pb-8 border-b border-zinc-50 uppercase">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-100 flex items-center justify-center overflow-hidden">
                            {look.user?.avatar ? (
                                <img src={resolveMediaURL(look.user.avatar)} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-xs text-white font-black">{(look.displayHandle?.[0] || "S").toUpperCase()}</span>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">@{look.formattedHandle}</p>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SLOOK ELITE MEMBER</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar space-y-8">
                        <p className="text-lg font-medium text-zinc-800 leading-relaxed">
                            "{look.caption}"
                        </p>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Shop this Look</p>
                            {look.products.map(prod => (
                                <div
                                    key={prod._id}
                                    onClick={() => { navigate(`/product/${prod.slug}`); onClose(); }}
                                    className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 border border-zinc-100 cursor-pointer hover:border-black hover:bg-white transition-all group/item"
                                >
                                    <img src={resolveMediaURL(prod.image)} className="w-16 h-20 object-cover rounded-2xl" alt="" />
                                    <div className="flex-1">
                                        <p className="text-xs font-black uppercase tracking-tight mb-1">{prod.name}</p>
                                        <Price amount={prod.price} className="text-sm font-bold text-zinc-500" />
                                    </div>
                                    <ChevronRight size={18} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-8 mt-auto border-t border-zinc-50 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleToggleLike(look._id)}
                                className="flex items-center gap-2 hover:scale-110 transition-transform"
                            >
                                <Heart
                                    size={20}
                                    className={look.likes?.includes(user?._id) ? "fill-red-500 text-red-500" : "text-zinc-400"}
                                />
                                <span className="text-[10px] font-black">{look.likes?.length || 0}</span>
                            </button>
                            <button className="hover:scale-110 transition-transform">
                                <Share2 size={20} className="text-zinc-400" />
                            </button>
                        </div>
                        <button
                            onClick={() => { handleAddFullLook(activeLook); onClose(); }}
                            className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 shadow-xl transition-all"
                        >
                            Add Full Look
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-zinc-50/50 pt-44 md:pt-52 pb-32 md:pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* HEADER */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]">
                        Styled by <span className="text-zinc-300">Community</span>
                    </h1>
                    <div className="flex flex-col items-center gap-6">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Join the movement #StyledBySLOOK</p>
                        <Link
                            to="/account?action=upload"
                            className="bg-black text-white px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-3 group"
                        >
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            Share Your House Style
                        </Link>
                    </div>
                </div>

                {/* FEED GRID */}
                {loading ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[3/5] bg-white rounded-[2.5rem] animate-pulse border border-zinc-100 shadow-sm" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 space-y-3 md:space-y-6">
                        {looks.map((look) => (
                            <motion.div
                                key={look._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setActiveLook(look)}
                                className="break-inside-avoid mb-3 md:mb-6 group cursor-pointer relative"
                            >
                                <div className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-zinc-100 bg-white hover:shadow-2xl transition-all duration-500">
                                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl">
                                            <ShoppingBag size={18} />
                                        </div>
                                    </div>

                                    <img src={resolveMediaURL(look.image)} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" alt="" loading="lazy" />

                                    <div className="p-3 md:p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 uppercase">
                                                <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-100 flex items-center justify-center overflow-hidden">
                                                    {look.user?.avatar ? (
                                                        <img src={resolveMediaURL(look.user.avatar)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[8px] text-white font-black">{(look.displayHandle?.[0] || "S").toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-tight text-zinc-900 leading-none">@{look.formattedHandle}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        <Sparkles size={8} className="text-amber-500 fill-amber-500" />
                                                        <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">Elite Stylist</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Heart size={12} className={look.likes?.includes(user?._id) ? "fill-red-500 text-red-500" : "text-zinc-300"} />
                                                <span className="text-[9px] font-bold text-zinc-400">{look.likes?.length || 0}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight line-clamp-2 leading-relaxed">
                                            {look.caption}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* YOU'RE NEXT CARD */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="break-inside-avoid"
                        >
                            <Link
                                to="/account?action=upload"
                                className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50 hover:border-black hover:bg-white transition-all duration-500 aspect-[3/4] flex flex-col items-center justify-center p-4 md:p-8 text-center gap-4 md:gap-6"
                            >
                                <div className="w-10 h-10 md:w-16 md:h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <Plus size={24} className="md:w-8 md:h-8" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-xl font-black uppercase tracking-tight mb-2">You're Next</h3>
                                    <p className="text-[7px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                        Show the community how you style SLOOK. <br />
                                        Get featured & earn Elite rewards.
                                    </p>
                                </div>
                                <div className="text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full">
                                    Post Your Look
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                )}

            </div>

            {/* LOOK MODAL */}
            <AnimatePresence>
                {activeLook && (
                    <LookModal look={activeLook} onClose={() => setActiveLook(null)} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialFeed;
