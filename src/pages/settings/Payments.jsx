import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Plus } from 'lucide-react';

const Payments = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pt-52 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">

        <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] hover:text-black mb-8">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Payments</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Manage Saved Cards</p>
          </div>
          <button className="bg-black text-white px-6 py-3 rounded-full font-black uppercase text-[10px] flex items-center gap-2">
            <Plus size={16} /> Add Card
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* EXAMPLE CARD 1 */}
          <div className="p-8 bg-zinc-900 text-white rounded-3xl relative h-48 flex flex-col justify-between shadow-xl">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs opacity-50">Debit</span>
              <CreditCard size={24} />
            </div>
            <div>
              <p className="font-mono text-xl tracking-widest mb-1">•••• •••• •••• 4242</p>
              <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest opacity-70">
                <span>John Doe</span>
                <span>12/28</span>
              </div>
            </div>
          </div>

          {/* EXAMPLE CARD 2 */}
          <div className="p-8 bg-zinc-100 text-zinc-400 rounded-3xl relative h-48 flex flex-col justify-between border border-zinc-200">
            <div className="flex justify-between items-start">
              <span className="font-mono text-xs">Credit</span>
              <CreditCard size={24} />
            </div>
            <div>
              <p className="font-mono text-xl tracking-widest mb-1">•••• •••• •••• 8899</p>
              <div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-widest">
                <span>HighPhaus User</span>
                <span>09/25</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
