import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const Shop = () => {
  const [filter, setFilter] = useState('All');

  // Fix: Force the page to the top whenever the component loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    /* CRITICAL FIX: 
       pt-40 (Mobile) and md:pt-52 (Desktop) ensures the title 
       is never hidden behind your fixed Navbar + Top Banner.
    */
    <div className="bg-white min-h-screen pt-40 md:pt-52 pb-32">
      <div className="container mx-auto px-4 md:px-10">
        
        {/* --- PAGE TITLE --- */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-zinc-400">
            Miso Silver Studio
          </p>
          <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-black leading-none">
            The Collection
          </h1>
        </div>

        {/* --- CATEGORY FILTERS (SCROLLABLE ON MOBILE) --- */}
        <div className="flex justify-start md:justify-center gap-4 mb-20 overflow-x-auto no-scrollbar px-4 pb-4">
          {['All', 'Rings', 'Earrings', 'Pendants', 'Bracelets'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-shrink-0 px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-500 rounded-full border ${
                filter === cat 
                  ? 'bg-black text-white border-black shadow-xl' 
                  : 'bg-white text-zinc-400 border-zinc-100 hover:border-black hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* --- PRODUCT GRID --- */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 md:gap-x-10 gap-y-16">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border-y border-zinc-50">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">
              No pieces currently available in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;