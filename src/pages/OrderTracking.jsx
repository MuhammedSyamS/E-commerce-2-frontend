import React, { useState } from 'react';
import api from '../api/instance';
import { Search, Package, CheckCircle, Truck, MapPin, AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const OrderTracking = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setOrder(null);

        try {
            const { data } = await api.post('/orders/track', { orderId, email });
            setOrder(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found or details mismatch.');
        } finally {
            setLoading(false);
        }
    };

    const STEPS = [
        { status: 'Placed', label: 'Order Placed', icon: Package },
        { status: 'Processing', label: 'Processing', icon: Clock },
        { status: 'Shipped', label: 'Shipped', icon: Truck },
        { status: 'Delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const getCurrentStep = (status) => {
        if (status === 'Cancelled') return -1;
        // Map status to index
        const map = { 'Placed': 0, 'Paid': 0, 'Processing': 1, 'Shipped': 2, 'Delivered': 3 };
        return map[status] !== undefined ? map[status] : 0;
    };

    return (
        <div className="bg-white min-h-screen pt-40 pb-20">
            <Helmet>
                <title>Track Your Order | SLOOK</title>
                <meta name="description" content="Track the status of your SLOOK order." />
            </Helmet>

            <div className="container mx-auto px-6 max-w-4xl">

                <div className="text-center mb-10 md:mb-16">
                    <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4">Track Your Order</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] md:text-[10px]">Enter your details below to see current status</p>
                </div>

                {/* INPUT FORM */}
                <div className="bg-zinc-50 p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 shadow-sm max-w-2xl mx-auto mb-16">
                    <form onSubmit={handleTrack} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-4">Order ID</label>
                            <input
                                type="text"
                                placeholder="e.g. 64f..."
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-5 py-3 md:px-6 md:py-4 font-bold text-sm md:text-base outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-4">Email Address</label>
                            <input
                                type="email"
                                placeholder="Same as used during checkout"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-5 py-3 md:px-6 md:py-4 font-bold text-sm md:text-base outline-none focus:border-black transition-colors"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? 'Locating...' : 'Track Artifact'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle size={20} />
                            <span className="text-xs font-bold">{error}</span>
                        </div>
                    )}
                </div>

                {/* ORDER DETAILS RESULT */}
                {order && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">

                        {/* STATUS BAR */}
                        <div className="bg-white border border-zinc-100 rounded-3xl p-8 mb-8 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                                <div>
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Status</p>
                                    <h2 className={`text-xl md:text-2xl font-black uppercase ${order.status === 'Cancelled' ? 'text-red-500' : 'text-green-500'}`}>
                                        {order.status}
                                    </h2>
                                </div>
                                <div className="text-left md:text-right">
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Expected Delivery</p>
                                    <p className="text-base md:text-lg font-bold">
                                        {order.isDelivered ? 'Delivered' : 'Est. 3-5 Business Days'}
                                    </p>
                                </div>
                            </div>

                            {/* PROGRESS BAR */}
                            {order.status !== 'Cancelled' && (
                                <div className="relative">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-zinc-100 -translate-y-1/2 rounded-full"></div>
                                    <div
                                        className="absolute top-1/2 left-0 h-1 bg-black -translate-y-1/2 rounded-full transition-all duration-1000"
                                        style={{ width: `${(getCurrentStep(order.status) / (STEPS.length - 1)) * 100}%` }}
                                    ></div>

                                    <div className="relative flex justify-between">
                                        {STEPS.map((step, idx) => {
                                            const current = getCurrentStep(order.status);
                                            const completed = idx <= current;
                                            return (
                                                <div key={step.status} className="flex flex-col items-center gap-2 md:gap-3">
                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all ${completed ? 'bg-black border-black text-white' : 'bg-white border-zinc-200 text-zinc-300'}`}>
                                                        <step.icon size={14} className="md:w-4 md:h-4" />
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <span className={`text-[7px] md:text-[9px] font-black uppercase tracking-widest ${completed ? 'text-black' : 'text-zinc-300'}`}>{step.label}</span>
                                                        {completed && (
                                                            <span className="text-[6px] md:text-[7px] text-zinc-400 font-bold uppercase mt-1">
                                                                {step.status === 'Placed' && new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                {step.status === 'Processing' && order.paidAt && new Date(order.paidAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                {step.status === 'Delivered' && order.deliveredAt && new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                                {step.status === 'Shipped' && order.isDispatched && new Date(order.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ITEMS & INFO GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Items */}
                            <div className="bg-zinc-50 p-8 rounded-3xl">
                                <h3 className="text-xs font-black uppercase tracking-widest mb-6">Artifacts in Transit</h3>
                                <div className="space-y-4">
                                    {order.orderItems.map((item, i) => (
                                        <div key={i} className="flex gap-4 bg-white p-3 rounded-xl border border-zinc-100">
                                            <div className="w-12 h-16 bg-zinc-100 rounded-lg overflow-hidden">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase">{item.name}</p>
                                                <p className="text-[10px] text-zinc-500 font-bold">Qty: {item.qty} × ₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 pt-6 border-t border-zinc-200 flex justify-between items-center">
                                    <span className="font-bold text-xs uppercase">Total Paid</span>
                                    <span className="font-black text-xl">₹{order.totalPrice.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Address */}
                            <div className="bg-white border border-zinc-200 p-8 rounded-3xl flex flex-col justify-center items-start">
                                <MapPin className="mb-4 text-zinc-400" size={32} />
                                <h3 className="text-xs font-black uppercase tracking-widest mb-2">Shipping To</h3>
                                <p className="font-bold text-lg">{order.shippingAddress.address}</p>
                                <p className="text-zinc-500 font-medium">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p className="text-zinc-500 font-medium mt-1">{order.shippingAddress.country}</p>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};

export default OrderTracking;
