import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Star } from 'lucide-react';

const ProductCard = ({ product }) => {
  const addToCart = useStore((state) => state.addToCart);

  return (
    <div className="group relative w-full">
      <Link to={`/product/${product.slug}`} className="block">
        
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4 cursor-pointer">
          {/* Main Image */}
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Best Seller Badge */}
          {product.isBestSeller && (
            <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10">
              Best Seller
            </span>
          )}

          {/* ADD TO CART BUTTON (Slides Up) */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="absolute bottom-0 left-0 w-full bg-black text-white py-3 text-xs font-bold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 hover:bg-gray-800"
          >
            Add to Cart
          </button>
        </div>

        {/* INFO SECTION - Matches video layout */}
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-2">
            <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2 uppercase">
              {product.name}
            </h3>
            <p className="text-[11px] text-gray-500 mt-1 font-medium tracking-wide">
              925 Sterling Silver
            </p>
          </div>
          
          <div className="text-right">
             <p className="text-sm font-bold text-black">Rs. {product.price}</p>
          </div>
        </div>
        
        {/* REVIEWS */}
        <div className="flex items-center gap-1 mt-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} fill="currentColor" className="text-black" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-medium">({product.reviews})</span>
        </div>

      </Link>
    </div>
  );
};

export default ProductCard;