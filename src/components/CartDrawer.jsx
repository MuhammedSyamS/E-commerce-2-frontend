import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useStore } from '../store/useStore';

const CartDrawer = () => {
  const { cart, toggleCart, removeFromCart } = useStore();
  const navigate = useNavigate();
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const freeShippingThreshold = 2000;
  const progress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Premium Backdrop Blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-all duration-500" 
        onClick={toggleCart}
      ></div>
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-[420px] bg-white h-full shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col animate-slide-in">
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 pb-6">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black">Your Bag</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              {cart.length} {cart.length === 1 ? 'Item' : 'Items'} selected
            </p>
          </div>
          <button 
            onClick={toggleCart} 
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-300 active:scale-90"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- Attractive Feature: Free Shipping Progress --- */}
        <div className="px-8 pb-6 border-b border-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Truck size={14} /> 
              {subtotal >= freeShippingThreshold ? "You've unlocked free shipping!" : `Add ₹${freeShippingThreshold - subtotal} more for free shipping`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Scrollable Items */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-gray-200" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Your bag is empty</p>
              <button 
                onClick={() => { toggleCart(); navigate('/shop'); }}
                className="mt-6 text-xs font-black uppercase underline underline-offset-8 hover:text-gray-600 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-5 group">
                <div className="relative w-24 h-32 bg-gray-50 rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                  <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={item.name} />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-sm text-gray-900 uppercase leading-tight max-w-[150px]">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item._id)} 
                        className="text-gray-300 hover:text-black transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Premium Silver</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center border border-gray-100 rounded-lg px-2 py-1 gap-3">
                      <button className="text-xs font-bold px-1 hover:text-gray-400">-</button>
                      <span className="text-xs font-black">1</span>
                      <button className="text-xs font-bold px-1 hover:text-gray-400">+</button>
                    </div>
                    <span className="font-black text-sm text-black">₹{item.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-8 bg-white border-t border-gray-100 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Subtotal</span>
                <span className="font-black text-xl tracking-tighter">₹{subtotal}.00</span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                Taxes and shipping calculated at checkout
              </p>
            </div>
            
            <button 
              onClick={() => { toggleCart(); navigate('/checkout'); }} 
              className="group relative w-full bg-black text-white py-5 font-black uppercase tracking-[0.3em] text-[10px] overflow-hidden transition-all hover:bg-zinc-900 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Secure Checkout <ShoppingBag size={14} />
              </span>
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500"></div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;