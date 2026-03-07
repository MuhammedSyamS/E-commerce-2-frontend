import React, { useState, useEffect } from 'react';
import api from '../api/instance';
import { useStore } from '../store/useStore';
import { Package, Truck, CheckCircle2, XCircle, RefreshCw, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { resolveMediaURL } from '../utils/mediaUtils';

const MyReturns = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReturns = async () => {
            if (!user?.token) return;
            try {
                const { data } = await api.get('/returns/my');
                setReturns(data);
            } catch (error) {
                console.error("Failed to fetch returns", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReturns();
        window.scrollTo(0, 0);
    }, [user.token]);

    const getStatusStep = (status) => {
        const steps = ['Requested', 'Approved', 'Pickup Scheduled', 'Picked Up', 'Received', 'QC Passed', 'Refund Completed', 'Replacement Sent', 'Resolved'];
        // Simplify mapping
        if (status === 'Pending' || status === 'Requested') return 1;
        if (status === 'Approved') return 2;
        if (status === 'Pickup Scheduled') return 3;
        if (status === 'Picked Up' || status === 'In Transit') return 4;
        if (status === 'Received' || status === 'QC Pending') return 5;
        if (status === 'QC Passed') return 6;
        if (status === 'Refund Completed' || status === 'Replacement Sent' || status === 'Exchanged' || status === 'Returned') return 7;
        if (status === 'Rejected' || status === 'QC Failed') return -1;
        return 0;
    };

    if (loading) return <div className="min-h-screen pt-40 text-center">Loading...</div>;

    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 pt-32 md:pt-40 pb-12 md:pb-20 px-4 md:px-6 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-4 mb-8 md:mb-12">
                    <button onClick={() => navigate('/account')} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                        <ChevronRight size={16} className="rotate-180 md:w-5 md:h-5" />
                    </button>
                    <div>
                        <h1 className="!text-xl md:!text-3xl font-black uppercase tracking-tighter italic">My Returns</h1>
                        <p className="text-zinc-500 text-[7px] md:text-xs font-bold uppercase tracking-widest mt-1">Track your requests & history</p>
                    </div>
                </div>

                {returns.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100 shadow-sm">
                        <Package size={48} className="mx-auto text-zinc-300 mb-4" />
                        <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest">No Returns Found</h3>
                        <button onClick={() => navigate('/my-orders')} className="mt-6 px-8 py-3 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition">
                            Go to Orders
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {returns.map(ret => {
                            const step = getStatusStep(ret.status);
                            const isRejected = step === -1;
                            const isDone = step === 7;

                            // Helper to find date for a step
                            const getDateForStep = (stepLabel) => {
                                // Simplified mapping
                                let targetStatus = [];
                                if (stepLabel === 'Requested') targetStatus = ['Requested'];
                                if (stepLabel === 'Approved') targetStatus = ['Approved'];
                                if (stepLabel === 'Pickup') targetStatus = ['Pickup Scheduled', 'Picked Up'];
                                if (stepLabel === 'QC') targetStatus = ['Received', 'QC Pending', 'QC Passed'];
                                if (stepLabel === 'Resolved') targetStatus = ['Refund Completed', 'Replacement Sent', 'Exchanged'];

                                const event = ret.timeline?.find(t => targetStatus.includes(t.status));
                                return event ? new Date(event.date).toLocaleDateString() : (stepLabel === 'Requested' ? new Date(ret.createdAt).toLocaleDateString() : null);
                            };

                            return (
                                <div key={ret._id} className="bg-white rounded-3xl p-3 md:p-8 border border-zinc-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                                        {/* IMAGE */}
                                        <div className="w-14 h-20 md:w-24 md:h-32 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                                            <img src={resolveMediaURL(ret.orderItem.image)} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                                        </div>

                                        {/* DETAILS */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2 md:mb-4">
                                                <div>
                                                    <span className={`inline-block px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest mb-1 md:mb-2 ${ret.type === 'Exchange' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                                                        }`}>
                                                        {ret.type} Request
                                                    </span>
                                                    <h3 className="font-bold uppercase text-xs md:text-lg leading-tight">{ret.orderItem.name}</h3>
                                                    <p className="text-[8px] md:text-xs text-zinc-500 font-mono mt-0.5 md:mt-1">Order #{ret.order?._id?.slice(-6)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-[8px] md:text-xs font-black uppercase tracking-widest ${isRejected ? 'text-red-500' : isDone ? 'text-green-500' : 'text-blue-500'}`}>
                                                        {ret.status}
                                                    </div>
                                                    {ret.reason && <p className="text-[7px] md:text-[10px] text-zinc-400 mt-1 font-medium bg-zinc-50 px-2 py-1 rounded inline-block">{ret.reason}</p>}
                                                </div>
                                            </div>

                                            {/* LOGISTICS INFO (Like Shipping Tracking) */}
                                            {ret.pickupDetails?.courier && (
                                                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between gap-4">
                                                    <div className="flex items-center gap-2 md:gap-3">
                                                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center">
                                                            <Truck size={12} className="text-zinc-600 md:w-4 md:h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Courier Partner</p>
                                                            <p className="text-[9px] md:text-xs font-bold uppercase">{ret.pickupDetails.courier}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Tracking ID</p>
                                                        <p className="text-[9px] md:text-xs font-mono font-bold">{ret.pickupDetails.trackingId || 'Pending'}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PROGRESS BAR */}
                                            <div className="mt-8 relative pt-4 pb-2">
                                                <div className="absolute top-[22px] left-0 w-full h-[2px] bg-zinc-100 rounded-full" />
                                                <div
                                                    className={`absolute top-[22px] left-0 h-[2px] rounded-full transition-all duration-1000 ${isRejected ? 'bg-red-200' : 'bg-black'}`}
                                                    style={{ width: isRejected ? '100%' : `${(step / 7) * 100}%` }}
                                                />

                                                <div className="relative flex justify-between">
                                                    {['Requested', 'Approved', 'Pickup', 'QC', 'Resolved'].map((label, i) => {
                                                        const isActive = step > i + 1; // +1 shift for 5 steps mapping to 7 detailed states
                                                        let activeState = false;
                                                        if (i === 0 && step >= 1) activeState = true;
                                                        if (i === 1 && step >= 2) activeState = true;
                                                        if (i === 2 && step >= 3) activeState = true;
                                                        if (i === 3 && step >= 5) activeState = true;
                                                        if (i === 4 && step >= 7) activeState = true;

                                                        if (isRejected) activeState = false;

                                                        const date = getDateForStep(label);

                                                        return (
                                                            <div key={label} className="flex flex-col items-center gap-2 group/step w-1/5">
                                                                <div className={`w-3 h-3 rounded-full border-2 z-10 transition-all ${isRejected && i === 4 ? 'bg-red-500 border-red-500' :
                                                                    activeState ? 'bg-black border-black scale-125' : 'bg-white border-zinc-200'
                                                                    }`}>
                                                                    {isRejected && i === 4 && <XCircle size={8} className="text-white absolute -top-4 left-1/2 -translate-x-1/2" />}
                                                                </div>
                                                                <div className="text-center">
                                                                    <span className={`block text-[6px] md:text-[9px] font-bold uppercase tracking-widest mb-0.5 ${activeState ? 'text-black' : 'text-zinc-300'}`}>
                                                                        {isRejected && i === 4 ? 'Rejected' : label}
                                                                    </span>
                                                                    {activeState && date && (
                                                                        <span className="block text-[6px] md:text-[8px] font-mono text-zinc-400">{date}</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* ADMIN COMMENT / FOOTER */}
                                            {ret.adminComment && (
                                                <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex gap-3 text-xs text-zinc-600">
                                                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                                    <p>{ret.adminComment}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyReturns;
