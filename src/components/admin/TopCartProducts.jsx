import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { ShoppingCart, TrendingUp, ArrowRight, Wallet, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopCartProducts = () => {
    const { user } = useStore();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTopCart = async () => {
            try {
                const { data } = await api.get('/reports/top-cart');
                setProducts(data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch top cart products", err);
                setLoading(false);
            }
        };

        if (user?.token) {
            fetchTopCart();
        }
    }, [user]);

    // Calculate Total Potential Revenue
    const totalPotential = products.reduce((acc, item) => acc + (item.price * item.count), 0);

    if (loading) return (
        <div className="bg-white border border-zinc-100 p-8 rounded-3xl h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        </div>
    );

    if (products.length === 0) return (
        <div className="bg-white border border-zinc-100 p-8 rounded-3xl h-full flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 mb-4">
                <ShoppingCart size={20} />
            </div>
            <p className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Cart Insights</p>
            <p className="text-[10px] text-zinc-400 mt-2">No active user carts found.</p>
        </div>
    );

    return (
        <div className="bg-white border border-zinc-100 p-6 md:p-8 rounded-3xl h-full flex flex-col">
            {/* HEADER */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">High Demand</p>
                    </div>
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Cart <span className="text-zinc-300">Insights</span></h3>
                </div>
                <div className="text-right">
                    <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-wider mb-1">Potential</p>
                    <p className="text-xl font-black text-blue-600">₹{totalPotential.toLocaleString()}</p>
                </div>
            </div>

            {/* LIST */}
            <div className="space-y-4 flex-1">
                {products.slice(0, 5).map((item, index) => (
                    <div
                        key={item._id}
                        onClick={() => navigate(`/product/${item._id}`)}
                        className="group flex items-center gap-4 p-2 -mx-2 hover:bg-zinc-50 rounded-xl transition-all cursor-pointer"
                    >
                        {/* RANK & IMAGE */}
                        <div className="relative">
                            <span className="absolute -top-2 -left-2 w-5 h-5 bg-black text-white text-[9px] font-bold flex items-center justify-center rounded-full z-10 border-2 border-white">
                                {index + 1}
                            </span>
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-100 shadow-sm relative">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* DETAILS */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="text-xs font-bold truncate pr-2 group-hover:text-blue-600 transition-colors">{item.name}</h4>
                                <span className="text-[10px] font-black whitespace-nowrap">₹{item.price.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">
                                        Stock: {item.stock}
                                    </span>
                                    <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                                        <TrendingUp size={10} />
                                        {item.count} Carts
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold text-blue-500">
                                    + ₹{(item.price * item.count).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-8 pt-6 border-t border-zinc-100">
                <button
                    onClick={() => navigate('/admin/marketing')}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                >
                    <Zap size={14} />
                    Convert with Offer
                </button>
            </div>
        </div>
    );
};

export default TopCartProducts;
