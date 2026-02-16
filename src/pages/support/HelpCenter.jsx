import React, { useState } from 'react';
import { Search, ChevronDown, MessageSquare, Truck, ShieldCheck, CreditCard, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const HelpCenter = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const faqs = [
    { q: "How do I care for my product?", a: "Each item comes with specific care instructions. Please refer to label or product page for details." },
    { q: "What is your shipping timeline?", a: "Standard shipping takes 3-5 business days. Express delivery is available for most metropolitan cities." },
    { q: "Do you provide warranty?", a: "Yes, all SLOOK products come with a standard manufacturer warranty against defects." },
    { q: "Can I return a customized item?", a: "Customized or personalized items are final sale and cannot be returned unless there is a manufacturing defect." },
    { q: "How do I find my size?", a: "We provide detailed size guides on all apparel and accessory product pages." }
  ];

  // --- LIVE SEARCH LOGIC ---
  const filteredFaqs = faqs.filter(faq =>
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* HEADER & SEARCH */}
        <div className="text-center mb-20">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-4">Concierge</p>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">Store Support</h1>

          <div className="relative max-w-xl mx-auto group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH TOPICS (E.G. 'SHIPPING', 'RETURNS')..."
              className="w-full border-b-2 border-black py-5 px-2 text-[11px] font-black uppercase tracking-widest outline-none transition-all focus:placeholder-transparent"
            />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-3">
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-zinc-300 hover:text-black">
                  <X size={16} />
                </button>
              )}
              <Search className="text-black" size={20} />
            </div>
          </div>
        </div>

        {/* CATEGORIES GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {[
            { icon: <Truck size={20} />, label: "Logistics", path: "/shipping" },
            { icon: <ShieldCheck size={20} />, label: "Warranty", path: "/faq" },
            { icon: <CreditCard size={20} />, label: "Billing", path: "/faq" },
            { icon: <MessageSquare size={20} />, label: "Exchanges", path: "/returns" }
          ].map((cat, i) => (
            <div key={i} className="border border-zinc-100 p-10 flex flex-col items-center hover:bg-black hover:text-white transition-all duration-500 cursor-pointer group" onClick={() => navigate(cat.path)}>
              <div className="mb-6 transform group-hover:scale-110 transition-transform">{cat.icon}</div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">{cat.label}</p>
            </div>
          ))}
        </div>

        {/* FAQs WITH FILTERING */}
        <div className="max-w-3xl mx-auto mb-32">
          <div className="flex justify-between items-end border-b border-zinc-100 pb-6 mb-10">
            <h2 className="text-xs font-black uppercase tracking-[0.4em]">Knowledge Base</h2>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
              Showing {filteredFaqs.length} results
            </p>
          </div>

          <div className="space-y-2">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, i) => (
                <div key={i} className="border border-zinc-50 rounded-sm overflow-hidden transition-all hover:border-zinc-200">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className={`w-full p-6 flex justify-between items-center text-left transition-colors ${activeFaq === i ? 'bg-zinc-50' : 'bg-white'}`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-widest leading-relaxed">{faq.q}</span>
                    <ChevronDown size={14} className={`transition-transform duration-500 ${activeFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === i && (
                    <div className="px-6 pb-6 pt-2 bg-zinc-50 text-zinc-500 text-[11px] uppercase leading-relaxed tracking-wider animate-in fade-in slide-in-from-top-1">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-20 border-2 border-dashed border-zinc-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">No matching topics found.</p>
              </div>
            )}
          </div>
        </div>

        {/* TICKET RAISING CTA */}
        <div className="relative overflow-hidden bg-black text-white p-16 text-center">
          {/* Decorative Background Text */}
          <div className="absolute top-0 left-0 text-[120px] font-black opacity-[0.03] select-none pointer-events-none -translate-x-10">
            STUDIO
          </div>

          <div className="relative z-10">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4">Request Personal Assistance</h3>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] mb-10">Average response time: 12 Studio Hours</p>
            <Link to="/support/ticket" className="inline-block border border-white text-white px-12 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500">
              Open a Support Ticket
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpCenter;
