import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingBag, Plus, ArrowUpRight, Heart, Award, Crown, Zap, ShieldCheck, Star } from 'lucide-react';
import api from '../api/instance';
import { resolveMediaURL } from '../utils/mediaUtils';
import { useStore } from '../store/useStore';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import FeaturedReviews from '../components/FeaturedReviews';
import FlashSaleBanner from '../components/FlashSaleBanner';
import Reveal from '../components/Reveal';
import Marquee from '../components/Marquee';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import AIStylist from '../components/AIStylist';



const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [communityLooks, setCommunityLooks] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const { user } = useStore();

  const newArrivalRef = useRef(null);
  const bestSellersSectionRef = useRef(null);
  const trendingRef = useRef(null);
  const recentlyViewedRef = useRef(null);
  const communityRef = useRef(null);

  const slides = [
    { id: 1, img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000", title: "The 2026 Collection", subtitle: "Modern Essentials" },
    { id: 2, img: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2000", title: "Urban Living", subtitle: "Curated Design" },
    { id: 3, img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000", title: "Premium Quality", subtitle: "Built to Last" },
  ];

  const scrollToProducts = () => {
    trendingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- OPTIMIZED DATA FETCHING ---
  const [homeData, setHomeData] = useState({ trending: [], newArrivals: [], bestSellers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        console.log("HOME: Fetching products...");
        setLoading(true);
        const { data } = await api.get('/products/home');
        console.log("HOME: Data received:", data);
        if (data) {
          setHomeData(data);
        } else {
          console.warn("HOME: Received empty data from API");
        }
      } catch (err) {
        console.error("HOME: Data Fetch Error:", err);
        setError("Failed to fetch products. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  useEffect(() => {
    const fetchLooks = async () => {
      try {
        const { data } = await api.get('/looks');
        if (data && data.length > 0) {
          setCommunityLooks(data.slice(0, 12));
        }
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

  const productSections = [
    { id: 'most-viewed', title: 'Trending Now', subtitle: 'Most Explored Artifacts', items: homeData.trending, link: '/shop?sort=mostViewed', ref: trendingRef, bg: 'bg-zinc-50' },
    { id: 'best-sellers', title: 'Best Sellers', subtitle: 'The Most Iconic Pieces', items: homeData.bestSellers, link: '/shop?best=true', ref: bestSellersSectionRef, bg: 'bg-white' },
    { id: 'new-arrivals', title: 'New Arrivals', subtitle: 'Fresh Studio Drops', items: homeData.newArrivals, link: '/shop?new=true', ref: newArrivalRef, bg: 'bg-white' }
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
                    <p className="text-white/80 text-[7px] md:text-base font-black uppercase tracking-mega mb-4">{slide.subtitle}</p>
                    <h2 className="text-white text-xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-6 leading-tighter">{slide.title}</h2>
                    <button onClick={scrollToProducts} className="bg-white text-black px-8 py-3 text-[8px] md:text-[10px] font-black uppercase tracking-extrawide hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">Explore SLOOK</button>
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
          <Marquee text="Premium Artifacts • High Quality • Studio Drops • Handpicked Originals •" />
        </>
      )}

      {productSections.map((section, idx) => (
        <React.Fragment key={section.id}>
          {(activeView === 'all' || activeView === section.id) && (
            <Reveal width="100%" delay={idx * 0.1}>
              <section id={section.id} className={`container-responsive relative ${section.bg} ${activeView !== 'all' ? 'pt-44 md:pt-52 pb-24 md:pb-32' : 'py-12 md:py-24'}`}>
                <div className="flex justify-between items-end mb-12 px-2">
                  <div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">{section.title}</h2>
                    <p className="text-[9px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">{section.subtitle}</p>
                  </div>
                  <Link to={section.link} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-zinc-200 pb-1 hover:border-black hover:text-zinc-600 transition-all">View All</Link>
                </div>

                <div className="relative flex items-center group/scroller">
                  {section.items.length > 0 && activeView === 'all' && (
                    <>
                      <button onClick={() => scroll(section.ref, 'left')} className="absolute -left-2 md:-left-20 top-[30%] md:top-[40%] -translate-y-1/2 z-50 text-black hover:text-zinc-600 transition-all hover:scale-110 active:scale-95"><ChevronLeft className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} /></button>
                      <button onClick={() => scroll(section.ref, 'right')} className="absolute -right-2 md:-right-20 top-[30%] md:top-[40%] -translate-y-1/2 z-50 text-black hover:text-zinc-600 transition-all hover:scale-110 active:scale-95"><ChevronRight className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} /></button>
                    </>
                  )}
                  {error && idx === 0 && (
                    <div className="w-full py-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center gap-4">
                      <p className="font-bold uppercase tracking-widest text-xs">{error}</p>
                      <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Retry Connection</button>
                    </div>
                  )}
                  <div ref={section.ref} className={`${activeView === 'all' ? 'flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-0 pb-10 w-full' : 'grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-8'}`}>
                    {section.items.length > 0 ? (
                      section.items.filter(p => p && p._id).map((product) => (
                        <div key={product._id} className={`${activeView === 'all' ? 'w-[181.03px] md:w-auto md:min-w-[20%] lg:min-w-[16%] snap-start md:snap-start flex-shrink-0' : 'w-full'}`}><ProductCard product={product} /></div>
                      ))
                    ) : !loading && !error ? (
                      <div className="w-full py-12 text-center border-2 border-dashed border-zinc-100 rounded-3xl col-span-full">
                        <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-[10px]">No Artifacts Curated Yet</p>
                      </div>
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


        </React.Fragment>
      ))}

      {activeView === 'all' && (
        <Reveal width="100%">
          <FeaturedReviews />
        </Reveal>
      )}

      {activeView === 'all' && (
        <Reveal width="100%">
          <section className="container-responsive py-12 md:py-24 relative bg-white border-t border-zinc-100 group/community">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Styled by You</h2>
                <p className="text-[8px] md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Community Curation #StyledBySLOOK</p>
              </div>
              <Link to="/looks" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-zinc-200 pb-1 hover:border-black hover:text-zinc-600 transition-all">View All Looks</Link>
            </div>

            <div className="relative">
              {/* Navigation Arrows */}
              <button 
                onClick={() => communityRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
                className="absolute -left-2 md:-left-12 top-1/2 -translate-y-1/2 z-50 p-2 md:p-3 bg-white border border-zinc-100 rounded-full shadow-xl transition-all hover:scale-110 active:scale-90 text-black"
              >
                <ChevronLeft size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
              </button>
              <button 
                onClick={() => communityRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
                className="absolute -right-2 md:-right-12 top-1/2 -translate-y-1/2 z-50 p-2 md:p-3 bg-white border border-zinc-100 rounded-full shadow-xl transition-all hover:scale-110 active:scale-90 text-black"
              >
                <ChevronRight size={20} className="md:w-6 md:h-6" strokeWidth={2.5} />
              </button>

              <div 
                ref={communityRef}
                className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 px-1"
              >
                {communityLooks.map((look) => {
                  const u = look.user;
                  
                  // ADVANCED ATTRIBUTION LOGIC
                  const displayHandle = (u ? `${u.firstName} ${u.lastName}`.trim() : look.userName) || "House Stylist";
                  
                  // Format for display (lowercase handle style)
                  const formattedHandle = displayHandle.toLowerCase().replace(/\s+/g, '');
                  
                  return (
                    <Link 
                      key={look._id} 
                      to="/looks" 
                      className="relative min-w-[240px] md:min-w-[320px] aspect-[3/4] overflow-hidden rounded-3xl group border border-zinc-100 bg-zinc-50 snap-start"
                    >
                      <img 
                        src={resolveMediaURL(look.image)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-1000" 
                        alt="" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {/* Attribution Bubble - Always Visible */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
                          <div className="w-5 h-5 rounded-full bg-zinc-900 border border-white/30 flex items-center justify-center overflow-hidden uppercase">
                            {u?.avatar ? (
                              <img src={resolveMediaURL(u.avatar)} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[7px] text-white font-black">{(displayHandle[0] || "S").toUpperCase()}</span>
                            )}
                          </div>
                          <p className="text-[8px] font-black text-black uppercase tracking-widest line-clamp-1">
                            @{formattedHandle}
                          </p>
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          View Look
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        </Reveal>
      )}

      {activeView === 'all' && (
        <Reveal width="100%">
          <section className="container-responsive py-12 md:py-24 bg-zinc-950 text-white overflow-hidden relative rounded-[3rem] mb-12">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full -mr-32 -mt-32"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 relative z-10 px-8">
              <div className="space-y-4">
                <p className="text-amber-500 text-[8px] md:text-[10px] font-black uppercase tracking-mega">Elite Rewards</p>
                <h2 className="text-base md:text-7xl font-black uppercase tracking-tighter leading-none">Loyalty <br /> <span className="text-zinc-800">Milestones.</span></h2>
              </div>
              <div className="max-w-xs">
                <p className="text-zinc-500 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6">Earn coins on every artifact purchase. Unlock exclusive tiers and baseline rewards.</p>
                <Link to="/account/loyalty" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-white text-black px-8 py-4 rounded-full hover:bg-zinc-200 transition-all">View My Ledger</Link>
              </div>
            </div>

            <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar pb-10 px-8 snap-x relative z-10">
              {[
                { tier: 'Bronze', spend: '0', color: 'from-orange-700 to-orange-900', perk: 'Base Tier' },
                { tier: 'Silver', spend: '5,000', color: 'from-zinc-300 to-zinc-500', perk: '1.2x Coins' },
                { tier: 'Gold', spend: '20,000', color: 'from-amber-400 to-amber-600', perk: '1.5x Coins' },
                { tier: 'Platinum', spend: '50,000', color: 'from-zinc-100 to-zinc-400', perk: '2x Coins' }
              ].map((m, i) => (
                <div key={i} className="min-w-[280px] bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] snap-center group hover:border-amber-500/30 transition-all">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} mb-8 shadow-lg group-hover:scale-110 transition-transform`}></div>
                  <h3 className="text-sm md:text-2xl font-black uppercase tracking-tight mb-2">Elite {m.tier}</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Unlocked at ₹{m.spend}</p>
                  <p className="text-xs font-black uppercase text-amber-500">{m.perk}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}


      {activeView === 'all' && user && recentlyViewed.length > 0 && (
        <Reveal width="100%">
          <section className="container-responsive py-12 md:py-24 relative bg-zinc-50 border-t border-zinc-100">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Recently Viewed</h2>
                <p className="text-sm md:text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Pick up where you left off</p>
              </div>
            </div>
            <div className="relative flex items-center group">
              <button onClick={() => scroll(recentlyViewedRef, 'left')} className="absolute -left-1 md:-left-20 top-[30%] md:top-[35%] -translate-y-1/2 z-50 text-black hover:text-zinc-600 transition-colors"><ChevronLeft className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} /></button>
              <button onClick={() => scroll(recentlyViewedRef, 'right')} className="absolute -right-1 md:-right-20 top-[30%] md:top-[35%] -translate-y-1/2 z-50 text-black hover:text-zinc-600 transition-colors"><ChevronRight className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} /></button>
              <div ref={recentlyViewedRef} className="flex gap-3 md:gap-4 w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-0 pb-10">
                {recentlyViewed.filter(p => p && p._id).map((product) => (
                  <div key={product._id} className="w-[181.03px] md:w-auto md:min-w-[20%] lg:min-w-[16%] snap-start md:snap-start flex-shrink-0"><ProductCard product={product} /></div>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      )}
      {recentlyViewed.length > 0 && activeView === 'all' && <AIStylist />}
    </div>
  );
};

export default Home;
