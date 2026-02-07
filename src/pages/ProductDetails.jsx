import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import {
  Star, ShoppingBag, Minus, Plus, Heart, Camera, X, Trash2,
  Loader2, ChevronRight, ChevronLeft, Zap, BadgePercent, Gift
} from 'lucide-react';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, addToCart, toggleWishlist } = useStore();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('story');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  const reviewsRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      if (reviewImages.length + files.length > 4) {
        addToast("You can only upload up to 4 images.", "error");
        return;
      }
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReviewImages(prev => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/products/${slug}`);
        setProduct(data);
        const allRes = await axios.get('http://localhost:5000/api/products');
        setAllProducts(allRes.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const currentPrice = selectedVariant?.price || product?.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product?.countInStock;
  const isOutOfStock = currentStock === 0;

  useEffect(() => {
    if (!loading && location.hash === '#reviews' && reviewsRef.current) {
      setTimeout(() => {
        reviewsRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else if (!loading) {
      window.scrollTo(0, 0);
    }
  }, [loading, location.hash]);

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (!user) return navigate('/login');
    toggleWishlist(product);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) return navigate('/login');
    if (!comment.trim()) return addToast("Please add a comment", "error");
    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/products/${product._id}/reviews`,
        { rating: ratingInput, comment, images: reviewImages },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      addToast("Review posted!", "success");
      window.location.reload();
    } catch (err) {
      addToast(err.response?.data?.message || "Review failed", "error");
    } finally { setSubmitting(false); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${product._id}/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      addToast("Review deleted", "success");
      window.location.reload();
    } catch (err) {
      addToast(err.response?.data?.message || "Delete failed", "error");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-zinc-900" size={32} />
    </div>
  );

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-center">
      <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Product Not Found</h1>
      <button onClick={() => navigate('/shop')} className="bg-black text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest">
        Return to Shop
      </button>
    </div>
  );

  const isWishlisted = user?.wishlist?.some(item => (item._id || item).toString() === product?._id.toString());
  const gallery = [product.image, ...(product.images || [])].filter(Boolean);
  const suggestions = Array.isArray(allProducts) ? allProducts.filter(p => p.category === product?.category && p._id !== product?._id).slice(0, 4) : [];

  const displayReviews = product.reviews?.length > 0
    ? [...product.reviews].reverse()
    : [
      { name: "Aarav S.", rating: 5, comment: "Exceptional finish and quality. Perfect studio piece." },
      { name: "Ishani M.", rating: 5, comment: "Beautifully packaged. The strike price deal was great!" }
    ];

  return (
    <div className="bg-white min-h-screen pt-40 lg:pt-56 pb-20 px-4 md:px-10">
      {selectedReview && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-50">
            <X size={24} />
          </button>
          <div className="relative w-full max-w-5xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {selectedReview.images?.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (selectedReview.index - 1 + selectedReview.images.length) % selectedReview.images.length;
                  setSelectedReview({ ...selectedReview, index: newIndex, image: selectedReview.images[newIndex] });
                }}
                className="absolute left-4 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all z-20"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <img
              src={selectedReview.image}
              alt="Full View"
              className="w-auto h-auto max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300 select-none"
            />
            {selectedReview.images?.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (selectedReview.index + 1) % selectedReview.images.length;
                  setSelectedReview({ ...selectedReview, index: newIndex, image: selectedReview.images[newIndex] });
                }}
                className="absolute right-4 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all z-20"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
          <p className="text-white/80 text-lg md:text-xl font-medium italic text-center max-w-2xl leading-relaxed mt-8">
            "{selectedReview.comment}"
          </p>
          {selectedReview.images?.length > 1 && (
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-4">
              Image {selectedReview.index + 1} of {selectedReview.images.length}
            </p>
          )}
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="flex flex-col-reverse lg:flex-row gap-3 lg:sticky lg:top-40">
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
              {gallery.map((img, i) => (
                <button key={i} onClick={() => setActiveImgIndex(i)}
                  className={`flex-shrink-0 w-12 h-16 rounded-xl overflow-hidden border transition-all ${activeImgIndex === i ? 'border-black' : 'border-transparent opacity-40'}`}>
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
            <div className="relative flex-1 aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm group">
              <img src={gallery.length > 0 ? gallery[activeImgIndex] : (product.image || "/placeholder.jpg")} className="w-full h-full object-cover" alt="" />
              {product.countInStock === 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center">
                  <span className="bg-black text-white px-6 py-3 text-xs font-black uppercase tracking-widest shadow-xl transform rotate-0">
                    Out of Stock
                  </span>
                </div>
              )}
              <button onClick={handleWishlist} className="absolute top-5 right-5 p-3 bg-white/90 backdrop-blur rounded-full shadow-lg active:scale-95 transition-transform z-30">
                <Heart size={18} fill={isWishlisted ? "black" : "none"} className={isWishlisted ? "text-black" : "text-zinc-300"} />
              </button>
            </div>
            {product.video && (
              <div className="mt-4 aspect-video rounded-3xl overflow-hidden border border-zinc-100 shadow-sm">
                {product.video.includes('youtube') || product.video.includes('youtu.be') ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={product.video.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                    title="Product Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video controls className="w-full h-full object-cover">
                    <source src={product.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6 pt-2 lg:pt-0">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 text-red-600 font-black text-[9px] uppercase tracking-widest">
                  <BadgePercent size={14} /> Seasonal Studio Offer
                </div>
                {product.tags && product.tags.map((tag, i) => (
                  <div key={i} className="bg-black text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
                    {tag}
                  </div>
                ))}
                {product.isBestSeller && !product.tags?.includes('Best Seller') && (
                  <div className="bg-amber-400 text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
                    Best Seller
                  </div>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-black uppercase italic tracking-tighter leading-none">{product.name}</h1>
              <div className="flex items-baseline gap-4 pt-1">
                <span className="text-2xl lg:text-3xl font-black italic">₹{currentPrice?.toLocaleString()}</span>
                <span className="text-base lg:text-lg text-zinc-300 line-through font-bold">₹{((currentPrice || 0) * 1.25).toLocaleString()}</span>
              </div>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3 py-4 border-t border-dashed border-zinc-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Select Option</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => {
                    const isSelected = selectedVariant === variant;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                          ${isSelected ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-black'}
                        `}
                      >
                        {variant.size && <span>Size {variant.size}</span>}
                        {variant.size && variant.color && <span className="mx-1">•</span>}
                        {variant.color && <span>{variant.color}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-y border-zinc-100">
              <div className="flex gap-6">
                {['story', 'specs'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} className={`py-3 text-[9px] font-black uppercase tracking-widest border-b ${activeTab === t ? 'border-black text-black' : 'border-transparent text-zinc-400'}`}>{t}</button>
                ))}
              </div>
              <div className="py-4 space-y-2">
                {activeTab === 'story' ? (
                  <p className="text-[11px] text-zinc-500 leading-relaxed italic whitespace-pre-line">{product.description || "No description available for this product."}</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {product.specs && product.specs.length > 0 ? (
                      product.specs.map((spec, i) => (
                        <div key={i} className="flex justify-between items-center text-[10px] uppercase border-b border-dashed border-zinc-100 pb-2 last:border-0">
                          <span className="font-bold text-zinc-400 tracking-widest">{spec.key}</span>
                          <span className="font-bold text-black">{spec.value}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-zinc-400 italic">No specifications available.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {!isOutOfStock ? (
                <>
                  <div className="flex gap-3">
                    <div className="flex items-center justify-between bg-zinc-50 border rounded-full px-5 w-32 h-[48px]">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:bg-zinc-200 rounded-full"><Minus size={14} /></button>
                      <span className="font-black text-sm">{quantity}</span>
                      <button onClick={() => setQuantity(Math.min(currentStock || 1, quantity + 1))} className="p-1 hover:bg-zinc-200 rounded-full"><Plus size={14} /></button>
                    </div>
                    <button onClick={() => addToCart({ ...product, price: currentPrice, selectedVariant, quantity })} className="flex-1 bg-black text-white h-[48px] rounded-full font-black uppercase tracking-widest text-[9px] shadow-lg active:scale-95 transition-all">Add To Bag</button>
                  </div>
                  <button
                    onClick={() => { addToCart({ ...product, price: currentPrice, selectedVariant, quantity }); navigate('/checkout'); }}
                    className="w-full h-[48px] border border-black rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-black hover:text-white transition-colors"
                  >
                    Quick Checkout
                  </button>
                </>
              ) : (
                <div className="w-full h-[48px] bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center font-black uppercase tracking-widest text-[10px] cursor-not-allowed">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        </div>

        <div ref={reviewsRef} id="reviews" className="mt-20 pt-10 border-t border-zinc-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="bg-zinc-50 p-6 rounded-3xl space-y-4 h-fit">
            <h3 className="text-xs font-black uppercase italic">Submit Review</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => <Star key={n} onClick={() => setRatingInput(n)} size={18} className={`cursor-pointer ${ratingInput >= n ? 'fill-black text-black' : 'text-zinc-200'}`} />)}
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comment..." className="w-full bg-white border border-zinc-100 rounded-2xl p-4 text-[10px] h-24 outline-none focus:border-black" />
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className={`cursor-pointer flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-full text-[9px] font-bold uppercase hover:bg-zinc-200 transition ${reviewImages.length >= 4 ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Camera size={14} /> <span>Add Photos ({reviewImages.length}/4)</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              {reviewImages.length > 0 && (
                <div className="flex gap-2 bg-zinc-50 p-2 rounded-xl w-fit">
                  {reviewImages.map((img, idx) => (
                    <div key={idx} className="relative w-12 h-12">
                      <img src={img} alt="Preview" className="w-full h-full rounded-lg object-cover border border-zinc-200" />
                      <button onClick={() => removeImage(idx)} className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full p-0.5 hover:bg-red-500 transition-colors">
                        <X size={8} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleReviewSubmit} disabled={submitting} className="w-full bg-black text-white py-3 rounded-full font-black text-[9px] uppercase shadow-md">{submitting ? "Posting..." : "Post Review"}</button>
          </div>

          <div className="lg:col-span-2 space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            {displayReviews.filter(r => r.isApproved !== false).map((rev, i) => {
              if (!rev || !rev.rating) return null;
              return (
                <div key={i} className="pb-6 border-b border-zinc-50">
                  <div className="flex justify-between items-center mb-1 font-black uppercase text-[9px] tracking-widest text-zinc-900">
                    <span>{rev.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex">{[...Array(rev.rating)].map((_, j) => <Star key={j} size={8} fill="black" />)}</div>
                      {user && (rev.user === user._id || rev.user?._id === user._id) && (
                        <button onClick={() => handleDeleteReview(rev._id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-500 italic leading-relaxed">"{rev.comment}"</p>
                  {rev.adminResponse && (
                    <div className="mt-3 ml-4 pl-3 border-l-2 border-zinc-200">
                      <p className="text-[9px] font-black uppercase text-zinc-900 mb-1 flex items-center gap-1">
                        <Zap size={10} fill="black" /> Official Response
                      </p>
                      <p className="text-[10px] text-zinc-500 italic leading-relaxed">{rev.adminResponse}</p>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {(() => {
                      const allImages = rev.images && rev.images.length > 0 ? rev.images : (rev.reviewImage ? [rev.reviewImage] : []);
                      return allImages.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Review"
                          onClick={() => setSelectedReview({
                            image: img,
                            images: allImages,
                            index: idx,
                            comment: rev.comment
                          })}
                          className="w-16 h-16 rounded-xl object-cover border border-zinc-100 cursor-zoom-in hover:scale-105 transition-transform"
                        />
                      ));
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mt-20 pt-10 border-t border-zinc-100">
            <h2 className="text-xs font-black uppercase italic mb-8 tracking-widest text-zinc-300 text-center">You Might Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestions.map(item => (
                <Link key={item._id} to={`/product/${item.slug}`} className="group text-left space-y-2">
                  <div className="aspect-[4/5] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-50 transition-transform group-hover:scale-95">
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                  <p className="text-[11px] font-bold italic">₹{item.price?.toLocaleString()}</p>
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