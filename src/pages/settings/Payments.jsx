import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import axios from 'axios';
import { CreditCard, ArrowLeft, Plus, Trash2, X } from 'lucide-react';

const Payments = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const { addToast } = useToast();
  const [cards, setCards] = useState(user?.savedCards || []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '', // only to get last4
    brand: 'Visa',
    expMonth: '',
    expYear: ''
  });

  const displayName = user ? `${user.firstName} ${user.lastName || ''}`.trim() : 'CARD HOLDER';

  useEffect(() => {
    if (user?.savedCards) setCards(user.savedCards);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      addToast("Session expired. Please Login again.", "error");
      return;
    }

    // Extract last 4
    const last4 = formData.cardNumber.slice(-4);
    const cardToSave = {
      last4: last4 || '0000',
      brand: formData.brand,
      expMonth: formData.expMonth,
      expYear: formData.expYear,
      cvv: formData.cvv
    };

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/users/cards', cardToSave, config);

      // Update Store and State
      setCards(data);
      // We generally also update global user object so other pages have fresh data, though less critical here
      setUser({ ...user, savedCards: data });
      setShowForm(false);
      setFormData({ cardNumber: '', brand: 'Visa', expMonth: '', expYear: '' });
    } catch (err) {
      console.error("Add Card Error:", err);
      addToast(err.response?.data?.message || err.message || "Failed to save card", "error");
    }
  };



  // --- MODAL STATE ---
  const [deleteModal, setDeleteModal] = useState({ show: false, cardId: null });

  const confirmDelete = (id) => {
    setDeleteModal({ show: true, cardId: id });
  };

  const handleDelete = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.delete(`/api/users/cards/${deleteModal.cardId}`, config);
      setCards(data);
      setUser({ ...user, savedCards: data });
      addToast("Card Removed", "success");
    } catch (err) {
      addToast("Failed to delete card", "error");
    } finally {
      setDeleteModal({ show: false, cardId: null });
    }
  };

  return (
    <div className="min-h-screen bg-white pt-40 lg:pt-48 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">

        <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] hover:text-black mb-8">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Payments</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Manage Saved Cards</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="bg-black text-white px-6 py-3 rounded-full font-black uppercase text-[10px] flex items-center gap-2">
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "Cancel" : "Add Card"}
          </button>
        </div>

        {showForm && (
          <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 mb-12 animate-in slide-in-from-top duration-300">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold uppercase mb-2 block">Card Number</label>
                <input required maxLength="19" placeholder="0000 0000 0000 0000" value={formData.cardNumber} onChange={e => setFormData({ ...formData, cardNumber: e.target.value })} className="w-full bg-white p-4 rounded-xl text-sm font-mono outline-none border border-transparent focus:border-black" />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase mb-2 block">Expiry Month</label>
                <input required maxLength="2" placeholder="MM" value={formData.expMonth} onChange={e => setFormData({ ...formData, expMonth: e.target.value })} className="w-full bg-white p-4 rounded-xl text-sm font-mono outline-none border border-transparent focus:border-black" />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase mb-2 block">Expiry Year</label>
                <input required maxLength="4" placeholder="YYYY" value={formData.expYear} onChange={e => setFormData({ ...formData, expYear: e.target.value })} className="w-full bg-white p-4 rounded-xl text-sm font-mono outline-none border border-transparent focus:border-black" />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase mb-2 block">CVV</label>
                <input required maxLength="4" placeholder="123" value={formData.cvv || ''} onChange={e => setFormData({ ...formData, cvv: e.target.value })} className="w-full bg-white p-4 rounded-xl text-sm font-mono outline-none border border-transparent focus:border-black" />
              </div>

              <button type="submit" className="md:col-span-2 bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition">Save Card</button>
            </form>
          </div>
        )}

        {cards.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 rounded-3xl">
            <CreditCard size={48} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">No Cards Saved</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {cards.map((card, idx) => (
              <div key={card._id || idx} className={`p-8 rounded-3xl relative h-48 flex flex-col justify-between shadow-xl transition-all group ${idx % 2 === 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs opacity-50">{card.brand}</span>
                  <button onClick={() => confirmDelete(card._id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500 hover:text-white rounded-full"><Trash2 size={14} /></button>
                </div>
                <div>
                  <p className="font-mono text-xl tracking-widest mb-1">•••• •••• •••• {card.last4}</p>
                  <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest opacity-70">
                    <span>{displayName.toUpperCase()}</span>
                    <span>{card.expMonth}/{card.expYear}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deleteModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-[2rem] max-w-sm w-full shadow-2xl animate-in zoom-in-95">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-4 italic text-center">Remove Card?</h3>
              <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wide mb-8">
                Are you sure you want to remove this payment method?
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setDeleteModal({ show: false, cardId: null })}
                  className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-zinc-200 hover:bg-zinc-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="py-4 rounded-xl font-black bg-red-500 text-white uppercase text-[10px] tracking-widest hover:bg-red-600 shadow-lg shadow-red-200 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div >
    </div >
  );
};

export default Payments;
