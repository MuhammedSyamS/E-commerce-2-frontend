import React, { useState } from 'react';
import { Truck, Search, ArrowRight, ShieldCheck, RotateCcw, AlertCircle, CheckCircle, Package, X, Loader2 } from 'lucide-react';
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
    const [images, setImages] = useState([]); // Base64 strings
    const [uploading, setUploading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [variants, setVariants] = useState({}); // itemId -> variants array
    const [selectedExchangeVariants, setSelectedExchangeVariants] = useState({}); // itemId -> variant object
    const [variantsLoading, setVariantsLoading] = useState({}); // itemId -> bool

    const { addToast } = useToast();
    const { user } = useStore();
    const navigate = useNavigate();

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const promises = files.map(file => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises)
            .then(base64s => {
                setImages(prev => [...prev, ...base64s]);
                addToast(`Attached ${files.length} file(s)`, "success");
            })
            .catch(err => {
                console.error("Upload failed", err);
                addToast("Failed to process files", "error");
            })
            .finally(() => setUploading(false));
    };

    const handleLookup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setOrder(null);
        setSelectedItems([]);
        setImages([]);
        setSuccessMsg('');
        try {
            // Use public lookup endpoint
            const { data } = await api.get(`/orders/lookup?id=${orderId}&email=${email}`);
            setOrder(data);

            // Check if order as a whole is too old
            const deliveryDate = data.deliveredAt ? new Date(data.deliveredAt) : new Date(data.createdAt);
            const daysDiff = (new Date() - deliveryDate) / (1000 * 60 * 60 * 24);
            if (daysDiff > 7 && data.orderStatus === 'Delivered') {
                addToast("Return period expired (7 days from delivery)", "warning");
            } else {
                addToast("Order Found!", "success");
            }
        } catch (err) {
            addToast(err.response?.data?.message || "Order not found or not eligible for return", "error");
        } finally {
            setLoading(false);
        }
    };

    const toggleItemSelection = async (itemId) => {
        if (selectedItems.includes(itemId)) {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
            // Cleanup variants if needed?
        } else {
            setSelectedItems([...selectedItems, itemId]);
            if (returnType === 'Exchange') {
                fetchVariantsForItem(itemId);
            }
        }
    };

    const fetchVariantsForItem = async (itemId) => {
        if (variants[itemId]) return;
        setVariantsLoading(prev => ({ ...prev, [itemId]: true }));
        try {
            const item = order.items.find(it => it._id === itemId);
            const pId = item.product?._id || item.product;
            const { data } = await api.get(`/products/${pId}/variants`);
            setVariants(prev => ({ ...prev, [itemId]: data.filter(v => v.stock > 0) }));
        } catch (err) {
            addToast("Failed to fetch variations for an item", "error");
        } finally {
            setVariantsLoading(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const handleSubmitReturn = async (e) => {
        e.preventDefault();

        if (!user) {
            addToast("Please login to verify ownership", "info");
            navigate('/login', { state: { from: window.location.pathname } });
            return;
        }

        if (selectedItems.length === 0) {
            addToast("Please select at least one item", "error");
            return;
        }

        const isDamaged = reason === 'Damaged Product' || reason === 'Wrong Item Received';
        if (isDamaged && images.length === 0) {
            addToast("Unboxing video/images required for damaged items", "error");
            return;
        }

        setLoading(true);
        try {
            const promises = selectedItems.map(itemId => {
                return api.post('/returns', {
                    orderId: order._id,
                    itemId,
                    reason,
                    comment,
                    type: returnType,
                    images: images,
                    requestedVariant: selectedExchangeVariants[itemId] || null
                });
            });

            await Promise.all(promises);

            setSuccessMsg("Return Request Initiated Successfully!");
            setSelectedItems([]);
            setOrder(null);
            setImages([]);
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
        <div className="bg-gray-50 min-h-screen pt-32 md:pt-44 pb-12 md:pb-20 px-4 md:px-6">
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
                    <div className="bg-white p-5 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="flex justify-center mb-6 md:mb-10">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400">
                                <RotateCcw size={24} className="md:w-8 md:h-8" />
                            </div>
                        </div>

                        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-center mb-2 md:mb-4">Returns <span className="text-zinc-300">Portal</span></h1>
                        <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-6 md:mb-12">Enter details to initiate return or exchange</p>

                        <form onSubmit={handleLookup} className="space-y-6 md:space-y-8">
                            <div className="space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Order Identifier</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 65a4fc..."
                                    required
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 md:p-5 text-sm font-bold outline-none focus:border-black transition-all appearance-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Email_Address</label>
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 md:p-5 text-sm font-bold outline-none focus:border-black transition-all appearance-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3.5 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-zinc-900 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 touch-manipulation"
                            >
                                {loading ? "Searching..." : "Find Order"}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </form>

                        <div className="mt-6 md:mt-12 p-4 md:p-6 bg-blue-50 rounded-2xl flex items-start gap-4">
                            <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={16} />
                            <p className="text-[8px] md:text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-relaxed">
                                Eligibility: Items can be returned within 7 days. Must be in original condition with tags. Unboxing video required for damaged items.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-5 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-xl animate-in zoom-in duration-500">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 md:mb-8 gap-4">
                            <div>
                                <h2 className="text-lg md:text-2xl font-black uppercase italic">Select Items</h2>
                                <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Order #{order._id.slice(-6)}</p>
                            </div>
                            <button onClick={() => setOrder(null)} className="text-[8px] md:text-[10px] font-bold underline text-left md:text-right p-2 -ml-2 md:ml-0">Change Order</button>
                        </div>
                        <form onSubmit={handleSubmitReturn}>
                            <div className="space-y-4 mb-8">
                                {returnableItems.map(item => {
                                    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
                                    const daysDiff = (new Date() - deliveryDate) / (1000 * 60 * 60 * 24);
                                    const isExpired = daysDiff > 7 && order.orderStatus === 'Delivered';

                                    return (
                                        <div key={item._id} className="space-y-3">
                                            <label className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all touch-manipulation ${isExpired ? 'opacity-50 cursor-not-allowed bg-zinc-50 border-zinc-100' : selectedItems.includes(item._id) ? 'border-black bg-zinc-50 active:scale-[0.99] cursor-pointer' : 'border-zinc-100 active:scale-[0.99] cursor-pointer'}`}>
                                                <div className="pt-1">
                                                    <input
                                                        type="checkbox"
                                                        disabled={isExpired}
                                                        className="w-4 h-4 md:w-5 md:h-5 accent-black rounded"
                                                        checked={selectedItems.includes(item._id)}
                                                        onChange={() => !isExpired && toggleItemSelection(item._id)}
                                                    />
                                                </div>
                                                <img src={item.image} alt="" className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg md:rounded-xl bg-zinc-200" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-bold text-[10px] md:text-xs uppercase truncate">{item.name}</p>
                                                        {isExpired && <span className="text-[7px] md:text-[8px] font-black bg-red-100 text-red-600 px-1.5 py-0.5 rounded uppercase ml-2">Period Expired</span>}
                                                    </div>
                                                    <p className="text-[8px] md:text-[10px] text-zinc-500 mt-0.5">Qty: {item.qty} | Size: {item.selectedVariant?.size || 'N/A'}</p>
                                                    <p className="text-xs md:text-[11px] font-black mt-1">₹{item.price}</p>
                                                </div>
                                            </label>
                                            打
                                            {/* Variant Picker for Exchange */}
                                            {returnType === 'Exchange' && selectedItems.includes(item._id) && (
                                                <div className="ml-10 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 animate-in fade-in slide-in-from-top-2">
                                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Choose Replacement Size</label>
                                                    {variantsLoading[item._id] ? (
                                                        <div className="flex items-center gap-2 py-2">
                                                            <Loader2 size={12} className="animate-spin" />
                                                            <span className="text-[10px] font-bold uppercase text-zinc-400">Loading Sizes...</span>
                                                        </div>
                                                    ) : !variants[item._id] || variants[item._id].length === 0 ? (
                                                        <p className="text-[10px] font-bold text-red-500 uppercase">Other sizes out of stock</p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {variants[item._id].map((v, vIdx) => (
                                                                <button
                                                                    key={vIdx}
                                                                    type="button"
                                                                    onClick={() => setSelectedExchangeVariants(prev => ({ ...prev, [item._id]: v }))}
                                                                    className={`px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${selectedExchangeVariants[item._id] === v ? 'bg-black text-white border-black' : 'bg-white border-zinc-200 text-zinc-600 hover:border-black'}`}
                                                                >
                                                                    {v.size} {v.color && `/ ${v.color}`}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {selectedItems.length > 0 && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Action</label>
                                        <div className="flex gap-4">
                                            {['Return', 'Exchange'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setReturnType(type)}
                                                    className={`flex-1 py-3 md:py-3 rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest border transition-all touch-manipulation ${returnType === type ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-zinc-200'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Reason</label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 md:p-4 text-xs font-bold outline-none focus:border-black appearance-none"
                                            >
                                                <option value="">Select Reason</option>
                                                <option value="Size Issue">Size Issue (Too Big/Small)</option>
                                                <option value="Damaged Product">Damaged / Defective Product</option>
                                                <option value="Wrong Item Received">Wrong Item Received</option>
                                                <option value="Quality Issue">Quality Not As Expected</option>
                                                <option value="Changed Mind">Changed Mind</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ArrowRight size={12} className="rotate-90 text-zinc-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Unboxing Proof (Images/Video)</label>
                                        <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-5 md:p-6 text-center transition-colors hover:border-black group relative">
                                            打                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*,video/*"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <div className="flex flex-col items-center gap-2">
                                                <div className={`p-2.5 md:p-3 rounded-full ${uploading ? 'bg-zinc-100 animate-pulse' : 'bg-white shadow-sm'}`}>
                                                    <RotateCcw size={18} className={uploading ? 'animate-spin' : 'text-zinc-400'} />
                                                </div>
                                                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black">
                                                    {uploading ? 'Processing File...' : 'Click or Drag to Upload'}
                                                </p>
                                                <p className="text-[6px] md:text-[7px] font-bold text-zinc-300 uppercase tracking-tighter">MAX 5MB · MP4, JPG, PNG</p>
                                            </div>
                                        </div>

                                        {images.length > 0 && (
                                            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                                                {images.map((img, idx) => (
                                                    <div key={idx} className="w-20 h-20 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0 relative group">
                                                        {img.startsWith('data:video') ? (
                                                            <video src={img} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <img src={img} className="w-full h-full object-cover" alt="Proof" />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[10px] font-black tracking-widest uppercase text-zinc-400 ml-1">Additional Comments</label>
                                        <textarea
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder="Please provide details..."
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-3.5 text-sm md:text-xs font-bold outline-none focus:border-black h-20 md:h-24 resize-none"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || uploading}
                                        className="w-full bg-black text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-zinc-900 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 block touch-manipulation disabled:opacity-50"
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
