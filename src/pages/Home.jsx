import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products'; // <--- IMPORTING LOCAL DATA

const Home = () => {
  // Filter only items marked as Best Sellers
  const bestSellers = products.filter(p => p.isBestSeller);

  return (
    <div className="bg-white min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative h-[550px] bg-[#f8f8f8] flex items-center justify-center overflow-hidden">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 z-10 pt-10 md:pt-0 text-center md:text-left">
            <h1 className="text-6xl md:text-8xl font-handwriting transform -rotate-2 text-black leading-none mb-2">
              Hi, I'm Sonia
            </h1>
            <h2 className="text-5xl md:text-7xl font-handwriting transform -rotate-3 text-black">
              I cook <span className="underline decoration-4 decoration-black underline-offset-4">jewellery</span>
            </h2>
            <Link to="/shop" className="inline-block mt-8 bg-black text-white px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition">
              View Collection
            </Link>
          </div>
          <div className="md:w-1/2 mt-8 md:mt-0 flex justify-center">
             {/* Placeholder for the character image */}
             <img 
               src="https://images.unsplash.com/photo-1515463138280-67d1dcbf3175?auto=format&fit=crop&q=80&w=600" 
               alt="Sonia Style" 
               className="w-[300px] md:w-[400px] h-auto object-contain mix-blend-multiply contrast-125 filter grayscale"
             />
          </div>
        </div>
      </section>

      {/* BEST SELLERS SECTION */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex justify-between items-end mb-8 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Best Sellers</h2>
          <Link to="/shop" className="text-xs font-bold underline uppercase">View All</Link>
        </div>
        
        {/* THE GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* "REAL SILVER" BANNER */}
      <section className="bg-black text-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tighter uppercase">
            Real Silver For Real You
          </h2>
          <p className="text-gray-400 mb-10 text-lg font-light max-w-xl mx-auto">
            You asked, We delivered. Handcrafted hallmarked 925 sterling silver. 
            For those who don't fake the flex.
          </p>
          <Link to="/shop" className="inline-block border border-white px-10 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;