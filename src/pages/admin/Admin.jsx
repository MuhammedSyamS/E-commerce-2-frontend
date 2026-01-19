import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Import Hook
import { products } from '../../data/products'; // <--- Notice the '../../' path
import { Package, DollarSign, ShoppingBag, Plus, Trash2, Edit } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const navigate = useNavigate(); // <--- Initialize Hook
  
  const stats = [
    { label: 'Total Revenue', value: '₹45,200', icon: <DollarSign size={20} /> },
    { label: 'Total Orders', value: '124', icon: <Package size={20} /> },
    { label: 'Products', value: products.length, icon: <ShoppingBag size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Admin Header */}
      <div className="bg-black text-white pt-24 pb-12 px-6">
        <div className="container mx-auto">
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase">Manage your store overview</p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 shadow-lg rounded-xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-2xl font-black">{stat.value}</h3>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">
                {stat.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button 
            onClick={() => setActiveTab('products')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            Products
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors ${
              activeTab === 'orders' ? 'border-b-2 border-black text-black' : 'text-gray-400 hover:text-black'
            }`}
          >
            Orders
          </button>
        </div>

        {/* Content Area */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          
          {/* --- PRODUCTS TAB --- */}
          {activeTab === 'products' && (
            <div>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold uppercase tracking-wide">Product List</h2>
                
                {/* --- ADD NEW BUTTON (Now Works) --- */}
                <button 
                  onClick={() => navigate('/admin/add')} 
                  className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-gray-800 transition rounded-lg"
                >
                  <Plus size={14} /> Add New
                </button>

              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold">
                    <tr>
                      <th className="p-4">Image</th>
                      <th className="p-4">Name</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition">
                        <td className="p-4">
                          <img src={product.image} alt="" className="w-12 h-12 object-cover rounded-md bg-gray-100" />
                        </td>
                        <td className="p-4 font-bold text-gray-900">{product.name}</td>
                        <td className="p-4">Rs. {product.price}</td>
                        <td className="p-4">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold uppercase text-gray-600">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button className="text-gray-400 hover:text-black"><Edit size={16} /></button>
                            <button className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- ORDERS TAB --- */}
          {activeTab === 'orders' && (
            <div>
              <div className="p-6 border-b border-gray-100">
                <h2 className="font-bold uppercase tracking-wide">Recent Orders</h2>
              </div>
              <div className="p-12 text-center text-gray-400 text-sm">
                <p>No new orders yet.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Admin;