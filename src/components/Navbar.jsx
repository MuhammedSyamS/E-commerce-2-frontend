import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const { cart, toggleCart, user } = useStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  // --- TOP BANNER LOGIC ---
  const messages = ["Save 5% on prepaid orders!", "Free Shipping on orders over ₹1999", "New Collection Drops Every Friday"];
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => { handleNext(); }, 4000); 
    return () => clearInterval(timer);
  }, [currentMsgIndex]);

  // --- SCROLL EFFECT ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentMsgIndex((prev) => (prev + 1) % messages.length);
      setIsAnimating(false);
    }, 300);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentMsgIndex((prev) => (prev - 1 + messages.length) % messages.length);
      setIsAnimating(false);
    }, 300);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] transition-all duration-500">
      
      {/* --- TOP BANNER --- */}
      <div className="bg-black text-white h-10 flex items-center justify-center gap-2 text-xs">
        <button onClick={handlePrev} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer"><ChevronLeft size={14} /></button>
        <div className="h-full w-[280px] md:w-[350px] relative overflow-hidden flex items-center justify-center">
          <p className={`font-bold tracking-[0.2em] uppercase text-center w-full absolute transition-all duration-300 transform ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            {messages[currentMsgIndex]}
          </p>
        </div>
        <button onClick={handleNext} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer"><ChevronRight size={14} /></button>
      </div>
      
      {/* --- MAIN NAV (INCREASED BLUR & OPACITY) --- */}
      <nav className={`transition-all duration-700 relative mx-4 mt-3 rounded-2xl border border-white/10 ${
        isScrolled 
        ? 'bg-black/60 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]' // Deep blur on scroll
        : 'bg-black/30 backdrop-blur-xl shadow-xl' // Heavy frost at the top
      }`}>
        <div className="w-full px-8 flex items-center justify-between relative h-20">
          
          <div className="md:hidden"><Menu className="w-6 h-6 text-white" /></div>

          <Link to="/" className="text-3xl font-black tracking-tighter text-white uppercase transform scale-y-110">miso</Link>

          <div className="hidden md:flex gap-12 text-xs font-bold tracking-[0.2em] uppercase absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="text-white hover:text-zinc-400 transition">Home</Link>
            <Link to="/shop" className="text-white hover:text-zinc-400 transition">Best Sellers</Link>
            <Link to="/shop" className="text-white hover:text-zinc-400 transition">Shop</Link>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}><Search className="w-5 h-5 text-white hover:text-zinc-400" /></button>
            <Link to="/wishlist"><Heart className="w-5 h-5 text-white hover:text-zinc-400" /></Link>
            <Link to={user ? "/account" : "/login"}><User className={`w-5 h-5 ${user ? 'text-green-400' : 'text-white'}`} /></Link>
            <div className="relative cursor-pointer group" onClick={toggleCart}>
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">{cartCount}</span>}
            </div>
          </div>
        </div>

        {/* SEARCH BAR DROPDOWN */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white text-black p-5 rounded-b-2xl shadow-2xl z-50">
            <form onSubmit={(e) => { e.preventDefault(); setIsSearchOpen(false); }} className="container mx-auto flex items-center gap-4">
              <Search className="text-gray-400 w-5 h-5" /><input type="text" placeholder="SEARCH COLLECTION..." className="flex-1 outline-none text-sm font-bold uppercase tracking-widest" autoFocus />
              <button type="button" onClick={() => setIsSearchOpen(false)}><X className="w-5 h-5" /></button>
            </form>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;