import React from 'react';
import { Send, Upload } from 'lucide-react';

const TicketForm = () => {
  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6 max-w-2xl">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">Raise a Ticket</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-12">Expect a response within 12-24 studio hours</p>

        <form className="space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest">Inquiry Type</label>
              <select className="w-full border-b border-zinc-200 py-3 outline-none text-[10px] font-black uppercase tracking-widest bg-transparent">
                <option>Product Defect</option>
                <option>Shipping Delay</option>
                <option>Wrong Item Received</option>
                <option>General Inquiry</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest">Order ID (Optional)</label>
              <input type="text" placeholder="#MS-0000" className="w-full border-b border-zinc-200 py-3 outline-none text-[10px] font-black uppercase tracking-widest" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest">Description</label>
            <textarea
              rows="5"
              placeholder="TELL US MORE ABOUT YOUR CONCERN..."
              className="w-full border border-zinc-100 p-4 outline-none text-[11px] font-medium uppercase tracking-wider bg-zinc-50 focus:border-black transition-colors"
            />
          </div>

          <div className="border-2 border-dashed border-zinc-100 p-8 text-center cursor-pointer hover:bg-zinc-50 transition-colors">
            <Upload size={20} className="mx-auto text-zinc-300 mb-2" />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Attach Photos (For Defects)</p>
          </div>

          <button className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform">
            Send Inquiry <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;