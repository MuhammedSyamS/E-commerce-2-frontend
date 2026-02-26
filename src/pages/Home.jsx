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


const Home = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('all');
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const { user } = useStore();

  const newArrivalRef = useRef(null);
  const bestSellersSectionRef = useRef(null);
  const trendingRef = useRef(null);
  const recentlyViewedRef = useRef(null);

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
          <Marquee text="Premium Artifacts • High Quality • Studio Drops • Handpicked Originals •" />
        </>
      )}

      {productSections.map((section, idx) => (
        <React.Fragment key={section.id}>
          {(activeView === 'all' || activeView === section.id) && (
            <Reveal width="100%" delay={idx * 0.1}>
              <section id={section.id} className={`container-responsive py-12 md:py-24 relative ${section.bg} ${activeView !== 'all' ? 'pt-40' : ''}`}>
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
                        <div key={product._id} className={`${activeView === 'all' ? 'min-w-[70%] sm:min-w-[45%] md:min-w-[28%] lg:min-w-[21%] snap-center md:snap-start' : 'w-[45%] md:w-[22%]'} flex-shrink-0`}><ProductCard product={product} /></div>
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
                <div className="container-responsive relative z-10 text-white">
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


      {activeView === 'all' && user && recentlyViewed.length > 0 && (
        <Reveal width="100%">
          <section className="container-responsive py-12 md:py-24 relative bg-zinc-50 border-t border-zinc-100">
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
    </div>
  );
};

export default Home;
