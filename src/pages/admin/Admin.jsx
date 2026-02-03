import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, IndianRupee, ShoppingBag, Plus, Trash2, Edit, ExternalLink, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../store/useStore'; // Explicit import needed for token

const Admin = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // New State

  // FETCH LIVE PRODUCTS FROM BACKEND
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Admin Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const config = { headers: { Authorization: `Bearer ${useStore.getState().user.token}` } }; // Ensure auth
        await axios.delete(`http://localhost:5000/api/products/${id}`, config);
        setProducts(products.filter(p => p._id !== id));
        addToast("Product removed from Studio", "success");
      } catch (err) {
        addToast("Failed to delete product", "error");
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50 font-black uppercase tracking-widest text-[10px]">
      Loading Studio Management...
    </div>
  );

  return (
    <div>
      <div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter transform -skew-x-6">
              Studio <span className="text-zinc-400">Inventory</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Miso Studio Administrative Portal</p>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <input
                placeholder="Search Products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-zinc-200 pl-10 pr-4 py-4 rounded-full text-xs font-bold uppercase tracking-widest w-64 focus:border-black outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={14} />
            </div>
            <Link
              to="/admin/add"
              className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all"
            >
              <Plus size={14} /> Add New Piece
            </Link>
          </div>
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 border border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Pieces</p>
              <h3 className="text-3xl font-black">{products.length}</h3>
            </div>
            <Package className="text-zinc-200" size={40} />
          </div>
          <div className="bg-white p-8 border border-zinc-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Collection Value</p>
              <h3 className="text-3xl font-black">₹{products.reduce((acc, curr) => acc + (curr.price * (curr.countInStock || 0)), 0).toLocaleString()}</h3>
            </div>
            <IndianRupee className="text-zinc-200" size={40} />
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-white border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">#</th>
                  <th className="px-6 py-5">Product</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Stock</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.filter(p =>
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((product, index) => (
                  <tr key={product._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-6 text-[10px] font-bold text-zinc-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <img src={product.image} className="w-12 h-12 object-cover rounded-sm bg-zinc-100" alt="" />
                        <div>
                          <p className="text-xs font-black uppercase">{product.name}</p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-zinc-100 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold">₹{product.price.toLocaleString()}</td>
                    <td className="px-6 py-6">
                      <span className={`text-[10px] font-bold ${product.countInStock > 0 ? 'text-zinc-500' : 'text-red-500'}`}>
                        {product.countInStock || 0}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      {product.isBestSeller && <span className="text-[8px] font-black uppercase bg-black text-white px-2 py-1">Best Seller</span>}
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Link to={`/product/${product.slug}`} target="_blank" className="p-2 text-zinc-400 hover:text-black transition-colors">
                          <ExternalLink size={16} />
                        </Link>
                        <button
                          onClick={() => navigate(`/admin/edit/${product._id}`)}
                          className="p-2 text-zinc-400 hover:text-black transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;