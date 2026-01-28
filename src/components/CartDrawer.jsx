import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Truck, Loader2, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';

const CartDrawer = () => {
  const { user, setUser, toggleCart } = useStore();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null); 
  
  const cartItems = user?.cart || [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const freeShippingThreshold = 2000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  const handleRemove = async (productId) => {
    if (!user?.token) return;
    
    setIsDeleting(productId);
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUser({ ...user, cart: data });
    } catch (err) {
      console.error("Delete failed:", err.response?.data?.message || err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => toggleCart(false)}
      ></div>
      
      {/* Drawer Container - FIXED FOR MOBILE */}
      <div className="relative w-full max-w-[420px] bg-white h-[100dvh] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-50">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-black italic transform -skew-x-3">Your Bag</h2>
            <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>
          <button onClick={() => toggleCart(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-6 py-4 bg-zinc-50/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
              <Truck size={12} /> 
              {subtotal >= freeShippingThreshold ? "Complimentary Shipping Unlocked" : `Add ₹${freeShippingThreshold - subtotal} for Free Shipping`}
            </span>
          </div>
          <div className="w-full h-1 bg-zinc-200 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-700" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Scrollable Items List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <ShoppingBag size={48} strokeWidth={1} className="mb-4" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">Empty Bag</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.product || item._id} className="flex gap-4 group">
                  <div className="w-20 h-24 bg-zinc-50 rounded-sm overflow-hidden flex-shrink-0 border border-zinc-100">
                    <img src={item.image} className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all" alt={item.name} />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-[11px] text-zinc-900 uppercase leading-tight tracking-tight max-w-[160px]">{item.name}</h4>
                      <button 
                        onClick={() => handleRemove(item.product || item._id)} 
                        disabled={isDeleting === (item.product || item._id)}
                        className="text-zinc-300 hover:text-black transition-colors"
                      >
                        {isDeleting === (item.product || item._id) ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Qty: {item.quantity || 1}</span>
                      </div>
                      <span className="font-black text-xs text-black">₹{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PINNED FOOTER - FIXED POSITION */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-zinc-100 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] space-y-4 pb-8 md:pb-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Estimated Total</span>
              <span className="font-black text-xl tracking-tighter italic transform -skew-x-2">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <button 
              onClick={() => { toggleCart(false); navigate('/checkout'); }} 
              className="w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all active:scale-[0.97] shadow-lg"
            >
              <ShieldCheck size={16} /> Secure Checkout
            </button>
            
            <p className="text-[8px] text-center font-bold text-zinc-300 uppercase tracking-widest">
              Standard duties & taxes included
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;