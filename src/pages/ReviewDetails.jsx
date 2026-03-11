import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import api from '../api/instance';
import { resolveMediaURL } from '../utils/mediaUtils';
import { Loader2 } from 'lucide-react';

const ReviewDetails = () => {
    const { reviewId } = useParams();
    const navigate = useNavigate();
    const [reviewData, setReviewData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mediaIndex, setMediaIndex] = useState(0);

    useEffect(() => {
        const fetchReview = async () => {
            try {
                // We'll use the featured reviews endpoint and find the specific one for now
                // Ideally there should be a /reviews/:id endpoint
                const { data } = await api.get('/products/reviews/featured');
                const review = data.find(item => {
                    const r = item.review || item;
                    return r._id === reviewId;
                });
                
                if (review) {
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
                }
            } catch (err) {
                console.error("Error fetching review:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReview();
    }, [reviewId]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="animate-spin text-zinc-300" size={40} />
            </div>
        );
    }

    if (!reviewData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white text-zinc-950 p-6">
                <h2 className="text-xl font-black uppercase tracking-tighter mb-4">Review Not Found</h2>
                <button onClick={() => navigate(-1)} className="bg-black text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">Go Back</button>
            </div>
        );
    }

    const currentMedia = reviewData.media[mediaIndex];

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in fade-in duration-300 overflow-y-auto no-scrollbar">
            {/* MOBILE HEADER */}
            <div className="fixed top-0 inset-x-0 z-[210] flex items-center justify-between p-4 bg-gradient-to-b from-white/90 to-transparent">
                <button 
                    onClick={() => navigate(-1)}
                    className="bg-black/5 text-zinc-900 p-2 rounded-full backdrop-blur-md"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
                        {(reviewData.name || "U").charAt(0)}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-950 leading-none mb-1">{reviewData.name}</p>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={8} fill="currentColor" className="text-black" />
                            ))}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-black/5 text-zinc-900 p-2 rounded-full backdrop-blur-md"
                >
                    <X size={24} />
                </button>
            </div>

            {/* MEDIA SECTION */}
            <div className="w-full aspect-[3/4] md:aspect-auto md:h-screen bg-zinc-50 relative flex items-center justify-center select-none overflow-hidden mt-16">
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

                {/* MEDIA NAVIGATION */}
                {reviewData.media.length > 1 && (
                    <>
                        <div className="absolute inset-y-0 left-0 w-1/4 z-30 flex items-center justify-start pl-4" onClick={prevMedia}>
                            <div className="p-2 bg-black/5 backdrop-blur-sm rounded-full text-black/20">
                                <ChevronLeft size={24} />
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 w-1/4 z-30 flex items-center justify-end pr-4" onClick={nextMedia}>
                            <div className="p-2 bg-black/5 backdrop-blur-sm rounded-full text-black/20">
                                <ChevronRight size={24} />
                            </div>
                        </div>
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/5">
                            {reviewData.media.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-1 h-1 rounded-full transition-all duration-300 ${idx === mediaIndex ? 'bg-black scale-125' : 'bg-black/10'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* CONTENT SECTION */}
            <div className="w-full p-6 pb-24 bg-white flex flex-col flex-1">
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
            
            {/* BOTTOM CTA */}
            <div className="fixed bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent">
                <Link 
                    to={`/product/${reviewData.productSlug}`}
                    className="w-full bg-black text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl"
                >
                    View Product Details <ArrowUpRight size={14} />
                </Link>
            </div>
        </div>
    );
};

export default ReviewDetails;
