import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Eye, Heart, Loader2, Star, Zap, Plus, X, ShoppingBag } from 'lucide-react';
import api from '../api/instance';
import Price from './Price';
import QuickView from './QuickView';

const ProductCard = ({ product, onAddToCart }) => {
  const { user, setUser, toggleCart, flashSale } = useStore();
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

    // If product has variants and none selected, show QuickAdd
    const hasVariants = product.variants && product.variants.length > 0;
    if (hasVariants && (!selectedSize || !selectedColor) && !showQuickAdd) {
      setShowQuickAdd(true);
      return;
    }

    if (!user) {
      error("Please login to shop");
      return navigate('/login');
    }

    setCartLoading(true);
    try {
      const variantData = hasVariants ? {
        size: selectedSize || product.variants[0].size,
        color: selectedColor || product.variants[0].color
      } : null;

      const { data } = await api.post('/cart/add', {
        productId: product._id,
        name: product.name,
        price: isFlashSale ? discountPrice : product.price,
        image: product.image,
        selectedVariant: variantData
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setUser({ ...user, cart: data });
      success(`Added ${product.name} to bag`);
      toggleCart(true);
      setShowQuickAdd(false);
      if (onAddToCart) onAddToCart();
    } catch (err) {
      error(err.response?.data?.message || "Failed to add to bag");
    } finally {
      setCartLoading(false);
    }
  };

  if (!product?._id) return null;

  return (
    <div className="group/card relative w-[181.03px] md:w-full md:max-w-[260px] transition-all duration-500 hover:-translate-y-2 md:overflow-visible">
      {/* IMAGE CONTAINER */}
      <div className="relative w-full h-[226.78px] md:h-auto md:aspect-[4/5] overflow-hidden bg-zinc-50 border border-zinc-100 mb-3 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            loading="lazy"
          />
        </Link>

        {/* OVERLAYS */}
        {isFlashSale && (
          <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1.5 z-20">
            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Zap size={10} fill="currentColor" /> Flash Sale
            </p>
          </div>
        )}

        {product.isNewArrival && !isFlashSale && (
          <div className="absolute top-0 left-0 bg-black text-white px-3 py-1.5 z-20">
            <p className="text-[10px] font-black uppercase tracking-widest">New Arrival</p>
          </div>
        )}

        {product.isBestSeller && !product.isNewArrival && !isFlashSale && (
          <div className="absolute top-0 left-0 bg-zinc-800 text-white px-3 py-1.5 z-20">
            <p className="text-[10px] font-black uppercase tracking-widest">Elite Choice</p>
          </div>
        )}

        {product.countInStock > 0 && product.countInStock < 5 && (
          <div className="absolute top-0 right-0 bg-amber-500 text-white px-3 py-1.5 z-20 animate-pulse">
            <p className="text-[10px] font-black uppercase tracking-widest">Limited Stock</p>
          </div>
        )}

        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {/* HEART BUTTON */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            disabled={loading}
            className="p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white active:scale-90 transition-all"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin text-zinc-500" />
            ) : (
              <Heart
                size={14}
                fill={isFav ? "black" : "none"}
                className="text-black"
              />
            )}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setShowQuickView(true); }}
            className="md:opacity-0 group-hover/card:opacity-100 p-1.5 rounded-full bg-white text-black shadow-sm hover:bg-black hover:text-white active:scale-90 transition-all duration-300"
          >
            <Eye size={14} />
          </button>
        </div>

        <QuickView
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          product={product}
        />

        {/* ADD TO BAG BUTTON (Hover Toggle) */}
        {product.countInStock > 0 && !showQuickAdd && (
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="absolute bottom-0 left-0 w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] translate-y-full opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all duration-500 z-20 disabled:bg-zinc-800"
          >
            {cartLoading ? 'Syncing...' : 'Add to Bag'}
          </button>
        )}

        {/* MOBILE QUICK ADD TRIGGER */}
        {product.countInStock > 0 && !showQuickAdd && (
          <button
            onClick={handleAddToCart}
            className="md:hidden absolute bottom-3 right-3 bg-black text-white w-8 h-8 rounded-full flex items-center justify-center shadow-xl z-20 active:scale-95 transition-all"
          >
            <ShoppingBag size={14} />
          </button>
        )}

        {/* QUICK SIZE SELECTOR OVERLAY */}
        {showQuickAdd && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 p-4 flex flex-col justify-end animate-in fade-in slide-in-from-bottom-full duration-500">
            <button
              onClick={(e) => { e.stopPropagation(); setShowQuickAdd(false); }}
              className="absolute top-2 right-2 text-white/50 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Select Size</p>
              <div className="flex flex-wrap gap-1.5">
                {[...new Set(product.variants.map(v => v.size))].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-[10px] font-black border transition-all ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white/60 border-white/20 hover:border-white/40'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={cartLoading || !selectedSize}
                className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
              >
                {cartLoading ? <Loader2 size={12} className="animate-spin" /> : 'Confirm Selection'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT INFO */}
      <div className="px-1 text-center">
        <h3 className="text-[11px] md:text-[12px] font-black uppercase tracking-tight mb-0.5 md:mb-1 truncate">{product.name}</h3>
        <div className="flex items-center justify-center gap-2">
          {isFlashSale ? (
            <>
              <Price amount={discountPrice} className="text-[11px] md:text-[12px] font-black text-red-600" />
              <Price amount={product.price} className="text-[9px] md:text-[10px] text-zinc-400 line-through" />
            </>
          ) : (
            <Price amount={product.price} className="text-[11px] md:text-[12px] font-black" />
          )}
        </div>

        {/* RATING */}
        <div className="flex items-center justify-center gap-1 mt-2 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                fill={i < Math.round(product.rating || 0) ? "black" : "transparent"}
                className={i < Math.round(product.rating || 0) ? "text-black" : "text-zinc-300"}
              />
            ))}
          </div>
          <span className="text-[9px] font-bold text-zinc-400">({product.numReviews || 0})</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
