import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Star, Heart } from 'lucide-react';

const ProductCard = ({ product }) => {
  const addToCart = useStore((state) => state.addToCart);
  const [isWishlisted, setIsWishlisted] = useState(false);

  return (
    <div className="group relative w-full">
      <div className="block">
        
        {/* IMAGE CONTAINER */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 mb-4 cursor-pointer">
          <Link to={`/product/${product.slug}`}>
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>
          
          {product.isBestSeller && (
            <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider z-10">
              Best Seller
            </span>
          )}

          {/* --- WISHLIST BUTTON (Black Fill Toggle) --- */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all active:scale-90"
          >
            <Heart 
              size={14} 
              className={`transition-colors duration-300 ${
                isWishlisted ? "text-black fill-black" : "text-black"
              }`} 
            />
          </button>

          {/* ADD TO CART BUTTON */}
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

        {/* INFO SECTION */}
        <Link to={`/product/${product.slug}`}>
          <div className="flex justify-between items-start px-1">
            <div className="flex-1 pr-2">
              <h3 className="text-[13px] font-bold text-gray-900 leading-tight group-hover:underline decoration-1 underline-offset-4 line-clamp-2 uppercase tracking-tight">
                {product.name}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1 font-medium tracking-wide">
                925 Sterling Silver
              </p>
            </div>
            
            <div className="text-right">
               <p className="text-[13px] font-bold text-black">Rs. {product.price}</p>
            </div>
          </div>
          
          {/* REVIEWS */}
          <div className="flex items-center gap-1 mt-1 px-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} fill="currentColor" className="text-black" />
              ))}
            </div>
            <span className="text-[9px] text-gray-400 font-medium tracking-tighter">
              ({product.reviews || 0})
            </span>
          </div>
        </Link>

      </div>
    </div>
  );
};

export default ProductCard;