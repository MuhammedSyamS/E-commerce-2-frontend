import React, { useState } from 'react';
import { Send, Upload, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import api from '../../api/instance';

const TicketForm = () => {
  const { user } = useStore();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: 'General Inquiry',
    orderId: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      addToast('Please login to raise a ticket', 'info');
      navigate('/login');
    }
  }, [user, navigate, addToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.message.trim()) return addToast('Please enter a description', 'error');

    setLoading(true);
    try {
      // Map Inquiry Type to Subject if needed, or just send as part of message
      const payload = {
        subject: formData.subject + (formData.orderId ? ` (Order: ${formData.orderId})` : ''),
        message: formData.message
      };

      await api.post('/support', payload);
      addToast('Ticket raised successfully!', 'success');
      navigate('/support-tickets');
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to raise ticket', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white min-h-screen pt-44 md:pt-52 pb-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Raise a Ticket</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-12">Expect a response within 12-24 studio hours</p>

        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest">Inquiry Type</label>
              <select
                className="w-full border-b border-zinc-200 py-3 outline-none text-[10px] font-black uppercase tracking-widest bg-transparent cursor-pointer focus:border-black transition-colors"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              >
                <option>Product Defect</option>
                <option>Shipping Delay</option>
                <option>Wrong Item Received</option>
                <option>General Inquiry</option>
                <option>Points / Loyalty</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest">Order ID (Optional)</label>
              <input
                type="text"
                placeholder="#MS-0000"
                className="w-full border-b border-zinc-200 py-3 outline-none text-[10px] font-black uppercase tracking-widest focus:border-black transition-colors"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest">Description</label>
            <textarea
              rows="5"
              placeholder="TELL US MORE ABOUT YOUR CONCERN..."
              className="w-full border border-zinc-100 p-4 outline-none text-[11px] font-medium uppercase tracking-wider bg-zinc-50 focus:border-black transition-colors resize-none"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div className="border-2 border-dashed border-zinc-100 p-8 text-center cursor-pointer hover:bg-zinc-50 transition-colors group">
            <Upload size={20} className="mx-auto text-zinc-300 mb-2 group-hover:text-black transition-colors" />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black transition-colors">Attach Photos (Coming Soon)</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all disabled:bg-zinc-800"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (
              <>Send Inquiry <Send size={14} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;

