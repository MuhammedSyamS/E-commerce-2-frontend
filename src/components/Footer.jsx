import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Mail, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

const XIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#0a0a0a] text-white border-t border-zinc-900">
      
      {/* --- TRUST BAR (Inverted to Dark) --- */}
      <div className="border-b border-zinc-900 py-10 px-6">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <Truck size={20} strokeWidth={1.5} className="text-zinc-400 group-hover:text-white transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Free Global Shipping</p>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <ShieldCheck size={20} strokeWidth={1.5} className="text-zinc-400 group-hover:text-white transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">925 Hallmarked Silver</p>
          </div>
          <div className="flex flex-col items-center gap-2 group cursor-default">
            <RotateCcw size={20} strokeWidth={1.5} className="text-zinc-400 group-hover:text-white transition-colors" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">7-Day Easy Returns</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          
          {/* BRAND STORY */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white">HighPhaus</h2>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-sm font-medium">
              Authentic 925 Sterling Silver for the modern rebel. 
              Designed in the studio, worn on the streets. No fillers, no fakes.
            </p>
            <div className="flex gap-6 pt-4">
              <Instagram className="w-4 h-4 cursor-pointer text-zinc-500 hover:text-white transition-all" />
              <XIcon className="w-4 h-4 cursor-pointer text-zinc-500 hover:text-white transition-all" />
              <Facebook className="w-4 h-4 cursor-pointer text-zinc-500 hover:text-white transition-all" />
              <Mail className="w-4 h-4 cursor-pointer text-zinc-500 hover:text-white transition-all" />
            </div>
          </div>

          {/* SHOP LINKS */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Shop</h3>
            <ul className="space-y-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              <li><Link to="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?filter=best-sellers" className="hover:text-white transition-colors">Best Sellers</Link></li>
              <li><Link to="/shop?category=Rings" className="hover:text-white transition-colors">Rings</Link></li>
              <li><Link to="/shop?category=Earrings" className="hover:text-white transition-colors">Earrings</Link></li>
            </ul>
          </div>

          {/* SUPPORT LINKS */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Support</h3>
            <ul className="space-y-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
              <li><Link to="/track-order" className="hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link to="/care-guide" className="hover:text-white transition-colors">Care Guide</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">The Inner Circle</h3>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-loose">
              Join for early access to drops and exclusive studio updates.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-transparent border-b border-zinc-800 py-4 text-[10px] font-black text-white outline-none focus:border-white transition-all placeholder:text-zinc-700"
              />
              <button className="absolute right-0 bottom-4 text-[10px] font-black uppercase tracking-widest text-white hover:translate-x-1 transition-transform">
                Join →
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="mt-24 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-[9px] font-bold uppercase tracking-[0.2em]">
            © 2026 HighPhaus Studio. All rights reserved.
          </p>
          <div className="flex gap-8 text-zinc-600 text-[9px] font-bold uppercase tracking-[0.2em]">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;