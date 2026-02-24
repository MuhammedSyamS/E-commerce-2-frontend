import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Coins, TrendingUp, TrendingDown,
    Calendar, ShoppingBag, Gift, RotateCcw, UserPlus
} from 'lucide-react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { Skeleton } from '../../components/ui/Skeleton';
import Price from '../../components/Price';

const LoyaltyLedger = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { data } = await api.get('/users/loyalty-history', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setTransactions(data);
            } catch (err) {
                console.error("Failed to fetch loyalty history", err);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchHistory();
        else navigate('/login');
    }, [user, navigate]);

    const getIcon = (type) => {
        switch (type) {
            case 'earn': return <TrendingUp className="text-green-500" size={16} />;
            case 'spend': return <TrendingDown className="text-red-500" size={16} />;
            case 'bonus': return <Gift className="text-purple-500" size={16} />;
            case 'refund': return <RotateCcw className="text-blue-500" size={16} />;
            case 'referral': return <UserPlus className="text-amber-500" size={16} />;
            default: return <Coins size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-10">
                <div className="max-w-3xl mx-auto space-y-8">
                    <Skeleton className="w-40 h-8" />
                    <Skeleton className="w-full h-32 rounded-3xl" />
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => <Skeleton key={i} className="w-full h-20 rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-32 pb-20 px-4 md:px-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate('/account')} className="p-2 hover:bg-zinc-50 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Loyalty Ledger</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">History of your SLOOK coins</p>
                    </div>
                </div>

                {/* Tier Progress Card */}
                <div className="bg-zinc-900 text-white rounded-[2.5rem] p-8 md:p-12 mb-10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2 flex items-center gap-2">
                                    <Sparkles size={12} className="animate-pulse" /> Current Status
                                </p>
                                <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Elite {user?.tier || 'Silver'}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-amber-400">{user?.loyaltyPoints || 0}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Available Coins</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                <span>Progress to Gold</span>
                                <span>{Math.min(100, (user?.loyaltyPoints / 5000) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative group/progress">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full relative"
                                    style={{ width: `${Math.min(100, (user?.loyaltyPoints / 5000) * 100)}%` }}
                                >
                                    {/* SHIMMER EFFECT */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[50%] skew-x-[-20deg] animate-[shimmer_2s_infinite]"></div>
                                </div>

                                {/* INTERACTIVE TOOLTIP */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover/progress:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] bg-black/80 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                                        Spend ₹{(5000 - (user?.loyaltyPoints || 0)).toLocaleString()} more to reach Gold
                                    </p>
                                </div>
                            </div>
                            <p className="text-[9px] text-zinc-500 font-medium">Earn 1 SLOOK Coin for every ₹1 spent. SLOOK Coins never expire for Elite members.</p>
                        </div>
                    </div>

                    {/* CSS for Shimmer */}
                    <style dangerouslySetInnerHTML={{
                        __html: `
          @keyframes shimmer {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(250%); }
          }
        `}} />
                </div>
                {/* Transactions List */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase italic tracking-widest mb-6 border-b border-zinc-100 pb-4">Recent Activity</h3>

                    {transactions.length === 0 ? (
                        <div className="text-center py-20 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200">
                            <Coins size={40} className="mx-auto text-zinc-200 mb-4" />
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">No transactions yet</p>
                            <Link to="/shop" className="text-[9px] font-black uppercase text-black underline mt-4 block">Start Shopping to Earn</Link>
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx._id} className="group bg-white border border-zinc-100 hover:border-black p-6 rounded-2xl transition-all duration-300 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${tx.type === 'spend' ? 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white' :
                                        tx.type === 'earn' ? 'bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white' :
                                            'bg-zinc-50 text-zinc-900 group-hover:bg-black group-hover:text-white'
                                        }`}>
                                        {getIcon(tx.type)}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black uppercase tracking-tight mb-1">{tx.description}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-[9px] font-bold text-zinc-400 uppercase">
                                                <Calendar size={10} /> {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                            {tx.referenceId && (
                                                <span className="text-[9px] font-bold text-zinc-300 uppercase">#{tx.referenceId.toString().slice(-6)}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-right ${tx.type === 'spend' ? 'text-red-500' : 'text-green-500'}`}>
                                    <p className="text-lg font-black italic tracking-tighter">
                                        {tx.type === 'spend' ? '-' : '+'}{tx.amount}
                                    </p>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Coins</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Information Box */}
                <div className="mt-12 p-8 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">How it works</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Earn Points</p>
                            <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
                                Earn 1 coin for every ₹100 spent. Higher tiers (Silver, Gold, Platinum) earn up to 2x more per rupee.
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Redeem Instantly</p>
                            <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
                                Use your coins at checkout to get direct discounts on your order. 1 coin = ₹1 reduction.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyLedger;
