import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' }); // Changed defaults to empty strings
  const [filters, setFilters] = useState({ size: '', color: '' }); // NEW State

  // UI States
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState(['All', 'Rings', 'Earrings', 'Necklaces', 'Bracelets', 'Men']); // Hardcoded or Fetched

  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL Params on Mount/Update
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    const filterParam = params.get('filter'); // legacy support
    const searchParam = params.get('keyword') || params.get('search');

    if (catParam) setCategory(catParam);
    if (searchParam) setKeyword(searchParam);

    // Legacy mapping
    if (filterParam === 'best-seller') { /* Logic to handle if needed, or separate state */ }

  }, [location.search]);

  // Fetch Products with Debounce for Search
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (keyword) params.append('keyword', keyword);
        if (category !== 'All') params.append('category', category);
        if (sort) params.append('sort', sort);
        if (sort) params.append('sort', sort);
        if (priceRange.min) params.append('minPrice', priceRange.min);
        if (priceRange.max) params.append('maxPrice', priceRange.max);
        if (filters.size) params.append('size', filters.size);
        if (filters.color) params.append('color', filters.color);

        console.log("Fetching with params:", params.toString());

        const { data } = await axios.get(`http://localhost:5000/api/products?${params.toString()}`);
        setProducts(data);

      } catch (err) {
        console.error("Shop Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500); // 500ms Debounce

    return () => clearTimeout(debounceTimer);
  }, [keyword, category, sort, priceRange, filters]);


  const handleSearchChange = (e) => {
    setKeyword(e.target.value);
    // Optional: Update URL
  };

  return (
    <div className="bg-white min-h-screen pt-32 pb-20">
      <Helmet>
        <title>Shop Collection | SLOOK</title>
        <meta name="description" content="Browse our curated collection of premium essentials. Filter by category, price, and more." />
      </Helmet>
      <div className="container mx-auto px-6 md:px-12">

        {/* --- HEADER & CONTROLS --- */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-black mb-2">
                The Collection
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                {products.length} Artifacts Found
              </p>
            </div>

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-96 group">
              <input
                type="text"
                placeholder="Refine Search..."
                value={keyword}
                onChange={handleSearchChange}
                className="w-full bg-transparent border-b border-zinc-300 py-3 pl-0 pr-10 text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all placeholder:text-zinc-300"
              />
              <Search className="absolute right-0 top-3 text-zinc-300 group-focus-within:text-black transition-colors" size={16} />
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center justify-between gap-6 border-y border-zinc-100 py-4">

            {/* Categories */}
            <div className="flex items-center gap-6 overflow-x-auto no-scrollbar mask-gradient">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-colors ${category === cat ? 'text-black' : 'text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort & Filter Trigger */}
            <div className="flex items-center gap-6 shrink-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${showFilters ? 'text-black' : 'text-zinc-400 hover:text-black'}`}
              >
                <SlidersHorizontal size={14} /> Filters
              </button>

              <div className="relative group">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-transparent text-[10px] font-bold uppercase tracking-[0.2em] pr-6 outline-none cursor-pointer text-zinc-500 hover:text-black transition-colors"
                >
                  <option value="newest">New Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" size={12} />
              </div>
            </div>
          </div>

          {/* --- EXPANDABLE FILTERS --- */}
          {showFilters && (
            <div className="mb-8 p-6 bg-zinc-50 border border-zinc-100 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Price Range */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Price Range</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full bg-white border border-zinc-200 p-2 text-xs font-bold outline-none focus:border-black"
                    />
                    <span className="text-zinc-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      value={priceRange.max}
                      className="w-full bg-white border border-zinc-200 p-2 text-xs font-bold outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Color */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Metal / Color</span>
                  <div className="flex flex-wrap gap-2">
                    {['Black', 'White', 'Blue', 'Red'].map(c => (
                      <button
                        key={c}
                        onClick={() => setFilters({ ...filters, color: filters.color === c ? '' : c })}
                        className={`px-3 py-1 border text-[10px] font-bold uppercase tracking-widest transition-all ${filters.color === c ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Size</span>
                  <div className="flex flex-wrap gap-2">
                    {['6', '7', '8', '9', '10', '11'].map(s => (
                      <button
                        key={s}
                        onClick={() => setFilters({ ...filters, size: filters.size === s ? '' : s })}
                        className={`w-8 h-8 flex items-center justify-center border text-[10px] font-bold transition-all ${filters.size === s ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Actions */}
                <div className="flex items-end justify-end">
                  <button
                    onClick={() => {
                      setPriceRange({ min: '', max: '' });
                      setFilters({ color: '', size: '' });
                      setCategory('All');
                      setKeyword('');
                    }}
                    className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline"
                  >
                    Reset All
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* --- PRODUCT GRID --- */}
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-12 md:gap-y-20">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product._id} className="animate-in fade-in zoom-in-95 duration-500">
                  <ProductCard product={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 text-center border-t border-dashed border-zinc-200">
                <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-zinc-300 mb-4">
                  0 Artifacts Found
                </p>
                <button
                  onClick={() => { setKeyword(''); setCategory('All'); }}
                  className="text-[10px] font-black underline uppercase tracking-widest text-black"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Shop;