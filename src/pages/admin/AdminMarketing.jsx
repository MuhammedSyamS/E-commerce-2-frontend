import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { Ticket, Zap, Plus, Minus, Trash2 } from 'lucide-react';

const AdminMarketing = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Coupons');

    // New Coupon State 
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage', // 'percentage' or 'fixed'
        discountAmount: '',
        minPurchase: '',
        expiryDate: '',
        isFirstOrderOnly: false,
        eligibleProducts: [],
        eligibleCategories: [],
        usageLimit: '',
        perUserLimit: ''
    });

    // Flash Sale State
    const [flashSales, setFlashSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // Derived from products
    const [searchQuery, setSearchQuery] = useState(''); // Product Search

    const [newFlashSale, setNewFlashSale] = useState({
        name: '',
        discountPercentage: '',
        startTime: '',
        endTime: '',
        products: [] // Array of IDs
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    useEffect(() => {
        if (activeTab === 'Coupons') {
            fetchCoupons();
            // Need products for the coupon product selector too
            if (products.length === 0) fetchProducts();
        }
        if (activeTab === 'Flash Sales') {
            fetchFlashSales();
            if (products.length === 0) fetchProducts();
        }
        setSearchQuery(''); // Reset search on tab switch
    }, [activeTab]);

    const fetchFlashSales = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/marketing/flash-sales', config);
            setFlashSales(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products'); // Public endpoint is fine
            setProducts(data);

            // Extract unique categories
            const uniqueCats = [...new Set(data.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCats);
        } catch (err) {
            console.error(err);
        }
    };

    const createFlashSale = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/marketing/flash-sales', newFlashSale, config);
            addToast("Flash Sale Created", "success");
            fetchFlashSales();
            setNewFlashSale({ name: '', discountPercentage: '', startTime: '', endTime: '', products: [] });
        } catch (err) {
            addToast("Failed to create sale", "error");
        }
    };

    const deleteFlashSale = async (id) => {
        if (!window.confirm("End this flash sale?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/marketing/flash-sales/${id}`, config);
            setFlashSales(flashSales.filter(s => s._id !== id));
            addToast("Flash Sale Deleted", "success");
        } catch (err) {
            addToast("Delete failed", "error");
        }
    };

    const toggleProductSelection = (productId) => {
        setNewFlashSale(prev => {
            const exists = prev.products.includes(productId);
            return {
                ...prev,
                products: exists
                    ? prev.products.filter(id => id !== productId)
                    : [...prev.products, productId]
            };
        });
    };

    const fetchCoupons = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/marketing/coupons', config);
            setCoupons(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/marketing/coupons', newCoupon, config);
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

    const deleteCoupon = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/marketing/coupons/${id}`, config);
            setCoupons(coupons.filter(c => c._id !== id));
            addToast("Coupon Deleted", "success");
        } catch (err) {
            addToast("Delete failed", "error");
        }
    };

    if (loading && activeTab === 'Coupons') return <div className="text-[10px] font-bold uppercase">Loading...</div>;

    return (
        <div>
            {/* Header matches existing... */}
            <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Growth Engine</p>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Offers & <span className="text-zinc-300">Discounts</span></h1>
            </div>

            <div className="flex gap-6 mb-8 border-b border-zinc-100 pb-1">
                <button onClick={() => setActiveTab('Coupons')} className={`flex items-center gap-2 pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Coupons' ? 'text-black border-b-2 border-black' : 'text-zinc-400'}`}>
                    <Ticket size={14} /> Coupons
                </button>
                <button onClick={() => setActiveTab('Flash Sales')} className={`flex items-center gap-2 pb-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'Flash Sales' ? 'text-black border-b-2 border-black' : 'text-zinc-400'}`}>
                    <Zap size={14} /> Flash Sales
                </button>
            </div>

            {activeTab === 'Coupons' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* EXISTING COUPON LIST & FORM (Kept as is) */}
                    <div className="lg:col-span-2 space-y-4">
                        {coupons.length === 0 ? <div className="text-center py-10 text-zinc-400">No Active Coupons</div> : (
                            coupons.map(coupon => (
                                <div key={coupon._id} className="bg-white p-6 rounded-2xl border border-zinc-100 flex items-center justify-between group hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-black text-white rounded-xl flex items-center justify-center font-black text-lg">
                                            {coupon.discountType === 'percentage' ? '%' : '₹'}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg tracking-tight uppercase">{coupon.code}</h3>
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                                                {coupon.discountType === 'percentage' ? `${coupon.discountAmount}% OFF` : `₹${coupon.discountAmount} FLAT OFF`}
                                                {' • '} Min: ₹{coupon.minPurchase}
                                                {coupon.isFirstOrderOnly && <span className="text-blue-600 ml-2">★ First Order Only</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-[9px] font-bold uppercase text-zinc-400">Expires</p>
                                            <p className="text-xs font-bold">{new Date(coupon.expiryDate).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => deleteCoupon(coupon._id)} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* COUPON FORM */}
                    <div className="bg-zinc-50 p-8 rounded-3xl h-fit">
                        <h3 className="font-black text-lg uppercase italic mb-6">Create Coupon</h3>
                        <form onSubmit={createCoupon} className="space-y-4">
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
                </div >
            )}

            {
                activeTab === 'Flash Sales' && (
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
                                            <div className="h-12 w-12 bg-black text-white rounded-xl flex items-center justify-center font-black text-lg">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-lg tracking-tight uppercase">{sale.name}</h3>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">
                                                    {new Date(sale.startTime).toLocaleString()} - {new Date(sale.endTime).toLocaleString()}
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    <span className="text-[9px] bg-black text-white px-2 py-0.5 rounded border border-black">
                                                        STORE-WIDE SALE
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 z-10">
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
        </div >
    );
};

export default AdminMarketing;
