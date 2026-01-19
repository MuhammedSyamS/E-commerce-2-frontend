import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products'; 
import heroImage from '../assets/miso.webp';

const Home = () => {
  // Logic to handle product display
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8); 
  const [displayLimit, setDisplayLimit] = useState(8);
  const allProducts = products.slice(0, displayLimit);

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      
      {/* --- 4K RESPONSIVE HERO SECTION --- */}
      {/* h-[75vh] on mobile makes the image feel immersive and high-end */}
      <section className="relative w-full h-[70vh] sm:h-[75vh] md:h-[85vh] overflow-hidden bg-zinc-100">
        <Link to="/shop" className="block w-full h-full">
          <img 
            src={heroImage} 
            alt="Miso Silver 4K Collection" 
            /* object-[center_20%] is the secret for phones: 
               It keeps the top-middle area (where jewelry usually is) 
               perfectly framed on vertical screens.
            */
            className="w-full h-full object-cover object-[center_25%] md:object-center transition-transform duration-[3000ms] ease-out hover:scale-105"
          />
          
          {/* High-End Glassmorphism Overlay for Mobile */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:hidden">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 text-center">
              <h2 className="text-white text-xl font-black uppercase tracking-tighter mb-2">The 2026 Collection</h2>
              <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.3em]">Shop Authentic Silver</p>
            </div>
          </div>
        </Link>
      </section>

      {/* --- BEST SELLERS --- */}
      <section className="container mx-auto px-4 md:px-10 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 border-b border-zinc-100 pb-6 md:pb-8">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Best Sellers</h2>
            <p className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-[0.4em] mt-3">Hallmarked 925 Sterling</p>
          </div>
          <Link to="/shop" className="text-[10px] md:text-xs font-black underline underline-offset-8 uppercase tracking-widest hover:text-zinc-500 transition">
            View All Pieces
          </Link>
        </div>
        
        {/* Responsive Grid: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-10 md:gap-y-16">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* --- BRAND STORY BANNER (MNC STYLE) --- */}
      <section className="bg-black text-white py-24 md:py-40 text-center relative overflow-hidden">
        {/* Background text decoration */}
        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none select-none">
           <span className="text-[30vw] font-black uppercase tracking-tighter">SILVER</span>
        </div>
        
        <div className="max-w-4xl mx-auto px-8 relative z-10">
          <h2 className="text-4xl md:text-8xl font-black mb-8 md:mb-12 tracking-tighter uppercase leading-[0.85]">
            Real Silver <br /> For Real You
          </h2>
          <div className="w-12 h-px bg-zinc-700 mx-auto mb-8 md:mb-12"></div>
          <p className="text-zinc-400 mb-12 md:mb-16 text-xs md:text-base font-medium uppercase tracking-[0.2em] max-w-xl mx-auto leading-relaxed">
            Every piece is handcrafted for those who value authenticity over trends.
          </p>
          
          <p className="italic text-2xl md:text-4xl text-zinc-600 font-serif lowercase opacity-50">
            stay authentic.
          </p>
        </div>
      </section>

      {/* --- NEW ARRIVALS / FULL COLLECTION --- */}
      <section className="container mx-auto px-4 md:px-10 py-16 md:py-24 bg-zinc-50/30">
        <div className="flex justify-between items-end mb-10 md:mb-16 border-b border-zinc-200 pb-6 md:pb-8">
          <div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">New Arrivals</h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.4em] mt-3">
              {allProducts.length} items curated for you
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-x-10 md:gap-y-16">
          {allProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        {/* --- LOAD MORE BUTTON --- */}
        {displayLimit < products.length && (
          <div className="mt-16 md:mt-24 text-center px-4">
            <button 
              onClick={() => setDisplayLimit(products.length)}
              className="w-full md:w-auto bg-black text-white px-16 py-5 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-2xl active:scale-95"
            >
              Explore Full Studio
            </button>
          </div>
        )}
      </section>

      {/* --- MINI FOOTER --- */}
      <footer className="py-12 border-t border-zinc-100 text-center">
         <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-300">Miso Silver Studio</p>
      </footer>

    </div>
  );
};

export default Home;