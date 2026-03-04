import React, { useState, useEffect, useRef } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Ticket, Flame, Clock, Gift, ShieldCheck, ChevronLeft, ChevronRight, CheckCircle2, Heart } from 'lucide-react';

import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import Price from './Price';

const CartDrawer = () => {
  const { user, setUser, toggleCart, isCartOpen, coupon: appliedCoupon, applyCoupon, removeCoupon, cart: guestCart, setCart: setGuestCart } = useStore();
  const [siteSettings, setSiteSettings] = useState({ taxRate: 0, shippingCharge: 0, freeShippingThreshold: 0 });
  const { addToast } = useToast();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  // Fetch Site Settings (Tax, Shipping etc)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSiteSettings(data);
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  const [couponCode, setCouponCode] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      if (direction === 'left') {
        current.scrollBy({ left: -200, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }
  };

  // Fetch Suggestions
  useEffect(() => {
    if (isCartOpen) {
      const fetchSuggestions = async () => {
        try {
          const { data } = await api.get('/products');
          // Shuffle and pick 4
          const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 5);
          setSuggestions(shuffled);
        } catch (err) {
          console.error("Failed to fetch suggestions", err);
        }
      };
      fetchSuggestions();
    }
  }, [isCartOpen]);

  // --- CART ACTIONS ---
  const getItemId = (item) => (item.product?._id || item.product || item._id || '').toString();

  const updateQty = async (productId, currentQty, change, variant) => {
    const parsedQty = Number(currentQty) || 1;
    const newQty = parsedQty + change;
    if (newQty < 1) return;

    const targetId = productId.toString();

    if (user) {
      const updatedCart = (user.cart || []).map(item => {
        if (getItemId(item) === targetId && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      setUser({ ...user, cart: updatedCart });

      try {
        if (change > 0) {
          await api.post('/cart/add', { productId, quantity: 1, selectedVariant: variant });
        } else {
          await api.post('/cart/decrease', { productId, selectedVariant: variant });
        }
      } catch (err) { console.error("Cart update failed:", err); }
    } else {
      const updatedCart = guestCart.map(item => {
        if (getItemId(item) === targetId && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
      setGuestCart(updatedCart);
    }
  };

  const removeItem = async (productId, variant, itemId) => {
    const targetId = productId.toString();
    if (user) {
      const updatedCart = (user.cart || []).filter(item => {
        if (itemId && item._id === itemId) return false;
        return !(getItemId(item) === targetId && JSON.stringify(item.selectedVariant) === JSON.stringify(variant));
      });
      setUser({ ...user, cart: updatedCart });
      try {
        await api.post('/cart/remove', { productId, selectedVariant: variant, _id: itemId });
        addToast("Item removed", "info");
      } catch (err) { console.error("Remove failed:", err); }
    } else {
      const updatedCart = guestCart.filter(item => {
        return !(getItemId(item) === targetId && JSON.stringify(item.selectedVariant) === JSON.stringify(variant));
      });
      setGuestCart(updatedCart);
      addToast("Item removed", "info");
    }
  };

  const handleSaveForLater = async (itemId) => {
    if (!user) return addToast("Login to save for later", "info");
    try {
      const { data } = await api.post('/cart/save-for-later', { _id: itemId });
      setUser({ ...user, cart: data.cart, savedForLater: data.savedForLater });
      addToast("Saved for later", "success");
    } catch (err) { addToast("Failed to save item", "error"); }
  };

  const handleMoveToCart = async (itemId) => {
    if (!user) return;
    try {
      const { data } = await api.post('/cart/move-to-cart', { _id: itemId });
      setUser({ ...user, cart: data.cart, savedForLater: data.savedForLater });
      addToast("Moved to cart", "success");
    } catch (err) { addToast("Failed to move item", "error"); }
  };

  const cartItems = user ? (user.cart || []) : guestCart;


  // ROBUST CALCULATION
  const subtotal = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return acc + (price * qty);
  }, 0);

  // Recalculate discount if percentage based?
  // For now, backend returns absolute discount.
  // We should ideally re-verify if cart changes, but for MVP let's trust the stored discount
  // or clear it if cart changes significantly?
  // Let's just use the stored discount.
  const discount = (appliedCoupon && typeof appliedCoupon.discount === 'number') ? appliedCoupon.discount : 0;
  const total = subtotal - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await api.post('/marketing/verify-coupon', {
        code: couponCode,
        cartTotal: subtotal,
        userId: user?._id || user?.id
      });

      applyCoupon({ code: data.code, discount: data.discount });
      addToast(data.message, "success");
      setCouponCode('');
    } catch (err) {
      addToast(err.response?.data?.message || "Invalid Coupon", "error");
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    addToast("Coupon Removed", "info");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => toggleCart(false)} />

      <div className="relative w-full sm:max-w-[420px] bg-[#f8f8f8] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">

        {/* Header - Premium Dark Header for Contrast */}
        <div className="py-2.5 px-4 md:py-3 md:px-6 flex items-center justify-between bg-black text-white border-b border-white/10 shadow-lg shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={16} className="text-amber-400 animate-pulse" />
            <h2 className="font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px]">Your Selection</h2>
          </div>
          <button onClick={() => toggleCart(false)} className="p-1.5 hover:bg-white/10 rounded-full transition"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-5 space-y-8 bg-zinc-50/50">
          {cartItems.length > 0 ? (
            <>
              {/* ITEM CARDS */}
              {/* SCARCITY ALERT */}
              <div className="bg-red-50 border border-red-100 p-2 md:p-2.5 rounded-2xl mb-6 flex items-center gap-3 animate-pulse">
                <div className="bg-red-500 text-white p-1.5 rounded-full"><Flame size={12} fill="currentColor" /></div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-tight text-red-900 leading-none mb-0.5">High Demand Artifacts</p>
                  <p className="text-[8px] md:text-[9px] font-bold text-red-600 uppercase tracking-widest leading-none">Items in bag are reserved for 10:00</p>
                </div>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item._id || item.product || Math.random()} className="bg-white p-3 md:p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100/80 flex gap-4 group hover:border-black transition-all duration-300">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200 group-hover:scale-95 transition-transform duration-500">
                      <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-1 md:gap-2">
                          <p className="font-black text-[11px] md:text-[10px] uppercase tracking-normal md:tracking-wider text-black leading-tight flex-1 line-clamp-2">{item.name || "Unknown Product"}</p>
                          <Price amount={item.price} className="font-black text-[10px] md:text-[11px] shrink-0 text-black px-2 py-0.5 bg-zinc-100 rounded" />
                        </div>
                        {item.selectedVariant && (
                          <p className="text-[10px] md:text-[9px] text-zinc-400 font-bold uppercase mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                            {item.selectedVariant.size && `Size ${item.selectedVariant.size} `}
                            {item.selectedVariant.size && item.selectedVariant.color && ` / `}
                            {item.selectedVariant.color}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 md:gap-3 bg-zinc-100 rounded-xl px-2 py-1.5 md:px-5 md:py-3 border border-zinc-200/50">
                            <button onClick={() => updateQty(item.product?._id || item._id || item.product, item.quantity, -1, item.selectedVariant)} className="text-zinc-400 hover:text-black transition-colors p-1"><Minus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /></button>
                            <span className="font-black text-[10px] md:text-sm w-3 md:w-4 text-center text-black">{item.quantity}</span>
                            <button onClick={() => updateQty(item.product?._id || item._id || item.product, item.quantity, 1, item.selectedVariant)} className="text-zinc-400 hover:text-black transition-colors p-1"><Plus className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" /></button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleSaveForLater(item._id)}
                            className="p-1.5 text-zinc-300 hover:text-amber-500 transition-colors"
                            title="Save for Later"
                          >
                            <Heart size={12} md:size={14} />
                          </button>
                          <button
                            onClick={() => removeItem(item.product?._id || item._id || item.product, item.selectedVariant, item._id)}
                            className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"
                            title="Remove Item"
                          >
                            <Trash2 size={12} md:size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* COUPON SECTION */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-zinc-400" />
                    <p className="text-[9px] font-black uppercase tracking-normal md:tracking-widest text-zinc-400">Promotional Code</p>
                  </div>
                  {appliedCoupon && (
                    <button onClick={handleRemoveCoupon} className="text-[9px] text-red-500 font-bold uppercase tracking-wider hover:underline">Remove</button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex justify-between items-center">
                    <span className="text-[11px] md:text-[10px] font-black uppercase text-green-700">{appliedCoupon?.code} Applied</span>
                    <Price amount={appliedCoupon?.discount || 0} className="text-[11px] md:text-[10px] font-bold text-green-600" />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-[#f8f8f8] border border-transparent rounded-xl px-3 py-3 md:px-4 md:py-4 text-[10px] md:text-[10px] font-black uppercase tracking-normal md:tracking-widest outline-none focus:border-zinc-200 transition-all"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-black text-white px-4 md:px-6 rounded-xl text-[9px] md:text-[9px] font-black uppercase tracking-normal md:tracking-widest active:scale-95 transition-transform"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* SUGGESTIONS - SMART RECOMMENDATIONS */}
              {suggestions.length > 0 && (
                <div className="space-y-4 relative pt-4 pb-2 border-t border-zinc-100">
                  <div className="flex items-center justify-between ml-1 pr-1">
                    <p className="text-[11px] md:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">You Might Also Like</p>
                    <div className="flex gap-2">
                      {/* Navigation Controls */}
                      <button onClick={() => scroll('left')} className="p-1.5 bg-white border border-zinc-200 rounded-full hover:bg-black hover:text-white hover:border-black transition shadow-sm">
                        <ChevronLeft size={10} />
                      </button>
                      <button onClick={() => scroll('right')} className="p-1.5 bg-white border border-zinc-200 rounded-full hover:bg-black hover:text-white hover:border-black transition shadow-sm">
                        <ChevronRight size={10} />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar pb-2 px-1 snap-x"
                  >
                    {suggestions
                      .filter(s => !cartItems.some(c => c.product === s._id || c._id === s._id)) // Filter out already in cart
                      .map(sug => (
                        <div
                          key={sug._id}
                          className="min-w-[130px] snap-center bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm cursor-pointer hover:border-zinc-300 transition-all group relative"
                          onClick={() => { navigate(`/product/${sug.slug || sug._id}`); toggleCart(false); }}
                        >
                          <div className="aspect-[3/4] bg-zinc-50 rounded-xl overflow-hidden mb-3 relative">
                            <img
                              src={sug.image}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              alt={sug.name}
                            />
                            <div className="absolute bottom-2 right-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="bg-black text-white p-1.5 rounded-full shadow-lg">
                                <Plus size={14} />
                              </div>
                            </div>
                          </div>
                          <p className="text-[9px] font-black uppercase truncate text-zinc-600 group-hover:text-black transition-colors">{sug.name}</p>
                          <Price amount={sug.price} className="text-[10px] font-bold mt-0.5 text-zinc-900" />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-10">
              <div className="opacity-50 flex flex-col items-center">
                <div className="bg-zinc-50 p-4 rounded-full mb-2">
                  <ShoppingBag size={32} strokeWidth={1.5} className="text-zinc-300" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Your Cart is Empty</p>
                <button
                  onClick={() => { toggleCart(false); navigate('/shop'); }}
                  className="text-xs font-bold underline underline-offset-4 decoration-zinc-300 hover:decoration-black hover:text-black transition-all mt-2"
                >
                  Start Curating
                </button>
              </div>

              {/* QUICK ADD TRENDING STRIP */}
              <div className="w-full pt-10 border-t border-zinc-50">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-6">Trending Now</p>
                <div className="flex gap-4 overflow-x-auto no-scrollbar px-4">
                  {suggestions.slice(0, 3).map(sug => (
                    <div
                      key={sug._id}
                      onClick={() => { navigate(`/product/${sug.slug || sug._id}`); toggleCart(false); }}
                      className="min-w-[140px] bg-white p-3 rounded-2xl border border-zinc-100 shadow-sm cursor-pointer group"
                    >
                      <div className="aspect-[3/4] bg-zinc-50 rounded-xl overflow-hidden mb-3">
                        <img src={sug.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      <p className="text-[9px] font-black uppercase truncate text-zinc-600 group-hover:text-black transition-colors mb-1">{sug.name}</p>
                      <Price amount={sug.price} className="text-[10px] font-bold text-zinc-900" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SAVED FOR LATER SECTION */}
          {user?.savedForLater?.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <h3 className="text-[11px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">Saved for Later</h3>
              {user.savedForLater.map(item => (
                <div key={item._id} className="bg-zinc-50 p-3 rounded-xl flex gap-3 opacity-75 hover:opacity-100 transition">
                  <div className="w-12 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <p className="font-black text-[10px] uppercase text-zinc-600">{item.name}</p>
                      <Price amount={item.price} className="text-[10px] font-bold text-zinc-400" />
                    </div>
                    <button onClick={() => handleMoveToCart(item._id)} className="text-[9px] font-black uppercase bg-white px-3 py-2 rounded-lg border border-zinc-200 hover:border-black shadow-sm">
                      Move to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-3 md:p-5 bg-[#fdfdfd] border-t border-zinc-200/60 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] shrink-0">

            {/* FREE SHIPPING PROGRESS BAR */}
            {subtotal > 0 && siteSettings.freeShippingThreshold > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] md:text-[9px] font-black uppercase tracking-widest">
                  {subtotal >= siteSettings.freeShippingThreshold ? (
                    <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={10} /> You've unlocked FREE Shipping!</span>
                  ) : (
                    <span className="text-zinc-500">₹{(siteSettings.freeShippingThreshold - subtotal).toLocaleString()} away from <span className="text-black">FREE Shipping</span></span>
                  )}
                  <span className="text-zinc-400">{Math.min(100, Math.round((subtotal / siteSettings.freeShippingThreshold) * 100))}%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${subtotal >= siteSettings.freeShippingThreshold ? 'bg-green-500' : 'bg-black'}`}
                    style={{ width: `${Math.min(100, (subtotal / siteSettings.freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* LOYALTY EARNINGS */}
            {user && (
              <div className="bg-amber-50/50 border border-amber-100/50 p-2 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-amber-400 text-white p-0.5 rounded-full"><Ticket size={10} fill="currentColor" /></div>
                  <span className="text-[9px] font-bold uppercase text-amber-900 tracking-wide">
                    Earn {Math.floor(total / 100)} Coins
                  </span>
                </div>
                <span className="text-[8px] md:text-[9px] font-bold text-amber-900">
                  Balance: {user.loyaltyPoints || 0}
                </span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between text-[11px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>Subtotal</span>
                <Price amount={subtotal} />
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[11px] md:text-[10px] font-black uppercase tracking-widest text-green-600">
                  <span>Studio Discount</span>
                  <Price amount={discount} />
                </div>
              )}

              <div className="flex justify-between items-end pt-2">
                <span className="text-sm font-black uppercase text-black">Total</span>
                <div className="text-right">
                  <Price amount={total} className="text-2xl font-black uppercase block leading-none text-black" />
                  <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-widest">Incl. of all taxes</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                window.scrollTo(0, 0);
                toggleCart(false);
                navigate('/checkout');
              }}
              className="w-full bg-black text-white py-3 md:py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] md:text-[10px] flex items-center justify-center gap-2 md:gap-3 active:scale-[0.98] hover:bg-zinc-900 transition-all shadow-xl shadow-black/10 group px-4"
            >
              <span>Secure <span className="text-amber-400 group-hover:text-white transition-colors">Checkout</span></span> <ChevronRight className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
