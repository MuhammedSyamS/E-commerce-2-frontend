import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useStore } from '../store/useStore';

const Navbar = () => {
  const { cart, toggleCart, user } = useStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
      {/* Top Banner */}
      <div className="bg-black text-white text-center py-2 text-[10px] md:text-xs font-bold tracking-widest uppercase">
        Save 5% on prepaid orders!
      </div>
      
      {/* Main Nav - Background set to dark so white text is visible */}
      <nav className="bg-[#454545bd] transition-all duration-300 relative">
        {/* Reduced padding (py-3) to make navbar smaller */}
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Menu className="md:hidden w-6 h-6 text-white" />

          {/* Logo - Pure White */}
          <Link to="/" className="text-3xl font-bold tracking-tighter text-white">miso</Link>

          {/* Desktop Links - Pure White Text */}
          <div className="hidden md:flex gap-8 text-[13px] font-bold tracking-wider uppercase">
            <Link to="/" className="text-white hover:text-gray-300 transition">Home</Link>
            <Link to="/shop" className="text-white hover:text-gray-300 transition">Best Sellers</Link>
            <Link to="/shop" className="text-white hover:text-gray-300 transition">Shop</Link>
          </div>

          {/* Icons - Pure White */}
          <div className="flex items-center gap-6">
            
            {/* SEARCH ICON */}
            <button onClick={() => setIsSearchOpen(!isSearchOpen)}>
               <Search className="w-5 h-5 cursor-pointer text-white" />
            </button>

            {/* LOGIN ICON */}
            <Link to={user ? "/account" : "/login"}>
              <User className={`w-5 h-5 cursor-pointer ${user ? 'text-green-400' : 'text-white'}`} />
            </Link>

            {/* CART ICON */}
            <div className="relative cursor-pointer group" onClick={toggleCart}>
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH BAR DROPDOWN */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-white text-black border-b border-gray-200 p-3 animate-slide-in shadow-lg">
            <form onSubmit={handleSearch} className="container mx-auto flex items-center gap-4">
              <Search className="text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search for jewellery..." 
                className="flex-1 outline-none text-sm font-medium uppercase tracking-wider"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" onClick={() => setIsSearchOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;