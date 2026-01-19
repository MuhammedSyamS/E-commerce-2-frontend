import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock Data (In real app, fetch using ID)
  const [formData, setFormData] = useState({
    name: 'Eagle Adjustable Ring',
    price: '799',
    category: 'Rings',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800'
  });

  const handleSave = (e) => {
    e.preventDefault();
    alert("Product Updated (Mock)!");
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="container mx-auto px-6 max-w-2xl">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Edit Product</h1>
          </div>
          <button className="text-red-500 hover:text-red-700 p-2 bg-white rounded-full shadow">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Product Name</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Price</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Category</label>
                <select className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black bg-white">
                  <option>Rings</option>
                  <option>Earrings</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Image Preview</label>
              <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
            </div>

            <button className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;