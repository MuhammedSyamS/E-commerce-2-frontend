import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const { toggleCart, user, isSearchOpen, toggleSearch } = useStore();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // NEW: Track mobile menu state
  const navigate = useNavigate();

  // --- TOP BANNER LOGIC ---
  const messages = ["Save 5% on prepaid orders!", "Free Shipping on orders over ₹1999", "New Collection Drops Every Friday"];
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => { handleNext(); }, 4000);
    return () => clearInterval(timer);
  }, [currentMsgIndex]);

  useEffect(() => {
    const handleScroll = () => { setIsScrolled(window.scrollY > 20); };
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

  const handleFilterNavigation = (viewType) => {
    navigate('/', { state: { filter: viewType } });
    setIsMenuOpen(false); // Close menu on click
  };

  const cartCount = user?.cart?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0;
  const wishlistCount = user?.wishlist?.length || 0;

  return (
    <div className="fixed top-0 left-0 w-full z-[100] transition-all duration-500">
      {/* TOP BANNER */}
      <div className="bg-black text-white h-10 flex items-center justify-center gap-2 text-xs">
        <button onClick={handlePrev} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
          <ChevronLeft size={14} />
        </button>
        <div className="h-full w-[280px] md:w-[350px] relative overflow-hidden flex items-center justify-center">
          <p className={`font-black tracking-[0.2em] uppercase text-center w-full absolute transition-all duration-300 transform ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            {messages[currentMsgIndex]}
          </p>
        </div>
        <button onClick={handleNext} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* MAIN NAV */}
      <nav className={`transition-all duration-700 relative mx-4 mt-3 rounded-2xl border border-white/10 ${isScrolled || isMenuOpen ? 'bg-black/90 backdrop-blur-2xl shadow-xl' : 'bg-black/30 backdrop-blur-xl'}`}>
        <div className="w-full px-8 flex items-center justify-between h-20">
          
          {/* MOBILE MENU TOGGLE */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-white">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link to="/" onClick={() => handleFilterNavigation('all')} className="text-3xl font-black tracking-tighter text-white uppercase transform scale-y-110">
            miso
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-12 text-xs font-bold tracking-[0.2em] uppercase absolute left-1/2 transform -translate-x-1/2">
            <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white hover:text-zinc-400 transition">NEW ARRIVAL</button>
            <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white hover:text-zinc-400 transition">BEST SELLER</button>
            <Link to="/shop" className="text-white hover:text-zinc-400 transition">Shop</Link>
          </div>

          {/* Icons Group */}
          <div className="flex items-center gap-6">
            <button onClick={toggleSearch} className="relative group">
              <Search className="w-5 h-5 text-white group-hover:text-zinc-400 transition" />
            </button>
            
            <Link to="/wishlist" className="relative group">
              <Heart className={`w-5 h-5 transition ${wishlistCount > 0 ? 'text-white fill-white' : 'text-white group-hover:text-zinc-400'}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to={user ? "/account" : "/login"}>
              <User className={`w-5 h-5 transition-all ${user ? 'text-white fill-white scale-110' : 'text-white hover:text-zinc-400'}`} />
            </Link>

            <div className="relative cursor-pointer group" onClick={toggleCart}>
              <ShoppingBag className="w-5 h-5 text-white transition group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 w-full bg-black/95 backdrop-blur-3xl rounded-3xl p-10 flex flex-col gap-8 border border-white/10 animate-in slide-in-from-top duration-500">
            <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white text-lg font-black uppercase tracking-widest text-left border-b border-white/5 pb-4">New Arrivals</button>
            <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white text-lg font-black uppercase tracking-widest text-left border-b border-white/5 pb-4">Best Sellers</button>
            <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-white text-lg font-black uppercase tracking-widest border-b border-white/5 pb-4">Shop All</Link>
            <Link to="/account" onClick={() => setIsMenuOpen(false)} className="text-white text-lg font-black uppercase tracking-widest">My Account</Link>
          </div>
        )}

        {/* SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="absolute top-0 left-0 w-full h-20 bg-white text-black rounded-2xl flex items-center px-8 z-[110] animate-in slide-in-from-top duration-300">
            <Search className="text-zinc-400 w-5 h-5" />
            <input 
              autoFocus 
              type="text" 
              placeholder="SEARCH THE SILVER STUDIO..." 
              className="flex-1 bg-transparent outline-none px-4 text-xs font-black uppercase tracking-widest" 
            />
            <button onClick={toggleSearch}><X className="w-5 h-5 text-black" /></button>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;