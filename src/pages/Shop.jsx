import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Rings', 'Pendants', 'Bracelets', 'Earrings'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Ensure your backend is running on port 5000
        const res = await axios.get('http://localhost:5000/api/products');
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error("Shop Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter Logic
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === activeCategory));
    }
  }, [activeCategory, products]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* --- CLEAN HEADER --- */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.2em] text-black">
            The Silver <span className="font-bold">Gallery</span>
          </h1>
          <div className="h-px w-20 bg-black mt-6"></div>
        </div>

        {/* --- FILTER NAVIGATION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-zinc-100 pb-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-300 ${
                  activeCategory === cat 
                  ? 'text-black scale-110' 
                  : 'text-zinc-400 hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
            {filteredProducts.length} Items Found
          </span>
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 md:gap-x-12 md:gap-y-20">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id} className="transition-opacity duration-500">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.5em] text-zinc-300">
                Selection currently unavailable
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* --- MINIMALIST FOOTER INFO --- */}
      <div className="mt-40 pt-20 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-300">
          Miso Studio &copy; 2026 | Hallmarked 925 Silver
        </p>
      </div>
    </div>
  );
};

export default Shop;