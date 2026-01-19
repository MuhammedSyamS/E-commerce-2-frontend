import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Star, Truck, ShieldCheck, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const addToCart = useStore((state) => state.addToCart);

  useEffect(() => {
    // Replace with your real API endpoint
    axios.get('http://localhost:5000/api/products')
      .then(res => {
        setAllProducts(res.data);
        const found = res.data.find(p => p.slug === slug || p._id === slug);
        setProduct(found);
        if (found) setActiveImg(found.image);
      });
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p._id !== product._id)
    .slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      {/* MOBILE BACK BUTTON */}
      <div className="md:hidden p-4 border-b border-gray-50">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="container mx-auto px-4 md:px-10 lg:px-20 py-6 md:py-16">
        {/* Main Grid: flex-col for Mobile, flex-row for Desktop */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">
          
          {/* --- LEFT: GALLERY --- */}
          {/* On mobile, this takes full width. On desktop, it takes 60% */}
          <div className="w-full lg:w-[60%] space-y-4">
            <div className="aspect-[4/5] bg-zinc-50 overflow-hidden rounded-sm">
              <img 
                src={activeImg || product.image} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            {/* Horizontal Scrollable Thumbnails for Mobile */}
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {[product.image, product.image, product.image].map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImg(img)}
                  className={`flex-shrink-0 w-20 h-24 border-2 transition ${activeImg === img ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumb" />
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT: PRODUCT INFO --- */}
          {/* IMPORTANT: lg:sticky only applies to Large Screens (Desktop) */}
          <div className="w-full lg:w-[40%] lg:sticky lg:top-24 h-auto lg:h-fit space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="black" />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  {product.reviews} Reviews
                </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                {product.name}
              </h1>
              <p className="text-2xl font-light">₹{product.price.toLocaleString()}</p>
            </div>

            <div className="h-px bg-zinc-100 w-full"></div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description</p>
              <p className="text-zinc-600 text-sm leading-relaxed">
                Handcrafted in premium 925 Sterling Silver. This hallmark piece is water-resistant, anti-tarnish, and certified for daily luxury.
              </p>
            </div>

            {/* Quantity & Add to Bag */}
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-zinc-200 rounded-full px-4 py-2">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="p-1"><Minus size={14}/></button>
                  <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)} className="p-1"><Plus size={14}/></button>
                </div>
              </div>

              <button 
                onClick={() => addToCart({...product, qty: quantity})}
                className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                Add to Bag <ShoppingBag size={16} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-xl space-y-2">
                <Truck size={20} />
                <p className="text-[10px] font-black uppercase">Free Shipping</p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-xl space-y-2">
                <ShieldCheck size={20} />
                <p className="text-[10px] font-black uppercase">925 Certified</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <section className="bg-zinc-50 py-16 mt-10">
        <div className="container mx-auto px-4 md:px-20">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Customer Feedback</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-zinc-100">
              <div className="flex text-black mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="black" />)}
              </div>
              <p className="text-sm font-bold uppercase mb-2">"High Quality Silver"</p>
              <p className="text-xs text-zinc-500">Perfect shine and weight. Highly recommend for MNC professionals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- RELATED PRODUCTS --- */}
      {relatedProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-20">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b pb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10">
              {relatedProducts.map((p) => (
                <Link key={p._id} to={`/product/${p.slug}`} className="group">
                  <div className="aspect-[4/5] bg-zinc-100 overflow-hidden mb-4">
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">{p.name}</p>
                  <p className="text-[10px] font-bold text-zinc-400">₹{p.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;