import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'Sonia Fan',
    email: 'sonia@example.com',
    phone: '9876543210',
    address: 'Varkala, Kerala',
    zip: '695141'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Profile Updated Successfully!");
    navigate('/account');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6">
      <div className="bg-white p-8 md:p-10 rounded-xl shadow-lg w-full max-w-lg border border-gray-100">
        
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-center">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full Name</label>
            <input 
              type="text" 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-black transition font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Email</label>
            <input 
              type="email" 
              value={formData.email}
              disabled
              className="w-full border-b-2 border-gray-100 py-2 outline-none text-gray-400 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-black transition font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">City / State</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-black transition font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Zip Code</label>
              <input 
                type="text" 
                value={formData.zip}
                onChange={(e) => setFormData({...formData, zip: e.target.value})}
                className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-black transition font-bold"
              />
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button type="button" onClick={() => navigate('/account')} className="flex-1 border border-gray-300 py-3 font-bold uppercase text-xs tracking-widest hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-black text-white py-3 font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition shadow-lg">
              Save Changes
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;