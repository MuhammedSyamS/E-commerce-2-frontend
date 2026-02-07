import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronLeft, ChevronRight, Heart, Shield, Bell } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios'; // We need axios directly for fetch

const Navbar = () => {
  const { toggleCart, user, isSearchOpen, toggleSearch, toggleAdminSidebar } = useStore();

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

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

  // FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/users/notifications?t=${Date.now()}`, config);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notif Fetch Fail");
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60s
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.token]);

  const markRead = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/users/notifications/${id}/read`, {}, config);
      // Update local state
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { }
  };

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
    setIsMenuOpen(false);
  };

  const cartCount = (user?.cart && Array.isArray(user.cart)) ? user.cart.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
  const wishlistCount = user?.wishlist?.length || 0;

  return (
    <div className={`fixed top-0 z-[100] transition-all duration-300 ease-in-out left-0 w-full`}>

      {/* --- TOP BANNER (FIXED ALIGNMENT) --- */}
      <div className="bg-black text-white h-10 flex items-center justify-center px-4">
        {/* Left Arrow */}
        <button onClick={handlePrev} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer flex-shrink-0">
          <ChevronLeft size={14} />
        </button>

        {/* Message Container - Now using Flex Centering */}
        <div className="h-full w-[280px] md:w-[400px] relative overflow-hidden mx-2">
          <div className={`w-full h-full flex items-center justify-center transition-all duration-300 transform ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <p className="font-black tracking-[0.2em] uppercase text-[9px] text-center">
              {messages[currentMsgIndex]}
            </p>
          </div>
        </div>

        {/* Right Arrow */}
        <button onClick={handleNext} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer flex-shrink-0">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* MAIN NAV */}
      <nav className={`transition-all duration-700 relative mx-4 mt-3 rounded-2xl border border-white/10 ${isScrolled || isMenuOpen || isAdminRoute ? 'bg-black/90 backdrop-blur-2xl shadow-xl' : 'bg-black/30 backdrop-blur-xl'}`}>
        <div className="w-full px-8 flex items-center h-20">

          {/* 1. LEFT SECTION (LOGO) */}
          <div className="flex-1 flex items-center gap-2 md:gap-4">
            {/* ADMIN TOGGLE (YouTube Style) */}
            {isAdminRoute && (
              <button onClick={toggleAdminSidebar} className="p-2 text-white hover:bg-white/10 rounded-full transition">
                <Menu size={24} />
              </button>
            )}

            {!isAdminRoute && (
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-white mr-0">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}

            <Link to="/" onClick={() => handleFilterNavigation('all')} className="text-3xl font-black tracking-tighter text-white uppercase transform scale-y-110 flex items-center gap-2">
              {/* HIDE 'SLOOK' FOR MANAGERS TO SAVE SPACE */}
              {user?.role !== 'manager' && <span>SLOOK</span>}

              {/* DYNAMIC ROLE SUFFIX */}
              {user?.role === 'admin' || user?.isAdmin ? (
                <span className="text-red-500 drop-shadow-md">ADMIN</span>
              ) : user?.role === 'manager' ? (
                <span className="text-blue-400 drop-shadow-md">MANAGER</span>
              ) : null}
            </Link>
          </div>

          {/* 2. CENTER SECTION (LINKS) */}
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black tracking-[0.3em] uppercase">
            <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white hover:text-zinc-400 transition whitespace-nowrap">NEW ARRIVAL</button>
            <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white hover:text-zinc-400 transition whitespace-nowrap">BEST SELLER</button>
            <Link to="/shop" className="text-white hover:text-zinc-400 transition">Shop</Link>
          </div>

          {/* 3. RIGHT SECTION (ICONS) */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-6">
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

            {/* NOTIFICATIONS BELL */}
            {user && (
              <div className="relative group">
                <button onClick={() => setShowNotif(!showNotif)} className="relative outline-none flex items-center justify-center">
                  <Bell className={`w-5 h-5 transition ${showNotif ? 'text-zinc-400' : 'text-white hover:text-zinc-400'}`} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* NOTIFICATION DROPDOWN */}
                {showNotif && (
                  <div className="absolute right-0 top-full pt-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-80 border border-zinc-100 animate-in slide-in-from-top-4 overflow-hidden">
                      <div className="p-4 border-b border-zinc-50 flex justify-between items-center bg-zinc-50">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Notifications</h3>
                        <button onClick={() => setShowNotif(false)}><X size={14} /></button>
                      </div>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        {!Array.isArray(notifications) || notifications.length === 0 ? (
                          <p className="p-6 text-center text-[10px] font-bold text-zinc-400 uppercase">No new alerts</p>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n._id}
                              onClick={() => markRead(n._id)}
                              className={`p-4 border-b border-zinc-50 hover:bg-zinc-50 transition cursor-pointer ${n.isRead ? 'opacity-50' : 'bg-white'}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'promo' ? 'bg-purple-500' : (n.type === 'order' ? 'bg-black' : 'bg-blue-500')}`}></div>
                                <div>
                                  <p className="text-xs font-bold text-black mb-1">{n.title}</p>
                                  <p className="text-[10px] text-zinc-500 leading-tight">{n.message}</p>
                                  <p className="text-[9px] text-zinc-300 mt-2 font-mono">{new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ADMIN / MANAGER PANEL LINK */}
            {(() => {
              if (user?.role === 'admin' || user?.isAdmin) {
                return (
                  <Link to="/admin" className="relative group" title="Admin Panel">
                    <Shield className="w-5 h-5 text-white transition group-hover:text-zinc-400" />
                  </Link>
                );
              }
              if (user?.role === 'manager') {
                return (
                  <Link to="/admin" className="relative group" title="Manager Panel">
                    <div className="relative">
                      <Shield className="w-5 h-5 text-purple-400 transition group-hover:text-white" />
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-purple-500 rounded-full border border-black"></div>
                    </div>
                  </Link>
                );
              }
              return null;
            })()}

            {/* USER PROFILE DROPDOWN */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 outline-none">
                  <User className="w-5 h-5 transition-all text-white fill-white scale-110" />
                </button>

                {/* DROPDOWN MENU */}
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-64 border border-zinc-100 animate-in slide-in-from-top-4">

                    {/* HEADER */}
                    <div className="border-b border-zinc-100 pb-4 mb-4">
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="font-black text-sm truncate">{user.firstName} {user.lastName}</p>
                    </div>

                    {/* LINKS */}
                    <div className="space-y-3">
                      <Link to="/account" className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                        My Account
                      </Link>
                      <Link to="/my-orders" className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                        My Orders
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                        Wishlist
                      </Link>
                      <Link to="/account/settings" className="flex items-center gap-3 text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                        Settings
                      </Link>
                    </div>

                    {/* LOGOUT */}
                    <div className="border-t border-zinc-100 mt-4 pt-4">
                      <button
                        onClick={() => { useStore.getState().logout(); navigate('/login'); }}
                        className="w-full text-left text-xs font-black uppercase tracking-wide text-red-500 hover:text-red-700 hover:pl-2 transition-all"
                      >
                        Log Out
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login">
                <User className="w-5 h-5 text-white hover:text-zinc-400 transition" />
              </Link>
            )}

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