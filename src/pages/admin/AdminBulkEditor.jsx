import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { Save, Search, AlertCircle, Package, ArrowLeft, Loader2, Edit3, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminBulkEditor = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [edits, setEdits] = useState({}); // { productId: { field: value } }

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/products');
                setProducts(data);
            } catch (err) {
                addToast("Failed to fetch products", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleEdit = (productId, field, value) => {
        setEdits(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value
            }
        }));
    };

    const saveAll = async () => {
        const updatedCount = Object.keys(edits).length;
        if (updatedCount === 0) return;

        setSaving(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put('/api/products/bulk-update', { edits }, config);
            addToast(`Successfully updated ${updatedCount} products`, "success");
            setEdits({});
            // Re-fetch to sync
            const { data } = await axios.get('/api/products');
            setProducts(data);
        } catch (err) {
            addToast(err.response?.data?.message || "Bulk update failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
            <Loader2 className="animate-spin text-zinc-300" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Loading Inventory...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-zinc-400 hover:text-black transition mb-4 text-[10px] font-black uppercase tracking-widest">
                        <ArrowLeft size={14} /> Back to Products
                    </button>
                    <h1 className="text-4xl font-black uppercase italic tracking-tighter">Bulk <span className="text-zinc-300">Inventory</span></h1>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                        <Edit3 size={14} className="text-purple-500" /> Fast Price & Stock Updates
                    </p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="SEARCH PRODUCTS..."
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold focus:ring-2 ring-black outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={saveAll}
                        disabled={saving || Object.keys(edits).length === 0}
                        className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
              ${Object.keys(edits).length > 0
                                ? 'bg-black text-white hover:scale-105 shadow-xl shadow-black/20'
                                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}
            `}
                    >
                        {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                        Save All Changes ({Object.keys(edits).length})
                    </button>
                </div>
            </div>

            {/* TOOLS & LEGEND */}
            <div className="flex items-center gap-6 bg-amber-50 border border-amber-100 p-4 rounded-2xl text-amber-800">
                <AlertCircle size={20} />
                <p className="text-[10px] font-bold uppercase tracking-widest">
                    Changes are staged locally. Click <span className="font-black">SAVE ALL CHANGES</span> to commit to the database.
                </p>
            </div>

            {/* PRODUCT LIST / TABLE */}
            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Product</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-40">Price (₹)</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-40">Stock</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-40">Category</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 w-32">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredProducts.map(product => (
                                <tr key={product._id} className="hover:bg-zinc-50/30 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={product.image} alt="" className="w-12 h-12 object-cover rounded-lg bg-zinc-100" />
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-tight">{product.name}</p>
                                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{product._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <input
                                            type="number"
                                            className={`
                        w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 ring-black
                        ${edits[product._id]?.price !== undefined ? 'bg-purple-50 border-purple-200 text-purple-600' : ''}
                      `}
                                            defaultValue={product.price}
                                            onChange={(e) => handleEdit(product._id, 'price', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-8 py-6">
                                        <input
                                            type="number"
                                            className={`
                        w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:ring-1 ring-black
                        ${edits[product._id]?.countInStock !== undefined ? 'bg-purple-50 border-purple-200 text-purple-600' : ''}
                      `}
                                            defaultValue={product.countInStock}
                                            onChange={(e) => handleEdit(product._id, 'countInStock', Number(e.target.value))}
                                        />
                                    </td>
                                    <td className="px-8 py-6">
                                        <select
                                            className={`
                        w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-[10px] font-bold uppercase outline-none focus:ring-1 ring-black appearance-none
                        ${edits[product._id]?.category !== undefined ? 'bg-purple-50 border-purple-200 text-purple-600' : ''}
                      `}
                                            defaultValue={product.category}
                                            onChange={(e) => handleEdit(product._id, 'category', e.target.value)}
                                        >
                                            <option value="Home Decor">Home Decor</option>
                                            <option value="Furniture">Furniture</option>
                                            <option value="Lighting">Lighting</option>
                                            <option value="Kitchenware">Kitchenware</option>
                                            <option value="Textiles">Textiles</option>
                                        </select>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => handleEdit(product._id, 'isActive', !(edits[product._id]?.isActive ?? product.isActive))}
                                            className={`
                        px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all
                        ${(edits[product._id]?.isActive ?? product.isActive)
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : 'bg-zinc-50 text-zinc-400 border-zinc-200'}
                      `}
                                        >
                                            {(edits[product._id]?.isActive ?? product.isActive) ? 'Active' : 'Disabled'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBulkEditor;
