import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Heart, Bell, User, ShoppingBag, Menu, X,
  ChevronLeft, ChevronRight, Shield,
  BadgePercent, Info, Zap
} from 'lucide-react';
import { useStore } from '../store/useStore';
import api from '../api/instance';
import Price from './Price'; // Assuming Price component exists or needs to be handled
import { io } from 'socket.io-client';

const Navbar = () => {
  const { toggleCart, user, isSearchOpen, toggleSearch, toggleAdminSidebar, currency, setCurrency, currencyRates, cart } = useStore();

  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : 0;

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = React.useRef(null);

  // SEARCH SUGGESTIONS
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [searchTimer, setSearchTimer] = useState(null);

  const handleSearchInput = (val) => {
    if (searchTimer) clearTimeout(searchTimer);
    if (!val) {
      setSuggestions({ products: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/search?keyword=${val}`);
        setSuggestions(data || { products: [], categories: [] });
      } catch (error) {
        console.error("Search Error:", error);
        setSuggestions({ products: [], categories: [] });
      }
    }, 300); // 300ms debounce
    setSearchTimer(timer);
  };

  // Keyboard Shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !isSearchOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const isAdminRoute = location.pathname.startsWith('/admin');

  // ... (existing code)


  // SEARCH OVERLAY


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
      const { data } = await api.get(`/users/notifications?t=${Date.now()}`);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Notif Fetch Fail");
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // --- SOCKET.IO ---
    let socket;
    if (user?.token) {
      const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin;
      socket = io(socketUrl);

      socket.on('connect', () => {
        console.log("Connected to Notifications Socket");
        socket.emit('join-user-room', user._id);
      });

      socket.on('notification', (notif) => {
        setNotifications(prev => [notif, ...(Array.isArray(prev) ? prev : [])]);
        // Optional: show a toast if you have access to it here, 
        // but Navbar usually doesn't have useToast unless imported.
        // Let's check if useToast is available in useStore or similar.
      });

      socket.on('ticket-reply', (data) => {
        // We could also trigger a fetch or just let 'notification' handle it
        console.log("Ticket Reply Received:", data);
      });
    }

    // Poll every 60s as fallback
    const interval = setInterval(fetchNotifications, 60000);
    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [user?.token, user?._id]);

  const handleNotificationClick = async (notif) => {
    // 1. Mark as read
    if (!notif.isRead) {
      try {
        await api.put(`/users/notifications/${notif._id}/read`, {});
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (err) { }
    }

    // 2. Navigate if URL exists
    // Robust check for data object
    const data = notif.data || {};
    let targetUrl = data.url || data.link;

    // FIX COLD DATA: If backend sent wrong URL structure, fix it here
    if (targetUrl && targetUrl.includes('/account/orders/')) {
      targetUrl = targetUrl.replace('/account/orders/', '/order/');
    }

    if (targetUrl) {
      console.log("Navigating to:", targetUrl);
      navigate(targetUrl);
      setShowNotif(false);
    } else if (notif.type === 'order') {
      // Fallback: If we have orderId but no URL, make one
      if (data.orderId) {
        navigate(`/order/${data.orderId}`);
      } else {
        navigate('/my-orders');
      }
      setShowNotif(false);
    } else {
      console.log("No URL found in notification", notif);
    }
  };

  // --- CLICK OUTSIDE TO CLOSE DROPDOWNS ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotif && !event.target.closest('.group')) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotif]);

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

  const guestCartCount = (cart && Array.isArray(cart)) ? cart.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
  const userCartCount = (user?.cart && Array.isArray(user.cart)) ? user.cart.reduce((acc, item) => acc + (item.quantity || 1), 0) : 0;
  const cartCount = user ? userCartCount : guestCartCount;

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
        <div className="h-full w-full max-w-[280px] md:max-w-[400px] relative overflow-hidden mx-2">
          <div className={`w-full h-full flex items-center justify-center transition-all duration-300 transform ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            <p className="font-black tracking-mega uppercase text-[8px] md:text-[9px] text-center">
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
      <nav className={`transition-all duration-700 relative border-b border-white/10 ${isScrolled || isMenuOpen || isAdminRoute ? 'bg-black/95 shadow-xl' : 'bg-black/40'}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center h-16 md:h-20">

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

            <Link to="/" onClick={() => handleFilterNavigation('all')} className="text-lg md:text-3xl font-black tracking-tighter text-white uppercase transform scale-y-110 flex items-center gap-2">
              {/* HIDE 'SLOOK' FOR MANAGERS TO SAVE SPACE */}
              {user?.role !== 'manager' && <span>SLOOK</span>}

              {/* DYNAMIC ROLE SUFFIX */}
              {user?.role === 'admin' || user?.isAdmin ? (
                <span className="text-red-500 drop-shadow-md text-xs md:text-sm">ADMIN</span>
              ) : user?.role === 'manager' ? (
                <span className="text-blue-400 drop-shadow-md text-xs md:text-sm">MANAGER</span>
              ) : null}
            </Link>
          </div>

          {/* 2. CENTER SECTION (LINKS) */}
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black tracking-[0.3em] uppercase">
            <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white hover:text-zinc-400 transition whitespace-nowrap">NEW ARRIVAL</button>
            <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white hover:text-zinc-400 transition whitespace-nowrap">BEST SELLER</button>
            <Link to="/community" className="text-white hover:text-zinc-400 transition group relative">
              COMMUNITY
              <span className="absolute -top-1 -right-4 bg-red-600 text-[6px] px-1 rounded animate-pulse text-white tracking-normal">LIVE</span>
            </Link>
            <Link to="/shop" className="text-white hover:text-zinc-400 transition">Shop</Link>
            <button
              onClick={() => navigate('/support')}
              className="text-white hover:text-zinc-400 transition whitespace-nowrap"
            >
              NEED HELP
            </button>
          </div>

          {/* 3. RIGHT SECTION (ICONS) */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-6 text-base md:text-[10px] font-black tracking-[0.3em] uppercase transition-all">
            <button onClick={toggleSearch} className="relative group p-2 rounded-full hover:bg-white/10 transition-all">
              <Search className="w-5 h-5 text-white group-hover:text-zinc-400 transition" />
            </button>

            {/* WISHLIST (Desktop Only) */}
            <Link to="/wishlist" className="hidden md:flex relative group p-2 rounded-full hover:bg-white/10 transition-all">
              <Heart className={`w-5 h-5 transition ${wishlistCount > 0 ? 'text-white fill-white' : 'text-white'}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-black text-[9px] w-3 h-3 flex items-center justify-center rounded-full font-black ring-2 ring-black">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CART (Desktop Only) */}
            <button onClick={toggleCart} className="hidden md:flex relative group p-2 rounded-full hover:bg-white/10 transition-all">
              <ShoppingBag className={`w-5 h-5 text-white transition hover:text-zinc-400 ${cartCount > 0 ? 'fill-white' : ''}`} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-white text-black text-[9px] w-3 h-3 flex items-center justify-center rounded-full font-black ring-2 ring-black">
                  {cartCount}
                </span>
              )}
            </button>

            {/* NOTIFICATIONS BELL */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  if (window.innerWidth < 768) {
                    navigate('/account/notifications');
                  } else {
                    setShowNotif(!showNotif);
                  }
                }}
                className="relative outline-none flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all"
              >
                <Bell className={`w-5 h-5 transition ${showNotif ? 'text-zinc-400' : 'text-white'}`} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] w-3 h-3 flex items-center justify-center rounded-full font-black animate-pulse ring-2 ring-black">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* NOTIFICATION DROPDOWN */}
              {showNotif && (
                <div className="absolute right-0 top-full mt-4 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl w-[90vw] max-w-[20rem] border border-white/20 overflow-hidden ring-1 ring-black/5">
                    <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-white/50">
                      <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Notifications</h3>
                      <button onClick={() => setShowNotif(false)} className="hover:bg-zinc-100 p-1 rounded-full transition"><X size={14} /></button>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar bg-white/30">
                      {!Array.isArray(notifications) || notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center gap-2">
                          <Bell size={24} className="text-zinc-200" />
                          <p className="text-sm md:text-[10px] font-bold text-zinc-400 uppercase">No new alerts</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n._id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-4 border-b border-zinc-50 hover:bg-white/80 transition cursor-pointer relative group/item ${n.isRead ? 'opacity-60 bg-transparent' : 'bg-white/60'}`}
                          >
                            {!n.isRead && <div className="absolute right-4 top-4 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                            <div className="flex gap-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.type === 'promo' ? 'bg-amber-100 text-amber-600' : (n.type === 'order' ? 'bg-zinc-100 text-black' : 'bg-blue-50 text-blue-600')}`}>
                                {n.type === 'order' ? <ShoppingBag size={14} /> : (n.title.includes('Price Drop') ? <BadgePercent size={14} /> : (n.type === 'promo' ? <Heart size={14} /> : <Info size={14} />))}
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-black text-black mb-1 uppercase tracking-tight">{n.title}</p>
                                <p className="text-[9px] text-zinc-600 leading-relaxed">{n.message}</p>
                                <p className="text-[8px] md:text-[9px] text-zinc-300 mt-2 font-mono">{new Date(n.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-zinc-100 bg-white/50 text-center">
                      <Link to="/account/notifications" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">View All History</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ADMIN / STAFF PANEL LINK */}
            {(() => {
              const isAdmin = user?.role === 'admin' || user?.isAdmin;
              const isStaff = isAdmin || ['manager', 'client_support_executive', 'digital_marketing_executive'].includes(user?.role);

              if (isAdmin) {
                return (
                  <Link to="/admin" className="relative group" title="Admin Panel">
                    <Shield className="w-5 h-5 text-white transition group-hover:text-zinc-400" />
                  </Link>
                );
              }
              if (isStaff) {
                return (
                  <Link to="/admin" className="relative group" title="Staff Panel">
                    <div className="relative">
                      <Shield className={`w-5 h-5 transition group-hover:text-white ${user?.role === 'manager' ? 'text-purple-400' : (user?.role === 'client_support_executive' ? 'text-blue-400' : 'text-orange-400')}`} />
                      <div className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-black ${user?.role === 'manager' ? 'bg-purple-500' : (user?.role === 'client_support_executive' ? 'bg-blue-500' : 'bg-orange-500')}`}></div>
                    </div>
                  </Link>
                );
              }
              return null;
            })()}

            {/* USER PROFILE DIRECT LINK */}
            {user ? (
              <Link to="/account" className="relative group flex items-center gap-2 outline-none group/badge">
                <User className="w-5 h-5 transition-all text-white fill-white scale-110 md:hover:text-zinc-400" />
                <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse ${(user.totalSpend || 0) >= 50000 ? 'bg-gradient-to-tr from-zinc-200 to-zinc-400' :
                  (user.totalSpend || 0) >= 20000 ? 'bg-amber-400' :
                    (user.totalSpend || 0) >= 5000 ? 'bg-zinc-300' :
                      'bg-orange-700'
                  }`} title={`${(user.totalSpend || 0) >= 50000 ? 'Platinum' : (user.totalSpend || 0) >= 20000 ? 'Gold' : (user.totalSpend || 0) >= 5000 ? 'Silver' : 'Bronze'} Member`} />
              </Link>
            ) : (
              <Link to="/login">
                <User className="w-5 h-5 text-white hover:text-zinc-400 transition" />
              </Link>
            )}

            {/* GLOBAL HUB REMOVED */}

          </div>
        </div>

        {/* MOBILE MENU DRAWER */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-3xl px-8 pb-12 border-t border-white/10 animate-in slide-in-from-top duration-500">
            <div className="pt-10 grid grid-cols-2 gap-x-8 gap-y-8">
              {/* Left Column: Core Shopping */}
              <div className="flex flex-col gap-6">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Discovery</p>
                <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white text-[11px] font-black uppercase tracking-widest text-left">New Arrivals</button>
                <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white text-[11px] font-black uppercase tracking-widest text-left">Best Sellers</button>
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">Shop All</Link>
                <Link to="/community" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                  Community
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                </Link>
              </div>

              {/* Right Column: Account & Support */}
              <div className="flex flex-col gap-6">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">My Account</p>
                {user && (
                  <Link to="/my-orders" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">My Orders</Link>
                )}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    const footer = document.getElementById('footer-track');
                    if (footer) footer.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-white text-[11px] font-black uppercase tracking-widest text-left"
                >
                  Track
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/support');
                  }}
                  className="text-white text-[11px] font-black uppercase tracking-widest text-left"
                >
                  NEED HELP
                </button>
              </div>
            </div>

            <div className="border-t border-white/10 mt-10 pt-8 flex items-center justify-between">
              {user ? (
                <button onClick={() => { useStore.getState().logout(); navigate('/login'); setIsMenuOpen(false); }} className="text-red-500 text-[11px] font-black uppercase tracking-widest">Log Out</button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">Sign In</Link>
              )}

              <div className="flex items-center gap-4">
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-white p-2 bg-white/5 rounded-full relative">
                  <Heart size={14} className={wishlistCount > 0 ? 'fill-white' : ''} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-black text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-black">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    if (!user) { navigate('/login'); return; }
                    navigate('/account/notifications');
                  }}
                  className="text-white p-2 bg-white/5 rounded-full relative"
                >
                  <Bell size={14} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-black animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <div onClick={() => { setIsMenuOpen(false); toggleCart(); }} className="text-white p-2 bg-white/5 rounded-full relative">
                  <ShoppingBag size={14} className={cartCount > 0 ? 'fill-white' : ''} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-white text-black text-[7px] w-3 h-3 flex items-center justify-center rounded-full font-black">
                      {cartCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="fixed inset-0 md:absolute md:top-0 md:left-0 md:w-full bg-white text-black md:rounded-b-2xl flex flex-col z-[200] shadow-2xl animate-in slide-in-from-top duration-500 overflow-hidden">
            {/* SEARCH INPUT AREA */}
            <div className="flex items-center px-6 md:px-8 h-20 w-full relative border-b border-zinc-100 md:border-none shrink-0 bg-white">
              <Search className="text-zinc-400 w-5 h-5 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="SEARCH SLOOK..."
                className="flex-1 bg-transparent outline-none px-4 text-sm md:text-sm font-black uppercase tracking-widest h-full placeholder:text-zinc-300"
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    toggleSearch();
                    navigate(`/shop?keyword=${e.target.value}`);
                  }
                }}
              />
              <button
                onClick={toggleSearch}
                className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors px-2 md:hidden"
              >
                Cancel
              </button>
              <button onClick={toggleSearch} className="hidden md:block">
                <X className="w-5 h-5 text-black flex-shrink-0 hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* SUGGESTIONS AREA */}
            <div className="flex-1 md:max-h-[60vh] overflow-y-auto no-scrollbar bg-[#fcfcfc] pb-20 md:pb-0">
              {(suggestions.products?.length > 0 || suggestions.categories?.length > 0) ? (
                <>
                  {/* CATEGORIES GROUP */}
                  {suggestions.categories?.length > 0 && (
                    <div className="p-6 md:p-8 border-b border-zinc-100 bg-white/50">
                      <p className="text-[10px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Categories</p>
                      <div className="flex flex-wrap gap-2.5">
                        {suggestions.categories.map((cat, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              toggleSearch();
                              navigate(`/shop?category=${cat}`);
                            }}
                            className="px-5 py-2.5 bg-white border border-zinc-200 rounded-full text-[10px] md:text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* PRODUCTS GROUP */}
                  {suggestions.products?.length > 0 && (
                    <div className="p-6 md:p-8">
                      <p className="text-[10px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-6">Products</p>
                      <div className="grid grid-cols-1 gap-3">
                        {suggestions.products.map((p) => (
                          <div
                            key={p._id}
                            onClick={() => {
                              toggleSearch();
                              navigate(`/product/${p.slug}`);
                            }}
                            className="flex items-center gap-4 md:gap-5 p-3 md:p-4 bg-white hover:shadow-xl rounded-[1.5rem] cursor-pointer transition-all border border-zinc-100 hover:border-black/5 group"
                          >
                            <div className="w-16 h-20 md:w-14 md:h-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-100 group-hover:scale-95 transition-transform">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm md:text-xs font-black uppercase tracking-tight text-black flex items-center gap-2 truncate">
                                {p.name}
                                <Zap size={10} className="text-zinc-200 group-hover:text-amber-400 transition-colors shrink-0" />
                              </h4>
                              <div className="flex items-center gap-3 mt-1.5">
                                <Price amount={p.price} className="text-xs md:text-xs text-zinc-900 font-extrabold" />
                                <span className="text-[9px] md:text-[9px] font-black uppercase bg-zinc-100 px-2 py-0.5 rounded text-zinc-400 tracking-wider">{p.category}</span>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-zinc-200 group-hover:text-black group-hover:translate-x-1 transition-all shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    onClick={() => toggleSearch()}
                    className="p-8 text-center text-[10px] md:text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 hover:text-black cursor-pointer border-t border-zinc-50 bg-white transition-colors"
                  >
                    View all results
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-10 text-center opacity-40">
                  <Search size={40} strokeWidth={1} className="mb-4 text-zinc-300" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">Start typing to explore</p>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
