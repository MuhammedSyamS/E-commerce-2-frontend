import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Eye, Heart, Loader2, Star, Zap, Plus, X, ShoppingBag } from 'lucide-react';
import api from '../api/instance';
import Price from './Price';
import QuickView from './QuickView';

const ProductCard = ({ product, onAddToCart }) => {
  const { user, cart: guestCart, setUser, flashSale, addToCart, setCart } = useStore();
  const cart = user ? (user.cart || []) : (guestCart || []);
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // --- FLASH SALE LOGIC ---
  const isFlashSale = flashSale && flashSale.products && flashSale.products.some(p => (p._id || p) === product._id);
  const discountPrice = isFlashSale
    ? Math.round(product.price * (1 - flashSale.discountPercentage / 100))
    : null;

  // --- WISHLIST CHECK ---
  const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
  const isFav = wishlist.some(item => (item?._id || item)?.toString() === product?._id?.toString());

  // --- TOGGLE WISHLIST ---
  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      error("Please login to save favorites");
      return navigate('/login');
    }
    setLoading(true);
    try {
      const { data } = await api.post('/wishlist', { productId: product._id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUser({ ...user, wishlist: data });
      const isNowFav = data.some(item => (item?._id || item)?.toString() === product._id?.toString());
      isNowFav ? success("Saved to Wishlist") : info("Removed from Wishlist");
    } catch (err) {
      error("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  // --- ADD TO CART ---
  const handleAddToCart = async (e) => {
    if (e) e.preventDefault();

    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants && (!selectedSize || !selectedColor) && !showQuickAdd) {
      setShowQuickAdd(true);
      return;
    }

    setCartLoading(true);
    try {
      const variantData = hasVariants ? {
        size: selectedSize || product.variants[0].size,
        color: selectedColor || product.variants[0].color
      } : null;

      await addToCart({
        ...product,
        price: isFlashSale ? discountPrice : product.price,
        selectedVariant: variantData,
        quantity: 1
      });

      success(`Added ${product.name} to bag`);
      setShowQuickAdd(false);
      if (onAddToCart) onAddToCart();
    } catch (err) {
      error("Failed to add to bag");
    } finally {
      setCartLoading(false);
    }
  };

  // --- QUANTITY LOGIC ---
  const cartItem = cart?.find(item => {
    const itemProductId = (item.product?._id || item.product || item._id || '').toString();
    return itemProductId === product?._id?.toString();
  });

  const updateQuantity = async (delta) => {
    if (!cartItem) return;
    const newQty = Math.max(0, (cartItem.quantity || 1) + delta);

    let updatedCart;
    if (newQty === 0) {
      updatedCart = cart.filter(item => (item._id || item.product?._id || item.product || '').toString() !== (cartItem._id || cartItem.product?._id || cartItem.product || '').toString());
    } else {
      updatedCart = cart.map(item => {
        if ((item._id || item.product?._id || item.product || '').toString() === (cartItem._id || cartItem.product?._id || cartItem.product || '').toString()) {
          return { ...item, quantity: newQty };
        }
        return item;
      });
    }

    setCart(updatedCart);

    if (user?.token && cartItem._id) {
      try {
        await api.post('/cart/update', { cartItemId: cartItem._id, quantity: newQty }, { headers: { Authorization: `Bearer ${user.token}` } });
      } catch (err) {
        console.error("Failed to sync quantity update:", err);
      }
    }
  };

  if (!product?._id) return null;

  return (
    <div className="group/card relative w-full transition-all duration-500 md:hover:-translate-y-2 text-center">
      {/* IMAGE & OVERLAYS CONTAINER */}
      <div className="relative w-full aspect-[4/5] bg-zinc-50 border border-zinc-100 mb-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">

        {/* SHARED ZOOM CONTAINER */}
        <div className="absolute inset-0">
          <Link to={`/product/${product.slug || product._id}`}>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
              loading="lazy"
            />
          </Link>
        </div>

        {/* TOP OVERLAYS */}
        <div className="absolute top-0 left-0 z-20">
          {isFlashSale && (
            <div className="bg-red-600 text-white px-3 py-1.5 rounded-tl-2xl">
              <p className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                <Zap size={10} fill="currentColor" /> Flash Sale
              </p>
            </div>
          )}
          {product.isNewArrival && !isFlashSale && (
            <div className="bg-black text-white px-3 py-1.5 rounded-tl-2xl">
              <p className="text-[8px] font-black uppercase tracking-widest">New Arrival</p>
            </div>
          )}
          {product.isBestSeller && !product.isNewArrival && !isFlashSale && (
            <div className="bg-zinc-800 text-white px-3 py-1.5 rounded-tl-2xl">
              <p className="text-[8px] font-black uppercase tracking-widest text-[#FFD700]">Elite Choice</p>
            </div>
          )}
        </div>

        {product.countInStock > 0 && product.countInStock < 5 && (
          <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1.5 z-20 animate-pulse rounded-tr-2xl">
            <p className="text-[8px] font-black uppercase tracking-widest">Limited Stock</p>
          </div>
        )}

        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
          </div>
        )}

        {/* TOP RIGHT ICONS */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-2">
          <button onClick={handleWishlist} className="p-2 rounded-full bg-white/90 shadow-sm hover:bg-white active:scale-90 transition-all border border-zinc-100">
            {loading ? <Loader2 size={14} className="animate-spin text-zinc-500" /> : <Heart size={14} fill={isFav ? "black" : "none"} className="text-black" />}
          </button>
          <button onClick={(e) => { e.preventDefault(); setShowQuickView(true); }} className="md:opacity-0 group-hover/card:opacity-100 p-2 rounded-full bg-white text-black shadow-sm hover:bg-black hover:text-white active:scale-90 transition-all duration-300 border border-zinc-100">
            <Eye size={14} />
          </button>
        </div>

        <QuickView isOpen={showQuickView} onClose={() => setShowQuickView(false)} product={product} />

        {/* DESKTOP HOVER: ADD TO BAG / QUANTITY */}
        {product.countInStock > 0 && !showQuickAdd && (
          <div className="hidden md:flex absolute inset-x-0 bottom-0 z-40 translate-y-full opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500">
            <div className="w-full bg-black text-white overflow-hidden shadow-2xl">
              {cartItem ? (
                <div className="flex items-center w-full">
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(-1); }} className="flex-1 py-4 hover:bg-zinc-800 transition-colors flex justify-center border-r border-white/10"><X size={14} /></button>
                  <div className="px-4 py-4 text-[10px] font-black min-w-[3rem] text-center">{cartItem.quantity}</div>
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(1); }} className="flex-1 py-4 hover:bg-zinc-800 transition-colors flex justify-center"><Plus size={14} /></button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="w-full py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-zinc-900 flex items-center justify-center gap-2"
                >
                  {cartLoading ? <Loader2 size={12} className="animate-spin" /> : 'Add to Bag'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* MOBILE QUICK ADD TRIGGER */}
        {product.countInStock > 0 && !showQuickAdd && (
          <button onClick={handleAddToCart} className="md:hidden absolute bottom-3 right-3 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl z-20 active:scale-95 transition-all">
            <ShoppingBag size={16} />
          </button>
        )}

        {/* QUICK SIZE SELECTOR OVERLAY */}
        {showQuickAdd && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 p-6 flex flex-col justify-end animate-in fade-in duration-300">
            <button onClick={(e) => { e.stopPropagation(); setShowQuickAdd(false); }} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={20} /></button>
            <div className="space-y-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 text-center">Select Size</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[...new Set(product.variants.map(v => v.size))].map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={`min-w-10 h-10 px-3 rounded-lg text-xs font-black border transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'}`}>{size}</button>
                ))}
              </div>
              <button onClick={handleAddToCart} disabled={cartLoading || !selectedSize} className="w-full bg-white text-black py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-2">
                {cartLoading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm Selection'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT INFO PANEL */}
      <div className="px-1 mt-3">
        <h3 className="text-[11px] md:text-[13px] font-black uppercase tracking-tight mb-1 truncate leading-tight transition-colors group-hover/card:text-zinc-600">{product.name}</h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          {isFlashSale ? (
            <>
              <Price amount={discountPrice} className="text-[12px] md:text-[15px] font-black text-red-600" />
              <Price amount={product.price} className="text-[10px] md:text-[11px] text-zinc-400 line-through" />
            </>
          ) : (
            <Price amount={product.price} className="text-[12px] md:text-[15px] font-black" />
          )}
        </div>

        {/* MOBILE BOTTOM CONTROLS */}
        <div className="md:hidden mt-3">
          {cartItem ? (
            <div className="flex items-center justify-between bg-zinc-100 rounded-full overflow-hidden h-11 px-2 border border-zinc-200">
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(-1); }} className="p-2 hover:bg-zinc-200 rounded-full transition-colors"><X size={12} /></button>
              <span className="text-[11px] font-black tracking-widest">{cartItem.quantity}</span>
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); updateQuantity(1); }} className="p-2 hover:bg-zinc-200 rounded-full transition-colors"><Plus size={12} /></button>
            </div>
          ) : (
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }} className="w-full bg-black text-white py-4 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all">Add To Bag</button>
          )}
        </div>

        {/* RATING SECTION */}
        <div className="flex items-center justify-center gap-1 mt-4 opacity-30 group-hover/card:opacity-100 transition-opacity">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill={i < Math.round(product.rating || 0) ? "black" : "transparent"} className={i < Math.round(product.rating || 0) ? "text-black" : "text-zinc-300"} />
            ))}
          </div>
          <span className="text-[9px] font-black text-zinc-400">({product.numReviews || 0})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;