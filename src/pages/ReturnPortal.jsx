import React, { useState } from 'react';
import { Truck, Search, ArrowRight, ShieldCheck, RotateCcw, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const ReturnPortal = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleLookup = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Logic: Fetch order by ID and Email (MNC Standard Security)
            const { data } = await axios.get(`/api/orders/lookup?id=${orderId}&email=${email}`);
            setOrder(data);
            addToast("Order Found!", "success");
        } catch (err) {
            addToast(err.response?.data?.message || "Order not found or not eligible for return", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-44 md:pt-52 pb-20">
            <Helmet>
                <title>Returns Portal | SLOOK</title>
            </Helmet>

            <div className="container mx-auto px-6 max-w-xl">
                {!order ? (
                    <div className="bg-white p-10 md:p-16 rounded-[3rem] shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex justify-center mb-10">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
                                <RotateCcw size={32} />
                            </div>
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tighter text-center mb-4">Returns <span className="text-zinc-300">Portal</span></h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-12">Enter details to initiate return or exchange</p>

                        <form onSubmit={handleLookup} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Order Identifier</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 65a4fc..."
                                    required
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-sm font-bold outline-none focus:border-black transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Email Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-5 text-sm font-bold outline-none focus:border-black transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? "Searching..." : "Track My Order"}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-12 p-6 bg-blue-50 rounded-2xl flex items-start gap-4">
                            <AlertCircle className="text-blue-500 shrink-0" size={20} />
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                                Eligibility: Items can be returned within 7 days of delivery. Must be in original condition with tags.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-10 rounded-[3rem] shadow-xl animate-in zoom-in duration-500">
                        {/* Order Details & Return Selection Logic would go here */}
                        <div className="text-center">
                            <ShieldCheck size={48} className="mx-auto text-green-500 mb-6" />
                            <h2 className="text-2xl font-black uppercase italic">Order Found</h2>
                            <p className="text-xs font-bold text-zinc-400 mt-2">Order ID: {order._id}</p>
                            <div className="mt-10 p-6 border border-dashed border-zinc-200 rounded-2xl">
                                <p className="text-xs font-medium text-zinc-500">Please contact support for manual returns while we finalize the automated QC integration.</p>
                            </div>
                            <button onClick={() => setOrder(null)} className="mt-8 text-xs font-black uppercase underline tracking-widest">Back to Search</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnPortal;
