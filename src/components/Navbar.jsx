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
  const { toggleCart, user, isSearchOpen, toggleSearch, toggleAdminSidebar, currency, setCurrency, currencyRates } = useStore();

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
      socket = io();

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
              onClick={() => {
                const footer = document.getElementById('site-footer');
                if (footer) footer.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-white hover:text-zinc-400 transition whitespace-nowrap"
            >
              Need Help?
            </button>
          </div>

          {/* 3. RIGHT SECTION (ICONS) */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-6 text-base md:text-[10px] font-black tracking-[0.3em] uppercase transition-all">
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
                <button onClick={() => setShowNotif(!showNotif)} className="relative outline-none flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all">
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
                        <h3 className="text-sm md:text-[10px] font-black uppercase tracking-widest text-zinc-500">Notifications</h3>
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
                                  <p className="text-sm md:text-[9px] text-zinc-300 mt-2 font-mono">{new Date(n.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2 border-t border-zinc-100 bg-white/50 text-center">
                        <Link to="/account/notifications" className="text-sm md:text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">View All History</Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

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

            {/* USER PROFILE DROPDOWN */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-2 outline-none relative group/badge">
                  <User className="w-5 h-5 transition-all text-white fill-white scale-110" />
                  {user && (
                    <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse ${(user.totalSpend || 0) >= 50000 ? 'bg-gradient-to-tr from-zinc-200 to-zinc-400' :
                      (user.totalSpend || 0) >= 20000 ? 'bg-amber-400' :
                        (user.totalSpend || 0) >= 5000 ? 'bg-zinc-300' :
                          'bg-orange-700'
                      }`} title={`${(user.totalSpend || 0) >= 50000 ? 'Platinum' : (user.totalSpend || 0) >= 20000 ? 'Gold' : (user.totalSpend || 0) >= 5000 ? 'Silver' : 'Bronze'} Member`} />
                  )}
                </button>

                {/* DROPDOWN MENU */}
                <div className="absolute right-0 top-full pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-6 w-64 border border-zinc-100 animate-in slide-in-from-top-4">

                    {/* HEADER */}
                    <div className="border-b border-zinc-100 pb-4 mb-4">
                      <p className="text-sm md:text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">Signed in as</p>
                      <p className="text-base md:text-sm font-black truncate">{user.firstName} {user.lastName}</p>
                    </div>

                    {/* LINKS */}
                    <div className="space-y-3">
                      <Link to="/account" className="flex items-center gap-3 text-base md:text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                        My Account
                      </Link>
                      <Link to="/my-orders" className="flex items-center gap-3 text-base md:text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                        My Orders
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-3 text-base md:text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                        Wishlist
                      </Link>
                      <Link to="/account/settings" className="flex items-center gap-3 text-base md:text-xs font-bold uppercase tracking-wide hover:pl-2 transition-all">
                      </Link>
                      <Link
                        to="/support"
                        className="block text-sm md:text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black hover:pl-2 transition-all mt-3"
                      >
                        Support Hub
                      </Link>
                    </div>

                    {/* LOGOUT */}
                    <div className="border-t border-zinc-100 mt-4 pt-4">
                      <button
                        onClick={() => { useStore.getState().logout(); navigate('/login'); }}
                        className="w-full text-left text-base md:text-xs font-black uppercase tracking-wide text-red-500 hover:text-red-700 hover:pl-2 transition-all"
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

            {/* GLOBAL HUB REMOVED */}

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
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-3xl px-8 flex flex-col gap-8 pb-12 border-t border-white/10 animate-in slide-in-from-top duration-500">
            <div className="pt-10 flex flex-col gap-6">
              <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white text-base md:text-3xl font-black uppercase tracking-tighter text-left">New Arrivals</button>
              <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white text-base md:text-3xl font-black uppercase tracking-tighter text-left">Best Sellers</button>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-white text-base md:text-3xl font-black uppercase tracking-tighter">Shop All</Link>
              <Link to="/support" onClick={() => setIsMenuOpen(false)} className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-4">Support Hub</Link>
              <Link to="/track-order" onClick={() => setIsMenuOpen(false)} className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Track Order</Link>
            </div>

            <div className="border-t border-white/10 pt-8">
              {user ? (
                <div className="flex flex-col gap-4">
                  <Link to="/account" onClick={() => setIsMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-[9px]">My Account</Link>
                  <button onClick={() => { useStore.getState().logout(); navigate('/login'); setIsMenuOpen(false); }} className="text-red-500 font-bold uppercase tracking-widest text-[9px] text-left">Log Out</button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-white font-bold uppercase tracking-widest text-[9px]">Sign In</Link>
              )}
            </div>
          </div>
        )}

        {/* SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="absolute top-0 left-0 w-full bg-white text-black rounded-b-2xl flex flex-col z-[200] shadow-2xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center px-8 h-20 w-full relative">
              <Search className="text-zinc-400 w-5 h-5 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="SEARCH SLOOK..."
                className="flex-1 bg-transparent outline-none px-4 text-base md:text-xs font-black uppercase tracking-widest h-full"
                onChange={(e) => handleSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    toggleSearch();
                    navigate(`/shop?keyword=${e.target.value}`);
                  }
                }}
              />
              <button onClick={toggleSearch}><X className="w-5 h-5 text-black flex-shrink-0" /></button>
            </div>

            {(suggestions.products?.length > 0 || suggestions.categories?.length > 0) && (
              <div className="border-t border-zinc-100 max-h-[60vh] overflow-y-auto custom-scrollbar bg-[#fcfcfc]">
                {/* CATEGORIES GROUP */}
                {suggestions.categories?.length > 0 && (
                  <div className="p-6 border-b border-zinc-100 bg-white/50">
                    <p className="text-sm md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.categories.map((cat, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            toggleSearch();
                            navigate(`/shop?category=${cat}`);
                          }}
                          className="px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-sm md:text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRODUCTS GROUP */}
                {suggestions.products?.length > 0 && (
                  <div className="p-6">
                    <p className="text-sm md:text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Products</p>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestions.products.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => {
                            toggleSearch();
                            navigate(`/product/${p.slug}`);
                          }}
                          className="flex items-center gap-5 p-3 hover:bg-white hover:shadow-xl rounded-2xl cursor-pointer transition-all border border-transparent hover:border-zinc-100 group"
                        >
                          <div className="w-14 h-16 bg-zinc-100 rounded-xl overflow-hidden shrink-0 border border-zinc-100 group-hover:scale-95 transition-transform">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base md:text-[11px] font-black uppercase tracking-tight text-black flex items-center gap-2">
                              {p.name}
                              <Zap size={10} className="text-zinc-200 group-hover:text-amber-400 transition-colors" />
                            </h4>
                            <div className="flex items-center gap-3 mt-1">
                              <Price amount={p.price} className="text-sm md:text-[10px] text-zinc-400 font-bold" />
                              <span className="text-sm md:text-[8px] font-black uppercase bg-zinc-100 px-2 py-0.5 rounded text-zinc-400">{p.category}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-zinc-100 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  onClick={() => toggleSearch()}
                  className="p-6 text-center text-sm md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 hover:text-black cursor-pointer border-t border-zinc-50 bg-white"
                >
                  View all results
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
