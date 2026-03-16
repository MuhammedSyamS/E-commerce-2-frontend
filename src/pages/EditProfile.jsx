import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/instance';
import { User, Mail, Lock, Save, ArrowLeft } from 'lucide-react';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '', // Read Only
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      setLoading(true);

      // Prepare payload (only send changed fields)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };

      const { data } = await api.put('/users/profile', updateData);

      // Update Global Store
      setUser({ ...data, token: user.token }); // Maintain token

      setMessage({ type: 'success', text: "Profile updated successfully!" });
      setLoading(false);
      // navigate('/account'); // Optional: redirect back or stay
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Update failed" });
      setLoading(false);
    }
  };

  return (
    // ADJUSTED PADDING: pt-32 (Mobile) and pt-40 (Desktop) to clear navbar (Safe Zone)
    <div className="min-h-screen bg-white pt-40 lg:pt-48 pb-20 px-6">
      <div className="max-w-xl mx-auto">

        <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] hover:text-black mb-12">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Edit <span className="text-zinc-300">Profile</span></h1>

        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div 
            className="relative group cursor-pointer"
            onClick={() => document.getElementById('avatar-input').click()}
          >
            <div className="w-24 h-24 rounded-full border-4 border-zinc-50 shadow-lg overflow-hidden bg-zinc-100 flex items-center justify-center transition-transform group-hover:scale-105">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className={`w-full h-full object-cover ${loading ? 'opacity-50' : 'opacity-100'}`}
                />
              ) : (
                <User size={40} className="text-zinc-400" />
              )}
              
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            <div className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full shadow-lg border-2 border-white">
              <User size={12} />
            </div>
            
            <input 
              id="avatar-input"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                  setLoading(true);
                  const formData = new FormData();
                  formData.append('file', file);
                  
                  const { data } = await api.post('/users/profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                  });
                  
                  setUser({ ...user, avatar: data.avatar });
                  setMessage({ type: 'success', text: "Profile picture updated!" });
                } catch (err) {
                  setMessage({ type: 'error', text: err.response?.data?.message || "Avatar update failed" });
                } finally {
                  setLoading(false);
                }
              }}
            />
          </div>
          <p className="text-[9px] font-bold uppercase text-zinc-400 mt-3 tracking-widest">Tap to change photo</p>
        </div>

        {message && (
          <div className={`p-4 mb-8 text-xs font-bold uppercase tracking-widest rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">First Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-zinc-50 border border-transparent focus:border-black rounded-xl py-3 pl-12 pr-4 outline-none font-bold text-sm transition"
                  placeholder="First Name"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-zinc-50 border border-transparent focus:border-black rounded-xl py-3 px-4 outline-none font-bold text-sm transition"
                  placeholder="Last Name"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-zinc-50 border border-transparent focus:border-black rounded-xl py-3 px-4 outline-none font-bold text-sm transition"
                placeholder="Phone Number"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full bg-zinc-100 text-zinc-400 border border-transparent rounded-xl py-3 pl-12 pr-4 outline-none font-bold text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-[9px] text-zinc-400 mt-2 uppercase font-bold tracking-wider">Contact support to change email.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition flex items-center justify-center gap-3 mt-8 shadow-xl"
          >
            {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
          </button>

        </form>
      </div>
    </div>
  );
};

export default EditProfile;
