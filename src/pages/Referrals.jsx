import React, { useState, useEffect } from 'react';
import api from '../api/instance';
import { useStore } from '../store/useStore';
import { Copy, Gift, Share2, Users, ArrowRight, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Referrals = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [referralData, setReferralData] = useState({
        referralCode: user?.referralCode || '...',
        referralEarnings: user?.referralEarnings || 0,
        referredFriends: []
    });
    const [loading, setLoading] = useState(true);

    const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`;

    useEffect(() => {
        const fetchReferralStats = async () => {
            try {
                const { data } = await api.get('/users/referrals');
                setReferralData(data);
            } catch (err) {
                console.error("Error fetching referrals:", err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.token) fetchReferralStats();
    }, [user]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        addToast("Referral link copied!", "success");
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join SLOOK',
                text: 'Signup on SLOOK and get 10% off your first order!',
                url: referralLink,
            })
                .then(() => addToast("Link shared successfully!", "success"))
                .catch((error) => console.log('Error sharing', error));
        } else {
            copyToClipboard();
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* HERO */}
                <div className="bg-black text-white rounded-[3rem] p-8 md:p-16 mb-12 relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">
                            <Gift size={12} className="inline mr-2 mb-0.5" />
                            Invite & Earn
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none">
                            Share the <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 text-6xl">Luxury</span>
                        </h1>
                        <p className="text-zinc-400 text-lg mb-8 font-medium">
                            Invite your friends to SLOOK. They get <span className="text-white font-bold">10% off</span> their first order,
                            and you earn <span className="text-white font-bold">₹500</span> in store credit for every successful referral.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="bg-white/10 backdrop-blur p-2 pr-4 rounded-full flex items-center border border-white/10 w-full sm:w-auto overflow-hidden">
                                <span className="bg-black text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest h-10 flex items-center shrink-0">
                                    {referralData.referralCode}
                                </span>
                                <input readOnly value={referralLink} className="bg-transparent border-none outline-none text-[10px] text-zinc-300 px-4 w-full truncate" />
                                <button onClick={copyToClipboard} className="text-white hover:text-yellow-400 transition-colors shrink-0">
                                    <Copy size={16} />
                                </button>
                            </div>
                            <button
                                onClick={handleShare}
                                className="bg-white text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <Share2 size={14} /> Share Link
                            </button>
                        </div>
                    </div>

                    <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 hidden md:block">
                        <Gift size={300} className="absolute -right-20 -top-20 -rotate-12" />
                    </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <DollarSign size={24} />
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter">₹{referralData.referralEarnings}</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Total Earnings</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Users size={24} />
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter">{referralData.referredFriends.length}</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Friends Referred</p>
                    </div>

                    <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                            <Gift size={24} />
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter">10%</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Friend's Discount</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* HOW IT WORKS */}
                    <div className="lg:col-span-1 bg-white border border-zinc-100 rounded-[3rem] p-10 h-fit">
                        <h2 className="text-sm font-black uppercase tracking-tight mb-8 border-b border-zinc-50 pb-4">How to Earn</h2>
                        <div className="space-y-10">
                            {[
                                { num: "1", title: "Send Invite", desc: "Share your unique referral link with friends." },
                                { num: "2", title: "They Shop", desc: "Your friend signs up and gets 10% off their first order." },
                                { num: "3", title: "You Earn", desc: "Once their order is delivered, you get ₹500 store credit." }
                            ].map((step) => (
                                <div key={step.num} className="flex gap-4">
                                    <span className="text-3xl font-black text-zinc-200">{step.num}</span>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-wide mb-1">{step.title}</h4>
                                        <p className="text-xs text-zinc-500 leading-relaxed font-medium">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* REFERRED FRIENDS LIST */}
                    <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-[3rem] p-10">
                        <div className="flex items-center justify-between mb-8 border-b border-zinc-50 pb-4">
                            <h2 className="text-sm font-black uppercase tracking-tight">Referred Friends</h2>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase">{referralData.referredFriends.length} Total</span>
                        </div>

                        {loading ? (
                            <div className="py-10 text-center animate-pulse text-[10px] font-black uppercase tracking-widest text-zinc-300">Syncing Network...</div>
                        ) : referralData.referredFriends.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-300">
                                    <Users size={32} />
                                </div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No friends referred yet</p>
                                <button onClick={handleShare} className="text-[10px] font-black text-purple-600 hover:text-black transition-colors uppercase flex items-center gap-2 mx-auto">
                                    Invite your first friend <ArrowRight size={12} />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {referralData.referredFriends.map((friend) => (
                                    <div key={friend._id} className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-zinc-300 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center text-xs font-black">
                                                {friend.firstName[0]}{friend.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase">{friend.firstName} {friend.lastName}</p>
                                                <p className="text-[9px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                                                    <Calendar size={10} /> Joined {new Date(friend.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            {friend.hasMadeFirstOrder ? (
                                                <div className="flex items-center gap-1.5 bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                                                    <CheckCircle2 size={12} /> Earned
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 bg-zinc-200 text-zinc-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">
                                                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-pulse"></span> Pending
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Referrals;
