import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Star, Truck, ShieldCheck, Heart } from 'lucide-react'; // <--- Added Heart

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false); // <--- New State
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    // Ideally: axios.get(`http://localhost:5000/api/products/${slug}`)
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        const found = res.data.find(p => p.slug === slug || p._id === slug);
        setProduct(found);
      });
  }, [slug]);

  if (!product) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    // Future: Add API call to save to backend
  };

  return (
    <div className="container mx-auto px-6 py-10 md:py-20">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Left: Images */}
        <div className="md:w-1/2">
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4 mt-4">
            {[1,2,3,4].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 cursor-pointer border border-transparent hover:border-black">
                <img src={product.image} className="w-full h-full object-cover opacity-80" alt="thumbnail" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="md:w-1/2 sticky top-24 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-black">
              {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="black" />)}
            </div>
            <span className="text-xs text-gray-500 underline">{product.reviews || 0} Reviews</span>
          </div>

          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">{product.name}</h1>
          <p className="text-2xl font-medium mb-6">Rs. {product.price}.00</p>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            Handcrafted in premium 925 Sterling Silver. This piece is designed to be worn daily, 
            water-resistant, and anti-tarnish. The perfect addition to your streetwear aesthetic.
          </p>

          {/* Buttons Row */}
          <div className="flex gap-4 mb-8">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Add to Cart
            </button>
            
            {/* Wishlist Button */}
            <button 
              onClick={toggleWishlist}
              className={`border border-gray-300 px-6 flex items-center justify-center transition hover:border-black ${isWishlisted ? 'bg-red-50 border-red-200' : 'bg-white'}`}
            >
              <Heart 
                size={20} 
                className={isWishlisted ? "text-red-500 fill-red-500" : "text-black"} 
              />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-500">
            <div className="flex items-center gap-3 border p-3">
              <Truck size={18} className="text-black" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-3 border p-3">
              <ShieldCheck size={18} className="text-black" />
              <span>1 Year Warranty</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;