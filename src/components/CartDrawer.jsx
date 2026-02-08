import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, Plus, Minus, ChevronRight, ChevronLeft, Ticket, Trash2 } from 'lucide-react'; // Added Trash2

import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartDrawer = () => {
  const { user, setUser, toggleCart, isCartOpen, coupon: appliedCoupon, applyCoupon, removeCoupon } = useStore();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [couponCode, setCouponCode] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const suggestions = []; // Fix ReferenceError

  // --- CART ACTIONS ---
  const updateQty = async (productId, currentQty, change, variant) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; // Use remove for 0

    // 1. Optimistic Update
    const updatedCart = (user.cart || []).map(item => {
      if (item.product === productId && JSON.stringify(item.selectedVariant) === JSON.stringify(variant)) {
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setUser({ ...user, cart: updatedCart });

    // 2. Backend Sync
    try {
      if (change > 0) {
        await axios.post('http://localhost:5000/api/cart/add', {
          productId,
          quantity: 1, // Add 1
          selectedVariant: variant
        }, { headers: { Authorization: `Bearer ${user.token}` } });
      } else {
        await axios.post('http://localhost:5000/api/cart/decrease', {
          productId,
          selectedVariant: variant
        }, { headers: { Authorization: `Bearer ${user.token}` } });
      }
    } catch (err) {
      console.error("Cart update failed:", err);
      // Revert? For now, we trust sync will happen next reload or user will retry.
    }
  };

  const removeItem = async (productId, variant) => {
    // 1. Optimistic Update
    const updatedCart = (user.cart || []).filter(item =>
      !(item.product === productId && JSON.stringify(item.selectedVariant) === JSON.stringify(variant))
    );
    setUser({ ...user, cart: updatedCart });

    // 2. Backend Sync
    try {
      await axios.post('http://localhost:5000/api/cart/remove', {
        productId,
        selectedVariant: variant
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      addToast("Item removed", "info");
    } catch (err) {
      console.error("Remove failed:", err);
      addToast("Failed to sync cart", "error");
    }
  };

  const cartItems = (user?.cart && Array.isArray(user.cart)) ? user.cart : [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);

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
      const { data } = await axios.post('http://localhost:5000/api/marketing/verify-coupon', {
        code: couponCode,
        cartTotal: subtotal
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
    <div className="fixed inset-0 z-[200] flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => toggleCart(false)} />

      <div className="relative w-full max-w-[420px] bg-[#fcfcfc] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">

        {/* Header */}
        <div className="p-6 flex items-center justify-between bg-white border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-zinc-400" />
            <h2 className="font-black uppercase tracking-[0.2em] text-[10px]">Your Selection</h2>
          </div>
          <button onClick={() => toggleCart(false)} className="p-2 hover:bg-zinc-50 rounded-full transition"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-8">
          {cartItems.length > 0 ? (
            <>
              {/* ITEM CARDS */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.product || Math.random()} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-50 flex-shrink-0">
                      <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-[10px] uppercase tracking-widest text-zinc-800 leading-tight pr-4">{item.name || "Unknown Product"}</p>
                        {item.selectedVariant && (
                          <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">
                            {item.selectedVariant.size && `Size ${item.selectedVariant.size}`}
                            {item.selectedVariant.size && item.selectedVariant.color && ` / `}
                            {item.selectedVariant.color}
                          </p>
                        )}
                        <p className="font-black text-[11px] italic transform -skew-x-6">₹{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</p>
                      </div>
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center bg-[#f8f8f8] rounded-full w-fit p-1 border border-zinc-100">
                          <button onClick={() => updateQty(item.product, item.quantity, -1, item.selectedVariant)} className="p-1 hover:text-black text-zinc-400"><Minus size={12} /></button>
                          <span className="w-8 text-center text-[11px] font-black">{item.quantity}</span>
                          <button onClick={() => updateQty(item.product, item.quantity, 1, item.selectedVariant)} className="p-1 hover:text-black text-zinc-400"><Plus size={12} /></button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product, item.selectedVariant)}
                          className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                          title="Remove Item"
                        >
                          <Trash2 size={14} />
                        </button>
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
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Promotional Code</p>
                  </div>
                  {appliedCoupon && (
                    <button onClick={handleRemoveCoupon} className="text-[9px] text-red-500 font-bold uppercase tracking-wider hover:underline">Remove</button>
                  )}
                </div>

                {appliedCoupon ? (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-xl flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-green-700">{appliedCoupon?.code} Applied</span>
                    <span className="text-[10px] font-bold text-green-600">-₹{(appliedCoupon?.discount || 0).toLocaleString()}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER CODE"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-[#f8f8f8] border border-transparent rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-zinc-200 transition-all"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="bg-black text-white px-5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* SUGGESTIONS - EFFECT REMOVED */}
              {suggestions.length > 0 && (
                <div className="space-y-4 relative pt-2">
                  <div className="flex items-center justify-between ml-1 pr-1">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Complete Your Curation</p>
                    <div className="flex gap-2">
                      <button onClick={() => scroll('left')} className="p-1 bg-white border border-zinc-200 rounded-full hover:bg-black hover:text-white transition shadow-sm">
                        <ChevronLeft size={12} />
                      </button>
                      <button onClick={() => scroll('right')} className="p-1 bg-white border border-zinc-200 rounded-full hover:bg-black hover:text-white transition shadow-sm">
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>

                  <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto no-scrollbar pb-4"
                  >
                    {suggestions.map(sug => (
                      <div
                        key={sug._id}
                        className="min-w-[140px] bg-white p-3 rounded-2xl border border-zinc-50 shadow-sm cursor-pointer hover:border-black transition-all group"
                        onClick={() => { navigate(`/product/${sug.slug || sug._id}`); toggleCart(false); }}
                      >
                        <div className="aspect-[4/5] bg-[#f8f8f8] rounded-xl overflow-hidden mb-3 relative">
                          {/* REMOVED: grayscale and group-hover:grayscale-0 */}
                          <img
                            src={sug.image}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                            alt={sug.name}
                          />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="text-white bg-black rounded-full p-1" size={20} />
                          </div>
                        </div>
                        <p className="text-[9px] font-black uppercase truncate text-zinc-500 group-hover:text-black transition-colors">{sug.name}</p>
                        <p className="text-[10px] font-black mt-1 italic">₹{sug.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag size={40} strokeWidth={1} className="mb-4 text-zinc-300" />
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Curate your first piece</p>
            </div>
          )}
        </div>

        {/* Footer Summary */}
        {cartItems.length > 0 && (
          <div className="p-8 bg-white border-t border-zinc-100 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-green-600">
                  <span>Studio Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-2xl font-black uppercase italic transform -skew-x-3 pt-2">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => { toggleCart(false); navigate('/checkout'); }}
              className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-black/10"
            >
              <span>Secure <span className="text-red-500">Checkout</span></span> <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;