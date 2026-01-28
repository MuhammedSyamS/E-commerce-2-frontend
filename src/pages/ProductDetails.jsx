import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Star, Truck, ShieldCheck, Minus, Plus, ShoppingBag, CreditCard } from 'lucide-react';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, setUser, toggleCart } = useStore(); // Access store actions

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/products');
        const data = Array.isArray(res.data) ? res.data : [];
        setAllProducts(data);

        const found = data.find(p => p.slug === slug || p._id === slug);
        
        if (found) {
          setProduct(found);
          setActiveImg(found.image);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  // --- FIXED: Unified Logic for Cart and Buy Now ---
  const handleAddToCart = async (redirectToCheckOut = false) => {
    if (!user || !user.token) {
      alert("Please login to continue");
      return navigate('/login');
    }

    setIsAdding(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      const cartItem = {
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        quantity: quantity
      };

      // Update Database Cart
      const { data } = await axios.post('http://localhost:5000/api/cart/add', cartItem, config);
      
      // Update Local Zustand State (res.data is usually the updated cart array)
      setUser({ ...user, cart: data });

      if (redirectToCheckOut) {
        navigate('/checkout');
      } else {
        toggleCart(true); // Open the side drawer to show success
      }
    } catch (err) {
      console.error("Cart error:", err.response?.data?.message || err.message);
      alert("Could not update bag. Try again.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="h-screen flex items-center justify-center bg-white flex-col gap-4">
      <p className="text-xs font-black uppercase tracking-[0.3em]">Product Not Found</p>
      <Link to="/shop" className="text-[10px] underline uppercase font-bold">Return to Shop</Link>
    </div>
  );

  const relatedProducts = allProducts
    .filter(p => p.category === product?.category && p._id !== product?._id)
    .slice(0, 4);

  return (
    <div className="bg-white min-h-screen pt-32 md:pt-40">
      <div className="container mx-auto px-4 md:px-10 lg:px-32 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
          
          {/* GALLERY */}
          <div className="w-full lg:w-[50%] space-y-3">
            <div className="aspect-[4/5] max-h-[450px] bg-zinc-50 overflow-hidden rounded-sm border border-zinc-100 mx-auto">
              <img src={activeImg || product?.image} alt={product?.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {[product?.image, product?.hoverImage].filter(Boolean).map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveImg(img)}
                  className={`flex-shrink-0 w-16 h-20 border transition cursor-pointer ${activeImg === img ? 'border-black' : 'border-transparent'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="thumb" />
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCT INFO */}
          <div className="w-full lg:w-[40%] space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="black" />)}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Hallmarked Jewelry</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic transform -skew-x-2">{product?.name}</h1>
              <p className="text-xl font-light">₹{product?.price?.toLocaleString()}</p>
            </div>

            <div className="h-px bg-zinc-100 w-full"></div>

            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Description</p>
              <p className="text-zinc-600 text-[11px] leading-relaxed">{product?.description}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center border border-zinc-200 rounded-full w-fit px-3 py-1">
                <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="p-1"><Minus size={12}/></button>
                <span className="w-8 text-center font-bold text-xs">{quantity}</span>
                <button onClick={() => setQuantity(q => q+1)} className="p-1"><Plus size={12}/></button>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleAddToCart(false)}
                  disabled={isAdding}
                  className="w-full max-w-sm bg-black text-white py-4 rounded-full font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  {isAdding ? 'Adding...' : 'Add to Bag'} <ShoppingBag size={14} />
                </button>

                <button 
                  onClick={() => handleAddToCart(true)}
                  disabled={isAdding}
                  className="w-full max-w-sm border border-black text-black py-4 rounded-full font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-3 hover:bg-black hover:text-white transition-all disabled:opacity-50"
                >
                  Buy It Now <CreditCard size={14} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <div className="p-3 bg-zinc-50 rounded-xl space-y-1 flex flex-col items-center border border-zinc-100">
                <Truck size={16} />
                <p className="text-[8px] font-black uppercase">Studio Shipping</p>
              </div>
              <div className="p-3 bg-zinc-50 rounded-xl space-y-1 flex flex-col items-center border border-zinc-100">
                <ShieldCheck size={16} />
                <p className="text-[8px] font-black uppercase">Anti-Tarnish</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="py-20 border-t border-zinc-100 mt-20">
          <div className="container mx-auto px-4 md:px-20">
            <h2 className="text-xl font-black uppercase tracking-tighter mb-10 italic">Complete the Look</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <Link key={p._id} to={`/product/${p.slug || p._id}`} className="group">
                  <div className="aspect-[4/5] bg-zinc-50 overflow-hidden mb-4 rounded-sm border border-zinc-100">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <p className="text-[9px] font-black uppercase tracking-widest">{p.name}</p>
                  <p className="text-[9px] font-bold text-zinc-400">₹{p.price?.toLocaleString()}</p>
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