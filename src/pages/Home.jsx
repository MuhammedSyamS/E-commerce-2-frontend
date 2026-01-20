import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products'; 
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Home = () => {
  const slides = [
    { 
      id: 1, 
      img: "https://images.pexels.com/photos/9461772/pexels-photo-9461772.jpeg?auto=compress&cs=tinysrgb&w=1600", 
      title: "The 2026 Collection", 
      subtitle: "Authentic 925 Silver" 
    },
    { 
      id: 2, 
      img: "https://images.pexels.com/photos/10972439/pexels-photo-10972439.jpeg?auto=compress&cs=tinysrgb&w=1600", 
      title: "Luxury Streetwear", 
      subtitle: "Handcrafted Designs" 
    },
    { 
      id: 3, 
      img: "https://images.pexels.com/photos/1453008/pexels-photo-1453008.jpeg?auto=compress&cs=tinysrgb&w=1600", 
      title: "Hallmarked Quality", 
      subtitle: "Lifetime Purity" 
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const promises = slides.map((src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src.img;
        img.onload = resolve;
        img.onerror = reject;
      });
    });
    Promise.all(promises).then(() => setLoading(false)).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => { nextSlide(); }, 5000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 8); 

  if (loading) return (
    <div className="h-screen w-full bg-black flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white overflow-x-hidden">
      
      <section className="relative w-full h-screen overflow-hidden bg-zinc-950">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img 
              src={slide.img} 
              alt={slide.title}
              className={`w-full h-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
                index === currentSlide ? "scale-110" : "scale-100"
              }`}
            />
            
            <div className="absolute inset-0 flex items-center justify-center px-6 z-20">
              <div className={`text-center max-w-4xl transition-all duration-1000 delay-300 transform ${
                index === currentSlide ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
              }`}>
                <p className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-[0.8em] mb-6 drop-shadow-md">
                  {slide.subtitle}
                </p>
                {/* --- REDUCED SIZE HERE: From text-9xl to text-7xl --- */}
                <h2 className="text-white text-4xl md:text-7xl font-black uppercase tracking-[0.05em] mb-10 leading-tight drop-shadow-2xl">
                  {slide.title}
                </h2>
                <Link 
                  to="/shop" 
                  className="inline-block bg-white text-black px-12 py-4 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-black hover:text-white transition-all duration-500 shadow-2xl active:scale-95"
                >
                  Explore Studio
                </Link>
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none z-10"></div>
          </div>
        ))}

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-3">
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/80 to-transparent animate-pulse"></div>
        </div>

        <div className="absolute inset-0 z-30 flex items-center justify-between px-4 md:px-10 pointer-events-none">
          <button onClick={prevSlide} className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto border border-white/5">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md transition-all pointer-events-auto border border-white/5">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Content Section below the hero */}
      <section className="container mx-auto px-4 md:px-10 py-24 relative z-40 bg-white">
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-black mb-16">Best Sellers</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-x-12 md:gap-y-20">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;