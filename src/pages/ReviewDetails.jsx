import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import api from '../api/instance';
import { resolveMediaURL } from '../utils/mediaUtils';
import { Loader2 } from 'lucide-react';

const ReviewDetails = () => {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    const [allReviews, setAllReviews] = useState([]);
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mediaIndex, setMediaIndex] = useState(0);

    // Initial fetch of all reviews
    useEffect(() => {
        const fetchAllReviews = async () => {
            try {
                const { data } = await api.get('/products/reviews/featured');
                setAllReviews(data);
            } catch (err) {
                console.error("Error fetching reviews:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAllReviews();
    }, []);

    // Update specific review data when reviewId or allReviews changes
    useEffect(() => {
        if (allReviews.length > 0) {
            const review = allReviews.find(item => {
                const r = item.review || item;
                return r._id === reviewId;
            });
            
            if (review) {
                processReview(review);
            } else {
                setReviewData(null);
            }
        }
    }, [reviewId, allReviews]);

    const processReview = (review) => {
        const r = review.review || review;
        const images = Array.isArray(r.images) ? r.images : (r.reviewImage ? [r.reviewImage] : []);
        const videos = Array.isArray(r.videos) ? r.videos : (r.video ? [r.video] : []);
        
        const media = [
            ...videos.map(url => ({ type: 'video', url })),
            ...images.map(url => ({ type: 'image', url }))
        ];

        setReviewData({
            ...r,
            productName: review.productName,
            productSlug: review.productSlug,
            productImage: review.productImage,
            media
        });
        setMediaIndex(0); // Reset media index on new review
    };

    const nextMedia = (e) => {
        e.stopPropagation();
        if (!reviewData?.media || reviewData.media.length <= 1) return;
        setMediaIndex(prev => (prev + 1) % reviewData.media.length);
    };

    const prevMedia = (e) => {
        e.stopPropagation();
        if (!reviewData?.media || reviewData.media.length <= 1) return;
        setMediaIndex(prev => (prev - 1 + reviewData.media.length) % reviewData.media.length);
    };

    const nextReview = (e) => {
        e.stopPropagation();
        if (allReviews.length <= 1) return;
        const currentIdx = allReviews.findIndex(item => (item.review?._id || item._id) === reviewId);
        const nextIdx = (currentIdx + 1) % allReviews.length;
        const nextId = allReviews[nextIdx].review?._id || allReviews[nextIdx]._id;
        // Navigation is now instant because allReviews is already in memory
        navigate(`/review/${nextId}`, { replace: true });
    };

    const prevReview = (e) => {
        e.stopPropagation();
        if (allReviews.length <= 1) return;
        const currentIdx = allReviews.findIndex(item => (item.review?._id || item._id) === reviewId);
        const prevIdx = (currentIdx - 1 + allReviews.length) % allReviews.length;
        const prevId = allReviews[prevIdx].review?._id || allReviews[prevIdx]._id;
        navigate(`/review/${prevId}`, { replace: true });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="animate-spin text-zinc-300" size={40} />
            </div>
        );
    }

    if (!reviewData && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-950 p-6">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Review Not Found</h2>
                <button onClick={() => navigate('/')} className="bg-black text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Go Home</button>
            </div>
        );
    }

    const currentMedia = reviewData.media[mediaIndex];

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col h-screen overflow-hidden animate-in fade-in duration-300">
            {/* MOBILE HEADER - Transparent overlay */}
            <div className="absolute top-0 inset-x-0 z-[210] flex items-center justify-between p-4 bg-gradient-to-b from-white/80 to-transparent">
                <button 
                    onClick={() => navigate('/')}
                    className="bg-black/5 text-zinc-900 p-2 rounded-full backdrop-blur-md active:scale-90 transition-all font-black uppercase tracking-widest text-[10px] flex items-center gap-1"
                >
                    <ChevronLeft size={20} /> Back
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
                        {(reviewData.name || "U").charAt(0)}
                    </div>
                    <div className="max-w-[120px]">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-950 leading-none mb-1 truncate">{reviewData.name}</p>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={8} fill="currentColor" className="text-black" />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="w-16"></div> {/* Placeholder to keep header design consistent */}
            </div>

            {/* MEDIA SECTION - Exactly 50% Height */}
            <div className="w-full h-[50vh] bg-zinc-50 relative flex items-center justify-center select-none overflow-hidden shrink-0">
                {currentMedia ? (
                    currentMedia.type === 'video' ? (
                        <video
                            controls
                            autoPlay
                            loop
                            src={resolveMediaURL(currentMedia.url)}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <img
                            src={resolveMediaURL(currentMedia.url)}
                            alt=""
                            className="w-full h-full object-contain"
                        />
                    )
                ) : (
                    <div className="text-zinc-300 font-medium italic uppercase tracking-widest text-[10px]">No Media Experience</div>
                )}

                {/* MEDIA NAVIGATION - Minimalist icons */}
                {reviewData.media.length > 1 && (
                    <div className="absolute inset-0 z-30 pointer-events-none flex justify-between items-center px-4">
                        <button 
                            onClick={prevMedia}
                            className="pointer-events-auto text-zinc-900/30 hover:text-zinc-900 p-2 transition-all active:scale-75"
                        >
                            <ChevronLeft size={32} strokeWidth={1.5} />
                        </button>
                        <button 
                            onClick={nextMedia}
                            className="pointer-events-auto text-zinc-900/30 hover:text-zinc-900 p-2 transition-all active:scale-75"
                        >
                            <ChevronRight size={32} strokeWidth={1.5} />
                        </button>
                    </div>
                )}
                
                {/* MEDIA INDICATORS */}
                {reviewData.media.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5">
                        {reviewData.media.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-1 h-1 rounded-full transition-all duration-300 ${idx === mediaIndex ? 'bg-black scale-125' : 'bg-black/10'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* CONTENT SECTION - Exactly 50% Height */}
            <div className="w-full h-[50vh] bg-white flex flex-col relative shrink-0">
                <div className="flex-1 overflow-y-auto no-scrollbar p-6 pb-24">
                    {/* PRODUCT REFERENCE */}
                    <Link to={`/product/${reviewData.productSlug}`} className="flex items-center gap-3 p-3 mb-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-zinc-100 shrink-0">
                            <img src={resolveMediaURL(reviewData.productImage)} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-400 leading-none mb-1">Product Reference</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-950 truncate">{reviewData.productName}</p>
                        </div>
                        <ArrowUpRight size={14} className="ml-auto text-zinc-300" />
                    </Link>

                    {/* COMMENT */}
                    <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={12} className="text-blue-600 fill-blue-50" />
                            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest">Verified Experience</p>
                        </div>
                        <p className="text-zinc-600 leading-[1.8] text-[15px] font-medium whitespace-pre-line">
                            "{reviewData.comment}"
                        </p>
                    </div>

                    {reviewData.adminResponse && (
                        <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 relative overflow-hidden">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-900 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-black rounded-full animate-pulse" /> Official Response
                            </p>
                            <p className="text-[12px] text-zinc-500 leading-relaxed italic font-medium">{reviewData.adminResponse}</p>
                        </div>
                    )}
                </div>

                {/* REVIEW NAVIGATION - Instant switching */}
                <div className="absolute bottom-6 inset-x-0 px-8 flex justify-between items-center pointer-events-none">
                    <button 
                        onClick={prevReview}
                        className="pointer-events-auto text-zinc-900 p-4 active:scale-90 transition-all flex items-center gap-2"
                    >
                        <ChevronLeft size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Prev Review</span>
                    </button>
                    <button 
                        onClick={nextReview}
                        className="pointer-events-auto text-zinc-900 p-4 active:scale-90 transition-all flex items-center gap-2"
                    >
                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Next Review</span>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetails;
