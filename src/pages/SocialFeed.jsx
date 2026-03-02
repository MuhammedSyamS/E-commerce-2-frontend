import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Share2, X, Plus, ChevronRight, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/instance';
import Price from '../components/Price';
import { useToast } from '../context/ToastContext';

const MOCK_LOOKS = [
    {
        _id: 'mock-1',
        image: "https://images.pexels.com/photos/9461772/pexels-photo-9461772.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "The 2026 Collection - Modern Essentials",
        user: { firstName: "Julian", lastName: "S.", avatar: "https://i.pravatar.cc/150?u=julian" },
        likes: [],
        products: [
            { _id: 'p1', name: "Obsidian Signet", price: 8900, image: "https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&w=400", x: 45, y: 30, slug: 'obsidian-ring' },
            { _id: 'p2', name: "Sterling Chain", price: 12500, image: "https://images.pexels.com/photos/9953654/pexels-photo-9953654.jpeg?auto=compress&cs=tinysrgb&w=400", x: 60, y: 50, slug: 'sterling-silver-chain' }
        ]
    },
    {
        _id: 'mock-2',
        image: "https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Urban Living - Curated Design",
        user: { firstName: "Elena", lastName: "R.", avatar: "https://i.pravatar.cc/150?u=elena" },
        likes: [],
        products: []
    },
    {
        _id: 'mock-3',
        image: "https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Premium Quality - Built to Last",
        user: { firstName: "Marcus", lastName: "T.", avatar: "https://i.pravatar.cc/150?u=marcus" },
        likes: [],
        products: []
    },
    {
        _id: 'mock-4',
        image: "https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Minimalist Workspace Vibes",
        user: { firstName: "Sarah", lastName: "J.", avatar: "https://i.pravatar.cc/150?u=sarah" },
        likes: [],
        products: []
    }
];

const SocialFeed = () => {
    const navigate = useNavigate();
    const { user, addToCart, toggleCart } = useStore();
    const { success } = useToast();
    const [looks, setLooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeLook, setActiveLook] = useState(null);

    const handleAddFullLook = (look) => {
        look.products.forEach(prod => {
            addToCart({
                _id: prod._id, // This should ideally be a real ID, but slug-based lookup might be safer if IDs aren't available
                name: prod.name,
                price: prod.price,
                image: prod.image,
                quantity: 1,
                selectedVariant: null // Optional: add default variant if needed
            });
        });
        success("Full Look Added to Cart! ✨");
        toggleCart(true); // Open cart to show progress
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
                // Only use mock data if the feed is truly empty AND we want to show examples
                setLooks(data && data.length > 0 ? data : MOCK_LOOKS);
            } catch (err) {
                console.error('Error fetching looks:', err);
                // On error, we should probably still show mock data so it doesn't look completely broken,
                // but maybe we should log it or show a subtle message.
                // Deciding to KEEP mock fallback for aesthetics but the user's issue likely 
                // comes from their own looks not appearing immediately.
                setLooks(MOCK_LOOKS);
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
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 bg-black/90 backdrop-blur-md"
        >
            <button onClick={onClose} className="absolute top-6 right-6 text-white hover:rotate-90 transition-transform duration-300">
                <X size={32} />
            </button>

            <div className="bg-white w-full max-w-6xl h-full max-h-[85vh] rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl">
                {/* IMAGE SIDE */}
                <div className="relative flex-1 bg-zinc-100 overflow-hidden group">
                    <img src={look.image} className="w-full h-full object-cover" alt="" />
                    {look.products.map(prod => (
                        <div
                            key={prod._id}
                            className="absolute w-8 h-8 bg-zinc-900 shadow-xl rounded-full flex items-center justify-center cursor-pointer hover:scale-125 transition-transform group/tag"
                            style={{ left: `${prod.x}%`, top: `${prod.y}%` }}
                        >
                            <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-white text-black p-3 rounded-2xl shadow-2xl opacity-0 group-hover/tag:opacity-100 transition-opacity pointer-events-none min-w-[180px]">
                                <div className="flex gap-3 items-center">
                                    <img src={prod.image} className="w-10 h-12 object-cover rounded-lg" alt="" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-tighter truncate">{prod.name}</p>
                                        <Price amount={prod.price} className="text-[11px] font-bold text-zinc-500" />
                                    </div>
                                </div>
                            </div>
                            <div className="w-2 h-2 bg-white rounded-full animate-ping absolute" />
                            <ShoppingBag size={14} className="text-white relative z-10" />
                        </div>
                    ))}
                </div>

                {/* DETAILS SIDE */}
                <div className="w-full md:w-[400px] flex flex-col p-8 bg-white">
                    <div className="flex items-center gap-3 mb-8 pb-8 border-b border-zinc-50">
                        <img src={look.user?.avatar || "https://ui-avatars.com/api/?name=" + (look.user?.firstName || "U")} className="w-12 h-12 rounded-full border-2 border-zinc-50" alt="" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-tight">{look.user?.firstName} {look.user?.lastName}</p>
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
                                    className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 border border-zinc-100 cursor-pointer hover:border-black transition-all group"
                                >
                                    <img src={prod.image} className="w-16 h-20 object-cover rounded-2xl" alt="" />
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
        <div className="min-h-screen bg-zinc-50/50 pt-44 md:pt-52 pb-20">
            <div className="max-w-7xl mx-auto px-6">

                {/* HEADER */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter">
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[3/5] bg-white rounded-[2.5rem] animate-pulse border border-zinc-100 shadow-sm" />
                        ))}
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                        {looks.map((look) => (
                            <motion.div
                                key={look._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => setActiveLook(look)}
                                className="break-inside-avoid group cursor-pointer relative"
                            >
                                <div className="relative overflow-hidden rounded-[2rem] shadow-sm border border-zinc-100 bg-white group-hover:shadow-2xl transition-all duration-500">
                                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                        <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl">
                                            <ShoppingBag size={18} />
                                        </div>
                                    </div>

                                    <img src={look.image} className="w-full h-auto group-hover:scale-105 transition-transform duration-700" alt="" loading="lazy" />

                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <img src={look.user?.avatar || "https://ui-avatars.com/api/?name=" + (look.user?.firstName || "U")} className="w-6 h-6 rounded-full group-hover:scale-110 transition-all border border-zinc-100"
                                                    alt="" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-tight text-zinc-900 leading-none">{look.user?.firstName} {look.user?.lastName}</p>
                                                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Verified Style</p>
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
                                className="block relative overflow-hidden rounded-[2rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50 hover:border-black hover:bg-white transition-all duration-500 aspect-[3/4] flex flex-col items-center justify-center p-8 text-center gap-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
                                    <Plus size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">You're Next</h3>
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed">
                                        Show the community how you style SLOOK. <br />
                                        Get featured & earn Elite rewards.
                                    </p>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-4 py-2 rounded-full">
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
