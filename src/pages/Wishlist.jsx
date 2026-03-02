import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Share2 } from 'lucide-react';
import api from '../api/instance';

const Wishlist = () => {
  const { user, setUser } = useStore();
  const { success } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      // Don't try to fetch if user is logged out
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        // --- UPDATED ENDPOINT: Using the dedicated wishlist route via api instance ---
        const { data } = await api.get('/wishlist');

        setWishlistItems(data);
        // SYNC GLOBAL STATE: Ensure navbar badge matches valid items (removes ghost IDs)
        if (user) setUser({ ...user, wishlist: data });
      } catch (error) {
        console.error("Error fetching wishlist:", error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user?.wishlist, user?.token]);

  const handleShare = () => {
    const link = `${window.location.origin}/wishlist/shared/${user._id}`;
    navigator.clipboard.writeText(link);
    success("Link copied to clipboard");
  };

  if (loading && user) {
    return <div className="min-h-screen pt-44 md:pt-52 text-center uppercase font-black tracking-widest text-[10px] text-zinc-400">Loading Vault...</div>;
  }

  return (
    <div className="bg-white min-h-screen pt-44 md:pt-52 pb-20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">

        <div className="mb-12 md:mb-16 text-center">
          <h1 className="!text-3xl md:!text-4xl font-black uppercase tracking-tighter mb-2">
            Your Wishlist
          </h1>
          <div className="h-1 w-12 bg-black mx-auto mb-4"></div>
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
            {wishlistItems.length} items saved in your vault
          </p>
          {wishlistItems.length > 0 && (
            <button onClick={handleShare} className="mx-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black border border-black px-4 py-2 hover:bg-black hover:text-white transition-all">
              <Share2 size={12} /> Share Collection
            </button>
          )}
        </div>

        {!user ? (
          <div className="text-center py-16 md:py-24 border border-dashed border-zinc-200 rounded-3xl mx-4 md:mx-0">
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6 md:mb-8">Please login to view your vault</p>
            <Link to="/login" className="inline-block bg-black text-white px-10 py-4 md:px-12 md:py-5 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-zinc-200 rounded-full">
              Login Now
            </Link>
          </div>
        ) : wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {wishlistItems.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={async () => {
                  // Purposefully leaving this empty or handling custom behavior.
                  // The user requested that adding to cart does NOT remove it from the wishlist.
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 md:py-24 bg-zinc-50 rounded-[2rem] md:rounded-[40px] border border-zinc-100 mx-4 md:mx-0">
            <p className="text-zinc-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-6 md:mb-8">Your vault is empty</p>
            <Link to="/shop" className="inline-block border-b-2 border-black pb-1 font-black uppercase tracking-widest text-[9px] md:text-[10px] hover:text-zinc-500 hover:border-zinc-500 transition-all">
              Discover Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
