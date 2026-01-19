import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save } from 'lucide-react';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Rings',
    image: '',
    description: '',
    isBestSeller: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product to add:', formData);
    // Backend logic goes here later
    alert("Product added (Mock Mode)");
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="container mx-auto px-6 max-w-5xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Add New Product</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: FORM */}
          <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Silver Eagle Ring"
                  className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black transition"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Price (INR)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 799"
                    className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black transition"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Category</label>
                  <select 
                    className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black transition bg-white"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Rings</option>
                    <option>Earrings</option>
                    <option>Pendants</option>
                    <option>Bracelets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black transition"
                    value={formData.image}
                    onChange={e => setFormData({...formData, image: e.target.value})}
                    required
                  />
                  <button type="button" className="bg-gray-100 p-3 rounded hover:bg-gray-200">
                    <Upload size={20} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Description</label>
                <textarea 
                  rows="4"
                  placeholder="Product details..."
                  className="w-full border border-gray-300 p-3 rounded outline-none focus:border-black transition"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex items-center gap-3 border p-4 rounded bg-gray-50">
                <input 
                  type="checkbox" 
                  id="bestSeller"
                  className="w-5 h-5 accent-black"
                  checked={formData.isBestSeller}
                  onChange={e => setFormData({...formData, isBestSeller: e.target.checked})}
                />
                <label htmlFor="bestSeller" className="text-sm font-bold uppercase">Mark as Best Seller</label>
              </div>

              <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition flex justify-center items-center gap-2 rounded">
                <Save size={18} /> Publish Product
              </button>

            </form>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div>
            <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">Live Preview</h3>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                {formData.image ? (
                  <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs uppercase font-bold">No Image</div>
                )}
                {formData.isBestSeller && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">
                    Best Seller
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg mb-1">{formData.name || "Product Name"}</h3>
              <p className="text-gray-500 text-xs uppercase tracking-wider mb-3">{formData.category}</p>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="font-bold">Rs. {formData.price || "000"}</span>
                <span className="text-xs font-bold uppercase bg-black text-white px-3 py-1 rounded-full">Add</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddProduct;