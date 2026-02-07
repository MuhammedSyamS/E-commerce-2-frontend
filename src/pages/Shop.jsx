import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [title, setTitle] = useState('The Silver Gallery'); // Dynamic Title

  const location = useLocation();

  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Ensure your backend is running on port 5000
        const res = await axios.get('http://localhost:5000/api/products');
        const data = Array.isArray(res.data) ? res.data : [];
        setProducts(data);
        setFilteredProducts(data);

        // Derive unique categories
        const uniqueCats = ['All', ...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCats);
      } catch (err) {
        console.error("Shop Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Robust Filter Logic
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const categoryParam = params.get('category');

    let currentTitle = 'The Silver Gallery';
    let filtered = Array.isArray(products) ? [...products] : []; // Create shallow copy

    // 1. Handle URL Category Logic
    if (categoryParam && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
      // We return here to let the state update trigger re-render
      // But typically we can just continue processing if we want instant result
    }

    // 2. Apply Category Filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    // 3. Apply Special URL Filters (Best Seller / New Arrival)
    if (filterParam) {
      if (filterParam === 'best-seller') {
        filtered = filtered.filter(p =>
          p.isBestSeller === true ||
          (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase() === 'best seller'))
        );
        currentTitle = 'Best Sellers';
      }
      else if (filterParam === 'new-arrival') {
        filtered = filtered.filter(p =>
          p.isNewArrival === true ||
          (Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase() === 'new arrival' || t.toLowerCase() === 'new'))
        );
        currentTitle = 'New Arrivals';
      }
    }

    setTitle(currentTitle);
    setFilteredProducts(filtered);
  }, [activeCategory, products, location.search]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6 md:px-12">

        {/* --- DYNAMIC HEADER --- */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-light uppercase tracking-[0.2em] text-black">
            {title === 'The Silver Gallery' ? (
              <>The Silver <span className="font-bold">Gallery</span></>
            ) : (
              <span className="font-bold text-black">{title}</span>
            )}
          </h1>
          <div className="h-px w-20 bg-black mt-6"></div>

          {/* Reset Filters Link */}
          {(location.search || activeCategory !== 'All') && (
            <Link to="/shop" onClick={() => setActiveCategory('All')} className="inline-block mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
              Clear Filters ×
            </Link>
          )}
        </div>

        {/* --- FILTER NAVIGATION --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-zinc-100 pb-6">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {categories.map((cat) => {
              // Calculate count based on current view (might be confusing if mixed with best-seller filter)
              // Let's keep it simple: Count of products in that category GLOBAL
              const count = cat === 'All'
                ? products.length
                : products.filter(p => p.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    // Optional: Clear URL params to avoid confusion?
                    // navigate('/shop'); // Depends on UX
                  }}
                  className={`text-[11px] font-bold uppercase tracking-[0.3em] transition-all duration-300 ${activeCategory === cat
                    ? 'text-black scale-110'
                    : 'text-zinc-400 hover:text-black'
                    }`}
                >
                  {cat} <span className="opacity-50 text-[9px]">({count})</span>
                </button>
              )
            })}
          </div>

          <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
            {filteredProducts.length} Items Found
          </span>
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-12 md:gap-x-12 md:gap-y-20">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product._id} className="transition-opacity duration-500">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.5em] text-zinc-300">
                No items match your selection
              </p>
              <Link to="/shop" onClick={() => setActiveCategory('All')} className="inline-block mt-4 text-xs font-bold underline">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* --- MINIMALIST FOOTER INFO --- */}
      <div className="mt-40 pt-20 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.6em] text-zinc-300">
          SLOOK Studio &copy; 2026 | Hallmarked 925 Silver
        </p>
      </div>
    </div>
  );
};

export default Shop;