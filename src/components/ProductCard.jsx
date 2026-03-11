import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Heart, Loader2, Star, Zap, Plus, Minus, X, ShoppingBag, Eye } from 'lucide-react';
import api from '../api/instance';
import { resolveMediaURL } from '../utils/mediaUtils';
import Price from './Price';


const ProductCard = ({ product, onAddToCart }) => {
  const { user, setUser, addToCart, flashSale } = useStore();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const [selectedSize, setSelectedSize] = useState(null);

  // Hover state — React controlled (100% reliable vs CSS group-hover)
  const [hovered, setHovered] = useState(false);

  // Determine if product is in cart (based on store state for accurate badge/state)
  const cart = user ? (user.cart || []) : useStore.getState().cart;
  const inCart = (cart || []).some(item => (item.product?._id || item.product || item._id).toString() === product._id.toString());

  // Determine if product is available — resilient check across schema variations
  const hasVariants = product.variants && product.variants.length > 0;
  
  // Robustly extract stock info or lack thereof
  const stockInfo = (product.countInStock !== undefined && product.countInStock !== null) ? Number(product.countInStock) : 
                    (product.stock !== undefined && product.stock !== null) ? Number(product.stock) : 
                    (product.qty !== undefined && product.qty !== null) ? Number(product.qty) : null;

  const totalVariantStock = hasVariants
    ? product.variants.reduce((sum, v) => sum + Number(v.stock || v.countInStock || v.qty || 0), 0)
    : stockInfo;

  // CRITICAL: If we have NO stock information at all (null), we MUST assume it's in stock 
  // to prevent false "Out of Stock" labels on legacy history entries.
  const isOutOfStock = hasVariants 
    ? totalVariantStock <= 0 
    : (totalVariantStock !== null && totalVariantStock <= 0);

  // Flash sale
  const isFlashSale = flashSale?.products?.some(p => (p._id || p) === product._id);
  const salePrice = isFlashSale
    ? Math.round(product.price * (1 - flashSale.discountPercentage / 100))
    : null;
  const finalPrice = isFlashSale ? salePrice : product.price;

  // Wishlist
  const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
  const isFav = wishlist.some(i => (i?._id || i)?.toString() === product?._id?.toString());

  const handleWishlist = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { error("Please login to save favorites"); return navigate('/login'); }
    setLoading(true);
    try {
      const { data } = await api.post('/wishlist', { productId: product._id }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setUser({ ...user, wishlist: data });
      data.some(i => (i?._id || i)?.toString() === product._id?.toString())
        ? success("Saved to Wishlist") : info("Removed from Wishlist");
    } catch { error("Failed to update wishlist"); }
    finally { setLoading(false); }
  };

  const handleAdd = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (inCart) return;

    if (hasVariants && !selectedSize && !showQuickAdd) { setShowQuickAdd(true); return; }
    if (!user) { error("Please login to shop"); return navigate('/login'); }

    setCartLoading(true);
    try {
      const variantData = hasVariants
        ? { size: selectedSize || product.variants[0].size, color: product.variants.find(v => v.size === (selectedSize || product.variants[0].size))?.color || product.variants[0].color }
        : null;

      // Use the store's addToCart which now handles drawer opening and quantity increments
      await addToCart({
        _id: product._id,
        name: product.name,
        price: finalPrice,
        image: resolveMediaURL(product.image),
        quantity: 1,
        selectedVariant: variantData
      });

      setShowQuickAdd(false);
      success(`Added to bag`);
      if (onAddToCart) onAddToCart();
    } catch (err) { error("Failed to add to bag"); }
    finally { setCartLoading(false); }
  };


  if (!product?._id) return null;

  return (
    <div
      className="relative w-full md:max-w-[260px] group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
    >
      {/* IMAGE CONTAINER */}
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-zinc-50 border border-zinc-100 rounded-2xl shadow-sm">

        {/* Lift + shadow on hover via inline style */}
        <div
          className="absolute inset-0 z-0 rounded-2xl transition-all duration-500"
          style={{ boxShadow: hovered ? '0 16px 40px rgba(0,0,0,0.15)' : 'none' }}
        />

        {/* Image */}
        <Link to={`/product/${product.slug || product._id}`} onClick={e => showQuickAdd && e.preventDefault()}>
          <img
            src={resolveMediaURL(product.image)}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700"
            style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        {isFlashSale && (
          <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1.5 z-10">
            <p className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1"><Zap size={10} fill="currentColor" /> Flash Sale</p>
          </div>
        )}
        {product.badge && (
          <div className="absolute top-0 left-0 bg-black text-white px-3 py-1.5 z-10">
            <p className="text-[8px] font-black uppercase tracking-widest">{product.badge}</p>
          </div>
        )}
        {product.tags && product.tags.length > 0 && product.tags.filter(t => t !== product.badge).slice(0, 1).map((tag, idx) => (
          <div key={idx} className={`absolute text-white px-3 py-1.5 z-10 ${product.badge ? 'top-8 left-0 bg-zinc-800' : 'top-0 left-0 bg-black'}`}>
            <p className="text-[8px] font-black uppercase tracking-widest">{tag}</p>
          </div>
        ))}
        {!isOutOfStock && (product.countInStock < 5 || product.variants?.some(v => Number(v.stock ?? 0) > 0 && Number(v.stock ?? 0) < 5)) && (
          <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1.5 z-10">
            <p className="text-[8px] font-black uppercase tracking-widest">Low Stock</p>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">Out of Stock</span>
          </div>
        )}

        {/* Heart icon */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-2">
          <button
            onClick={handleWishlist} disabled={loading}
            className="p-1.5 rounded-full bg-white/90 shadow hover:bg-white active:scale-90 transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin text-zinc-400" />
              : <Heart size={14} fill={isFav ? "black" : "none"} className="text-black" />}
          </button>
          
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/product/${product.slug || product._id}`); }}
            className="p-1.5 rounded-full bg-white/90 shadow hover:bg-white active:scale-90 transition-all duration-300 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
          >
            <Eye size={14} className="text-black" />
          </button>
        </div>



        {/* Quick Size Selector */}
        {showQuickAdd && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-40 p-4 flex flex-col justify-end">
            <button onClick={e => { e.stopPropagation(); setShowQuickAdd(false); }} className="absolute top-2 right-2 text-white/50 hover:text-white">
              <X size={18} />
            </button>
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">Select Size</p>
              <div className="flex flex-wrap gap-1.5">
                {[...new Set(product.variants.map(v => v.size))].map(size => (
                  <button key={size} onClick={() => setSelectedSize(size)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-[10px] font-black border transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/20'}`}>
                    {size}
                  </button>
                ))}
              </div>
              <button onClick={handleAdd} disabled={cartLoading || !selectedSize}
                className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 flex items-center justify-center gap-2">
                {cartLoading ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
              </button>
            </div>
          </div>
        )}

        {/* ====== ADD TO BAG / QUANTITY BAR ======
            - Uses inline opacity (NOT translate) to show/hide — never clipped by overflow-hidden
            - hovered is React state (not CSS group-hover) — works inside scroll containers
            - Renders for EVERY product regardless of stock (stock check disabled for diagnosis)
        */}
        {!showQuickAdd && (
          <div
            className="absolute bottom-0 left-0 w-full z-20 bg-black text-white transition-all duration-500 ease-out"
            style={{
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              pointerEvents: hovered ? 'auto' : 'none'
            }}
          >
            <button
              onClick={handleAdd}
              disabled={cartLoading || isOutOfStock}
              className="w-full h-11 text-[9px] font-black uppercase tracking-[0.15em] hover:bg-zinc-900 disabled:opacity-50"
            >
              {isOutOfStock ? 'Out of Stock' : cartLoading ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Add to Bag'}
            </button>
          </div>
        )}
      </div>

      {/* ====== PRODUCT INFO ====== */}
      <div className="px-1 text-center mt-3">
        <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-tight mb-0.5 truncate">{product.name}</h3>
        <div className="flex items-center justify-center gap-2">
          {isFlashSale ? (
            <>
              <Price amount={salePrice} className="text-[11px] md:text-[12px] font-black text-red-600" />
              <Price amount={product.price} className="text-[9px] text-zinc-400 line-through" />
            </>
          ) : (
            <Price amount={product.price} className="text-[11px] md:text-[12px] font-black" />
          )}
        </div>
        <div className="flex items-center justify-center gap-1 mt-1.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={9}
              fill={i < Math.round(product.rating || 0) ? "black" : "transparent"}
              className={i < Math.round(product.rating || 0) ? "text-black" : "text-zinc-300"} />
          ))}
          <span className="text-[8px] font-bold text-zinc-400 ml-0.5">({product.numReviews || 0})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
