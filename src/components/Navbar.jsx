import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const { cart, toggleCart, user } = useStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // --- TOP BANNER LOGIC ---
  const messages = [
    "Save 5% on prepaid orders!",
    "Free Shipping on orders over ₹1999",
    "New Collection Drops Every Friday"
  ];
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000); 
    return () => clearInterval(timer);
  }, [currentMsgIndex]);

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
  // ------------------------

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/shop');
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="sticky top-0 z-50">
      
      {/* --- TOP BANNER (Increased Height to h-10) --- */}
      <div className="bg-black text-white h-10 flex items-center justify-center gap-2 text-xs">
        <button onClick={handlePrev} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
          <ChevronLeft size={14} />
        </button>

        <div className="h-full w-[280px] md:w-[350px] relative overflow-hidden flex items-center justify-center">
          <p 
            className={`font-bold tracking-[0.2em] uppercase text-center w-full absolute transition-all duration-300 ease-in-out transform ${
              isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            {messages[currentMsgIndex]}
          </p>
        </div>

        <button onClick={handleNext} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
          <ChevronRight size={14} />
        </button>
      </div>
      
      {/* --- MAIN NAV (Increased Height to h-20) --- */}
      <nav className="bg-[#454545] text-white transition-all duration-300 relative mx-4 mt-3 rounded-2xl shadow-xl">
        {/* Increased vertical padding (py-0) and set fixed height (h-20) for a thicker bar */}
        <div className="w-full px-8 flex items-center justify-between relative h-20">
          
          {/* Mobile Menu */}
          <div className="md:hidden">
            <Menu className="w-6 h-6 text-white" />
          </div>

          {/* Logo (Larger Text) */}
          <Link to="/" className="text-3xl font-black tracking-tighter text-white uppercase transform scale-y-110">
            miso
          </Link>

          {/* Desktop Links (Larger Text & Spacing) */}
          <div className="hidden md:flex gap-12 text-xs font-bold tracking-[0.2em] uppercase absolute left-1/2 transform -translate-x-1/2">
            <Link to="/" className="text-white hover:text-gray-200 transition">Home</Link>
            <Link to="/shop" className="text-white hover:text-gray-200 transition">Best Sellers</Link>
            <Link to="/shop" className="text-white hover:text-gray-200 transition">Shop</Link>
          </div>

          {/* Icons (Larger Icons) */}
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
               <Search className="w-5 h-5 cursor-pointer text-white hover:text-gray-200 transition-colors" />
            </button>

            <Link to={user ? "/account" : "/login"}>
              <User className={`w-5 h-5 cursor-pointer transition-colors ${user ? 'text-green-400' : 'text-white hover:text-gray-200'}`} />
            </Link>

            <div className="relative cursor-pointer group" onClick={toggleCart}>
              <ShoppingBag className="w-5 h-5 text-white hover:text-gray-200 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH BAR DROPDOWN (Curved Bottom) */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white text-black border-b border-gray-200 p-5 rounded-b-2xl shadow-2xl z-50">
            <form onSubmit={handleSearch} className="container mx-auto flex items-center gap-4">
              <Search className="text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="WHAT ARE YOU LOOKING FOR?" 
                className="flex-1 outline-none text-sm font-bold uppercase tracking-wider placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" onClick={() => setIsSearchOpen(false)}>
                <X className="w-5 h-5 hover:text-red-500 transition" />
              </button>
            </form>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;