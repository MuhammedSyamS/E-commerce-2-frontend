import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, Plus, Minus, ChevronRight, ChevronLeft, Ticket } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CartDrawer = () => {
  const { user, setUser, toggleCart, isCartOpen } = useStore();
  const navigate = useNavigate();
  const scrollRef = useRef(null); 
  
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [allProducts, setAllProducts] = useState([]);

  const cartItems = user?.cart || [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const total = subtotal - discount;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setAllProducts(data);
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    };
    if (isCartOpen) fetchProducts();
  }, [isCartOpen]);

  const suggestions = allProducts
    .filter(p => !cartItems.find(item => item.product === p._id))
    .slice(0, 8);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 220 : scrollLeft + 220;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const updateQty = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      const { data } = await axios.post('http://localhost:5000/api/cart/add', 
        { productId, quantity: delta }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUser({ ...user, cart: data });
    } catch (err) { console.error(err); }
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'MISO10') {
      setDiscount(subtotal * 0.10);
      alert("10% Studio Discount Applied!");
    } else {
      alert("Invalid code");
    }
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
                  <div key={item.product} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex gap-4">
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-zinc-50 flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <p className="font-black text-[10px] uppercase tracking-widest text-zinc-800 leading-tight pr-4">{item.name}</p>
                        <p className="font-black text-[11px] italic transform -skew-x-6">₹{item.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center bg-[#f8f8f8] rounded-full w-fit p-1 border border-zinc-100 mt-2">
                        <button onClick={() => updateQty(item.product, item.quantity, -1)} className="p-1 hover:text-black text-zinc-400"><Minus size={12}/></button>
                        <span className="w-8 text-center text-[11px] font-black">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product, item.quantity, 1)} className="p-1 hover:text-black text-zinc-400"><Plus size={12}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* COUPON SECTION */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Ticket size={14} className="text-zinc-400" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Promotional Code</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="ENTER CODE" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-[#f8f8f8] border border-transparent rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-zinc-200 transition-all"
                  />
                  <button 
                    onClick={applyCoupon}
                    className="bg-black text-white px-5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                  >
                    Apply
                  </button>
                </div>
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
              Secure Checkout <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;