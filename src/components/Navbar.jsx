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
import { motion, AnimatePresence } from 'framer-motion';

const Badge = ({ count, textColor = "text-white" }) => (
  <AnimatePresence mode="popLayout">
    {count > 0 && (
      <motion.div
        key="badge-container"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={`absolute -top-1.5 -right-1 ${textColor} text-[11px] font-black pointer-events-none z-10 flex items-center justify-center`}
        style={{
          textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.5)'
        }}
      >
        <div className="relative overflow-hidden h-[1.2rem] flex items-center leading-none">
          <AnimatePresence mode="wait">
            <motion.span
              key={count}
              initial={{ y: 15, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -15, opacity: 0, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 20
              }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

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


  // --- TOP BANNER LOGIC ---
  const [messages, setMessages] = useState([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchTopBanners = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data && data.topNavbarMessages) {
            setMessages(data.topNavbarMessages);
        }
      } catch (err) {
         console.error("Failed to fetch top banners", err);
      }
    };
    fetchTopBanners();

    // Listen for live updates from Admin Settings
    window.addEventListener('settings-updated', fetchTopBanners);
    return () => window.removeEventListener('settings-updated', fetchTopBanners);
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => { handleNext(); }, 4000);
    return () => clearInterval(timer);
  }, [currentMsgIndex, messages.length]);

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
      });

      socket.on('ticket-reply', (data) => {
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
    if (!notif.isRead) {
      try {
        await api.put(`/users/notifications/${notif._id}/read`, {});
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (err) { }
    }

    const data = notif.data || {};
    let targetUrl = data.url || data.link;

    if (targetUrl && targetUrl.includes('/account/orders/')) {
      targetUrl = targetUrl.replace('/account/orders/', '/order/');
    }

    if (targetUrl) {
      navigate(targetUrl);
      setShowNotif(false);
    } else if (notif.type === 'order') {
      if (data.orderId) {
        navigate(`/order/${data.orderId}`);
      } else {
        navigate('/my-orders');
      }
      setShowNotif(false);
    }
  };

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

      {/* --- TOP BANNER --- */}
      {messages.length > 0 && (
      <div className="bg-black text-white h-10 flex items-center justify-center px-4">
        {messages.length > 1 && (
        <button onClick={handlePrev} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer flex-shrink-0">
          <ChevronLeft size={14} />
        </button>
        )}
        <div className="h-full w-full max-w-[280px] md:max-w-[400px] relative overflow-hidden mx-2">
          <div className={`w-full h-full flex items-center justify-center transition-all duration-300 transform ${isAnimating ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
            {messages[currentMsgIndex]?.link ? (
              <Link to={messages[currentMsgIndex].link} className="font-black tracking-mega uppercase text-[8px] md:text-[9px] text-center hover:text-zinc-300 transition-colors">
                {messages[currentMsgIndex].text}
              </Link>
            ) : (
              <p className="font-black tracking-mega uppercase text-[8px] md:text-[9px] text-center">
                {messages[currentMsgIndex]?.text}
              </p>
            )}
          </div>
        </div>
        {messages.length > 1 && (
        <button onClick={handleNext} className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer flex-shrink-0">
          <ChevronRight size={14} />
        </button>
        )}
      </div>
      )}

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-3xl flex flex-col items-center pt-24 md:pt-32 px-4"
          >
            <button onClick={toggleSearch} className="absolute top-6 right-6 text-black hover:text-zinc-600 p-2">
              <X size={32} />
            </button>
            <div className="w-full max-w-3xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                onChange={(e) => handleSearchInput(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-200 text-black text-xl md:text-3xl font-black uppercase tracking-tighter py-4 pl-12 pr-4 outline-none focus:border-black transition-colors placeholder:text-zinc-400"
              />
            </div>
            
            {/* SEARCH RESULTS */}
            <div className="w-full max-w-5xl mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto pb-20 no-scrollbar">
              {suggestions?.products?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Artifacts</h3>
                  <div className="flex flex-col gap-4">
                    {suggestions.products.map(p => {
                      const imgPath = p.images?.[0] || '';
                      const imgSrc = imgPath.startsWith('http') ? imgPath : `${import.meta.env.VITE_API_URL?.replace('/api', '') || window.location.origin}${imgPath}`;
                      return (
                      <div key={p._id} onClick={() => { navigate(`/product/${p.slug || p._id}`); toggleSearch(); }} className="flex gap-4 items-center group cursor-pointer hover:bg-zinc-100 p-2 rounded-xl transition">
                        <img src={imgSrc} className="w-16 h-16 object-cover rounded-lg bg-zinc-100 group-hover:scale-105 transition" />
                        <div>
                          <p className="text-black text-xs md:text-sm font-black uppercase tracking-tight">{p.name}</p>
                          <p className="text-zinc-500 text-[10px] uppercase mt-1">₹{p.price}</p>
                        </div>
                      </div>
                    )})}
                  </div>
                </div>
              )}
              {suggestions?.categories?.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.categories.map(c => (
                      <button key={c} onClick={() => { navigate(`/shop?category=${c}`); toggleSearch(); }} className="px-4 py-2 border border-zinc-200 rounded-full text-[10px] font-black text-black uppercase tracking-widest hover:bg-black hover:text-white transition">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN NAV */}
      <nav className={`transition-all duration-700 relative border-b border-white/10 ${isScrolled || isMenuOpen || isAdminRoute ? 'bg-black/95 shadow-xl' : 'bg-black/40'}`}>
        <div className="container mx-auto px-4 md:px-6 flex items-center h-16 md:h-20">

          {/* LEFT SECTION */}
          <div className="flex-1 flex items-center gap-2 md:gap-4">
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
              {user?.role !== 'manager' && <span>SLOOK</span>}
              {user?.role === 'admin' || user?.isAdmin ? (
                <span className="text-red-500 drop-shadow-md text-xs md:text-sm">ADMIN</span>
              ) : user?.role === 'manager' ? (
                <span className="text-blue-400 drop-shadow-md text-xs md:text-sm">MANAGER</span>
              ) : null}
            </Link>
          </div>

          {/* CENTER SECTION */}
          <div className="hidden md:flex items-center gap-12 text-[10px] font-black tracking-[0.3em] uppercase">
            <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white hover:text-zinc-400 transition whitespace-nowrap">NEW ARRIVAL</button>
            <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white hover:text-zinc-400 transition whitespace-nowrap">BEST SELLER</button>
            <Link to="/community" className="text-white hover:text-zinc-400 transition group relative">
              COMMUNITY
              <span className="absolute -top-1 -right-4 bg-red-600 text-[6px] px-1 rounded animate-pulse text-white tracking-normal">LIVE</span>
            </Link>
            <Link to="/shop" className="text-white hover:text-zinc-400 transition">Shop</Link>
            <button onClick={() => navigate('/support')} className="text-white hover:text-zinc-400 transition whitespace-nowrap">NEED HELP</button>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex-1 flex items-center justify-end gap-2 md:gap-6 text-base md:text-[10px] font-black tracking-[0.3em] uppercase transition-all">
            <button onClick={toggleSearch} className="relative group p-2 rounded-full hover:bg-white/10 transition-all">
              <Search className="w-5 h-5 text-white group-hover:text-zinc-400 transition" />
            </button>

            {/* WISHLIST */}
            <Link to="/wishlist" className="hidden md:flex relative group p-2 rounded-full hover:bg-white/10 transition-all">
              <Heart className={`w-5 h-5 transition ${wishlistCount > 0 ? 'text-black fill-white' : 'text-white'}`} />
              <Badge count={wishlistCount} />
            </Link>

            {/* CART */}
            <button onClick={toggleCart} className="hidden md:flex relative group p-2 rounded-full hover:bg-white/10 transition-all">
              <ShoppingBag className={`w-5 h-5 transition ${cartCount > 0 ? 'text-black fill-white' : 'text-white'}`} />
              <Badge count={cartCount} />
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative group">
              <button
                onClick={() => {
                  if (!user) { navigate('/login'); return; }
                  if (window.innerWidth < 768) { navigate('/account/notifications'); } 
                  else { setShowNotif(!showNotif); }
                }}
                className="relative outline-none flex items-center justify-center p-2 rounded-full hover:bg-white/10 transition-all"
              >
                <Bell className={`w-5 h-5 transition ${showNotif ? 'text-zinc-400' : 'text-white'}`} />
                <Badge count={unreadCount} textColor="text-red-500" />
              </button>

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

            {/* ADMIN SHORTCUT */}
            {(user?.role === 'admin' || user?.isAdmin) && (
              <Link to="/admin/dashboard" className="hidden md:flex p-2 rounded-full hover:bg-white/10 transition-all text-red-500" title="Admin Dashboard">
                <Shield className="w-5 h-5 fill-red-500/10" />
              </Link>
            )}

            {/* PROFILE */}
            {user ? (
              <Link to="/account" className="relative group flex items-center gap-2 outline-none group/badge">
                <User className="w-5 h-5 transition-all text-white fill-white scale-110 md:hover:text-zinc-400" />
                <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse ${(user.totalSpend || 0) >= 50000 ? 'bg-gradient-to-tr from-zinc-200 to-zinc-400' :
                  (user.totalSpend || 0) >= 20000 ? 'bg-amber-400' :
                    (user.totalSpend || 0) >= 5000 ? 'bg-zinc-300' :
                      'bg-orange-700'
                  }`} />
              </Link>
            ) : (
              <Link to="/login">
                <User className="w-5 h-5 text-white hover:text-zinc-400 transition" />
              </Link>
            )}

          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-3xl px-8 pb-12 border-t border-white/10 animate-in slide-in-from-top duration-500">
            <div className="pt-10 grid grid-cols-2 gap-x-8 gap-y-8">
              <div className="flex flex-col gap-6">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Discovery</p>
                <button onClick={() => handleFilterNavigation('new-arrivals')} className="text-white text-[11px] font-black uppercase tracking-widest text-left">New Arrivals</button>
                <button onClick={() => handleFilterNavigation('best-sellers')} className="text-white text-[11px] font-black uppercase tracking-widest text-left">Best Sellers</button>
                <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">Shop All</Link>
                <div className="flex items-center gap-2">
                  <Link to="/community" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">Community</Link>
                  <span className="bg-red-600 text-[6px] px-1 rounded animate-pulse text-white tracking-normal">LIVE</span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Support</p>
                <Link to="/support" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">Need Help</Link>
                <Link to="/account/orders" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">Track Order</Link>
              </div>
            </div>

            <div className="border-t border-white/10 mt-10 pt-8 flex items-center justify-between">
              {user ? (
                <button onClick={() => { useStore.getState().logout(); navigate('/login'); setIsMenuOpen(false); }} className="text-red-500 text-[11px] font-black uppercase tracking-widest">Log Out</button>
              ) : (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-white text-[11px] font-black uppercase tracking-widest">Sign In</Link>
              )}

              <div className="flex items-center gap-4">
                {(user?.role === 'admin' || user?.isAdmin) && (
                  <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="text-red-500 p-2 bg-red-500/10 rounded-full" title="Admin Dashboard">
                    <Shield size={14} fill="currentColor" fillOpacity={0.1} />
                  </Link>
                )}
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="text-white p-2 bg-white/5 rounded-full relative">
                  <Heart size={14} className={wishlistCount > 0 ? 'text-black fill-white' : ''} />
                  <Badge count={wishlistCount} />
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
                  <Badge count={unreadCount} textColor="text-red-500" />
                </button>
                <div onClick={() => { setIsMenuOpen(false); toggleCart(); }} className="text-white p-2 bg-white/5 rounded-full relative">
                  <ShoppingBag size={14} className={cartCount > 0 ? 'text-black fill-white' : ''} />
                  <Badge count={cartCount} />
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
