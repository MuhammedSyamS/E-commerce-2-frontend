import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('All');
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    // Fetch products based on filter
    const query = filter === 'All' ? '' : `?category=${filter}`;
    axios.get(`http://localhost:5000/api/products${query}`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, [filter]);

  return (
    <div className="bg-white min-h-screen pt-10 pb-20">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight text-center mb-10">
          All Collections
        </h1>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-2 md:gap-4 mb-16 flex-wrap">
          {['All', 'Rings', 'Earrings', 'Pendants'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold border transition-all ${
                filter === cat 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <div key={product._id} className="group cursor-pointer">
              <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute bottom-4 left-4 right-4 bg-white text-black py-3 text-xs font-bold uppercase opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                  Add to Cart
                </button>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 group-hover:underline decoration-1 underline-offset-4">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Sterling Silver</p>
                </div>
                <span className="text-sm font-bold">Rs. {product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;