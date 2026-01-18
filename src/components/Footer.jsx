import React from 'react';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Column */}
        <div>
          <h2 className="text-3xl font-bold tracking-tighter mb-6">miso</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Handcrafted 925 Sterling Silver jewellery. <br />
            For those who don't fake the flex.
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Shop</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="hover:text-white cursor-pointer transition">New Arrivals</li>
            <li className="hover:text-white cursor-pointer transition">Best Sellers</li>
            <li className="hover:text-white cursor-pointer transition">Rings</li>
            <li className="hover:text-white cursor-pointer transition">Earrings</li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Support</h3>
          <ul className="space-y-4 text-sm text-gray-400">
            <li className="hover:text-white cursor-pointer transition">Track Order</li>
            <li className="hover:text-white cursor-pointer transition">Shipping & Returns</li>
            <li className="hover:text-white cursor-pointer transition">Care Guide</li>
            <li className="hover:text-white cursor-pointer transition">Contact Us</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Stay in the loop</h3>
          <div className="flex border-b border-gray-600 pb-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-transparent w-full outline-none text-white placeholder-gray-500"
            />
            <button className="text-xs font-bold uppercase">Join</button>
          </div>
          <div className="flex gap-4 mt-8">
            <Instagram className="w-5 h-5 cursor-pointer hover:text-gray-300" />
            <Facebook className="w-5 h-5 cursor-pointer hover:text-gray-300" />
            <Twitter className="w-5 h-5 cursor-pointer hover:text-gray-300" />
            <Mail className="w-5 h-5 cursor-pointer hover:text-gray-300" />
          </div>
        </div>
      </div>
      
      <div className="text-center text-gray-600 text-xs mt-16">
        © 2026 Miso by Sonia. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;