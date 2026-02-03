import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { Ticket, Zap, Plus, Trash2 } from 'lucide-react';

const AdminMarketing = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Coupons');

    // New Coupon State
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'percentage',
        discountAmount: '',
        minPurchase: '',
        expiryDate: ''
    });

    useEffect(() => {
        if (activeTab === 'Coupons') fetchCoupons();
    }, [activeTab]);

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
            setNewCoupon({ code: '', discountType: 'percentage', discountAmount: '', minPurchase: '', expiryDate: '' });
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
                    {/* LIST */}
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

                    {/* CREATE FORM */}
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
                            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-transform">
                                Create Coupon
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'Flash Sales' && (
                <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-100 border-dashed">
                    <Zap size={48} className="mx-auto text-zinc-300 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-widest">Coming Soon</h3>
                    <p className="text-xs text-zinc-400 mt-2">Flash Sale Management Interface</p>
                </div>
            )}
        </div>
    );
};

export default AdminMarketing;
