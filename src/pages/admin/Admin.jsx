import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, DollarSign, ShoppingBag, Plus, Trash2, Edit, ExternalLink } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        await axios.delete(`http://localhost:5000/api/products/${id}`);
        setProducts(products.filter(p => p._id !== id));
        alert("Product removed from Studio.");
      } catch (err) {
        alert("Failed to delete product.");
      }
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-zinc-50 font-black uppercase tracking-widest text-[10px]">
      Loading Studio Management...
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter transform -skew-x-6">
              Studio <span className="text-zinc-400">Inventory</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-2">Miso Studio Administrative Portal</p>
          </div>
          <Link 
            to="/admin/add" 
            className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition-all"
          >
            <Plus size={14} /> Add New Piece
          </Link>
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
              <h3 className="text-3xl font-black">₹{products.reduce((acc, curr) => acc + curr.price, 0).toLocaleString()}</h3>
            </div>
            <DollarSign className="text-zinc-200" size={40} />
          </div>
        </div>

        {/* INVENTORY TABLE */}
        <div className="bg-white border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-5">Product</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-zinc-50 transition-colors">
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