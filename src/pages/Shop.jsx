import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/instance';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ChevronDown, X, RotateCcw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Skeleton } from '../components/ui/Skeleton';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('All');
  const [subcategory, setSubcategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [filters, setFilters] = useState({ size: '', color: '', minRating: 0 });
  const [flags, setFlags] = useState({ inStock: false, isNewArrival: false, isBestSeller: false });

  // UI States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState(['All']);
  const [subcategories, setSubcategories] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catParam = params.get('category');
    const searchParam = params.get('keyword') || params.get('search');
    const newParam = params.get('new') || params.get('isNewArrival') || params.get('filter') === 'new-arrival';
    const bestParam = params.get('best') || params.get('isBestSeller') || params.get('filter') === 'best-seller';
    const mostViewedParam = params.get('mostViewed') || params.get('filter') === 'most-viewed';
    const sortParam = params.get('sort');

    if (catParam) setCategory(catParam);
    if (searchParam) setKeyword(searchParam);
    if (newParam) setFlags(f => ({ ...f, isNewArrival: true }));
    if (bestParam) setFlags(f => ({ ...f, isBestSeller: true }));
    if (mostViewedParam || sortParam === 'mostViewed') setSort('mostViewed');
    else if (sortParam) setSort(sortParam);

    const fetchFilterData = async () => {
      try {
        const { data } = await api.get('/products/filters');
        setCategories(['All', ...data.categories.filter(c => c !== 'All')]);
        setSubcategories(data.subcategories || []);
        setAvailableSizes(data.sizes);
        setAvailableColors(data.colors);
      } catch (err) {
        console.error("Filter Data Fetch Fail");
      }
    };
    fetchFilterData();
  }, [location.search]);

  // Fetch Products with Debounce
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (keyword) params.append('keyword', keyword);
        if (category !== 'All') params.append('category', category);
        if (subcategory !== 'All') params.append('subcategory', subcategory);
        if (sort) params.append('sort', sort);
        if (priceRange.min) params.append('minPrice', priceRange.min);
        if (priceRange.max) params.append('maxPrice', priceRange.max);
        if (filters.size) params.append('size', filters.size);
        if (filters.color) params.append('color', filters.color);
        if (filters.minRating > 0) params.append('minRating', filters.minRating);
        if (flags.inStock) params.append('inStock', 'true');
        if (flags.isNewArrival) params.append('isNewArrival', 'true');
        if (flags.isBestSeller) params.append('isBestSeller', 'true');

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data);
      } catch (err) {
        console.error("Shop Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [keyword, category, subcategory, sort, priceRange, filters, flags]);

  const handleSearchChange = (e) => setKeyword(e.target.value);

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setFilters({ color: '', size: '', minRating: 0 });
    setFlags({ inStock: false, isNewArrival: false, isBestSeller: false });
    setCategory('All');
    setSubcategory('All');
    setKeyword('');
  };

  const FilterContent = ({ isMobile = false }) => (
    <div className={`space-y-14 ${isMobile ? 'pr-2' : ''}`}>
      {/* Status Section */}
      <section className="space-y-6">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Artifact Status</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'inStock', label: 'Stock' },
            { id: 'isNewArrival', label: 'New' },
            { id: 'isBestSeller', label: 'Best' }
          ].map(flag => (
            <button
              key={flag.id}
              onClick={() => setFlags({ ...flags, [flag.id]: !flags[flag.id] })}
              className={`py-3 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-all ${flags[flag.id]
                ? (isMobile ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-black text-white border-black')
                : (isMobile ? 'bg-transparent text-zinc-500 border-zinc-900 hover:border-zinc-700' : 'bg-transparent text-zinc-300 border-zinc-100 hover:border-zinc-200')}`}
            >
              {flag.label}
            </button>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-8">
        <div className="space-y-6">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Main Category</h4>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setSubcategory('All'); }}
                className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all ${category === cat
                  ? (isMobile ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                  : (isMobile ? 'text-zinc-500 border-zinc-900 hover:border-zinc-700' : 'text-zinc-400 border-zinc-100 hover:border-zinc-200')}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {subcategories.length > 0 && (
          <div className="space-y-6">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Sub-Style</h4>
            <div className="flex flex-wrap gap-2">
              {subcategories.map(s => (
                <button
                  key={s}
                  onClick={() => setSubcategory(subcategory === s ? 'All' : s)}
                  className={`px-4 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all ${subcategory === s
                    ? (isMobile ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                    : (isMobile ? 'text-zinc-500 border-zinc-900 hover:border-zinc-700' : 'text-zinc-400 border-zinc-100 hover:border-zinc-200')}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Colors */}
      <section className="space-y-6">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Visual Tints</h4>
        <div className="flex flex-wrap gap-3">
          {availableColors.map(c => (
            <button
              key={c}
              onClick={() => setFilters({ ...filters, color: filters.color === c ? '' : c })}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${filters.color === c
                ? (isMobile ? 'bg-white text-black border-white' : 'bg-black text-white border-black')
                : (isMobile ? 'bg-zinc-900/40 text-zinc-500 border-zinc-900 hover:border-zinc-700' : 'bg-zinc-50 text-zinc-400 border-zinc-100 hover:border-zinc-200')
                }`}
            >
              <div className="w-2 h-2 rounded-full border border-zinc-200" style={{ backgroundColor: c.toLowerCase() }}></div>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-6">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Dimension Spec</h4>
        <div className="flex flex-wrap gap-3">
          {availableSizes.map(s => (
            <button
              key={s}
              onClick={() => setFilters({ ...filters, size: filters.size === s ? '' : s })}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl border text-[11px] font-black transition-all ${filters.size === s
                ? (isMobile ? 'bg-white text-black border-white scale-110' : 'bg-black text-white border-black scale-105')
                : (isMobile ? 'bg-transparent text-zinc-500 border-zinc-900 hover:border-zinc-700' : 'bg-transparent text-zinc-300 border-zinc-100 hover:border-zinc-200')
                }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Price Range */}
      <section className="space-y-6">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Valuation (₹)</h4>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
            className={`flex-1 border p-4 rounded-2xl text-[11px] font-black outline-none transition-all ${isMobile ? 'bg-zinc-900/50 border-zinc-900 text-white focus:border-zinc-700' : 'bg-zinc-50 border-zinc-100 text-black focus:border-black'}`}
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className={`flex-1 border p-4 rounded-2xl text-[11px] font-black outline-none transition-all ${isMobile ? 'bg-zinc-900/50 border-zinc-900 text-white focus:border-zinc-700' : 'bg-zinc-50 border-zinc-100 text-black focus:border-black'}`}
          />
        </div>
      </section>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pt-40 pb-20 selection:bg-black selection:text-white">
      <Helmet>
        <title>The Collection | SLOOK Elite</title>
        <meta name="description" content="Explore SLOOK's premium collection of hand-picked artifacts." />
      </Helmet>

      <div className="container mx-auto px-6 md:px-12">
        {/* --- CONTROL BAR --- */}
        <div className="flex flex-wrap items-center justify-between gap-8 border-b border-zinc-100 py-6 mb-12">
          {/* Categories Scroller */}
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar mask-gradient pr-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setSubcategory('All'); }}
                className={`text-[10px] font-black uppercase tracking-[0.25em] whitespace-nowrap transition-all ${category === cat ? 'text-black scale-110' : 'text-zinc-300 hover:text-zinc-600'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-8 shrink-0">
            {/* Search Input - Minimalist */}
            <div className="relative group">
              <input
                type="text"
                placeholder="Find Artifact..."
                value={keyword}
                onChange={handleSearchChange}
                className="bg-transparent border-b border-zinc-100 py-2 px-1 text-[10px] font-black uppercase tracking-widest outline-none focus:border-black transition-all placeholder:text-zinc-300 w-32 focus:w-48"
              />
              <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-black transition-colors" size={12} />
            </div>

            {/* Sort Dropdown */}
            <div className="relative group">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-transparent text-[10px] font-black uppercase tracking-[0.2em] pr-8 outline-none cursor-pointer text-zinc-500 hover:text-black transition-colors"
              >
                <option value="newest">Latest</option>
                <option value="price-asc">Value: Low-High</option>
                <option value="price-desc">Value: High-Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-300 group-hover:text-black" size={12} />
            </div>

            {/* Filter Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              <SlidersHorizontal size={14} strokeWidth={3} /> Filters
            </button>
          </div>
        </div>

      </div>

      <div className="flex flex-col lg:flex-row gap-16">
        {/* --- DESKTOP SIDEBAR --- */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-48 h-[calc(100vh-240px)] overflow-y-auto no-scrollbar pb-20">
          <div className="mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-1">Catalog</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Curated Elite Discovery</p>
          </div>
          <FilterContent />
          <div className="mt-12 pt-10 border-t border-zinc-100">
            <button onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Reset All Parameters</button>
          </div>
        </aside>

        {/* --- MAIN GRID --- */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-16 md:gap-x-12 md:gap-y-24">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-6">
                  <Skeleton className="aspect-square w-full rounded-xl bg-zinc-50" />
                  <div className="space-y-3 px-2">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-3 w-1/4 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-16 md:gap-x-12 md:gap-y-24 relative z-10">
              {products.length > 0 ? (
                products.map((product) => (
                  <div key={product._id} className="group/item animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="col-span-full py-40 text-center rounded-[3rem] bg-zinc-50 border-2 border-dashed border-zinc-100">
                  <RotateCcw size={40} className="mx-auto text-zinc-200 mb-6 font-thin" />
                  <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Artifacts Found</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8">Refine your parameters or reset</p>
                  <button
                    onClick={resetFilters}
                    className="px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    Reset Discovery
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- FILTER DRAWER (ELITE BLACK THEME) --- */}
      <div
        className={`fixed inset-0 z-[150] transition-visibility duration-300 ${isDrawerOpen ? 'visible' : 'invisible'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-xl transition-opacity duration-500 ${isDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 right-0 w-full max-w-[480px] h-full bg-zinc-950 text-white shadow-3xl transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) p-10 md:p-14 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none">Catalog</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500 mt-2">Filter Explorer / Elite Specification</p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-4 bg-zinc-900/50 text-zinc-400 rounded-full hover:bg-white hover:text-black transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar border-t border-zinc-900 pt-10">
            <FilterContent isMobile={true} />
          </div>

          <div className="pt-10 flex items-center gap-4 border-t border-zinc-900 mt-auto bg-zinc-950 pb-6">
            <button
              onClick={resetFilters}
              className="flex-1 py-5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 hover:text-white transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="flex-[2] py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-100 active:scale-95 transition-all font-black shadow-2xl shadow-white/5"
            >
              Analyze {products.length} Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
