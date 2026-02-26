import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Coins, TrendingUp, TrendingDown,
    Calendar, Gift, RotateCcw, UserPlus, Sparkles
} from 'lucide-react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { Skeleton } from '../../components/ui/Skeleton';

const TIERS = [
    { name: 'Bronze', threshold: 0, color: 'from-orange-700 to-orange-900', text: 'Base Tier', perk: '1x Coins' },
    { name: 'Silver', threshold: 5000, color: 'from-zinc-300 to-zinc-500', text: '1.2x Coins', perk: 'Unlock at ₹5,000' },
    { name: 'Gold', threshold: 20000, color: 'from-amber-400 to-amber-600', text: '1.5x Coins', perk: 'Unlock at ₹20,000' },
    { name: 'Platinum', threshold: 50000, color: 'from-zinc-100 to-zinc-400', text: '2x Coins', perk: 'Unlock at ₹50,000' },
];

const LoyaltyLedger = () => {
    const { user, refreshUser } = useStore();
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
                console.error('Failed to fetch loyalty history', err);
            } finally {
                setLoading(false);
            }
        };
        if (user) { fetchHistory(); refreshUser(); }
        else navigate('/login');
    }, []);  // eslint-disable-line

    const points = user?.loyaltyPoints || 0;
    const tierName = user?.tier || 'Bronze';
    const nextTier = TIERS.find(t => t.threshold > points);
    const nextThreshold = nextTier?.threshold || 50000;
    // Determine the previous tier's threshold to calculate progress within current bracket
    const currentTierObj = [...TIERS].reverse().find(t => points >= t.threshold) || TIERS[0];
    const prevThreshold = currentTierObj.threshold;
    const bracket = nextThreshold - prevThreshold;
    const progressPct = bracket > 0 ? Math.min(100, ((points - prevThreshold) / bracket) * 100) : 100;

    const getIcon = (type) => {
        switch (type) {
            case 'earn': return <TrendingUp className="text-green-500" size={14} />;
            case 'spend': return <TrendingDown className="text-red-500" size={14} />;
            case 'bonus': return <Gift className="text-purple-500" size={14} />;
            case 'refund': return <RotateCcw className="text-blue-500" size={14} />;
            case 'referral': return <UserPlus className="text-amber-500" size={14} />;
            default: return <Coins size={14} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pt-28 pb-20 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Skeleton className="w-40 h-8" />
                    <Skeleton className="w-full h-40 rounded-3xl" />
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full h-16 rounded-2xl" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 md:pt-32 pb-24 overflow-x-hidden">
            <div className="max-w-2xl mx-auto px-4">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => navigate('/account')} className="p-2 hover:bg-zinc-50 rounded-full transition-colors shrink-0">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">Loyalty Ledger</h1>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Your SLOOK Coin History</p>
                    </div>
                </div>

                {/* Tier Status Card */}
                <div className="bg-zinc-900 text-white rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none" />
                    <div className="relative z-10">

                        {/* Top Row */}
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500 mb-1 flex items-center gap-1">
                                    <Sparkles size={10} className="animate-pulse" /> Current Status
                                </p>
                                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">Elite {tierName}</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl sm:text-3xl font-black text-amber-400">{points.toLocaleString()}</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Available Coins</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                <span>{nextTier ? `Progress to ${nextTier.name}` : 'Max Tier Reached'}</span>
                                <span>{progressPct.toFixed(0)}%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700"
                                    style={{ width: `${progressPct}%` }}
                                />
                            </div>
                            {nextTier && (
                                <p className="text-[9px] text-zinc-500 font-medium">
                                    {(nextThreshold - points).toLocaleString()} more coins to reach {nextTier.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tier Milestone Scroll */}
                <div className="mb-8">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3 px-1">Tier Milestones</h3>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {TIERS.map((tier) => {
                            const isActive = tierName === tier.name;
                            return (
                                <div
                                    key={tier.name}
                                    className={`shrink-0 w-36 p-4 rounded-2xl border transition-all ${isActive ? 'border-amber-400/50 bg-zinc-900 text-white shadow-lg shadow-amber-500/10' : 'border-zinc-100 bg-zinc-50'}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${tier.color} mb-3 shadow-md`} />
                                    <p className={`text-xs font-black uppercase tracking-tight mb-0.5 ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                                        {isActive && '✓ '}Elite {tier.name}
                                    </p>
                                    <p className={`text-[8px] font-bold uppercase tracking-widest ${isActive ? 'text-amber-400' : 'text-zinc-400'}`}>{tier.text}</p>
                                    <p className={`text-[8px] font-medium mt-1 ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>{tier.perk}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Transactions */}
                <div className="space-y-3 mb-8">
                    <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100 pb-3 mb-4">Recent Activity</h3>

                    {transactions.length === 0 ? (
                        <div className="text-center py-16 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                            <Coins size={32} className="mx-auto text-zinc-200 mb-3" />
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">No transactions yet</p>
                            <Link to="/shop" className="text-[9px] font-black uppercase text-black underline">Start Shopping to Earn</Link>
                        </div>
                    ) : (
                        transactions.map((tx) => (
                            <div key={tx._id} className="bg-white border border-zinc-100 hover:border-zinc-300 p-4 sm:p-5 rounded-2xl transition-all flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === 'spend' ? 'bg-red-50 text-red-500' :
                                            tx.type === 'earn' ? 'bg-green-50 text-green-500' :
                                                'bg-zinc-50 text-zinc-500'
                                        }`}>
                                        {getIcon(tx.type)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] sm:text-xs font-bold truncate">{tx.description}</p>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                            <Calendar size={8} />
                                            {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-right shrink-0 ${tx.type === 'spend' ? 'text-red-500' : 'text-green-500'}`}>
                                    <p className="text-sm sm:text-base font-black tabular-nums">
                                        {tx.type === 'spend' ? '-' : '+'}{tx.amount ?? 0}
                                    </p>
                                    <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Coins</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* How it Works */}
                <div className="p-5 sm:p-8 bg-zinc-50 rounded-2xl border border-zinc-100">
                    <h4 className="text-[9px] font-black uppercase tracking-widest mb-4">How It Works</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Earn Points</p>
                            <p className="text-[10px] text-zinc-600 leading-relaxed">
                                Earn 1 coin for every ₹100 spent. Silver, Gold & Platinum tiers earn up to 2x more.
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase text-zinc-400 mb-1">Redeem Instantly</p>
                            <p className="text-[10px] text-zinc-600 leading-relaxed">
                                Use coins at checkout for instant discounts. 1 coin = ₹1 off.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoyaltyLedger;
