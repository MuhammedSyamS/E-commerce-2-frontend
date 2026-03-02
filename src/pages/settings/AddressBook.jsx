import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import api from '../../api/instance';
import { MapPin, Plus, Trash2, ArrowLeft } from 'lucide-react';

const AddressBook = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    alternatePhone: '',
    isDefault: false
  });

  // Sync with store on mount
  useEffect(() => {
    if (user?.addresses) setAddresses(user.addresses);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      addToast("Session expired. Please Login again.", "error");
      return;
    }

    try {
      const { data } = await api.post('/users/addresses', formData);

      // Update local and store
      setAddresses(data);
      setUser({ ...user, addresses: data });
      setShowForm(false);
      setFormData({ label: 'Home', street: '', city: '', state: '', zip: '', phone: '', alternatePhone: '', isDefault: false });
    } catch (err) {
      console.error("Add Address Error:", err);
      // Show explicit error: Server Message OR Network Message OR Fallback
      addToast(err.response?.data?.message || err.message || "Failed to add address", "error");
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const { data } = await api.delete(`/users/addresses/${id}`);
      setAddresses(data);
      setUser({ ...user, addresses: data });
    } catch (err) {
      addToast("Failed to delete", "error");
    }
  };

  return (
    <div className="min-h-screen bg-white pt-44 md:pt-52 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">

        <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] hover:text-black mb-8">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Address Book</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Manage Your Shipping Destinations</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-black text-white px-6 py-3 rounded-full font-black uppercase text-[10px] flex items-center gap-2">
            <Plus size={16} /> {showForm ? "Cancel" : "Add New"}
          </button>
        </div>

        {showForm && (
          <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 mb-12 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required placeholder="Label (e.g. Home)" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} className="bg-white p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-black" />
              <input required placeholder="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-white p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-black" />
              <input required placeholder="Street Address" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} className="md:col-span-2 bg-white p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-black" />
              <input required placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="bg-white p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-black" />
              <input required placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="bg-white p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-black" />
              <input required placeholder="ZIP Code" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} className="bg-white p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-black" />
              <input placeholder="Alternate Phone (Optional)" value={formData.alternatePhone} onChange={e => setFormData({ ...formData, alternatePhone: e.target.value })} className="bg-white p-4 rounded-xl text-sm font-medium outline-none border border-transparent focus:border-black" />

              <button type="submit" className="md:col-span-2 bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition">Save Address</button>
            </form>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 rounded-3xl">
            <MapPin size={48} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No Addresses Saved</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map(addr => (
              <div key={addr._id} className="p-8 border border-zinc-100 rounded-3xl relative hover:shadow-lg transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{addr.label}</span>
                  <button onClick={() => handleDelete(addr._id)} className="text-zinc-300 hover:text-red-500 transition"><Trash2 size={16} /></button>
                </div>
                <p className="font-bold text-lg mb-1">{addr.street}</p>
                <p className="text-zinc-500 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
                <p className="text-zinc-400 text-xs mt-4 font-mono">
                  {addr.phone}
                  {addr.alternatePhone && <span className="text-zinc-300 ml-2">| {addr.alternatePhone}</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressBook;
