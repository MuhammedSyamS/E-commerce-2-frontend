import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products'; // Mock data for now

const Wishlist = () => {
  // Simulating a wishlist with the first 3 products
  const wishlistItems = products.slice(0, 3);

  return (
    <div className="bg-white min-h-screen pt-10 pb-20">
      <div className="container mx-auto px-6">
        
        <h1 className="text-3xl font-black uppercase tracking-tighter text-center mb-2">
          Your Wishlist
        </h1>
        <p className="text-center text-gray-500 text-sm mb-12 uppercase tracking-widest">
          {wishlistItems.length} items saved
        </p>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {wishlistItems.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">Your wishlist is empty.</p>
            <Link to="/shop" className="bg-black text-white px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;