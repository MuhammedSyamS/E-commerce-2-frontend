import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import {
  Star, ShoppingBag, Minus, Plus, Heart, Camera, X, Trash2,
  Loader2, ChevronRight, ChevronLeft, Zap, BadgePercent, Gift, ShieldCheck, RotateCcw
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

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
  const [sortOption, setSortOption] = useState('newest');

  const reviewsRef = useRef(null);

  const [uploading, setUploading] = useState(false);

  const validateFile = (file, type) => {
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB Video, 5MB Image
    if (file.size > maxSize) {
      addToast(`File too large. Max ${type === 'video' ? '50MB' : '5MB'}`, "error");
      return false;
    }
    return true;
  };

  // HELPER: Resize Image (MNC Performance Optimization)
  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max dimensions (e.g. 1080p)
          const MAX_WIDTH = 1080;
          const MAX_HEIGHT = 1080;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG 0.7 quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    // Process sequentially to avoid browser freeze
    for (const file of files) {
      if (!validateFile(file, 'image')) continue;

      try {
        const resizedImage = await resizeImage(file);
        setReviewImages(prev => [...prev, resizedImage]);
      } catch (err) {
        console.error("Compression ended error", err);
        addToast("Failed to process image", "error");
      }
    }
    setUploading(false);
  };

  const [reviewVideos, setReviewVideos] = useState([]); // Changed to Array

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      if (!validateFile(file, 'video')) continue;

      // Video Compression is hard on client without heavy libraries.
      // We will read as DataURL but warn if huge.
      const reader = new FileReader();

      await new Promise((resolve) => {
        reader.onloadend = () => {
          setReviewVideos(prev => [...prev, reader.result]);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
  };

  const removeImage = (index) => {
    setReviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setReviewVideos(prev => prev.filter((_, i) => i !== index));
  };

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/products/${slug}`);
        setProduct(data);

        // Record View (AI)
        if (user && data._id) {
          axios.post('http://localhost:5000/api/users/history',
            { productId: data._id },
            { headers: { Authorization: `Bearer ${user.token}` } }
          ).catch(err => console.error("Tracking Error:", err));
        }

        // Fetch AI Recommendations
        const recRes = await axios.get('http://localhost:5000/api/products/recommendations', {
          headers: user ? { Authorization: `Bearer ${user.token}` } : {}
        });
        setSuggestions(recRes.data || []);

      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, user]);

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
    if (!loading && location.hash === '#reviews') {
      setActiveTab('reviews'); // Ensure tab is active if applicable
      setTimeout(() => {
        if (reviewsRef.current) {
          reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Increased timeout for ensuring layout is stable
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
        { rating: ratingInput, comment, images: reviewImages, videos: reviewVideos },
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

  // MERGE IMAGES AND VIDEO INTO ONE GALLERY ARRAY
  const mediaItems = [
    ...(product.image ? [{ type: 'image', url: product.image }] : []),
    ...(product.images || []).map(url => ({ type: 'image', url })),
    ...(product.videos || []).map(url => ({ type: 'video', url })),
    ...(product.video ? [{ type: 'video', url: product.video }] : [])
  ];

  // REMOVED SHADOWED VARIABLE 'suggestions'

  const handleHelpfulVote = async (reviewId) => {
    if (!user) return addToast("Please login to vote", "error");
    try {
      const { data } = await axios.put(`http://localhost:5000/api/products/${product._id}/reviews/${reviewId}/helpful`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      // Optimistic Update
      const updatedReviews = (product.reviews || []).map(r => {
        if (r._id === reviewId) {
          const isHelpful = data.isHelpful;
          const currentHelpful = r.helpful || [];
          const newHelpful = isHelpful
            ? [...currentHelpful, user._id]
            : currentHelpful.filter(id => id !== user._id);
          return { ...r, helpful: newHelpful };
        }
        return r;
      });
      setProduct({ ...product, reviews: updatedReviews });
      addToast(data.isHelpful ? "Marked as helpful" : "Vote removed", "success");
    } catch (err) {
      addToast("Failed to vote", "error");
    }
  };

  const getSortedReviews = () => {
    if (!product?.reviews) return [];
    // Safe spread to prevent crash if reviews is undefined/null
    let reviews = [...(product.reviews || [])].filter(r => r.isApproved !== false);

    switch (sortOption) {
      case 'newest':
        return reviews.reverse(); // Default is oldest first in DB usually
      case 'oldest':
        return reviews;
      case 'highest':
        return reviews.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return reviews.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return reviews.sort((a, b) => (b.helpful?.length || 0) - (a.helpful?.length || 0));
      default:
        return reviews.reverse();
    }
  };

  const sortedReviews = getSortedReviews();

  return (
    <div className="bg-white min-h-screen pt-40 lg:pt-56 pb-20 px-4 md:px-10">
      <Helmet>
        <title>{product ? `${product.name} | SLOOK` : 'Product Details | SLOOK'}</title>
        <meta name="description" content={product?.description || "Shop the finest curated goods at SLOOK."} />
        <meta property="og:title" content={product?.name} />
        <meta property="og:description" content={product?.description} />
        <meta property="og:image" content={product?.image} />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* ... (Existing Lightbox Code) ... */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedReview(null)}
        >
          <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-50">
            <X size={24} />
          </button>

          <div
            className="bg-white w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT: MEDIA GALLERY (2/3 width on large screens) */}
            <div className="lg:col-span-2 bg-black relative flex items-center justify-center h-1/2 lg:h-full group">
              {/* Navigation Arrows */}
              {selectedReview.media?.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = (selectedReview.index - 1 + selectedReview.media.length) % selectedReview.media.length;
                      setSelectedReview({
                        ...selectedReview,
                        index: newIndex,
                        currentMedia: selectedReview.media[newIndex]
                      });
                    }}
                    className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all z-20 backdrop-blur-sm"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newIndex = (selectedReview.index + 1) % selectedReview.media.length;
                      setSelectedReview({
                        ...selectedReview,
                        index: newIndex,
                        currentMedia: selectedReview.media[newIndex]
                      });
                    }}
                    className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all z-20 backdrop-blur-sm"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Media Content */}
              {selectedReview.currentMedia?.type === 'video' ? (
                <video
                  controls
                  autoPlay
                  src={selectedReview.currentMedia.url}
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={selectedReview.currentMedia?.url || selectedReview.image}
                  alt="Review Media"
                  className="w-full h-full object-contain select-none"
                />
              )}

              {/* Media Counter Badge */}
              {selectedReview.media?.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                  {selectedReview.index + 1} / {selectedReview.media.length}
                </div>
              )}
            </div>

            {/* RIGHT: REVIEW DETAILS (1/3 width on large screens) */}
            <div className="lg:col-span-1 bg-white p-6 lg:p-10 overflow-y-auto flex flex-col h-1/2 lg:h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-black text-xs uppercase">
                  {selectedReview.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">{selectedReview.name}</p>
                  {selectedReview.isVerifiedPurchase && (
                    <span className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1">
                      <BadgePercent size={10} /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < (selectedReview.rating || 5) ? "fill-black text-black" : "text-zinc-200"}
                  />
                ))}
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-sm text-zinc-600 leading-relaxed italic mb-6">
                  "{selectedReview.comment}"
                </p>
                {selectedReview.adminResponse && (
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-6">
                    <p className="text-[10px] font-black uppercase text-zinc-900 mb-2 flex items-center gap-1">
                      <Zap size={10} fill="black" /> Official Response
                    </p>
                    <p className="text-xs text-zinc-500 italic">{selectedReview.adminResponse}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-100">
                <p className="text-[10px] text-zinc-400 font-bold uppercase mb-4">
                  Posted on {selectedReview.createdAt ? new Date(selectedReview.createdAt).toLocaleDateString() : 'Recent'}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent propagation
                    handleHelpfulVote(selectedReview._id);
                  }}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase transition-all
                    ${(user && selectedReview.helpful?.includes(user._id)) ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}
                  `}
                >
                  <Heart size={14} fill={(user && selectedReview.helpful?.includes(user._id)) ? "white" : "none"} />
                  <span>Helpful ({selectedReview.helpful?.length || 0})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* ... (Existing Product Header/Gallery) ... */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="flex flex-col-reverse lg:flex-row gap-3 lg:sticky lg:top-40">
            {/* THUMBNAILS */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar">
              {mediaItems.map((item, i) => (
                <button key={i} onClick={() => setActiveImgIndex(i)}
                  className={`flex-shrink-0 w-12 h-16 rounded-xl overflow-hidden border transition-all flex items-center justify-center bg-zinc-50 ${activeImgIndex === i ? 'border-black opacity-100' : 'border-transparent opacity-40'}`}>
                  {item.type === 'video' ? (
                    <div className="bg-black/10 rounded-full p-1"><Zap size={14} fill="currentColor" /></div>
                  ) : (
                    <img src={item.url} className="w-full h-full object-cover" alt="" loading="lazy" />
                  )}
                </button>
              ))}
            </div>

            {/* MAIN DISPLAY */}
            <div className="relative flex-1 aspect-[4/5] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-sm group">
              {mediaItems[activeImgIndex]?.type === 'video' ? (
                <div className="w-full h-full bg-black flex items-center justify-center">
                  {(mediaItems[activeImgIndex].url && (mediaItems[activeImgIndex].url.includes('youtube') || mediaItems[activeImgIndex].url.includes('youtu.be'))) ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={mediaItems[activeImgIndex].url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      title="Product Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls autoPlay className="w-full h-full object-contain">
                      <source src={mediaItems[activeImgIndex]?.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ) : (
                <img
                  src={mediaItems[activeImgIndex]?.url || "/placeholder.jpg"}
                  className="w-full h-full object-cover"
                  alt=""
                  loading="lazy"
                />
              )}

              {/* Overlays only for Image */}
              {mediaItems[activeImgIndex]?.type === 'image' && product.countInStock === 0 && (
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

              {/* Star Rating Display */}
              <div className="flex items-center gap-2 mt-2 cursor-pointer group w-fit" onClick={() => {
                setActiveTab('reviews');
                setTimeout(() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.round(product.rating || 0) ? "fill-black text-black" : "text-zinc-200"}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-zinc-500 group-hover:text-black transition-colors underline decoration-zinc-300 underline-offset-4">
                  {product.numReviews || 0} Reviews
                </span>
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

            <div id="reviews-section" className="border-y border-zinc-100">
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

            {/* TRUST BAR */}
            <div className="grid grid-cols-2 gap-3 pt-6">
              {[
                { text: "256-Bit Secure SSL Checkout", icon: <ShieldCheck size={14} /> },
                { text: "7-Day Money-Back Guarantee", icon: <RotateCcw size={14} /> },
                { text: "Inspected for Premium Quality", icon: <Star size={14} /> },
                { text: "Over 1,000+ Happy Customers", icon: <Heart size={14} /> }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-tight">
                  <span className="text-black">{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div ref={reviewsRef} id="reviews" className="mt-20 pt-10 border-t border-zinc-100 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="bg-zinc-50 p-6 rounded-3xl space-y-4 h-fit">
            <h3 className="text-xs font-black uppercase italic">Submit Review</h3>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(n => <Star key={n} onClick={() => setRatingInput(n)} size={18} className={`cursor-pointer ${ratingInput >= n ? 'fill-black text-black' : 'text-zinc-200'}`} />)}
            </div>
            <div className="bg-zinc-100 p-4 rounded-xl mb-4">
              <p className="text-[10px] font-bold uppercase mb-2">Tips for a helpful review:</p>
              <ul className="list-disc pl-4 space-y-1 text-[9px] text-zinc-500 italic">
                <li>What hesitation did you have before buying?</li>
                <li>How would you describe the feeling of wearing this?</li>
                <li>What specific problem did this product solve?</li>
              </ul>
            </div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your experience..." className="w-full bg-white border border-zinc-100 rounded-2xl p-4 text-[10px] h-24 outline-none focus:border-black" />
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <label className={`cursor-pointer flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition active:scale-95 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Camera size={14} className="text-zinc-900" />
                  <span className="text-zinc-600">Add Photos</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                </label>
                <label className={`cursor-pointer flex items-center gap-2 bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition active:scale-95 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <Zap size={14} className="text-zinc-900" />
                  <span className="text-zinc-600">Add Videos</span>
                  <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" disabled={uploading} />
                </label>
                {uploading && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 animate-pulse">
                    <Loader2 size={12} className="animate-spin" /> Compressing & Uploading...
                  </div>
                )}
              </div>

              {/* MEDIA PREVIEW GRID */}
              {(reviewImages.length > 0 || reviewVideos.length > 0) && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {reviewImages.map((img, idx) => (
                    <div key={`img-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group border border-zinc-100 bg-zinc-50">
                      <img src={img} alt="Preview" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {reviewVideos.map((vid, idx) => (
                    <div key={`vid-${idx}`} className="relative aspect-square rounded-xl overflow-hidden group bg-black flex items-center justify-center border border-zinc-100">
                      <video src={vid} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={16} className="text-white fill-white" />
                      </div>
                      <button onClick={() => removeVideo(idx)} className="absolute top-1 right-1 bg-white/20 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-red-500">
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleReviewSubmit} disabled={submitting} className="w-full bg-black text-white py-3 rounded-full font-black text-[9px] uppercase shadow-md">{submitting ? "Posting..." : "Post Review"}</button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* SORTING CONTROLS */}
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <h2 className="text-xs font-black uppercase italic tracking-widest">
                {sortedReviews.length} Reviews
              </h2>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-[10px] font-bold uppercase bg-transparent border-none focus:ring-0 cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>

            <div className="max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
              {sortedReviews.map((rev, i) => {
                if (!rev || !rev.rating) return null;
                const isHelpful = user && rev.helpful?.includes(user._id);

                return (
                  <div
                    key={i}
                    onClick={() => {
                      // UNIFIED MEDIA LIST (Videos + Images)
                      const videos = rev.videos || (rev.video ? [rev.video] : []);
                      const images = rev.images || (rev.reviewImage ? [rev.reviewImage] : []);
                      const allMedia = [
                        ...videos.map(v => ({ type: 'video', url: v })),
                        ...images.map(i => ({ type: 'image', url: i }))
                      ];

                      setSelectedReview({
                        ...rev,
                        media: allMedia.length > 0 ? allMedia : [{ type: 'image', url: '/placeholder.jpg' }], // Fallback if no media
                        currentMedia: allMedia.length > 0 ? allMedia[0] : { type: 'image', url: '/placeholder.jpg' },
                        index: 0
                      });
                    }}
                    className="pb-6 border-b border-zinc-50 last:border-0 cursor-pointer group hover:bg-zinc-50/50 transition-colors p-4 -mx-4 rounded-xl"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-black uppercase text-[10px] tracking-widest text-zinc-900 group-hover:underline decoration-zinc-300 underline-offset-4 transition-all">{rev.name}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase flex items-center gap-1">
                              <BadgePercent size={8} /> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} size={8} className={j < rev.rating ? "fill-black text-black" : "text-zinc-200"} />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-[9px] text-zinc-400 font-medium">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                        {user && (rev.user === user._id || rev.user?._id === user._id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteReview(rev._id);
                            }}
                            className="text-red-500 hover:text-red-700 transition-colors bg-white p-1 rounded-full shadow-sm"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-zinc-600 italic leading-relaxed mb-3 line-clamp-3">"{rev.comment}"</p>

                    {/* IMAGES & VIDEO PREVIEW (Mini) */}
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {(() => {
                        const videos = rev.videos || (rev.video ? [rev.video] : []);
                        const images = rev.images || (rev.reviewImage ? [rev.reviewImage] : []);
                        const allMedia = [
                          ...videos.map(v => ({ type: 'video', url: v })),
                          ...images.map(i => ({ type: 'image', url: i }))
                        ];

                        if (allMedia.length === 0) return null;

                        return allMedia.slice(0, 4).map((media, idx) => (
                          <div
                            key={idx}
                            className={`w-12 h-12 rounded-lg overflow-hidden border border-zinc-100 ${media.type === 'video' ? 'bg-black flex items-center justify-center' : ''}`}
                          >
                            {media.type === 'video' ? (
                              <Zap size={16} className="text-white" />
                            ) : (
                              <img src={media.url} alt="Review" className="w-full h-full object-cover" />
                            )}
                          </div>
                        ));
                      })()}
                      {((rev.videos?.length || 0) + (rev.images?.length || 0)) > 4 && (
                        <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center text-[9px] font-bold text-zinc-500 border border-zinc-200">
                          +{(rev.videos?.length || 0) + (rev.images?.length || 0) - 4}
                        </div>
                      )}
                    </div>
                    {/* ACTIONS: Helpful & Response */}
                    <div className="flex items-center justify-between mt-2">
                      {/* Helpful Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHelpfulVote(rev._id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase transition-colors border border-zinc-100 shadow-sm
                          ${isHelpful ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 hover:bg-zinc-50'}
                        `}
                      >
                        <Heart size={10} fill={isHelpful ? "white" : "none"} />
                        <span>Helpful ({rev.helpful?.length || 0})</span>
                      </button>
                    </div>

                    {/* Admin Response */}
                    {rev.adminResponse && (
                      <div className="mt-3 ml-4 pl-3 border-l-2 border-zinc-200">
                        <p className="text-[9px] font-black uppercase text-zinc-900 mb-1 flex items-center gap-1">
                          <Zap size={10} fill="black" /> Official Response
                        </p>
                        <p className="text-[10px] text-zinc-500 italic leading-relaxed line-clamp-2">{rev.adminResponse}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>



        {
          suggestions.length > 0 && (
            <div className="mt-20 pt-10 border-t border-zinc-100">
              <h2 className="text-xs font-black uppercase italic mb-8 tracking-widest text-zinc-300 text-center">You Might Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestions.map((item) => (
                  <Link key={item._id} to={`/product/${item.slug}`} className="group text-left space-y-2 block">
                    <div className="aspect-[4/5] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-50 transition-transform group-hover:scale-95 relative">
                      {item.isBestSeller && (
                        <span className="absolute top-2 left-2 bg-amber-400 text-black text-[8px] font-black uppercase px-2 py-1 rounded-full z-10">Best Seller</span>
                      )}
                      <img src={item.image} className="w-full h-full object-cover" alt="" loading="lazy" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black uppercase truncate text-zinc-900">{item.name}</p>
                      <p className="text-[11px] font-bold italic text-zinc-500">₹{item.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        }
      </div >
    </div >
  );
};

export default ProductDetails;