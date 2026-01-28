import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Truck, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';

const CartDrawer = () => {
  const { user, setUser, toggleCart } = useStore();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(null); // Track which item is being deleted
  
  const cartItems = user?.cart || [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const freeShippingThreshold = 2000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  // --- NEW DATABASE DELETE LOGIC ---
  const handleRemove = async (productId) => {
    if (!user?.token) return;
    
    setIsDeleting(productId);
    try {
      const { data } = await axios.delete(
        `http://localhost:5000/api/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Update Zustand with the new cart array returned from the DB
      setUser({ ...user, cart: data });
    } catch (err) {
      console.error("Delete failed:", err.response?.data?.message || err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" onClick={toggleCart}></div>
      
      <div className="relative w-full max-w-[420px] bg-white h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-8 pb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Your Bag</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} selected
            </p>
          </div>
          <button onClick={toggleCart} className="p-2 hover:bg-gray-100 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-8 pb-6 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Truck size={14} /> 
              {subtotal >= freeShippingThreshold ? "Free shipping unlocked!" : `Add ₹${freeShippingThreshold - subtotal} more for free shipping`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-black transition-all duration-1000" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <ShoppingBag size={32} className="text-gray-200 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Your bag is empty</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.product || item._id} className="flex gap-5 group">
                <div className="relative w-24 h-32 bg-gray-50 rounded-xl overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-gray-900 uppercase leading-tight">{item.name}</h4>
                      <button 
                        onClick={() => handleRemove(item.product || item._id)} 
                        disabled={isDeleting === (item.product || item._id)}
                        className="text-gray-300 hover:text-black disabled:opacity-50"
                      >
                        {isDeleting === (item.product || item._id) ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black">Qty: {item.quantity || 1}</span>
                    <span className="font-black text-sm text-black">₹{item.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-8 bg-white border-t border-gray-100 space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Subtotal</span>
              <span className="font-black text-xl tracking-tighter">₹{subtotal}.00</span>
            </div>
            <button 
              onClick={() => { toggleCart(); navigate('/checkout'); }} 
              className="w-full bg-black text-white py-5 font-black uppercase tracking-[0.3em] text-[10px] hover:bg-zinc-800 transition-all"
            >
              Secure Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;