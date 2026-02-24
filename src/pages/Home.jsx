import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag, Plus, ArrowUpRight, Heart, Award, Crown, Zap, ShieldCheck, Star } from 'lucide-react';
import api from '../api/instance';
import { useStore } from '../store/useStore';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import FeaturedReviews from '../components/FeaturedReviews';
import FlashSaleBanner from '../components/FlashSaleBanner';
import Reveal from '../components/Reveal';
import Marquee from '../components/Marquee';
import { Skeleton } from '../components/ui/Skeleton';

const MOCK_LOOKS = [
  {
    _id: 'mock-1',
    image: "https://images.pexels.com/photos/9461772/pexels-photo-9461772.jpeg?auto=compress&cs=tinysrgb&w=800",
    caption: "The 2026 Collection - Modern Essentials",
    user: { firstName: "Julian", lastName: "S.", avatar: "https://i.pravatar.cc/150?u=julian" },
    likes: 124
  },
  {
    _id: 'mock-2',
    image: "https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=800",
    caption: "Urban Living - Curated Design",
    user: { firstName: "Elena", lastName: "R.", avatar: "https://i.pravatar.cc/150?u=elena" },
    likes: 89
  },
  {
    _id: 'mock-3',
    image: "https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg?auto=compress&cs=tinysrgb&w=800",
    caption: "Premium Quality - Built to Last",
    user: { firstName: "Marcus", lastName: "T.", avatar: "https://i.pravatar.cc/150?u=marcus" },
    likes: 215
  },
  {
    _id: 'mock-4',
    image: "https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&w=800",
    caption: "Minimalist Workspace Vibes",
    user: { firstName: "Sarah", lastName: "J.", avatar: "https://i.pravatar.cc/150?u=sarah" },
    likes: 156
  },
  {
    _id: 'mock-5',
    image: "https://images.pexels.com/photos/4458554/pexels-photo-4458554.jpeg?auto=compress&cs=tinysrgb&w=800",
    caption: "Industrial Minimalism",
    user: { firstName: "David", lastName: "L.", avatar: "https://i.pravatar.cc/150?u=david" },
    likes: 42
  },
  {
    _id: 'mock-6',
    image: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=800",
    caption: "Monochrome Studio",
    user: { firstName: "Alex", lastName: "K.", avatar: "https://i.pravatar.cc/150?u=alex" },
    likes: 310
  }
];

const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('all');
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [looks, setLooks] = useState([]); // NEW: Community Looks
  const [scrollY, setScrollY] = useState(0);
  const { user } = useStore();

  const newArrivalRef = useRef(null);
  const bestSellersSectionRef = useRef(null);
  const trendingRef = useRef(null);
  const recentlyViewedRef = useRef(null);
  const socialRef = useRef(null);

  const slides = [
    { id: 1, img: "https://images.pexels.com/photos/9461772/pexels-photo-9461772.jpeg?auto=compress&cs=tinysrgb&w=1600", title: "The 2026 Collection", subtitle: "Modern Essentials" },
    { id: 2, img: "https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=1600", title: "Urban Living", subtitle: "Curated Design" },
    { id: 3, img: "https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg?auto=compress&cs=tinysrgb&w=1600", title: "Premium Quality", subtitle: "Built to Last" },
  ];

  const scrollToProducts = () => {
    trendingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        const { data } = await api.get('/looks');
        setLooks(data);
      } catch (err) {
        console.error("Home Looks Fetch Error:", err);
      }
    };
    fetchLooks();
  }, []);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!user?.token) return;
      try {
        const { data } = await api.get('/users/recently-viewed');
        setRecentlyViewed(data);
      } catch (err) {
        console.error("Recently Viewed Fetch Fail");
      }
    };
    fetchRecentlyViewed();
  }, [user?.token]);

  useEffect(() => {
    if (location.state?.filter) {
      setActiveView(location.state.filter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveView('all');
    }
  }, [location]);

  useEffect(() => {
    if (activeView === 'all') {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentSlide, activeView, slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const scroll = (ref, direction) => {
    if (ref.current) {
      const el = ref.current;
      const width = el.clientWidth;
      const scrollAmount = direction === 'left' ? -width * 0.8 : width * 0.8;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // --- FILTERING LOGIC ---
  const bestSellers = products.filter(p =>
    p.isBestSeller || (Array.isArray(p.tags) && (p.tags.includes('Best Seller') || p.tags.includes('best seller')))
  );

  const newArrivals = products.filter(p =>
    p.isNewArrival || (Array.isArray(p.tags) && (p.tags.includes('New Arrival') || p.tags.includes('New')))
  );

  const mostViewedProducts = [...products].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 20);

  const productSections = [
    { id: 'most-viewed', title: 'Trending Now', subtitle: 'Most Explored Artifacts', items: mostViewedProducts, link: '/shop?sort=mostViewed', ref: trendingRef, bg: 'bg-zinc-50' },
    { id: 'best-sellers', title: 'Best Sellers', subtitle: 'The Most Iconic Pieces', items: bestSellers, link: '/shop?best=true', ref: bestSellersSectionRef, bg: 'bg-white' },
    { id: 'new-arrivals', title: 'New Arrivals', subtitle: 'Fresh Studio Drops', items: newArrivals, link: '/shop?new=true', ref: newArrivalRef, bg: 'bg-white' }
  ];

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white overflow-x-hidden">
      <Helmet>
        <title>SLOOK | Modern Essentials & Curated Goods</title>
        <meta name="description" content="Discover premium essentials at SLOOK. Curated designs for the modern aesthetic." />
      </Helmet>

      <FlashSaleBanner />

      {activeView === 'all' && (
        <>
          <section className="relative w-full h-screen overflow-hidden bg-zinc-950">
            {slides.map((slide, index) => (
              <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
                <img
                  src={slide.img}
                  className={`w-full h-full object-cover transition-transform will-change-transform`}
                  style={{
                    transitionDuration: index === currentSlide ? '0ms' : '1000ms',
                    transform: index === currentSlide ? `scale(${1.1 + (scrollY * 0.0005)}) translateY(${scrollY * 0.2}px)` : 'scale(1)'
                  }}
                  alt=""
                  loading="eager"
                />
                <div className="absolute inset-0 flex items-center justify-center px-6 z-20">
                  <div className="text-center">
                    <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.8em] mb-6">{slide.subtitle}</p>
                    <h2 className="text-white text-4xl md:text-7xl font-black uppercase tracking-[0.05em] mb-10 leading-tight">{slide.title}</h2>
                    <button onClick={scrollToProducts} className="bg-white text-black px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">Explore SLOOK</button>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 z-10"></div>
              </div>
            ))}
            <div className="absolute inset-0 z-30 flex items-center justify-between px-2 md:px-10 pointer-events-none">
              <button onClick={prevSlide} className="text-white/50 hover:text-white transition-colors pointer-events-auto"><ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>
              <button onClick={nextSlide} className="text-white/50 hover:text-white transition-colors pointer-events-auto"><ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>
            </div>
          </section>
          <Marquee text="Elite Artifacts • Timeless Quality • Studio Drops • Handpicked Originals •" />
        </>
      )}

      {productSections.map((section, idx) => (
        <React.Fragment key={section.id}>
          {(activeView === 'all' || activeView === section.id) && (
            <Reveal width="100%" delay={idx * 0.1}>
              <section id={section.id} className={`max-w-[1440px] mx-auto px-4 md:px-24 py-24 relative ${section.bg} ${activeView !== 'all' ? 'pt-40' : ''}`}>
                <div className="flex justify-between items-end mb-12">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">{section.title}</h2>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">{section.subtitle}</p>
                  </div>
                  <Link to={section.link} className="text-[10px] font-black uppercase tracking-[0.2em] border-b border-zinc-200 pb-1 hover:border-black hover:text-zinc-600 transition-all">View All</Link>
                </div>

                <div className="relative flex items-center group/scroller">
                  {products.length > 0 && activeView === 'all' && (
                    <>
                      <button onClick={() => scroll(section.ref, 'left')} className="hidden md:block absolute -left-4 md:-left-20 top-[40%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-all hover:scale-110 active:scale-95"><ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>
                      <button onClick={() => scroll(section.ref, 'right')} className="hidden md:block absolute -right-4 md:-right-20 top-[40%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-all hover:scale-110 active:scale-95"><ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>
                    </>
                  )}
                  <div ref={section.ref} className={`flex gap-6 md:gap-8 w-full ${activeView === 'all' ? 'overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 md:px-0 pb-10' : 'flex-wrap justify-center'}`}>
                    {products.length > 0 ? (
                      section.items.map((product) => (
                        <div key={product._id} className={`${activeView === 'all' ? 'min-w-[40%] sm:min-w-[45%] md:min-w-[28%] lg:min-w-[21%] snap-center md:snap-start' : 'w-[45%] md:w-[22%]'} flex-shrink-0`}><ProductCard product={product} /></div>
                      ))
                    ) : (
                      [...Array(4)].map((_, i) => (
                        <div key={i} className="min-w-[21%] flex-shrink-0 space-y-4">
                          <Skeleton className="aspect-square w-full rounded-2xl bg-zinc-100" />
                          <Skeleton className="h-4 w-3/4 rounded-full bg-zinc-100" />
                          <Skeleton className="h-3 w-1/4 rounded-full bg-zinc-50" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          {idx === 0 && activeView === 'all' && (
            <Reveal width="100%">
              <section className="relative w-full h-[60vh] md:h-[75vh] bg-zinc-900 overflow-hidden flex items-center">
                <div className="absolute inset-0">
                  <img src="https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=1600" className="w-full h-full object-cover opacity-70" alt="Brand Heritage" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent"></div>
                </div>
                <div className="container mx-auto px-6 md:px-16 relative z-10 text-white">
                  <div className="max-w-3xl">
                    <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.6em] mb-4">SLOOK Heritage</p>
                    <h2 className="text-5xl md:text-9xl font-black uppercase leading-[0.85] mb-8 tracking-tighter">Timeless <br /> Quality.</h2>
                    <p className="text-white/80 text-sm md:text-base font-medium max-w-md mb-10 leading-relaxed">Every piece is selected for durability and style, designed to merge industrial minimalism with everyday utility.</p>
                    <Link to="/shop" className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] hover:gap-10 transition-all duration-500">Shop Full Collection <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></Link>
                  </div>
                </div>
              </section>
            </Reveal>
          )}
        </React.Fragment>
      ))}


      {activeView === 'all' && (
        <Reveal width="100%">
          <FeaturedReviews />
        </Reveal>
      )}

      {/* STYLED BY YOU - SOCIAL PROOF */}
      {activeView === 'all' && (
        <Reveal width="100%">
          <section className="bg-zinc-50 py-24 border-t border-zinc-200">
            <div className="max-w-[1440px] mx-auto px-4 md:px-24 mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-2">Community</p>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic transform -skew-x-3">Styled by <span className="text-zinc-400">You</span></h2>
              </div>
              <Link to="/social" className="px-8 py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl">
                View Gallery <ArrowRight size={14} />
              </Link>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 md:px-24">
              <div className="relative flex items-center group/social-scroller">
                <button onClick={() => scroll(socialRef, 'left')} className="hidden md:block absolute -left-4 md:-left-20 top-[40%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-all hover:scale-110 active:scale-95"><ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>
                <button onClick={() => scroll(socialRef, 'right')} className="hidden md:block absolute -right-4 md:-right-20 top-[40%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-all hover:scale-110 active:scale-95"><ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>

                <div ref={socialRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-10 snap-x snap-mandatory w-full">

                  {/* UPLOAD CTA CARD - FIXED AS FIRST ITEM */}
                  <Link to="/account?action=upload" className="min-w-[280px] md:min-w-[320px] bg-white rounded-[2rem] border-2 border-dashed border-zinc-300 hover:border-black transition-all duration-500 snap-center flex flex-col items-center justify-center p-8 text-center gap-6 shadow-sm hover:shadow-xl group">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-black group-hover:text-white transition-all duration-300 transform group-hover:scale-110">
                      <Plus size={36} />
                    </div>
                    <div>
                      <p className="text-2xl font-black uppercase italic tracking-tighter">You're Next</p>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Upload Your Look</p>
                    </div>
                  </Link>

                  {/* REAL LOOKS */}
                  {(Array.isArray(looks) && looks.length > 0 ? looks : MOCK_LOOKS).map((look) => (
                    <div key={look._id} className="min-w-[280px] md:min-w-[320px] bg-white rounded-[2rem] overflow-hidden border border-zinc-100 shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer snap-center" onClick={() => navigate('/social')}>

                      {/* Image Container */}
                      <div className="relative overflow-hidden aspect-[4/5]">
                        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          <div className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl hover:scale-110 transition-transform">
                            <ShoppingBag size={18} />
                          </div>
                        </div>
                        <img src={look.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={look.caption} />
                      </div>

                      {/* Content Below */}
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img src={look.user?.avatar || `https://ui-avatars.com/api/?name=${look.user?.firstName || 'U'}`} className="w-9 h-9 rounded-full border border-zinc-100 object-cover" />
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-tight text-zinc-900 leading-none">{look.user?.firstName}</p>
                              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Verified Style</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 bg-zinc-50 px-3 py-1.5 rounded-full">
                            <Heart size={14} className="text-zinc-400 fill-zinc-100 group-hover:fill-red-50 group-hover:text-red-500 transition-colors" />
                            <span className="text-[10px] font-black text-zinc-500">{look.likes?.length || 0}</span>
                          </div>
                        </div>
                        <p className="text-xs font-medium text-zinc-600 leading-relaxed line-clamp-2">
                          "{look.caption}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {activeView === 'all' && user && recentlyViewed.length > 0 && (
        <Reveal width="100%">
          <section className="max-w-[1440px] mx-auto px-4 md:px-24 py-24 relative bg-zinc-50 border-t border-zinc-100">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Recently Viewed</h2>
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Pick up where you left off</p>
              </div>
            </div>
            <div className="relative flex items-center group">
              <button onClick={() => scroll(recentlyViewedRef, 'left')} className="hidden md:block absolute -left-2 md:-left-20 top-[35%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-colors"><ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>
              <button onClick={() => scroll(recentlyViewedRef, 'right')} className="hidden md:block absolute -right-2 md:-right-20 top-[35%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-colors"><ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} /></button>
              <div ref={recentlyViewedRef} className="flex gap-6 md:gap-8 w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 md:px-0 pb-10">
                {recentlyViewed.map((product) => (
                  <div key={product._id} className="min-w-[40%] sm:min-w-[45%] md:min-w-[28%] lg:min-w-[21%] snap-center md:snap-start flex-shrink-0"><ProductCard product={product} /></div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}
      {activeView === 'all' && (
        <Reveal width="100%">
          <section className="bg-white py-24 pb-48">
            <div className="max-w-[1440px] mx-auto px-4 md:px-24">
              <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-2">Privilege</p>
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic transform -skew-x-3">Loyalty <span className="text-zinc-300">Milestones</span></h2>
                </div>
                <button onClick={() => navigate('/account')} className="text-[10px] font-black uppercase tracking-widest border-b border-zinc-200 pb-1 hover:border-black transition-all">Join the Elite</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                  { tier: 'Bronze', spend: 'Starts at ₹0', perk: '1.0x Elite Coins', icon: Award, color: 'text-amber-700' },
                  { tier: 'Silver', spend: '₹10k+ Spent', perk: '1.2x Elite Coins', icon: ShieldCheck, color: 'text-blue-600' },
                  { tier: 'Gold', spend: '₹50k+ Spent', perk: '1.5x Elite Coins', icon: Star, color: 'text-amber-500' },
                  { tier: 'Platinum', spend: '₹1 Lakh+', perk: '2.0x Elite Coins', icon: Crown, color: 'text-zinc-900' }
                ].map((m, i) => (
                  <div key={i} className="group p-8 rounded-[2.5rem] bg-zinc-50 border border-zinc-100 hover:bg-white hover:border-zinc-800 hover:shadow-2xl transition-all duration-500">
                    <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${m.color}`}>
                      <m.icon size={28} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{m.spend}</p>
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 italic">{m.tier}</h3>
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Zap size={12} fill="currentColor" />
                      <span className="text-[11px] font-bold uppercase tracking-tight">{m.perk}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}
    </div>
  );
};

export default Home;
