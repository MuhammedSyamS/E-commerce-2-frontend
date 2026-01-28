import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Heart, Loader2 } from 'lucide-react';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const { user, setUser, toggleCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // --- 1. ROBUST WISHLIST CHECK ---
  const wishlist = user?.wishlist || [];
  const isFav = wishlist.some(item => {
    const itemId = item._id || item;
    return itemId.toString() === product?._id?.toString();
  });

  // --- 2. DATABASE WISHLIST TOGGLE ---
  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login'); // Redirect instead of alert

    setLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/wishlist',
        { productId: product._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUser({ ...user, wishlist: data });
    } catch (err) {
      console.error("Wishlist error:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. DATABASE ADD TO CART ---
  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login'); // Redirect instead of alert

    setCartLoading(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      // Sync user state with the new cart from database
      setUser({ ...user, cart: data });
      toggleCart(true); // Open sidebar
    } catch (err) {
      console.error("Cart error:", err.response?.data?.message || err.message);
    } finally {
      setCartLoading(false);
    }
  };

  if (!product?._id) return null;

  return (
    <div className="group relative w-full max-w-[280px] mx-auto transition-all duration-300">
      {/* IMAGE CONTAINER */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4">
        <Link to={`/product/${product.slug || product._id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        </Link>
        
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
        <button 
          onClick={handleAddToCart}
          disabled={cartLoading}
          className="absolute bottom-0 left-0 w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-20 disabled:bg-zinc-800"
        >
          {cartLoading ? 'Syncing...' : 'Add to Bag'}
        </button>
      </div>

      {/* PRODUCT INFO */}
      <div className="px-1">
        <div className="flex justify-between items-start">
          <h3 className="text-[12px] font-black uppercase truncate pr-2">{product.name}</h3>
          <p className="text-[12px] font-black">Rs. {product.price}</p>
        </div>
        <p className="text-[9px] text-zinc-400 mt-1 font-bold uppercase tracking-widest">925 Sterling Silver</p>
      </div>
    </div>
  );
};

export default ProductCard;