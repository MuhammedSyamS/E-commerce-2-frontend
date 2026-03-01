import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/instance';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ChevronDown, X, RotateCcw, Zap } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
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
        <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Status</h4>
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
          <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Category</h4>
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
            <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Subcategory</h4>
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
        <div className="flex justify-between items-end">
          <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Color</h4>
          {filters.color && <button onClick={() => setFilters({ ...filters, color: '' })} className="text-[10px] font-bold text-zinc-400 hover:text-red-500 uppercase tracking-widest">Clear</button>}
        </div>
        <div className="flex flex-wrap gap-2">
          {availableColors.map(c => {
            const hex = colorMap[c] || '#CCCCCC';
            const isSelected = filters.color === c;
            return (
              <button
                key={c}
                onClick={() => setFilters({ ...filters, color: isSelected ? '' : c })}
                className={`group relative flex flex-col items-center gap-2 p-1.5 rounded-2xl border transition-all duration-500 ${isSelected
                  ? (isMobile ? 'bg-white/10 border-white' : 'bg-zinc-50 border-black scale-105')
                  : (isMobile ? 'border-zinc-900' : 'border-zinc-100 hover:border-zinc-300')
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-90 ${hex.toLowerCase() === '#ffffff' ? 'border-zinc-200' : 'border-transparent'}`}
                  style={{ backgroundColor: hex }}
                >
                  {isSelected && <Zap size={14} className={hex.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'} fill="currentColor" />}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {c}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sizes */}
      <section className="space-y-6">
        <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Size</h4>
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
        <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] border-l-2 pl-4 ${isMobile ? 'text-zinc-600 border-white' : 'text-zinc-400 border-black'}`}>Price (₹)</h4>
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

  const colorMap = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Red': '#EF4444',
    'Blue': '#3B82F6',
    'Green': '#22C55E',
    'Grey': '#71717A',
    'Slate': '#475569',
    'Navy': '#1E3A8A',
    'Pink': '#EC4899',
    'Beige': '#F5F5DC',
    'Cream': '#FFFDD0',
    'Olive': '#808000',
    'Tan': '#D2B48C',
    'Silver': '#C0C0C0',
    'Gold': '#FFD700',
  };

  return (
    <div className="bg-white min-h-screen pb-20 selection:bg-black selection:text-white overflow-hidden">
      <Helmet>
        <title>The Collection | SLOOK</title>
        <meta name="description" content="Explore SLOOK's premium collection of hand-picked artifacts." />
      </Helmet>

      {/* --- ELITE SHOP HERO --- */}
      <section className="relative pt-36 pb-20 md:pt-56 md:pb-32 px-6 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-zinc-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-zinc-50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-10" />

        <div className="container-responsive relative">
          <div className="max-w-3xl">
            <h1 className="!text-5xl md:!text-8xl lg:!text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-4 md:mb-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              The<br />
              Collection
            </h1>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 animate-in fade-in slide-in-from-bottom-8 delay-300 duration-1000">
              <div className="h-px w-20 bg-black hidden md:block" />
              <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] text-zinc-400">
                Spring-Summer 2026 Collection
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- STICKY GLASS CONTROL BAR --- */}
      <nav className="sticky top-20 z-[100] px-6 py-4 transition-all duration-500">
        <div className="container-responsive">
          <div className="bg-white/80 backdrop-blur-2xl border border-zinc-100 rounded-full px-6 py-2 md:px-8 md:py-3 shadow-2xl shadow-black/5 flex items-center justify-between gap-4">

            {/* Minimal Categories (Desktop) */}
            <div className="hidden lg:flex items-center gap-8 overflow-x-auto no-scrollbar pr-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setSubcategory('All'); }}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${category === cat ? 'text-black scale-105' : 'text-zinc-300 hover:text-zinc-600'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Mobile Title Placeholder */}
            <h2 className="lg:hidden text-xs font-black uppercase tracking-widest">{category === 'All' ? 'Catalog' : category}</h2>

            <div className="flex items-center gap-4 md:gap-8 shrink-0">
              {/* Search Trigger (Mobile) vs Search Input (Desktop) */}
              <div className="relative group flex items-center">
                <input
                  type="text"
                  placeholder="Seach Collection..."
                  value={keyword}
                  onChange={handleSearchChange}
                  className="bg-transparent border-none py-2 px-1 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-0 transition-all placeholder:text-zinc-300 w-24 md:w-32 focus:md:w-48"
                />
                <Search className="text-zinc-300 group-focus-within:text-black transition-colors" size={14} />
              </div>

              {/* Sort Dropdown */}
              <div className="relative group hidden md:block">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="appearance-none bg-transparent text-[10px] font-black uppercase tracking-[0.2em] pr-8 outline-none cursor-pointer text-zinc-500 hover:text-black transition-colors border-none focus:ring-0"
                >
                  <option value="newest">Latest arrivals</option>
                  <option value="price-asc">Price (Low-High)</option>
                  <option value="price-desc">Price (High-Low)</option>
                  <option value="rating">Top customer rated</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-300 group-hover:text-black" size={12} />
              </div>

              <div className="w-px h-6 bg-zinc-100 hidden md:block" />

              {/* Filter Trigger */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 shadow-xl shadow-black/10 group"
              >
                <SlidersHorizontal size={12} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-500" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container-responsive pt-12">
        <Breadcrumbs items={[
          { label: 'Shop', path: '/shop' },
          ...(category !== 'All' ? [{ label: category, path: `/shop?category=${category}` }] : [])
        ]} />

        <div className="flex flex-col lg:flex-row gap-8 md:gap-16 mt-6 md:mt-8">
          {/* --- DESKTOP SIDEBAR --- */}
          <aside className="hidden lg:block w-72 shrink-0 sticky top-48 h-[calc(100vh-240px)] overflow-y-auto no-scrollbar pb-20">
            <div className="mb-12">
              <h2 className="!text-3xl lg:!text-4xl font-black uppercase tracking-tighter leading-none mb-1">Catalog</h2>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-300">Hand-Picked Selection</p>
            </div>
            <FilterContent />
            <div className="mt-12 pt-10 border-t border-zinc-100">
              <button onClick={resetFilters} className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Reset All Parameters</button>
            </div>
          </aside>

          {/* --- MAIN GRID --- */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-[2rem]" />
                    <Skeleton className="h-4 w-3/4 mx-auto rounded-full" />
                    <Skeleton className="h-4 w-1/4 mx-auto rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 relative z-10">
                {products.length > 0 ? (
                  products.map((product, idx) => (
                    <div
                      key={product._id}
                      className="group/item animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
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
                      Reset Filters
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
            <div className="flex items-center justify-between mb-8 md:mb-12">
              <div>
                <h2 className="!text-3xl md:!text-5xl font-black uppercase tracking-tighter text-white leading-none">Catalog</h2>
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500 mt-1 md:mt-2">Filter Products</p>
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
                Show {products.length} Items
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
