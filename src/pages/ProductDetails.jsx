import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Share2, Heart, ShoppingBag, ChevronRight, Star, Minus, Plus, Instagram, Facebook, Twitter, MessageCircle, MoreHorizontal, Send, Info, BadgePercent, Trash2, Zap, ArrowLeft, Camera, Video, Play, Maximize2, Download, ExternalLink, Link as LinkIcon, Home, X, Loader2, ChevronLeft, BellRing, Check, Sparkles, ShieldCheck, RotateCcw, Lock, Award } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { Skeleton } from '../components/ui/Skeleton';
import { Helmet } from 'react-helmet-async';
import Price from '../components/Price';
import api from '../api/instance';
import NotifyMeModal from '../components/NotifyMeModal';
import RecentlyViewed from '../components/RecentlyViewed';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, addToCart, toggleWishlist } = useStore();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState('story');
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // selectedVariant is now a useMemo to prevent state lag
  const [ratingInput, setRatingInput] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [sortOption, setSortOption] = useState('newest');
  const [siteSettings, setSiteSettings] = useState(null);
  const [showWaitlistModal, setShowWaitlistModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const [showSizeConsultant, setShowSizeConsultant] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitPreference, setFitPreference] = useState('Standard');
  const [aiRecommendation, setAiRecommendation] = useState(null);

  // Dynamic Delivery Logic
  const deliveryDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }, []);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [zoomRatio, setZoomRatio] = useState(1);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const reviewsRef = useRef(null);
  const scrollToReviews = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const validateFile = (file, type) => {
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      addToast(`File too large. Max ${type === 'video' ? '50MB' : '5MB'}`, "error");
      return false;
    }
    return true;
  };

  const resizeImage = (file) => {
    const [ratingInput, setRatingInput] = useState(5);
    const [comment, setComment] = useState("");
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1080;
          const MAX_HEIGHT = 1080;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
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
    for (const file of files) {
      if (!validateFile(file, 'image')) continue;
      try {
        const resizedImage = await resizeImage(file);
        setReviewImages(prev => [...prev, resizedImage]);
      } catch (err) { addToast("Failed to process image", "error"); }
    }
    setUploading(false);
  };

  const [reviewVideos, setReviewVideos] = useState([]);
  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      if (!validateFile(file, 'video')) continue;
      const reader = new FileReader();
      await new Promise((resolve) => {
        reader.onloadend = () => { setReviewVideos(prev => [...prev, reader.result]); resolve(); };
        reader.readAsDataURL(file);
      });
    }
    setUploading(false);
  };

  const removeImage = (index) => setReviewImages(prev => prev.filter((_, i) => i !== index));
  const removeVideo = (index) => setReviewVideos(prev => prev.filter((_, i) => i !== index));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
        let history = [];
        try { history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]'); } catch (e) { history = []; }
        const updatedHistory = [
          { _id: data._id, name: data.name, slug: data.slug, image: data.image, price: data.price },
          ...(Array.isArray(history) ? history.filter(item => item._id !== data._id) : [])
        ].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedHistory));
        if (user && data._id && user.token) {
          api.post('/users/history', { productId: data._id }).catch(() => { });
        }
        const recRes = await api.get(`/products/recommendations?category=${data.category}&exclude=${data._id}`);
        setSuggestions(recRes.data || []);
        const settingsRes = await api.get('/settings');
        setSiteSettings(settingsRes.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [slug, user]);

  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const params = new URLSearchParams(location.search);
      const urlColor = params.get('color');
      const urlSize = params.get('size');

      if (urlColor || urlSize) {
        if (urlColor) setSelectedColor(urlColor);
        if (urlSize) setSelectedSize(urlSize);
      } else {
        const inStockVariant = product.variants.find(v => Number(v.stock ?? v.countInStock ?? v.qty ?? 0) > 0);
        const firstVariant = inStockVariant || product.variants[0];
        setSelectedColor(firstVariant.color);
        setSelectedSize(firstVariant.size);
      }
    } else {
      setSelectedColor(null);
      setSelectedSize(null);
    }
  }, [product, location.search]);

  const updateUrlParams = (color, size) => {
    const params = new URLSearchParams(location.search);
    if (color) params.set('color', color);
    if (size) params.set('size', size);
    navigate({ search: params.toString() }, { replace: true });
  };

  const colors = useMemo(() => {
    if (!product?.variants) return [];
    const colorMap = new Map();
    product.variants.forEach(v => {
      if (v.color && !colorMap.has(v.color)) {
        colorMap.set(v.color, v.image || product.image);
      }
    });
    return Array.from(colorMap.entries()).map(([name, image]) => ({ name, image }));
  }, [product]);

  const allSizes = useMemo(() => {
    if (!product?.variants) return [];
    const sizes = [...new Set(product.variants.map(v => v.size).filter(Boolean))];
    // Custom sort for standard sizes
    const order = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    return sizes.sort((a, b) => {
      const indexA = order.indexOf(a.toUpperCase());
      const indexB = order.indexOf(b.toUpperCase());
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      return a.localeCompare(b);
    });
  }, [product]);

  // DERIVE SELECTED VARIANT IN RENDER (No state lag)
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    return product.variants.find(v =>
      String(v.color || '').trim().toLowerCase() === String(selectedColor || '').trim().toLowerCase() &&
      String(v.size || '').trim().toLowerCase() === String(selectedSize || '').trim().toLowerCase()
    ) || null;
  }, [selectedColor, selectedSize, product]);

  // SMART PIVOT LOGIC: If a user picks a color/size that is OOS in the current combo,
  // but available in others, pivot them to an available one.
  useEffect(() => {
    if (!product?.variants || !selectedColor || !selectedSize) return;

    // If current selection is OOS or non-existent
    const currentIsOOS = !selectedVariant || Number(selectedVariant.stock || 0) <= 0;

    if (currentIsOOS) {
      // Find FIRST available variant for the CURRENT color
      const autoVariant = product.variants.find(v =>
        String(v.color || '').trim().toLowerCase() === String(selectedColor || '').trim().toLowerCase() &&
        Number(v.stock ?? v.countInStock ?? v.qty ?? 0) > 0
      );

      if (autoVariant) {
        setSelectedSize(autoVariant.size);
      }
    }
  }, [selectedColor, product, selectedVariant]); // Only pivot on color change/stock change 

  const currentPrice = selectedVariant?.price || product?.price;
  const currentStock = (product?.variants && product.variants.length > 0)
    ? (selectedVariant ? Number(selectedVariant.stock ?? selectedVariant.countInStock ?? selectedVariant.qty ?? 0) : 0)
    : Number(product?.countInStock || 0);
  const isOutOfStock = currentStock <= 0;

  const mediaItems = useMemo(() => {
    const items = [
      ...(product?.image ? [{ type: 'image', url: product.image }] : []),
      ...(product?.images || []).map(url => ({ type: 'image', url })),
      ...(product?.videos || []).map(url => ({ type: 'video', url })),
      ...(product?.video ? [{ type: 'video', url: product.video }] : [])
    ];
    return items;
  }, [product]);

  const [variantForcedImage, setVariantForcedImage] = useState(null);
  useEffect(() => {
    if (selectedVariant?.image) { setVariantForcedImage(selectedVariant.image); }
    else { setVariantForcedImage(null); }
  }, [selectedVariant]);

  const handleThumbnailClick = (index) => {
    setActiveMediaIndex(index);
    setVariantForcedImage(null);
  };

  useEffect(() => {
    if (!loading && location.hash === '#reviews') {
      setActiveTab('reviews');
      setTimeout(() => { if (reviewsRef.current) reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 500);
    } else if (!loading) { window.scrollTo(0, 0); }
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
      await api.post(`/products/${product._id}/reviews`,
        { rating: ratingInput, comment, images: reviewImages, videos: reviewVideos },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      addToast("Review posted!", "success");
      window.location.reload();
    } catch (err) { addToast(err.response?.data?.message || "Review failed", "error"); } finally { setSubmitting(false); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/products/${product._id}/reviews/${reviewId}`, { headers: { Authorization: `Bearer ${user.token}` } });
      addToast("Review deleted", "success");
      window.location.reload();
    } catch (err) { addToast(err.response?.data?.message || "Delete failed", "error"); }
  };


  const ratingDistribution = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!product?.reviews) return dist;
    product.reviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) dist[Math.floor(r.rating)]++;
    });
    return dist;
  }, [product]);

  if (loading) return (
    <div className="bg-white min-h-screen pt-40 md:pt-48 pb-20 font-sans">
      <div className="container-responsive">
        <Skeleton className="h-4 w-48 mb-10 rounded-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-7">
            <Skeleton className="aspect-square w-full rounded-[2.5rem]" />
            <div className="grid grid-cols-4 gap-4 mt-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <Skeleton className="h-16 w-full rounded-full mt-10" />
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (<div className="h-screen flex items-center justify-center">Product Not Found</div>);

  const isWishlisted = user?.wishlist?.some(item => (item._id || item).toString() === product?._id.toString());
  const getDeliveryDateRange = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleHelpfulVote = async (reviewId) => {
    if (!user) return addToast("Please login to vote", "error");
    try {
      const { data } = await api.put(`/products/${product._id}/reviews/${reviewId}/helpful`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      const updatedReviews = (product.reviews || []).map(r => {
        if (r._id === reviewId) {
          const currentHelpful = r.helpful || [];
          const newHelpful = data.isHelpful ? [...currentHelpful, user._id] : currentHelpful.filter(id => id !== user._id);
          return { ...r, helpful: newHelpful };
        }
        return r;
      });
      setProduct({ ...product, reviews: updatedReviews });
    } catch (err) { addToast("Failed to vote", "error"); }
  };

  const sortedReviews = (() => {
    let reviews = [...(product.reviews || [])].filter(r => r.isApproved !== false);
    switch (sortOption) {
      case 'newest': return reviews.reverse();
      case 'oldest': return reviews;
      case 'highest': return reviews.sort((a, b) => b.rating - a.rating);
      case 'lowest': return reviews.sort((a, b) => a.rating - b.rating);
      case 'helpful': return reviews.sort((a, b) => (b.helpful?.length || 0) - (a.helpful?.length || 0));
      default: return reviews.reverse();
    }
  })();

  return (
    <div className="bg-white min-h-screen pt-40 md:pt-48 pb-20 font-sans text-[#1a1a1a] selection:bg-black selection:text-white">
      <Helmet>
        <title>{`${product.name} | SLOOK`}</title>
        <meta name="description" content={product.description} />
      </Helmet>

      {selectedReview && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8" onClick={() => setSelectedReview(null)}>
          <button className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-50"><X size={24} /></button>
          <div className="bg-white w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="lg:col-span-2 bg-black relative flex items-center justify-center h-1/2 lg:h-full group">
              {selectedReview.media?.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); const newIndex = (selectedReview.index - 1 + selectedReview.media.length) % selectedReview.media.length; setSelectedReview({ ...selectedReview, index: newIndex, currentMedia: selectedReview.media[newIndex] }); }} className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black z-20 transition-all"><ChevronLeft size={24} /></button>
                  <button onClick={(e) => { e.stopPropagation(); const newIndex = (selectedReview.index + 1) % selectedReview.media.length; setSelectedReview({ ...selectedReview, index: newIndex, currentMedia: selectedReview.media[newIndex] }); }} className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white hover:text-black z-20 transition-all"><ChevronRight size={24} /></button>
                </>
              )}
              {selectedReview.currentMedia?.type === 'video' ? <video controls autoPlay src={selectedReview.currentMedia.url} className="w-full h-full object-contain bg-black" /> : <img src={selectedReview.currentMedia?.url || selectedReview.image} alt="Review" className="w-full h-full object-contain" />}
            </div>
            <div className="lg:col-span-1 bg-white p-6 lg:p-10 overflow-y-auto flex flex-col h-1/2 lg:h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-sm tracking-tight">{selectedReview.name?.charAt(0)}</div>
                <div><p className="text-sm font-bold uppercase tracking-tight text-zinc-900">{selectedReview.name}</p></div>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed mb-6">"{selectedReview.comment}"</p>
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <button onClick={(e) => { e.stopPropagation(); handleHelpfulVote(selectedReview._id); }} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-base md:text-xs font-bold uppercase transition-all ${(user && selectedReview.helpful?.includes(user._id)) ? 'bg-black text-white shadow-lg' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}><Heart size={14} fill={(user && selectedReview.helpful?.includes(user._id)) ? "white" : "none"} /><span>Helpful ({selectedReview.helpful?.length || 0})</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotifyMeModal isOpen={showWaitlistModal} onClose={() => setShowWaitlistModal(false)} product={product} variant={selectedVariant} />

      <div className="container-responsive py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 relative">

          {/* COLUMN 1: IMMERSIVE GALLERY (lg:col-span-7) */}
          <div className="lg:col-span-7 flex gap-6">
            {/* THUMBNAILS STRIP */}
            <div className="hidden xl:flex flex-col gap-3 sticky top-32 h-fit w-16 shrink-0">
              {mediaItems.map((item, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveMediaIndex(i); setVariantForcedImage(null); }}
                  className={`aspect-[3/4] rounded-lg overflow-hidden border transition-all duration-300 bg-zinc-50 ${activeMediaIndex === i && !variantForcedImage ? 'border-zinc-900 shadow-sm scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  {item.type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100"><Play size={12} className="text-zinc-400" /></div>
                  ) : (
                    <img src={item.url} className="w-full h-full object-cover" alt="" />
                  )}
                </button>
              ))}
            </div>

            {/* MAIN HERO IMAGE */}
            <div className="flex-1 space-y-10">
              <div
                className="relative aspect-[4/5] w-full rounded-[2rem] overflow-hidden bg-zinc-50 cursor-zoom-in group/main"
                onMouseMove={(e) => {
                  const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                  const x = ((e.pageX - left) / width) * 100;
                  const y = ((e.pageY - top) / height) * 100;
                  setMousePos({ x, y });
                }}
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
              >
                <AnimatePresence mode="wait">
                  <button
                    onClick={handleWishlist}
                    className={`absolute top-6 right-6 z-20 p-4 rounded-2xl transition-all shadow-xl backdrop-blur-md ${isWishlisted ? 'bg-zinc-900/80 text-white' : 'bg-white/50 text-zinc-900 hover:bg-white'}`}
                  >
                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>
                  <motion.div
                    key={variantForcedImage || activeMediaIndex}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "circOut" }}
                    className="w-full h-full"
                  >
                    {mediaItems[activeMediaIndex]?.type === 'video' && !variantForcedImage ? (
                      <video src={mediaItems[activeMediaIndex].url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                      <img
                        src={variantForcedImage || mediaItems[activeMediaIndex]?.url}
                        className={`w-full h-full object-cover transition-transform duration-200 ${isZooming ? 'scale-[2.5]' : 'scale-100'}`}
                        style={isZooming ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                        alt={product.name}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* COLUMN 2: INFORMATION HUB (lg:col-span-5) */}
          <div className="flex flex-col lg:col-span-5 space-y-8 md:space-y-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[10px] md:text-sm font-black uppercase tracking-mega text-zinc-400">{product.category}</span>
                <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                <span className="text-[10px] md:text-sm font-black uppercase tracking-mega text-zinc-400">{product.subcategory}</span>
              </div>
              <div role="heading" aria-level="1" className="text-xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter leading-tighter text-zinc-900">
                {product.name}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={scrollToReviews}
                className="flex items-center gap-1 text-black hover:opacity-70 transition-opacity"
              >
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} />
                ))}
              </button>
              <button onClick={scrollToReviews} className="text-[8px] md:text-sm font-black text-zinc-400 uppercase tracking-widest hover:text-black transition-colors">
                {product.numReviews} Verified Reviews
              </button>
            </div>

            {/* PRODUCT DNA SECTION (Moved here for better visibility) */}
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="space-y-3">
                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-mega text-zinc-400 border-b border-zinc-100 pb-2">Description</h3>
                <p className="text-zinc-600 text-[13px] leading-relaxed font-bold opacity-80 italic">"{product.description}"</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-[10px] md:text-sm font-black uppercase tracking-mega text-zinc-400 border-b border-zinc-100 pb-2">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Bespoke Craftsmanship', 'Limited Edition Run', 'Sustainable Ethics', 'Global Priority Shipping'].map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] md:text-[10px] font-black text-zinc-900 uppercase">
                      <Check size={12} className="text-green-500" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-2 bg-zinc-50 p-4 rounded-[1.2rem] border border-zinc-100">
              <div className="flex items-baseline gap-3">
                <span className="text-lg md:text-3xl font-black text-zinc-900 tracking-tighter">
                  <Price amount={currentPrice} />
                </span>
                {currentPrice < product.price * 1.2 && (
                  <del className="text-zinc-300 text-lg font-bold">
                    <Price amount={product.price * 1.4} />
                  </del>
                )}
              </div>
              <p className="text-[8px] md:text-[10px] font-black text-green-600 uppercase tracking-mega">
                Free Delivery Across India
              </p>
            </div>
            {/* PREMIUM VARIANT UX: COLOR SWATCHES */}
            {colors.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase tracking-mega text-zinc-400">Color / {selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {colors.map((color, idx) => {
                    const isSelected = selectedColor === color.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => { setSelectedColor(color.name); updateUrlParams(color.name, selectedSize); }}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all duration-300 ${isSelected ? 'border-zinc-900 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      >
                        <div className="w-full h-full rounded-full overflow-hidden border border-zinc-100 p-0.5">
                          <img src={color.image} className="w-full h-full object-cover rounded-full" alt={color.name} />
                        </div>
                        {isSelected && <div className="absolute -top-1 -right-1 bg-black text-white p-1 rounded-full border-2 border-white"><Check size={8} /></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PREMIUM VARIANT UX: SIZE PILLS */}
            {allSizes.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-black uppercase tracking-mega text-zinc-400">Select Size</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size, idx) => {
                    const isSelected = selectedSize === size;
                    const vMatch = product.variants.find(v => v.size?.toLowerCase() === size?.toLowerCase() && (selectedColor ? v.color?.toLowerCase() === selectedColor?.toLowerCase() : true));
                    const isOOS = !vMatch || (Number(vMatch.stock || 0) <= 0);
                    return (
                      <button
                        key={idx}
                        disabled={isOOS}
                        onClick={() => { setSelectedSize(size); updateUrlParams(selectedColor, size); }}
                        className={`py-2 px-4 rounded-xl border-2 font-black text-[9px] md:text-xs transition-all duration-300 ${isSelected ? 'bg-zinc-900 text-white border-zinc-900 shadow-md' : 'bg-white text-zinc-900 border-zinc-100 hover:border-zinc-900'} ${isOOS ? 'opacity-20 cursor-not-allowed' : 'active:scale-95'}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setShowSizeConsultant(true)}
                  className="w-full h-11 bg-zinc-900 text-white rounded-xl font-black uppercase tracking-mega text-[8px] shadow-lg hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} /> AI Size Consultant
                </button>
              </div>
            )}

            <div className="flex flex-col gap-6 pt-8 border-t border-zinc-100">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm md:text-xs font-black uppercase tracking-widest text-zinc-500">In Stock</span>
                  </div>
                </div>
              </div>
            </div>

            {!isOutOfStock ? (
              <div className="space-y-6">
                {/* QUANTITY & ACTIONS */}
                <div className="flex items-center justify-between bg-zinc-50 rounded-2xl p-4 border border-zinc-100">
                  <span className="text-sm md:text-xs font-black uppercase tracking-widest text-zinc-400">Quantity</span>
                  <div className="flex items-center gap-6">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-zinc-600 hover:text-black transition-colors"><Minus size={16} /></button>
                    <span className="font-black text-sm w-6 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(currentStock || 10, quantity + 1))} className="text-zinc-600 hover:text-black transition-colors"><Plus size={16} /></button>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col space-y-3">
                  <button
                    onClick={() => addToCart({ ...product, price: currentPrice, selectedVariant, quantity })}
                    className="w-full h-16 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-base md:text-xs hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl"
                  >
                    <ShoppingBag size={20} /> Add to Bag
                  </button>
                  <button
                    onClick={() => {
                      const checkoutItem = { _id: product._id, product: product, name: product.name, price: currentPrice, image: variantForcedImage || product.image, selectedVariant: selectedVariant, quantity: quantity };
                      navigate('/checkout', { state: { checkoutSingleItem: checkoutItem } });
                    }}
                    className="w-full h-16 bg-white border-2 border-black text-black rounded-2xl font-black uppercase tracking-widest text-base md:text-xs hover:bg-black hover:text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <ShieldCheck size={20} /> Secure Checkout
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="w-full h-16 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-base md:text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl lg:flex hidden"
              >
                <BellRing size={20} /> Waitlist Enrollment
              </button>
            )}
          </div>

          {/* FLOATING MOBILE ACTION BAR — Restored and Enhanced */}
          {!isOutOfStock ? (
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-zinc-100 p-4 z-[100] lg:hidden animate-in slide-in-from-bottom-full duration-700">
              <div className="flex items-center gap-4 max-w-lg mx-auto">
                <div className="flex-1">
                  <p className="text-sm md:text-xs font-black uppercase tracking-widest text-zinc-400 mb-0.5">Premium Access</p>
                  <Price amount={currentPrice} className="text-2xl md:text-lg font-black text-zinc-900 tracking-tighter" />
                </div>
                <div className="flex-[2.5] flex gap-2">
                  <button
                    onClick={() => addToCart({ ...product, price: currentPrice, selectedVariant, quantity })}
                    className="flex-1 h-14 bg-zinc-100 text-black rounded-2xl font-black uppercase tracking-widest text-sm md:text-xs flex items-center justify-center active:scale-95 transition-all border border-zinc-200"
                  >
                    <ShoppingBag size={14} />
                  </button>
                  <button
                    onClick={() => {
                      const checkoutItem = { _id: product._id, product: product, name: product.name, price: currentPrice, image: variantForcedImage || product.image, selectedVariant: selectedVariant, quantity: quantity };
                      navigate('/checkout', { state: { checkoutSingleItem: checkoutItem } });
                    }}
                    className="flex-[3] h-14 bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm md:text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
                  >
                    <Zap size={14} fill="currentColor" /> Checkout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-zinc-100 p-4 z-[100] lg:hidden">
              <button
                onClick={() => setShowWaitlistModal(true)}
                className="w-full h-14 bg-amber-400 text-black rounded-2xl font-black uppercase tracking-widest text-sm md:text-xs flex items-center justify-center gap-2 shadow-lg"
              >
                <BellRing size={16} /> Join Waitlist
              </button>
            </div>
          )}

          {/* TRUST ELEMENTS BAR (Directly Under Actions) */}
          <div className="flex flex-col gap-4 pt-8 border-t border-zinc-100 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100/50">
                <ShieldCheck size={18} className="text-zinc-900" />
                <span className="text-sm md:text-[10px] font-black uppercase tracking-widest text-zinc-600">Secure Checkout</span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100/50">
                <RotateCcw size={18} className="text-zinc-900" />
                <span className="text-sm md:text-[10px] font-black uppercase tracking-widest text-zinc-600">7 Days Return</span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100/50">
                <Lock size={18} className="text-zinc-900" />
                <span className="text-sm md:text-[10px] font-black uppercase tracking-widest text-zinc-600">Secured Payment</span>
              </div>
              <div className="flex items-center gap-3 bg-zinc-50/50 p-3 rounded-xl border border-zinc-100/50">
                <Award size={18} className="text-zinc-900" />
                <span className="text-sm md:text-[10px] font-black uppercase tracking-widest text-zinc-600">Authentic Product</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* PREMIUM TABS SECTION */}
      <div className="container-responsive">
        <div ref={reviewsRef} className="mt-32 space-y-12">
          <div className="flex justify-center border-b border-zinc-100 overflow-x-auto no-scrollbar md:justify-start">
            <button
              className="px-4 py-3 md:px-10 md:py-6 !text-[10px] md:!text-sm font-bold uppercase tracking-widest text-black relative shrink-0"
            >
              Verified Reviews
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black animate-in fade-in slide-in-from-bottom-1" />
            </button>
          </div>

          <div className="min-h-[400px]">

            {/* REVIEWS SECTION */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                {/* REVIEW SUMMARY & FILTERS */}
                <div className="lg:col-span-4 space-y-12">
                  <div className="space-y-6">
                    <div className="flex items-baseline gap-2 md:gap-4">
                      <h2 className="font-black text-zinc-900 tracking-tighter" style={{ fontSize: 'clamp(1.5rem, 6vw, 3rem)' }}>{(product.rating || 0).toFixed(1)}</h2>
                      <div className="flex flex-col gap-1">
                        <div className="flex text-black">
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? "currentColor" : "none"} />)}
                        </div>
                        <p className="font-black uppercase tracking-widest text-zinc-400" style={{ fontSize: 'clamp(8px, 2vw, 12px)' }}>Based on {product.numReviews} Reviews</p>
                      </div>
                    </div>

                    {/* RATING DISTRIBUTION GRAPH */}
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingDistribution[star] || 0;
                        const percentage = product.numReviews > 0 ? (count / product.numReviews) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-4 group cursor-pointer">
                            <span className="font-black text-zinc-900 w-2" style={{ fontSize: 'clamp(8px, 2vw, 12px)' }}>{star}</span>
                            <div className="flex-1 h-1.5 md:h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "circOut" }}
                                className="h-full bg-zinc-900"
                              />
                            </div>
                            <span className="font-black text-zinc-300 group-hover:text-zinc-900 transition-colors w-6" style={{ fontSize: 'clamp(8px, 2vw, 12px)' }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6 bg-zinc-50 p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-zinc-100">
                    <div role="heading" aria-level="3" className="!text-[10px] md:!text-sm font-black uppercase tracking-widest text-zinc-900">Share Your Experience</div>
                    <div className="flex gap-1.5">{[1, 2, 3, 4, 5].map(n => <Star key={n} onClick={() => setRatingInput(n)} size={24} className={`${ratingInput >= n ? 'fill-zinc-900 text-zinc-900' : 'text-zinc-200'} cursor-pointer transition-all hover:scale-110 active:scale-90`} />)}</div>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Artifact performance & aesthetics..." className="w-full bg-white border border-zinc-200 rounded-xl p-5 text-sm h-32 outline-none focus:border-zinc-900 transition-all resize-none shadow-inner" />
                    <div className="flex gap-2 md:gap-3">
                      <label className="flex-1 cursor-pointer bg-white border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-xl" style={{ fontSize: 'clamp(8px, 2vw, 12px)', height: 'clamp(2rem, 8vw, 3rem)' }}><Camera size={14} /> Image<input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" /></label>
                      <label className="flex-1 cursor-pointer bg-white border border-zinc-200 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 font-black uppercase tracking-widest rounded-xl" style={{ fontSize: 'clamp(8px, 2vw, 12px)', height: 'clamp(2rem, 8vw, 3rem)' }}><Video size={14} /> Video<input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" /></label>
                    </div>
                    <button onClick={handleReviewSubmit} disabled={submitting} className="w-full bg-zinc-900 text-white rounded-xl font-black uppercase tracking-widest shadow-lg hover:bg-black active:scale-95 transition-all" style={{ fontSize: 'clamp(9px, 2.5vw, 12px)', height: 'clamp(2.5rem, 10vw, 3.5rem)' }}>{submitting ? "Processing..." : "Submit Review"}</button>
                  </div>
                </div>

                {/* REVIEWS LIST */}
                <div className="lg:col-span-8 space-y-12">
                  <div className="flex justify-between items-center border-b border-zinc-100 pb-4 md:pb-8">
                    <div role="heading" aria-level="2" className="!text-sm md:!text-xl font-black tracking-tight text-zinc-900 uppercase">Social Proof</div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="!text-[10px] md:!text-sm font-black text-zinc-400 uppercase tracking-widest">Sort By</span>
                      <select onChange={(e) => setSortOption(e.target.value)} className="bg-transparent !text-[10px] md:!text-sm font-black uppercase tracking-widest outline-none cursor-pointer border-b-2 border-zinc-900 pb-1">
                        <option value="newest">Newest</option>
                        <option value="highest">Best Rating</option>
                        <option value="helpful">Helpful</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-16">
                    {sortedReviews.map((rev, i) => (
                      <div key={i} onClick={() => {
                        const videos = rev.videos || (rev.video ? [rev.video] : []);
                        const images = rev.images || (rev.reviewImage ? [rev.reviewImage] : []);
                        const allMedia = [...videos.map(v => ({ type: 'video', url: v })), ...images.map(img => ({ type: 'image', url: img }))];
                        setSelectedReview({ ...rev, media: allMedia, currentMedia: allMedia[0] || { type: 'image', url: rev.image }, index: 0 });
                      }} className="space-y-6 group cursor-pointer animate-in fade-in duration-700">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-sm tracking-tight text-zinc-900 border border-zinc-200 shadow-sm">{rev.name?.charAt(0)}</div>
                            <div className="space-y-1">
                              <p className="font-bold text-sm tracking-tight text-zinc-900">{rev.name}</p>
                              <div className="flex gap-0.5">{[...Array(5)].map((_, j) => <Star key={j} size={12} className={j < rev.rating ? "fill-zinc-900 text-zinc-900" : "text-zinc-200"} />)}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm md:text-xs text-zinc-400 font-bold uppercase tracking-widest">{new Date(rev.createdAt).toLocaleDateString()}</span>
                            {user && rev.user === user._id && <button onClick={(e) => { e.stopPropagation(); handleDeleteReview(rev._id); }} className="text-zinc-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>}
                          </div>
                        </div>
                        <p className="text-sm text-zinc-600 leading-relaxed italic border-l-2 border-zinc-100 pl-6 ml-6">"{rev.comment}"</p>
                        <div className="flex gap-3 ml-12">
                          {(rev.images || []).slice(0, 4).map((img, idx) => (
                            <div key={idx} className="w-20 h-24 rounded-xl overflow-hidden shadow-sm border border-zinc-100 group-hover:border-black/20 transition-all hover:scale-105 active:scale-95">
                              <img src={img} className="w-full h-full object-cover" alt="" />
                            </div>
                          ))}
                          {(rev.videos || []).length > 0 && (
                            <div className="w-20 h-24 rounded-xl bg-black/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-all">
                              <Play size={24} className="text-white fill-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* LIGHTBOX MODAL */}
          {showLightbox && (
            <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center" onClick={() => setShowLightbox(false)}>
              <button className="absolute top-8 right-8 text-white/50 hover:text-white p-3 bg-white/10 rounded-full transition-colors z-[210]"><X size={32} /></button>
              <div className="relative w-full max-w-6xl h-full flex items-center justify-center p-12" onClick={e => e.stopPropagation()}>
                <button
                  disabled={lightboxIndex === 0}
                  onClick={() => setLightboxIndex(prev => prev - 1)}
                  className="absolute left-8 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all disabled:opacity-0"
                >
                  <ChevronLeft size={32} />
                </button>
                <img src={mediaItems[lightboxIndex]?.url} className="w-full h-full object-contain animate-in fade-in zoom-in-95 duration-500 select-none" alt="" />
                <button
                  disabled={lightboxIndex === mediaItems.length - 1}
                  onClick={() => setLightboxIndex(prev => prev + 1)}
                  className="absolute right-8 p-4 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all disabled:opacity-0"
                >
                  <ChevronRight size={32} />
                </button>

                <div className="absolute bottom-12 flex gap-3">
                  {mediaItems.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${lightboxIndex === i ? 'bg-white scale-150' : 'bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <RecentlyViewed currentProductId={product._id} />

          {/* RECOMMENDED PRODUCTS */}
          {suggestions.length > 0 && (
            <div className="mt-32 pt-20 border-t border-zinc-100">
              <div className="flex justify-between items-end mb-6 md:mb-12">
                <div>
                  <h2 className="font-black uppercase tracking-tighter" style={{ fontSize: 'clamp(14px, 4vw, 24px)' }}>Recommended <span className="text-zinc-300">Artifacts</span></h2>
                  <p className="font-black uppercase tracking-widest text-zinc-400 mt-1" style={{ fontSize: 'clamp(8px, 1.5vw, 12px)' }}>Curated for your aesthetic</p>
                </div>
                <Link to="/shop" className="font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors" style={{ fontSize: 'clamp(8px, 1.5vw, 12px)' }}>View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {suggestions.slice(0, 4).map((item) => (
                  <Link key={item._id} to={`/product/${item.slug}`} className="group block space-y-4">
                    <div className="aspect-[3/4] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                      <img src={item.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    </div>
                    <div className="space-y-1 px-1">
                      <p className="font-black uppercase text-zinc-900 group-hover:text-black transition-colors line-clamp-1" style={{ fontSize: 'clamp(9px, 2vw, 14px)' }}>{item.name}</p>
                      <div className="flex justify-between items-center">
                        <Price amount={item.price} className="font-black" style={{ fontSize: 'clamp(10px, 2.5vw, 14px)' }} />
                        <span className="font-bold text-zinc-300 uppercase tracking-widest" style={{ fontSize: 'clamp(7px, 1.5vw, 12px)' }}>{item.category}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* AI SIZE CONSULTANT MODAL */}
          <AnimatePresence>
            {showSizeConsultant && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
                >
                  <div className="p-8 bg-zinc-900 text-white relative">
                    <button onClick={() => setShowSizeConsultant(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-amber-400 rounded-full text-black"><Award size={24} /></div>
                      <h2 className="text-xl font-black uppercase tracking-tighter italic">AI Size <span className="text-amber-400">Consultant</span></h2>
                    </div>
                    <p className="text-zinc-400 text-sm md:text-xs font-black uppercase tracking-[0.3em]">Neural Fit Analysis Engine</p>
                  </div>

                  <div className="p-8 space-y-6">
                    {!aiRecommendation ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm md:text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Height (cm)</label>
                            <input
                              type="number"
                              placeholder="e.g. 180"
                              value={height}
                              onChange={(e) => setHeight(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm md:text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Weight (kg)</label>
                            <input
                              type="number"
                              placeholder="e.g. 75"
                              value={weight}
                              onChange={(e) => setWeight(e.target.value)}
                              className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 text-sm font-bold outline-none focus:border-black transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm md:text-xs font-black uppercase tracking-widest text-zinc-400 ml-1">Fit Preference</label>
                          <div className="flex gap-2">
                            {['Slim', 'Standard', 'Oversized'].map(fit => (
                              <button
                                key={fit}
                                onClick={() => setFitPreference(fit)}
                                className={`flex-1 py-3 rounded-xl text-sm md:text-xs font-black uppercase tracking-widest border transition-all ${fitPreference === fit ? 'bg-black text-white border-black shadow-lg shadow-black/10' : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300'}`}
                              >
                                {fit}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          disabled={!height || !weight}
                          onClick={() => {
                            const h = parseInt(height);
                            const w = parseInt(weight);
                            let baseSize = 'M';
                            if (h > 185 || w > 85) baseSize = 'XL';
                            else if (h > 175 || w > 70) baseSize = 'L';
                            else if (h < 165 || w < 55) baseSize = 'S';

                            setAiRecommendation({
                              size: baseSize,
                              confidence: 94,
                              reason: `Based on your ${fitPreference.toLowerCase()} preference and BMI profile.`
                            });
                          }}
                          className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm md:text-xs shadow-xl hover:bg-black active:scale-95 transition-all disabled:opacity-20"
                        >
                          Analyze Profile
                        </button>
                      </>
                    ) : (
                      <div className="text-center space-y-4 py-4 animate-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-zinc-900 text-white rounded-2xl flex items-center justify-center text-3xl font-black mx-auto shadow-lg">
                          {aiRecommendation.size}
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight">Recommended Size</h4>
                          <p className="text-sm md:text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">{aiRecommendation.reason}</p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setAiRecommendation(null);
                              setHeight('');
                              setWeight('');
                            }}
                            className="flex-1 py-4 border border-zinc-100 rounded-2xl text-sm md:text-xs font-black uppercase tracking-widest hover:bg-zinc-50 transition-all text-zinc-400"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => {
                              setSelectedSize(aiRecommendation.size);
                              setShowSizeConsultant(false);
                              setAiRecommendation(null);
                              setSelectedColor(selectedColor); // Trigger re-render
                            }}
                            className="flex-[2] py-4 bg-black text-white rounded-2xl text-sm md:text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                          >
                            Apply {aiRecommendation.size}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

