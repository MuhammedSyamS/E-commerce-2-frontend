import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { 
  Star, ShoppingBag, Minus, Plus, Heart, Camera, Send, 
  Loader2, Tag, ShieldCheck, Truck, ChevronRight, ChevronLeft, 
  CheckCircle2, Zap, BadgePercent, Gift, Info, Box, RefreshCw
} from 'lucide-react';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, setUser, addToCart } = useStore();
  const fileInputRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('story');

  // Review States
  const [ratingInput, setRatingInput] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState(""); 
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/products/${slug}`);
        setProduct(data);
        const allRes = await axios.get('http://localhost:5000/api/products');
        setAllProducts(allRes.data || []);
      } catch (err) { console.error("Fetch Error:", err); } 
      finally { setLoading(false); }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [slug]);

  // GALLERY LOGIC (5 SLOTS)
  const gallery = product ? [product.image, product.image, product.image, product.image, product.image] : [];

  // --- ACTIONS ---
  const handleWishlist = async () => {
    if (!user?.token) return navigate('/login');
    try {
      const { data } = await axios.post(`http://localhost:5000/api/wishlist`, 
        { productId: product._id }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setUser({ ...user, wishlist: data });
    } catch (err) { console.error("Wishlist sync error"); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) return navigate('/login');
    if (!comment.trim()) return alert("Review text is required");
    setSubmitting(true);
    try {
      // FIXED: Sending object to prevent "Nested Object" error
      await axios.post(`http://localhost:5000/api/products/${product._id}/reviews`, 
        { rating: ratingInput, comment, reviewImage }, 
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("Review posted!");
      window.location.reload();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
    finally { setSubmitting(false); }
  };

  const isWishlisted = user?.wishlist?.some(id => (id._id || id) === product?._id);
  const suggestions = allProducts.filter(p => p.category === product?.category && p._id !== product?._id).slice(0, 4);

  if (loading || !product) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="bg-white min-h-screen pt-44 pb-20 px-4 md:px-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* 1. GALLERY (5-Image Strip + Arrows + Heart) */}
          <div className="flex flex-col-reverse md:flex-row gap-4 sticky top-40">
            <div className="flex md:flex-col gap-3 overflow-x-auto no-scrollbar">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImgIndex(i)} className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImgIndex === i ? 'border-black' : 'border-transparent opacity-40'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="relative flex-1 aspect-[4/5] bg-zinc-50 rounded-[3rem] overflow-hidden group border border-zinc-100 shadow-sm">
              <img src={gallery[activeImgIndex]} className="w-full h-full object-cover transition-transform duration-1000 hover:scale-125 cursor-zoom-in" alt="" />
              <button onClick={() => setActiveImgIndex((activeImgIndex - 1 + 5) % 5)} className="absolute left-4 top-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft /></button>
              <button onClick={() => setActiveImgIndex((activeImgIndex + 1) % 5)} className="absolute right-4 top-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-all"><ChevronRight /></button>
              <button onClick={handleWishlist} className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-full shadow-xl z-20">
                <Heart size={20} className={isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-300"} />
              </button>
              <div className="absolute bottom-6 left-6 bg-black text-white px-4 py-2 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-2"><Zap size={12} className="text-yellow-400 fill-yellow-400" /> Exclusive</div>
            </div>
          </div>

          {/* 2. INFO & OFFERING */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest bg-red-50 w-fit px-3 py-1 rounded-full">
                <BadgePercent size={14} /> Flash Studio Offer Applied
              </div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex text-black">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? "black" : "none"} />)}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 underline">{product.numReviews || 0} Verified Reviews</span>
              </div>
              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-4xl font-black italic">₹{product.price.toLocaleString()}</span>
                <span className="text-xl text-zinc-300 line-through font-bold">₹{(product.price * 1.25).toLocaleString()}</span>
                <p className="text-[10px] font-black text-green-600 uppercase">You Save 25% Today</p>
              </div>
            </div>

            {/* PRODUCT TABS (Story/Specs) */}
            <div className="border-y border-zinc-100 py-2">
              <div className="flex gap-8">
                {['story', 'details', 'shipping'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === t ? 'border-black' : 'border-transparent text-zinc-400'}`}>{t}</button>
                ))}
              </div>
              <div className="py-6 text-xs text-zinc-500 leading-relaxed italic">
                {activeTab === 'story' && (product.description || "A masterfully crafted piece designed for elegance.")}
                {activeTab === 'details' && "Material: 925 Sterling Silver | Hallmarked | High Polish Finish"}
                {activeTab === 'shipping' && "Usually ships within 48 hours. Free delivery on orders above ₹2k."}
              </div>
            </div>

            {/* UNIFORM BUTTONS */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-full px-8 py-4 w-full sm:w-44 h-[68px]">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus size={18}/></button>
                  <span className="font-black text-xl">{quantity}</span>
                  <button onClick={() => setQuantity(q => q+1)}><Plus size={18}/></button>
                </div>
                <button onClick={() => addToCart({...product, quantity})} className="flex-1 bg-black text-white h-[68px] rounded-full font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl active:scale-95">Add To Bag</button>
              </div>
              <button onClick={() => { addToCart({...product, quantity}); navigate('/checkout'); }} className="w-full h-[68px] border-2 border-black rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-black hover:text-white transition-all">Express Checkout</button>
            </div>

            {/* TRUST GRID */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"><Truck size={20} className="mx-auto mb-2 text-zinc-400"/><p className="text-[8px] font-black uppercase tracking-tighter">Fast Ship</p></div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"><ShieldCheck size={20} className="mx-auto mb-2 text-zinc-400"/><p className="text-[8px] font-black uppercase tracking-tighter">Hallmarked</p></div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100"><RefreshCw size={20} className="mx-auto mb-2 text-zinc-400"/><p className="text-[8px] font-black uppercase tracking-tighter">Easy Return</p></div>
            </div>
          </div>
        </div>

        {/* 3. REVIEWS (PERMANENT INPUT + LIST) */}
        <div className="mt-32 pt-20 border-t border-zinc-100 grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="space-y-8">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-zinc-900 leading-none">Verified Review</h2>
            <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 space-y-6">
              <div className="flex gap-2">
                {[1,2,3,4,5].map(n => <Star key={n} onClick={() => setRatingInput(n)} size={24} className={`cursor-pointer ${ratingInput >= n ? 'fill-black text-black' : 'text-zinc-200'}`} />)}
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment on the craftsmanship..." className="w-full bg-white border border-zinc-200 rounded-3xl p-6 text-xs font-bold h-32 outline-none focus:border-black transition-all" />
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => fileInputRef.current.click()} className="p-3 bg-white border rounded-full"><Camera size={18} /></button>
                <input type="file" hidden ref={fileInputRef} onChange={(e) => { /* Handle image upload */ }} />
                <button onClick={handleReviewSubmit} disabled={submitting} className="bg-black text-white px-8 py-3 rounded-full font-black uppercase text-[10px] shadow-xl">{submitting ? "Posting..." : "Post Review"}</button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-12">
            {product.reviews?.length > 0 ? product.reviews.map((rev, i) => (
              <div key={i} className="pb-8 border-b border-zinc-50 group">
                <div className="flex justify-between items-center mb-2 font-black uppercase text-[10px]">
                  <span>{rev.name}</span>
                  <div className="flex">{[...Array(rev.rating)].map((_, j) => <Star key={j} size={10} fill="black" />)}</div>
                </div>
                <p className="text-sm text-zinc-500 italic leading-relaxed">"{rev.comment}"</p>
                {rev.reviewImage && <img src={rev.reviewImage} className="w-24 h-24 rounded-2xl object-cover mt-4 border border-zinc-100" alt="" />}
              </div>
            )) : <p className="text-zinc-300 italic uppercase font-black text-xs">No feedback yet.</p>}
          </div>
        </div>

        {/* 4. SUGGESTIONS (COMPLETE THE LOOK) */}
        {suggestions.length > 0 && (
          <div className="mt-32 pt-20 border-t border-zinc-100">
            <h2 className="text-3xl font-black uppercase italic mb-10 tracking-tighter text-center">Complete <span className="text-zinc-300">The Look</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {suggestions.map(item => (
                <Link key={item._id} to={`/product/${item.slug || item._id}`} className="group space-y-4">
                  <div className="aspect-[4/5] bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 group-hover:shadow-2xl transition-all duration-500">
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">{item.category}</p>
                    <p className="text-xs font-black uppercase">{item.name}</p>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-sm font-bold italic">₹{item.price.toLocaleString()}</p>
                      <p className="text-[10px] font-bold text-zinc-300 line-through">₹{Math.round(item.price * 1.25).toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;