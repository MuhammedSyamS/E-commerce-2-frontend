import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { Ticket, Zap, Plus, Minus, Trash2, Mail, Send, Users, Clock, ShoppingCart } from 'lucide-react';

const AdminMarketing = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('Coupons');
    const [coupons, setCoupons] = useState([]);
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minPurchase: '',
        expiryDate: '',
        isFirstOrderOnly: false,
        eligibleProducts: [],
        eligibleCategories: [],
        usageLimit: '',
        perUserLimit: ''
    });

    const [newFlashSale, setNewFlashSale] = useState({
        name: '',
        discountPercentage: '',
        startTime: '',
        endTime: '',
        products: []
    });

    const categories = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports'];

    const [broadcasts, setBroadcasts] = useState([]);
    const [sending, setSending] = useState(false);
    const [previewContent, setPreviewContent] = useState(null);
    const [referralStats, setReferralStats] = useState(null);
    const [newBroadcast, setNewBroadcast] = useState({
        subject: '',
        content: '',
        targetAudience: 'Subscribers'
    });
    const [abandonedCarts, setAbandonedCarts] = useState([]);

    useEffect(() => {
        if (activeTab === 'Coupons') {
            fetchCoupons();
            if (products.length === 0) fetchProducts();
        }
        if (activeTab === 'Flash Sales') {
            fetchFlashSales();
            if (products.length === 0) fetchProducts();
        }
        if (activeTab === 'Campaigns') {
            fetchBroadcasts();
        }
        if (activeTab === 'Referrals') {
            fetchReferralStats();
        }
        if (activeTab === 'Retargeting') {
            fetchAbandonedCarts();
        }
        setSearchQuery('');
    }, [activeTab]);

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/marketing/coupons');
            setCoupons(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFlashSales = async () => {
        try {
            const { data } = await api.get('/marketing/flash-sales');
            setFlashSales(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data.products || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBroadcasts = async () => {
        try {
            const { data } = await api.get('/marketing/broadcasts');
            setBroadcasts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReferralStats = async () => {
        try {
            const { data } = await api.get('/orders/admin/stats');
            setReferralStats({
                topReferrers: data.topReferrers,
                referralRevenue: data.referralRevenue
            });
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAbandonedCarts = async () => {
        try {
            const { data } = await api.get('/users/admin/abandoned-carts');
            setAbandonedCarts(data);
        } catch (err) {
            addToast("Failed to fetch abandoned carts", "error");
        }
    };

    const sendNudge = async (userId) => {
        try {
            await api.post(`/users/admin/nudge/${userId}`);
            addToast("Recovery nudge sent!", "success");
            fetchAbandonedCarts();
        } catch (err) {
            addToast("Failed to send nudge", "error");
        }
    };

    const sendBroadcast = async (e, status = 'Sent') => {
        if (e) e.preventDefault();
        if (status === 'Sent' && !window.confirm(`Send this campaign to all ${newBroadcast.targetAudience}? This cannot be undone.`)) return;

        setSending(true);
        try {
            const { data } = await api.post('/marketing/broadcasts', {
                ...newBroadcast,
                status
            });

            addToast(status === 'Sent' ? `Campaign Sent to ${data.sentCount} recipients` : "Campaign Saved as Draft", "success");
            fetchBroadcasts();
            if (status === 'Sent') setNewBroadcast({ subject: '', content: '', targetAudience: 'Subscribers' });
        } catch (err) {
            console.error("Broadcast Error:", err);
            const message = err.response?.data?.message || "Failed to process campaign";
            addToast(message, "error");
        } finally {
            setSending(false);
        }
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try {
            await api.post('/marketing/coupons', newCoupon);
            addToast("Coupon Created Successfully", "success");
            fetchCoupons();
            setNewCoupon({
                code: '',
                discountType: 'percentage',
                discountAmount: '',
                minPurchase: '',
                expiryDate: '',
                isFirstOrderOnly: false,
                eligibleProducts: [],
                eligibleCategories: [],
                usageLimit: '',
                perUserLimit: ''
            });
        } catch (err) {
            addToast("Failed to create coupon", "error");
        }
    };

    const toggleCouponStatus = async (id) => {
        try {
            await api.put(`/marketing/coupons/${id}/toggle`);
            addToast("Coupon status updated", "success");
            fetchCoupons();
        } catch (err) {
            addToast("Failed to toggle status", "error");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        addToast("Code copied to clipboard", "success");
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            await api.delete(`/marketing/coupons/${id}`);
            addToast("Coupon Deleted", "success");
            fetchCoupons();
        } catch (err) {
            addToast("Failed to delete coupon", "error");
        }
    };

    const createFlashSale = async (e) => {
        e.preventDefault();
        try {
            await api.post('/marketing/flash-sales', newFlashSale);
            addToast("Flash Sale Launched", "success");
            fetchFlashSales();
            setNewFlashSale({
                name: '',
                discountPercentage: '',
                startTime: '',
                endTime: '',
                products: []
            });
        } catch (err) {
            addToast("Failed to launch flash sale", "error");
        }
    };

    const toggleFlashSaleStatus = async (id) => {
        try {
            await api.put(`/marketing/flash-sales/${id}/toggle`);
            addToast("Flash sale status updated", "success");
            fetchFlashSales();
        } catch (err) {
            addToast("Failed to toggle status", "error");
        }
    };

    const deleteFlashSale = async (id) => {
        if (!window.confirm("Delete this flash sale?")) return;
        try {
            await api.delete(`/marketing/flash-sales/${id}`);
            addToast("Flash Sale Deleted", "success");
            fetchFlashSales();
        } catch (err) {
            addToast("Failed to delete sale", "error");
        }
    };

    const toggleProductSelection = (productId) => {
        setNewFlashSale(prev => ({
            ...prev,
            products: prev.products.includes(productId)
                ? prev.products.filter(id => id !== productId)
                : [...prev.products, productId]
        }));
    };

    return (
        <div>
            {/* ... Header */}
            <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Growth Engine</p>
                <h1 className="text-2xl font-black uppercase italic tracking-tighter">Offers & <span className="text-zinc-300">Outreach</span></h1>
            </div>

            <div className="flex gap-6 mb-8 border-b border-zinc-100 pb-1">
                <button onClick={() => setActiveTab('Coupons')} className={`flex items-center gap-2 pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Coupons' ? 'text-black border-b-2 border-black' : 'text-zinc-400'}`}>
                    <Ticket size={14} /> Coupons
                </button>
                <button onClick={() => setActiveTab('Flash Sales')} className={`flex items-center gap-2 pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Flash Sales' ? 'text-black border-b-2 border-black' : 'text-zinc-400'}`}>
                    <Zap size={14} /> Flash Sales
                </button>
                <button onClick={() => setActiveTab('Campaigns')} className={`flex items-center gap-2 pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Campaigns' ? 'text-black border-b-2 border-black' : 'text-zinc-400'}`}>
                    <Mail size={14} /> Campaigns
                </button>
                <button onClick={() => setActiveTab('Referrals')} className={`flex items-center gap-2 pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Referrals' ? 'text-black border-b-2 border-black' : 'text-zinc-400'}`}>
                    <Users size={14} /> Referrals
                </button>
                <button onClick={() => setActiveTab('Retargeting')} className={`flex items-center gap-2 pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Retargeting' ? 'text-black border-b-2 border-black' : 'text-zinc-400'}`}>
                    <Clock size={14} /> Retargeting
                </button>
            </div>

            {/* ... Coupons Tab Content */}
            {activeTab === 'Coupons' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ... existing coupon list */}
                    <div className="lg:col-span-2 space-y-4">
                        {coupons.length === 0 ? <div className="text-center py-10 text-zinc-400">No Active Coupons</div> : (
                            coupons.map(coupon => (
                                <div key={coupon._id} className="bg-white p-6 rounded-2xl border border-zinc-100 flex items-center justify-between group hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${coupon.isActive ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                            {coupon.discountType === 'percentage' ? '%' : '₹'}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className={`font-black text-lg tracking-tight uppercase ${!coupon.isActive && 'text-zinc-400 line-through'}`}>{coupon.code}</h3>
                                                <button onClick={() => copyToClipboard(coupon.code)} className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-black transition-colors">
                                                    <Plus size={12} className="rotate-45" /> {/* Shorthand for copy/icon */}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} FLAT OFF`}
                                                {' • '} Min: ₹{coupon.minPurchase}
                                                {coupon.isFirstOrderOnly && <span className="text-blue-600 ml-2">★ First Order Only</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase text-zinc-400">Used</p>
                                            <p className="text-xs font-black">{coupon.usedCount || 0}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase text-zinc-400">Expires</p>
                                            <p className="text-xs font-bold">{new Date(coupon.expiryDate).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleCouponStatus(coupon._id)}
                                                className={`w-10 h-5 rounded-full relative transition-colors ${coupon.isActive ? 'bg-green-500' : 'bg-zinc-200'}`}
                                            >
                                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${coupon.isActive ? 'right-1' : 'left-1'}`}></div>
                                            </button>
                                            <button onClick={() => deleteCoupon(coupon._id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {/* ... existing coupon form */}
                    <div className="bg-zinc-50 p-8 rounded-3xl h-fit">
                        <h3 className="font-black text-lg uppercase italic mb-6">Create Coupon</h3>
                        <form onSubmit={createCoupon} className="space-y-4">
                            {/* ... inputs */}
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400">Code</label>
                                <input required type="text" placeholder="e.g. SUMMER20" className="w-full bg-white p-3 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 ring-black/10"
                                    value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">Type</label>
                                    <select className="w-full bg-white p-3 rounded-xl text-xs font-bold uppercase outline-none"
                                        value={newCoupon.discountType} onChange={e => setNewCoupon({ ...newCoupon, discountType: e.target.value })}>
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed Amount (₹)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">Value</label>
                                    <input required type="number" placeholder="20" className="w-full bg-white p-3 rounded-xl text-sm font-bold outline-none"
                                        value={newCoupon.discountAmount} onChange={e => setNewCoupon({ ...newCoupon, discountAmount: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">Min Purchase</label>
                                    <input required type="number" placeholder="1000" className="w-full bg-white p-3 rounded-xl text-sm font-bold outline-none"
                                        value={newCoupon.minPurchase} onChange={e => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">Expiry</label>
                                    <input required type="date" className="w-full bg-white p-3 rounded-xl text-xs font-bold outline-none"
                                        value={newCoupon.expiryDate} onChange={e => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">Total Usage Limit (Optional)</label>
                                    <input type="number" placeholder="e.g. 100" className="w-full bg-white p-3 rounded-xl text-sm font-bold outline-none"
                                        value={newCoupon.usageLimit} onChange={e => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">Per User Limit (Optional)</label>
                                    <input type="number" placeholder="e.g. 1" className="w-full bg-white p-3 rounded-xl text-sm font-bold outline-none"
                                        value={newCoupon.perUserLimit} onChange={e => setNewCoupon({ ...newCoupon, perUserLimit: e.target.value })} />
                                </div>
                            </div>
                            {/* ADVANCED TOGGLE */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400 hover:text-black transition-colors"
                                >
                                    {showAdvanced ? <Minus size={12} /> : <Plus size={12} />}
                                    {showAdvanced ? 'Simple Mode' : 'Advanced Targeting'}
                                </button>
                            </div>
                            {showAdvanced && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 border-l-2 border-zinc-200 pl-4">
                                    {/* CATEGORY SELECTOR */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-400">Eligible Categories</label>
                                        <div className="flex flex-wrap gap-2">
                                            {categories.map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => setNewCoupon(prev => ({
                                                        ...prev,
                                                        eligibleCategories: prev.eligibleCategories.includes(cat)
                                                            ? prev.eligibleCategories.filter(c => c !== cat)
                                                            : [...prev.eligibleCategories, cat]
                                                    }))}
                                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${newCoupon.eligibleCategories.includes(cat) ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* PRODUCT SELECTOR */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-zinc-400 block">Eligible Products</label>
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            className="w-full bg-white p-2 mb-2 rounded-lg text-xs font-bold border border-zinc-100 placeholder:text-zinc-300 outline-none focus:border-zinc-400 transition-colors"
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                        />
                                        <div className="max-h-40 overflow-y-auto bg-white p-2 rounded-xl border border-zinc-200 space-y-1">
                                            {products
                                                .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                                .map(p => (
                                                    <div key={p._id} onClick={() => setNewCoupon(prev => ({
                                                        ...prev,
                                                        eligibleProducts: prev.eligibleProducts.includes(p._id)
                                                            ? prev.eligibleProducts.filter(id => id !== p._id)
                                                            : [...prev.eligibleProducts, p._id]
                                                    }))}
                                                        className={`p-2 rounded-lg cursor-pointer text-xs flex items-center gap-2 ${newCoupon.eligibleProducts.includes(p._id) ? 'bg-black text-white' : 'hover:bg-zinc-50'}`}>
                                                        <div className={`w-3 h-3 rounded-full border ${newCoupon.eligibleProducts.includes(p._id) ? 'bg-white border-transparent' : 'border-zinc-300'}`}></div>
                                                        <span className="truncate flex-1">{p.name}</span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isFirstOrderOnly"
                                    checked={newCoupon.isFirstOrderOnly}
                                    onChange={e => setNewCoupon({ ...newCoupon, isFirstOrderOnly: e.target.checked })}
                                    className="w-4 h-4 text-black bg-gray-100 border-gray-300 rounded focus:ring-black"
                                />
                                <label htmlFor="isFirstOrderOnly" className="text-[10px] font-black uppercase text-zinc-500 cursor-pointer select-none">
                                    Valid for First Order Only
                                </label>
                            </div>

                            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform">
                                Create Coupon
                            </button>
                        </form>
                    </div >
                </div>
            )}

            {/* ... Flash Sales Tab Content (Keep unchanged) */}
            {activeTab === 'Flash Sales' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LIST */}
                    <div className="lg:col-span-2 space-y-4">
                        {flashSales.length === 0 ? <div className="text-center py-10 text-zinc-400">No Active Flash Sales</div> : (
                            flashSales.map(sale => (
                                <div key={sale._id} className="bg-white p-6 rounded-2xl border border-zinc-100 flex items-center justify-between group hover:shadow-lg transition-all relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 bg-red-500 text-white text-[9px] font-black uppercase rounded-bl-xl z-20">
                                        {sale.discountPercentage}% OFF
                                    </div>
                                    <div className="flex items-center gap-4 z-10">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg transition-colors ${sale.isActive ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-400'}`}>
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <h3 className={`font-black text-lg tracking-tight uppercase ${!sale.isActive && 'text-zinc-400 line-through'}`}>{sale.name}</h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                                                {new Date(sale.startTime).toLocaleString()} - {new Date(sale.endTime).toLocaleString()}
                                            </p>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                <span className={`text-[9px] px-2 py-0.5 rounded border ${sale.isActive ? 'bg-black text-white border-black' : 'bg-zinc-100 text-zinc-400 border-zinc-200'}`}>
                                                    STORE-WIDE SALE
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 z-10">
                                        <button
                                            onClick={() => toggleFlashSaleStatus(sale._id)}
                                            className={`w-10 h-5 rounded-full relative transition-colors ${sale.isActive ? 'bg-green-500' : 'bg-zinc-200'}`}
                                        >
                                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${sale.isActive ? 'right-1' : 'left-1'}`}></div>
                                        </button>
                                        <button onClick={() => deleteFlashSale(sale._id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* CREATE FORM */}
                    <div className="bg-zinc-50 p-8 rounded-3xl h-fit">
                        <h3 className="font-black text-lg uppercase italic mb-6">Launch Flash Sale</h3>
                        <form onSubmit={createFlashSale} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400">Sale Name</label>
                                <input required type="text" placeholder="e.g. 48H FLASH SALE" className="w-full bg-white p-3 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 ring-black/10"
                                    value={newFlashSale.name} onChange={e => setNewFlashSale({ ...newFlashSale, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400">Discount (%)</label>
                                <input required type="number" placeholder="50" className="w-full bg-white p-3 rounded-xl text-sm font-bold outline-none"
                                    value={newFlashSale.discountPercentage} onChange={e => setNewFlashSale({ ...newFlashSale, discountPercentage: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">Start</label>
                                    <input required type="datetime-local" className="w-full bg-white p-3 rounded-xl text-xs font-bold outline-none"
                                        value={newFlashSale.startTime} onChange={e => setNewFlashSale({ ...newFlashSale, startTime: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase text-zinc-400">End</label>
                                    <input required type="datetime-local" className="w-full bg-white p-3 rounded-xl text-xs font-bold outline-none"
                                        value={newFlashSale.endTime} onChange={e => setNewFlashSale({ ...newFlashSale, endTime: e.target.value })} />
                                </div>
                            </div>
                            {/* ADVANCED TOGGLE */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAdvanced(!showAdvanced)}
                                    className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-zinc-400 hover:text-black transition-colors"
                                >
                                    {showAdvanced ? <Minus size={12} /> : <Plus size={12} />}
                                    {showAdvanced ? 'Simple Mode' : 'Advanced Targeting'}
                                </button>
                            </div>
                            {showAdvanced ? (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 border-l-2 border-zinc-200 pl-4">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 mb-2 block">Select Products ({newFlashSale.products.length})</label>
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full bg-white p-2 mb-2 rounded-lg text-xs font-bold border border-zinc-100 placeholder:text-zinc-300 outline-none focus:border-zinc-400 transition-colors"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                    <div className="max-h-40 overflow-y-auto bg-white p-2 rounded-xl border border-zinc-200 space-y-1">
                                        {products
                                            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                            .map(p => (
                                                <div key={p._id} onClick={() => toggleProductSelection(p._id)}
                                                    className={`p-2 rounded-lg cursor-pointer text-xs flex items-center gap-2 ${newFlashSale.products.includes(p._id) ? 'bg-black text-white' : 'hover:bg-zinc-50'}`}>
                                                    <div className={`w-3 h-3 rounded-full border ${newFlashSale.products.includes(p._id) ? 'bg-white border-transparent' : 'border-zinc-300'}`}></div>
                                                    <span className="truncate flex-1">{p.name}</span>
                                                    <span className="font-bold">₹{p.price}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 mb-2 block">Scope</label>
                                    <div className="w-full bg-zinc-100 p-3 rounded-xl text-xs font-bold text-zinc-500 border border-zinc-200">
                                        Global / Store-wide Sale (All Products)
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform">
                                Start Sale
                            </button>
                        </form>
                    </div>
                </div>
            )
            }

            {/* --- NEW CAMPAIGN TAB CONTENT --- */}
            {activeTab === 'Campaigns' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* CAMPAIGN LIST */}
                    <div className="lg:col-span-2 space-y-4">
                        {broadcasts.length === 0 ? <div className="text-center py-10 text-zinc-400">No Campaigns Yet</div> : (
                            broadcasts.map(broadcast => (
                                <div key={broadcast._id} className="bg-white p-6 rounded-2xl border border-zinc-100 hover:shadow-lg transition-all">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-black text-lg tracking-tight uppercase">{broadcast.subject}</h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide flex items-center gap-2">
                                                <Users size={12} /> {broadcast.targetAudience} {' • '}
                                                {new Date(broadcast.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${broadcast.status === 'Sent' ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                            {broadcast.status}
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 p-4 rounded-xl text-xs text-zinc-600 mb-4 line-clamp-3">
                                        <div dangerouslySetInnerHTML={{ __html: broadcast.content.substring(0, 150) + '...' }} />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                                        <span>Sent To: {broadcast.sentCount} Users</span>
                                        {broadcast.sentAt && <span>Delivered: {new Date(broadcast.sentAt).toLocaleTimeString()}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* COMPOSE FORM */}
                    <div className="bg-zinc-50 p-8 rounded-3xl h-fit">
                        <h3 className="font-black text-lg uppercase italic mb-6">New Campaign</h3>
                        <form onSubmit={sendBroadcast} className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400">Subject</label>
                                <input required type="text" placeholder="e.g. Winter Sale Is Here!" className="w-full bg-white p-3 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-black/10"
                                    value={newBroadcast.subject} onChange={e => setNewBroadcast({ ...newBroadcast, subject: e.target.value })} />
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400">Target Audience</label>
                                <select className="w-full bg-white p-3 rounded-xl text-xs font-bold uppercase outline-none"
                                    value={newBroadcast.targetAudience} onChange={e => setNewBroadcast({ ...newBroadcast, targetAudience: e.target.value })}>
                                    <option value="Subscribers">Subscribers (Newsletter)</option>
                                    <option value="Customers">Customers (Active Users)</option>
                                    <option value="All">Everyone</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[9px] font-black uppercase text-zinc-400">Email Content (HTML Supported)</label>
                                <textarea required rows={8} placeholder="<h1>Hello!</h1><p>Check out our new drop...</p>"
                                    className="w-full bg-white p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-black/10 resize-none font-mono"
                                    value={newBroadcast.content} onChange={e => setNewBroadcast({ ...newBroadcast, content: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className={`w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${sending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                                >
                                    {sending ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={14} /> Send Broadcast
                                        </>
                                    )}
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={(e) => sendBroadcast(e, 'Draft')}
                                        disabled={sending}
                                        className="bg-white border border-zinc-200 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-zinc-50 transition-colors"
                                    >
                                        Save Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewContent(newBroadcast.content)}
                                        className="bg-zinc-100 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-zinc-200 transition-colors"
                                    >
                                        Live Preview
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LIVE PREVIEW MODAL */}
            {previewContent !== null && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 lg:p-10">
                    <div className="bg-white w-full max-w-4xl h-full rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                            <h2 className="font-black uppercase tracking-tight text-xl italic text-black">Campaign <span className="text-zinc-400">Preview</span></h2>
                            <button
                                onClick={() => setPreviewContent(null)}
                                className="h-10 w-10 bg-zinc-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all"
                            >
                                <Minus size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-10 bg-[#f9f9f9]">
                            <div className="bg-white shadow-xl mx-auto max-w-2xl min-h-[500px] border border-zinc-200 overflow-hidden rounded-lg">
                                <div className="p-4 bg-zinc-50 border-b border-zinc-100">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Subject: {newBroadcast.subject || "(No Subject)"}</p>
                                </div>
                                <div
                                    className="p-8 prose prose-zinc max-w-none"
                                    dangerouslySetInnerHTML={{ __html: previewContent || "No content to preview" }}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-zinc-100 text-center">
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">End of Preview</p>
                        </div>
                    </div>
                </div>
            )}
            {/* --- REFERRAL PROGRAM TAB --- */}
            {activeTab === 'Referrals' && (
                <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* REVENUE OVERVIEW */}
                        <div className="bg-black text-white p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-center min-h-[250px]">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Growth Performance</p>
                                <h2 className="text-5xl font-black italic tracking-tighter mb-4">₹{referralStats?.referralRevenue?.toLocaleString() || 0}</h2>
                                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">Total Revenue from Referrals</p>
                            </div>
                            <div className="absolute right-0 top-0 opacity-10 -rotate-12 translate-x-10 -translate-y-10">
                                <Users size={250} />
                            </div>
                        </div>

                        {/* LEADERBOARD */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm">
                            <h3 className="font-black text-lg uppercase italic mb-8 flex items-center gap-3">
                                <Users size={20} className="text-purple-600" /> Top Referrers
                            </h3>
                            <div className="space-y-4">
                                {!referralStats?.topReferrers?.length ? (
                                    <div className="text-center py-10 text-zinc-400 text-xs font-bold uppercase tracking-widest">No Referral Activity Yet</div>
                                ) : (
                                    referralStats.topReferrers.map((ref, idx) => (
                                        <div key={ref._id} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black uppercase">{ref.name}</p>
                                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight">{ref.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-black text-green-600">₹{ref.referralEarnings.toLocaleString()}</p>
                                                <p className="text-[9px] text-zinc-400 font-bold uppercase">{ref.conversions} Conversions</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ACTIVE RULES */}
                    <div className="bg-zinc-50 p-10 rounded-[3rem] border border-zinc-100 text-center">
                        <h3 className="font-black uppercase italic mb-10 tracking-tight">Active Referral Rules</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { title: "Inviter Reward", value: "₹500", desc: "Added to wallet after friend's first order is delivered." },
                                { title: "Friend Discount", value: "10% OFF", desc: "Applied automatically via referral link signup." },
                                { title: "Eligibility", value: "Delivered", desc: "Credit is only issued once the order cycle is completed." }
                            ].map((rule, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest mb-1">{rule.title}</p>
                                    <h4 className="text-2xl font-black italic mb-2">{rule.value}</h4>
                                    <p className="text-[11px] text-zinc-500 font-medium px-4">{rule.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* --- RETARGETING TAB --- */}
            {activeTab === 'Retargeting' && (
                <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-1">Abandoned Sessions</p>
                            <h4 className="text-3xl font-black italic">{abandonedCarts.length}</h4>
                        </div>
                        <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-3xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Avg. Cart Value</p>
                            <h4 className="text-3xl font-black italic">
                                ₹{abandonedCarts.length > 0
                                    ? Math.round(abandonedCarts.reduce((acc, cartUser) => acc + cartUser.cart.reduce((cAcc, item) => cAcc + (item.price * item.quantity), 0), 0) / abandonedCarts.length).toLocaleString()
                                    : 0}
                            </h4>
                        </div>
                    </div>

                    <div className="bg-white border border-zinc-100 rounded-[2.5rem] overflow-hidden">
                        <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
                            <h3 className="font-black text-lg uppercase italic flex items-center gap-3">
                                <ShoppingCart size={20} className="text-amber-500" /> Abandoned Bag Recovery
                            </h3>
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Showing sessions older than 2 hours</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-zinc-50 text-[9px] font-black uppercase tracking-widest text-zinc-400 border-b border-zinc-100">
                                        <th className="px-8 py-4">Customer</th>
                                        <th className="px-8 py-4">Items</th>
                                        <th className="px-8 py-4">Cart Total</th>
                                        <th className="px-8 py-4">Last Active</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {abandonedCarts.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-10 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest">No abandoned carts found</td>
                                        </tr>
                                    ) : (
                                        abandonedCarts.map(cartUser => {
                                            const total = cartUser.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                                            const lastUpdated = new Date(cartUser.updatedAt);
                                            const nudgeSent = cartUser.abandonedCartEmailSentAt;

                                            return (
                                                <tr key={cartUser._id} className="hover:bg-zinc-50/50 transition-colors">
                                                    <td className="px-8 py-6">
                                                        <p className="text-xs font-black uppercase">{cartUser.firstName} {cartUser.lastName}</p>
                                                        <p className="text-[9px] text-zinc-400 font-bold tracking-tight">{cartUser.email}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex -space-x-3 overflow-hidden">
                                                            {cartUser.cart.map((item, i) => (
                                                                <img key={i} src={item.image} alt={item.name} className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" />
                                                            ))}
                                                            {cartUser.cart.length > 3 && (
                                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-zinc-100 text-[8px] font-black ring-2 ring-white">
                                                                    +{cartUser.cart.length - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-[8px] font-black uppercase text-zinc-400 mt-2">{cartUser.cart.length} ITEMS</p>
                                                    </td>
                                                    <td className="px-8 py-6 font-black text-sm italic">₹{total.toLocaleString()}</td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-[10px] font-bold text-zinc-500 uppercase">{lastUpdated.toLocaleDateString()}</p>
                                                        <p className="text-[9px] text-zinc-400 font-mono italic">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button
                                                            onClick={() => sendNudge(cartUser._id)}
                                                            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${nudgeSent ? 'bg-zinc-100 text-zinc-400' : 'bg-amber-100 text-amber-600 hover:bg-amber-600 hover:text-white hover:scale-105 active:scale-95 shadow-sm'}`}
                                                        >
                                                            {nudgeSent ? `NUDGED ${new Date(nudgeSent).toLocaleDateString()}` : 'SEND RECOVERY NUDGE'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMarketing;
