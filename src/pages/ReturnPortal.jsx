import React, { useState } from 'react';
import { Truck, Search, ArrowRight, ShieldCheck, RotateCcw, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import api from '../api/instance'; // Use configured instance
import { useToast } from '../context/ToastContext';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

const ReturnPortal = () => {
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]); // Array of itemIds
    const [reason, setReason] = useState('');
    const [comment, setComment] = useState('');
    const [returnType, setReturnType] = useState('Return'); // Return or Exchange
    const [successMsg, setSuccessMsg] = useState('');

    const { addToast } = useToast();
    const { user } = useStore();
    const navigate = useNavigate();

    const handleLookup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOrder(null);
        setSelectedItems([]);
        setSuccessMsg('');
        try {
            // Use public lookup endpoint
            const { data } = await api.get(`/orders/lookup?id=${orderId}&email=${email}`);
            setOrder(data);
            addToast("Order Found!", "success");
        } catch (err) {
            addToast(err.response?.data?.message || "Order not found or not eligible for return", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelection = (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
        } else {
            setSelectedItems([...selectedItems, itemId]);
        }
    };

    const handleSubmitReturn = async (e) => {
        e.preventDefault();

        if (!user) {
            addToast("Please login to verify ownership", "info");
            navigate('/login');
            return;
        }

        if (selectedItems.length === 0) {
            addToast("Please select at least one item", "error");
            return;
        }

        setLoading(true);
        try {
            // We need to submit a request for EACH selected item if the backend expects one-by-one
            // Backend `createReturnRequest` takes `itemId` (singular).
            // So we loop.

            const promises = selectedItems.map(itemId => {
                return api.post('/returns', {
                    orderId: order._id,
                    itemId,
                    reason,
                    comment,
                    type: returnType,
                    images: [] // TODO: Add Image Upload UI if needed
                });
            });

            await Promise.all(promises);

            setSuccessMsg("Return Request Initiated Successfully!");
            setSelectedItems([]);
            setOrder(null); // Reset
            addToast("Return Initiated", "success");

        } catch (err) {
            addToast(err.response?.data?.message || "Failed to initiate return", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filter for delivered items only
    const returnableItems = order?.items?.filter(item =>
        !['Return Requested', 'Returned', 'Exchange Requested', 'Exchanged'].includes(item.status)
    ) || [];

    return (
        <div className="bg-gray-50 min-h-screen pt-28 md:pt-52 pb-20 px-4 md:px-6">
            <Helmet>
                <title>Returns Portal | SLOOK</title>
            </Helmet>

            <div className="container mx-auto max-w-xl">
                {successMsg ? (
                    <div className="bg-white p-8 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-xl text-center animate-in zoom-in duration-500">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} className="md:w-10 md:h-10" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic mb-4">Request Received</h2>
                        <p className="text-zinc-500 text-sm md:text-base font-medium mb-8 leading-relaxed">Your return request has been submitted. You will receive an email with shipping instructions shortly.</p>
                        <button onClick={() => window.location.reload()} className="text-xs font-black uppercase underline tracking-widest p-4">Process Another</button>
                    </div>
                ) : !order ? (
                    <div className="bg-white p-6 md:p-16 rounded-[2.5rem] md:rounded-[3rem] shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex justify-center mb-8 md:mb-10">
                            <div className="w-14 h-14 md:w-16 md:h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
                                <RotateCcw size={28} className="md:w-8 md:h-8" />
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-center mb-2 md:mb-4">Returns <span className="text-zinc-300">Portal</span></h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-8 md:mb-12">Enter details to initiate return or exchange</p>

                        <form onSubmit={handleLookup} className="space-y-6 md:space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Order Identifier</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 65a4fc..."
                                    required
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 md:p-5 text-base md:text-sm font-bold outline-none focus:border-black transition-all appearance-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Email_Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 md:p-5 text-base md:text-sm font-bold outline-none focus:border-black transition-all appearance-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 touch-manipulation"
                            >
                                {loading ? "Searching..." : "Find Order"}
                                {!loading && <ArrowRight size={18} />}
                            </button>
                        </form>

                        <div className="mt-8 md:mt-12 p-5 md:p-6 bg-blue-50 rounded-2xl flex items-start gap-4">
                            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                                Eligibility: Items can be returned within 7 days. Must be in original condition with tags. Unboxing video required for damaged items.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[3rem] shadow-xl animate-in zoom-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-black uppercase italic">Select Items</h2>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order #{order._id.slice(-6)}</p>
                            </div>
                            <button onClick={() => setOrder(null)} className="text-[10px] font-bold underline text-left md:text-right p-2 -ml-2 md:ml-0">Change Order</button>
                        </div>

                        <form onSubmit={handleSubmitReturn}>
                            <div className="space-y-4 mb-8">
                                {returnableItems.length === 0 && (
                                    <p className="text-center text-zinc-400 font-bold text-xs py-8">No returnable items found in this order.</p>
                                )}
                                {returnableItems.map(item => (
                                    <label key={item._id} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.99] touch-manipulation ${selectedItems.includes(item._id) ? 'border-black bg-zinc-50' : 'border-zinc-100'}`}>
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 accent-black rounded"
                                                checked={selectedItems.includes(item._id)}
                                                onChange={() => toggleItemSelection(item._id)}
                                            />
                                        </div>
                                        <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-xl bg-zinc-200" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs uppercase truncate">{item.name}</p>
                                            <p className="text-[10px] text-zinc-500 mt-0.5">Qty: {item.qty} | Size: {item.selectedVariant?.size || 'N/A'}</p>
                                            <p className="text-[11px] font-black mt-1">₹{item.price}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {selectedItems.length > 0 && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Action</label>
                                        <div className="flex gap-4">
                                            {['Return', 'Exchange'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setReturnType(type)}
                                                    className={`flex-1 py-4 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-widest border transition-all touch-manipulation ${returnType === type ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Reason</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm md:text-xs font-bold outline-none focus:border-black appearance-none"
                                            >
                                                <option value="">Select Reason</option>
                                                <option value="Size Issue">Size Issue (Too Big/Small)</option>
                                                <option value="Damaged Product">Damaged / Defective Product</option>
                                                <option value="Wrong Item Received">Wrong Item Received</option>
                                                <option value="Quality Issue">Quality Not As Expected</option>
                                                <option value="Changed Mind">Changed Mind</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ArrowRight size={14} className="rotate-90 text-zinc-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Additional Comments</label>
                                        <textarea
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder="Please provide details..."
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-base md:text-xs font-bold outline-none focus:border-black h-24 resize-none"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-black text-white py-4 md:py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-zinc-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 block touch-manipulation"
                                    >
                                        {loading ? "Processing..." : `Confirm ${returnType}`}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReturnPortal;
