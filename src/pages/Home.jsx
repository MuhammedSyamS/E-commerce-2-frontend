import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import axios from 'axios';
import ProductCard from '../components/ProductCard'; 

const Home = () => {
  const location = useLocation();
  const [activeView, setActiveView] = useState('all'); 
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const scrollRef = useRef(null);
  const newArrivalRef = useRef(null);
  const bestSellersSectionRef = useRef(null); 

  const slides = [
    { id: 1, img: "https://images.pexels.com/photos/9461772/pexels-photo-9461772.jpeg?auto=compress&cs=tinysrgb&w=1600", title: "The 2026 Collection", subtitle: "Authentic 925 Silver" },
    { id: 2, img: "https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=1600", title: "Luxury Streetwear", subtitle: "Handcrafted Designs" },
    { id: 3, img: "https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg?auto=compress&cs=tinysrgb&w=1600", title: "Hallmarked Quality", subtitle: "Lifetime Purity" },
  ];

  const scrollToProducts = () => {
    bestSellersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Home Data Fetch Error:", err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.state?.filter) {
      setActiveView(location.state.filter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveView('all');
    }
  }, [location]);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000); 
    const promises = slides.map((slide) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = slide.img;
        img.onload = resolve;
        img.onerror = resolve; 
      });
    });
    Promise.all(promises).then(() => {
      setLoading(false);
      clearTimeout(timeout);
    });
  }, []);

  useEffect(() => {
    if (activeView === 'all') {
      const timer = setInterval(() => { nextSlide(); }, 5000);
      return () => clearInterval(timer);
    }
  }, [currentSlide, activeView]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const scroll = (ref, direction) => {
    if (ref.current) {
      const width = ref.current.offsetWidth;
      const scrollAmount = direction === 'left' ? -width * 0.8 : width * 0.8;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const bestSellers = products.filter(p => p.isBestSeller); 
  const newArrivals = products.filter(p => p.isNewArrival || !p.isBestSeller);

  if (loading) return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* --- MAIN HERO --- */}
      {activeView === 'all' && (
        <section className="relative w-full h-screen overflow-hidden bg-zinc-950">
          {slides.map((slide, index) => (
            <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
              <img src={slide.img} className={`w-full h-full object-cover transition-transform duration-[8000ms] ${index === currentSlide ? "scale-110" : "scale-100"}`} alt="" />
              <div className="absolute inset-0 flex items-center justify-center px-6 z-20">
                <div className="text-center">
                  <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.8em] mb-6">{slide.subtitle}</p>
                  <h2 className="text-white text-4xl md:text-7xl font-black uppercase tracking-[0.05em] mb-10 leading-tight">{slide.title}</h2>
                  <button onClick={scrollToProducts} className="bg-white text-black px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 cursor-pointer">Explore Studio</button>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 z-10"></div>
            </div>
          ))}
          
          <div className="absolute inset-0 z-30 flex items-center justify-between px-2 md:px-10 pointer-events-none">
            <button onClick={prevSlide} className="text-white/50 hover:text-white transition-colors pointer-events-auto">
              <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
            </button>
            <button onClick={nextSlide} className="text-white/50 hover:text-white transition-colors pointer-events-auto">
              <ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
            </button>
          </div>
        </section>
      )}

      {/* --- BEST SELLERS --- */}
      {(activeView === 'all' || activeView === 'best-sellers') && (
        <section ref={bestSellersSectionRef} className={`max-w-[1440px] mx-auto px-4 md:px-16 py-24 relative bg-white ${activeView !== 'all' ? 'pt-40' : ''}`}>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic transform -skew-x-3">Best Sellers</h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">The Most Iconic Pieces</p>
            </div>
          </div>

          <div className="relative flex items-center group">
            {activeView === 'all' && (
              <>
                <button onClick={() => scroll(scrollRef, 'left')} className="absolute -left-2 md:-left-20 top-[35%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-colors">
                  <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
                </button>
                <button onClick={() => scroll(scrollRef, 'right')} className="absolute -right-2 md:-right-20 top-[35%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-colors">
                  <ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
                </button>
              </>
            )}

            <div ref={scrollRef} className={`flex gap-6 md:gap-8 w-full ${activeView === 'all' ? 'overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 md:px-0' : 'flex-wrap justify-center'}`}>
              {bestSellers.map((product) => (
                <div key={product._id} className={`${activeView === 'all' ? 'min-w-[80%] sm:min-w-[45%] md:min-w-[28%] lg:min-w-[21%] snap-center md:snap-start' : 'w-[45%] md:w-[22%]'} flex-shrink-0`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- SECONDARY HERO (The MNC Brand Section) --- */}
      {activeView === 'all' && (
        <section className="relative w-full h-[60vh] md:h-[75vh] bg-zinc-900 overflow-hidden flex items-center">
          <div className="absolute inset-0">
            <img 
              src="https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=1600" 
              className="w-full h-full object-cover opacity-70" 
              alt="Brand Heritage" 
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent"></div>
          </div>
          <div className="container mx-auto px-6 md:px-16 relative z-10 text-white">
            <div className="max-w-3xl">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.6em] mb-4">Miso Studio Heritage</p>
              <h2 className="text-5xl md:text-9xl font-black uppercase leading-[0.85] mb-8 tracking-tighter italic">Timeless <br /> Purity.</h2>
              <p className="text-white/80 text-sm md:text-base font-medium max-w-md mb-10 leading-relaxed">
                Every piece is hallmarked for 925 purity, designed in our boutique studio to merge industrial minimalism with luxury craftsmanship.
              </p>
              <Link to="/shop" className="group flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] hover:gap-10 transition-all duration-500">
                Shop Full Collection <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- NEW ARRIVALS --- */}
      {(activeView === 'all' || activeView === 'new-arrivals') && (
        <section className={`max-w-[1440px] mx-auto px-4 md:px-16 py-24 relative bg-white ${activeView !== 'all' ? 'pt-40' : ''}`}>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic transform -skew-x-3">New Arrivals</h2>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-2">Fresh Studio Drops</p>
            </div>
          </div>

          <div className="relative flex items-center group">
            {activeView === 'all' && (
              <>
                <button onClick={() => scroll(newArrivalRef, 'left')} className="absolute -left-2 md:-left-20 top-[35%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-colors">
                  <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
                </button>
                <button onClick={() => scroll(newArrivalRef, 'right')} className="absolute -right-2 md:-right-20 top-[35%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-colors">
                  <ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
                </button>
              </>
            )}

            <div ref={newArrivalRef} className={`flex gap-6 md:gap-8 w-full ${activeView === 'all' ? 'overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-8 md:px-0' : 'flex-wrap justify-center'}`}>
              {newArrivals.map((product) => (
                <div key={product._id} className={`${activeView === 'all' ? 'min-w-[80%] sm:min-w-[45%] md:min-w-[28%] lg:min-w-[21%] snap-center md:snap-start' : 'w-[45%] md:w-[22%]'} flex-shrink-0`}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;