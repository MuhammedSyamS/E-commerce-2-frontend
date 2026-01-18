import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products'; // <--- IMPORTING LOCAL DATA

const Shop = () => {
  const [filter, setFilter] = useState('All');

  // Filter Logic: If 'All', show everything. Else match category.
  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="bg-white min-h-screen pt-8 pb-20">
      <div className="container mx-auto px-6">
        
        <h1 className="text-4xl font-bold uppercase tracking-tight text-center mb-8">
          Shop Collections
        </h1>

        {/* Categories Buttons */}
        <div className="flex justify-center gap-3 mb-12 flex-wrap">
          {['All', 'Rings', 'Earrings', 'Pendants', 'Bracelets'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all border ${
                filter === cat 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;