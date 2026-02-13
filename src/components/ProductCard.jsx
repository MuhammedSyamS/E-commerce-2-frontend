import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Heart, Loader2, Star, Zap } from 'lucide-react';
import axios from 'axios';

const ProductCard = ({ product, onAddToCart }) => {
  const { user, setUser, toggleCart, flashSale } = useStore();
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // --- FLASH SALE LOGIC ---
  const isFlashSale = flashSale && flashSale.products && flashSale.products.some(p => (p._id || p) === product._id);
  const discountPrice = isFlashSale
    ? Math.round(product.price * (1 - flashSale.discountPercentage / 100))
    : null;

  // --- 1. ROBUST WISHLIST CHECK ---
  const wishlist = Array.isArray(user?.wishlist) ? user.wishlist : [];
  const isFav = wishlist.some(item => {
    const itemId = item?._id || item;
    return itemId?.toString() === product?._id?.toString();
  });

  // --- 2. DATABASE WISHLIST TOGGLE ---
  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) {
      error("Please login to save favorites");
      return navigate('/login');
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/wishlist',
        { productId: product._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUser({ ...user, wishlist: data });

      // Toast Feedback
      const isNowFav = data.some(item => (item?._id || item)?.toString() === product._id?.toString());
      if (isNowFav) success("Saved to Wishlist");
      else info("Removed from Wishlist");

    } catch (err) {
      console.error("Wishlist error:", err);
      error("Failed to update wishlist");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. DATABASE ADD TO CART ---
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      error("Please login to shop");
      return navigate('/login');
    }

    setCartLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          productId: product._id,
          name: product.name,
          price: isFlashSale ? discountPrice : product.price, // Use Item Price (Discounted if sale)
          image: product.image
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Sync user state with the new cart from database
      setUser({ ...user, cart: data });
      success(`Added ${product.name} to bag`); // TOAST
      toggleCart(true); // Open sidebar
      if (onAddToCart) onAddToCart(); // Custom Callback (e.g. for Wishlist Move)
    } catch (err) {
      console.error("Cart error:", err.response?.data?.message || err.message);
      error(err.response?.data?.message || "Failed to add to bag");
    } finally {
      setCartLoading(false);
    }
  };

  if (!product?._id) return null;

  return (
    <div className="group/card relative w-full max-w-[280px] mx-auto transition-all duration-300">
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        </Link>

        {/* FLASH SALE BADGE */}
        {isFlashSale && (
          <div className="absolute top-0 left-0 bg-red-600 text-white px-3 py-1.5 z-20">
            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
              <Zap size={10} fill="currentColor" /> Flash Sale
            </p>
          </div>
        )}

        {/* OOS OVERLAY */}
        {product.countInStock === 0 && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-black uppercase tracking-widest">
              Out of Stock
            </span>
          </div>
        )}

        {/* WISHLIST BUTTON */}
        <button
          onClick={handleWishlist}
          disabled={loading}
          className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white active:scale-90 transition-all"
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

        {/* ADD TO BAG BUTTON (Syncs with DB) */}
        {product.countInStock > 0 && (
          <button
            onClick={handleAddToCart}
            disabled={cartLoading}
            className="absolute bottom-0 left-0 w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] translate-y-full opacity-0 group-hover:translate-y-0 group-hover/card:opacity-100 transition-all duration-500 z-20 disabled:bg-zinc-800"
          >
            {cartLoading ? 'Syncing...' : 'Add to Bag'}
          </button>
        )}
      </div>

      {/* PRODUCT INFO */}
      <div className="px-1">
        <div className="flex justify-between items-start">
          <h3 className="text-[12px] font-black uppercase truncate pr-2">{product.name}</h3>

          <div className="text-right">
            {isFlashSale ? (
              <>
                <p className="text-[12px] font-black text-red-600">₹{discountPrice.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-400 line-through decoration-red-500/50">₹{product.price.toLocaleString()}</p>
              </>
            ) : (
              <p className="text-[12px] font-black">{typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : 'Price Unavailable'}</p>
            )}
          </div>
        </div>

        {/* RATING */}
        <div className="flex items-center gap-1 mt-1">
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

        <div className="flex justify-between items-center mt-1">

          {product.countInStock > 0 && product.countInStock < 5 && (
            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest">Only {product.countInStock} Left</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;