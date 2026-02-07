import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, IndianRupee, ShoppingBag, Plus, Trash2, Edit, ExternalLink, Search, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../store/useStore'; // Explicit import needed for token

const Admin = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useStore(); // Fix: Destructure user from store

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // New State

  // FETCH LIVE PRODUCTS FROM BACKEND
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        // Add timestamp to bust cache
        const res = await axios.get(`http://localhost:5000/api/products?t=${Date.now()}`);
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Admin Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [user]); // Re-fetch on auth change

  const handleRefresh = () => {
    // Re-trigger fetch manually
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/products?t=${Date.now()}`);
        setProducts(Array.isArray(res.data) ? res.data : []);
        addToast("Inventory Refreshed", "success");
      } catch (err) {
        addToast("Refresh Failed", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  };


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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter transform -skew-x-6">
              Studio <span className="text-zinc-400">Inventory</span>
              <button onClick={handleRefresh} className="ml-4 p-2 bg-zinc-100 rounded-full text-zinc-400 hover:text-black hover:rotate-180 transition-all inline-block align-middle transform skew-x-6" title="Refresh Inventory">
                <RefreshCw size={18} />
              </button>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">SLOOK Studio Administrative Portal</p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <input
                placeholder="Search Products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border border-zinc-200 pl-10 pr-4 py-4 rounded-full text-xs font-bold uppercase tracking-widest w-full md:w-64 focus:border-black outline-none"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-400" size={14} />
            </div>
            <Link
              to="/admin/products/add"
              className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all w-full md:w-auto"
            >
              <Plus size={14} /> Add New Piece
            </Link>
          </div>
        </div>


        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* ... stats ... */}
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
              <h3 className="text-3xl font-black">₹{products.reduce((acc, curr) => acc + ((typeof curr.price === 'number' ? curr.price : 0) * (curr.countInStock || 0)), 0).toLocaleString()}</h3>
            </div>
            <IndianRupee className="text-zinc-200" size={40} />
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-white border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-4 py-4 md:px-6 md:py-5">#</th>
                  <th className="px-4 py-4 md:px-6 md:py-5">Product</th>
                  <th className="px-4 py-4 md:px-6 md:py-5">Category</th>
                  <th className="px-4 py-4 md:px-6 md:py-5">Price</th>
                  <th className="px-4 py-4 md:px-6 md:py-5">Stock</th>
                  <th className="px-4 py-4 md:px-6 md:py-5">Status</th>
                  <th className="px-4 py-4 md:px-6 md:py-5 text-right whitespace-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.filter(p =>
                  (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((product, index) => (
                  <tr key={product._id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-4 md:px-6 md:py-6 text-[10px] font-bold text-zinc-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-6">
                      <div className="flex items-center gap-4">
                        <img src={product.image || "/placeholder.jpg"} className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-sm bg-zinc-100 flex-shrink-0" alt="" />
                        <div>
                          <p className="text-xs font-black uppercase truncate max-w-[150px] md:max-w-none">{product.name || "Unknown Interface"}</p>
                          <p className="text-[9px] text-zinc-400 font-bold uppercase">{product.slug || "No Slug"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-6">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-zinc-100 rounded-full">
                        {product.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-6 text-sm font-bold">₹{typeof product.price === 'number' ? product.price.toLocaleString() : '0'}</td>
                    <td className="px-4 py-4 md:px-6 md:py-6">
                      <span className={`text-[10px] font-bold ${product.countInStock > 0 ? 'text-zinc-500' : 'text-red-500'}`}>
                        {product.countInStock || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-6">
                      {product.isBestSeller && <span className="text-[8px] font-black uppercase bg-black text-white px-2 py-1">Best Seller</span>}
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-6 text-right">
                      <div className="flex justify-end gap-2 md:gap-3">
                        {/* VIEW BUTTON - Removed target="_blank" for SPA feel */}
                        <button
                          onClick={() => navigate(`/product/${product.slug}`)}
                          className="p-2 text-zinc-400 hover:text-black transition-colors"
                          title="View Live Page"
                        >
                          <ExternalLink size={16} />
                        </button>

                        <button
                          onClick={() => navigate(`/admin/products/edit/${product._id}`)}
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