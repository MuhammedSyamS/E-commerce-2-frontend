import React, { useEffect, useState, useRef } from 'react';
import api from '../api/instance';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Play, Maximize2, MoreHorizontal, ArrowUpRight, X, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveMediaURL } from '../utils/mediaUtils';
import MarqueeRibbon from './MarqueeRibbon';


const FeaturedReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [commentExpanded, setCommentExpanded] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll effect
    useEffect(() => {
        if (reviews.length <= 1) return;
        const timer = setInterval(() => {
            if (scrollRef.current) {
                const el = scrollRef.current;
                const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10;
                if (isAtEnd) {
                    el.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    el.scrollBy({ left: el.clientWidth * 0.8, behavior: 'smooth' });
                }
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [reviews.length]);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const el = scrollRef.current;
            const width = el.clientWidth;
            const scrollAmount = direction === 'left' ? -width * 0.8 : width * 0.8;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Auto-reset expansion on review change
    useEffect(() => {
        setCommentExpanded(false);
    }, [selectedReview?._id]);

    // Fetch Data
    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/products/reviews/featured');
                setReviews(Array.isArray(data) ? data : []);
            } catch (err) {
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    // Helper to extract media from review object consistently
    const getMediaFromReview = (item) => {
        const r = item.review || item;
        const images = Array.isArray(r.images) ? r.images : (r.reviewImage ? [r.reviewImage] : []);
        const videos = Array.isArray(r.videos) ? r.videos : (r.video ? [r.video] : []);

        return [
            ...videos.map(url => ({ type: 'video', url })),
            ...images.map(url => ({ type: 'image', url }))
        ];
    };

    // Helper to open modal
    const openModal = (item, index) => {
        const r = item.review || item;
        const media = getMediaFromReview(item);

        setSelectedReview({
            ...r,
            productName: item.productName || "Product",
            productSlug: item.productSlug || "#",
            productImage: item.productImage || null,
            media,
            currentMedia: media[0] || null,
            mediaIndex: 0,
            reviewIndex: index // Store index for Next/Prev Review
        });
    };

    // Navigation Handlers
    const nextReview = (e) => {
        e.stopPropagation();
        if (!selectedReview) return;
        const nextIdx = (selectedReview.reviewIndex + 1) % reviews.length;
        openModal(reviews[nextIdx], nextIdx);
    };

    const prevReview = (e) => {
        e.stopPropagation();
        if (!selectedReview) return;
        const prevIdx = (selectedReview.reviewIndex - 1 + reviews.length) % reviews.length;
        openModal(reviews[prevIdx], prevIdx);
    };

    const nextMedia = (e) => {
        e.stopPropagation();
        if (!selectedReview || !selectedReview.media || selectedReview.media.length <= 1) return;
        const nextMediaIdx = (selectedReview.mediaIndex + 1) % selectedReview.media.length;
        setSelectedReview({
            ...selectedReview,
            mediaIndex: nextMediaIdx,
            currentMedia: selectedReview.media[nextMediaIdx]
        });
    };

    const prevMedia = (e) => {
        e.stopPropagation();
        if (!selectedReview || !selectedReview.media || selectedReview.media.length <= 1) return;
        const prevMediaIdx = (selectedReview.mediaIndex - 1 + selectedReview.media.length) % selectedReview.media.length;
        setSelectedReview({
            ...selectedReview,
            mediaIndex: prevMediaIdx,
            currentMedia: selectedReview.media[prevMediaIdx]
        });
    };

    // if (loading) return null; // Removed to prevent section flicker/missing on slow mobile

    return (
        <section className="bg-zinc-50 py-12 md:py-24 border-t border-zinc-200">

            {/* IMMERSIVE MODAL (With Navigation) */}
            {selectedReview && (
                <div
                    className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex items-center justify-center animate-in fade-in duration-300"
                    onClick={() => setSelectedReview(null)}
                >
                    {/* ENHANCED NAVIGATION ARROWS (Outside Card) */}
                    <button
                        onClick={prevReview}
                        className="fixed left-2 md:left-12 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-all z-[120] hover:scale-125 group flex flex-col items-center gap-2"
                    >
                        <ChevronLeft size={48} strokeWidth={1.5} className="md:w-16 md:h-16 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">PREV</span>
                    </button>
                    <button
                        onClick={nextReview}
                        className="fixed right-2 md:right-12 top-1/2 -translate-y-1/2 text-black/40 hover:text-black transition-all z-[120] hover:scale-125 group flex flex-col items-center gap-2"
                    >
                        <ChevronRight size={48} strokeWidth={1.5} className="md:w-16 md:h-16 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">NEXT</span>
                    </button>

                    <div 
                        className="bg-white w-full md:max-w-7xl max-h-[95vh] md:max-h-[85vh] md:rounded-[3rem] overflow-y-auto no-scrollbar flex flex-col md:flex-row shadow-2xl relative mx-auto" 
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Final Close Button */}
                        <button 
                            onClick={() => setSelectedReview(null)}
                            className="absolute top-6 right-6 z-[130] bg-black text-white p-2.5 rounded-full shadow-2xl border border-white/20 hover:scale-110 active:scale-95 transition-all"
                        >
                            <X size={20} />
                        </button>

                        {/* Media Section (TOP) */}
                            )}

                            {/* ABSOLUTE PRODUCT REFERENCE OVERLAY (DEKTOP ONLY) */}
                            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-30 pointer-events-none hidden md:block">
                                <div className="flex items-center gap-2 px-2.5 py-1 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                                    <div className="w-7 h-7 rounded-lg bg-white overflow-hidden border border-white/5 shrink-0">
                                        <img src={resolveMediaURL(selectedReview.productImage)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-0.5">Reviewing</p>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-white truncate max-w-[100px]">{selectedReview.productName}</p>
                                    </div>
                                </div>
                            </div>

                            {/* MOBILE NAVIGATION OVERLAYS */}
                            <div className="absolute inset-y-0 left-0 w-20 z-20 md:hidden" onClick={prevReview} />
                            <div className="absolute inset-y-0 right-0 w-20 z-20 md:hidden" onClick={nextReview} />

                            {/* MEDIA NAVIGATION ARROWS (Local) */}
                            {selectedReview.media?.length > 1 && (
                                <>
                                    <button
                                        onClick={prevMedia}
                                        className="absolute left-6 bottom-10 text-white/60 hover:text-white bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 transition-all z-30"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextMedia}
                                        className="absolute right-6 bottom-10 text-white/60 hover:text-white bg-black/20 backdrop-blur-md p-2 rounded-full hover:bg-black/40 transition-all z-30"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Carousel Dots */}
                            {selectedReview.media?.length > 1 && (
                                <div className="absolute bottom-8 flex gap-2 z-10 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                    {selectedReview.media.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedReview({ ...selectedReview, mediaIndex: idx, currentMedia: selectedReview.media[idx] });
                                            }}
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${idx === selectedReview.mediaIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section (BOTTOM) */}
                        <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col bg-white overflow-y-auto no-scrollbar relative">
                            {/* USER INFO AT TOP */}
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-50">
                                <div className="w-12 h-12 rounded-full bg-zinc-950 flex items-center justify-center text-xs font-sans font-black text-white shadow-xl">
                                    {(selectedReview.name || "U").charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs md:text-sm font-black text-zinc-900 leading-none uppercase tracking-widest truncate">{selectedReview.name}</h4>
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={11} fill="currentColor" className="text-black" />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 text-[9px] uppercase tracking-[0.2em] font-black">{selectedReview.role || "Verified Studio Member"}</p>
                                </div>
                            </div>


                            {/* COMMENT AREA (With Scroller) */}
                            <div className="flex-1 overflow-y-auto no-scrollbar mb-8 pr-2">
                                <div className="space-y-4">
                                    <p className={`text-zinc-950 leading-[1.6] text-[13px] md:text-base font-medium ${!commentExpanded && selectedReview.comment?.length > 150 ? 'line-clamp-4' : ''}`}>
                                        {selectedReview.comment}
                                    </p>
                                    
                                    {selectedReview.comment?.length > 150 && (
                                        <button 
                                            onClick={() => setCommentExpanded(!commentExpanded)}
                                            className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b-2 border-zinc-900 pb-0.5 hover:text-zinc-500 hover:border-zinc-500 transition-all flex items-center gap-2"
                                        >
                                            {commentExpanded ? 'Show Less' : 'View Full Experience'}
                                            <ChevronRight size={14} className={`transition-transform duration-300 ${commentExpanded ? '-rotate-90' : 'rotate-90'}`} />
                                        </button>
                                    )}
                                </div>

                                {selectedReview.adminResponse && (
                                    <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 mt-8 relative overflow-hidden group/response">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/response:opacity-10 transition-opacity">
                                            <Zap size={48} fill="black" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 mb-4 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-black rounded-full animate-pulse" /> Official Response
                                        </p>
                                        <p className="text-xs md:text-sm text-zinc-500 leading-relaxed italic font-medium">{selectedReview.adminResponse}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-6 md:px-24">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8 md:mb-12">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                            Community Verified
                        </p>
                        <h2 className="text-4xl md:text-5xl font-sans text-zinc-900">
                            The Collection in the Wild
                        </h2>
                    </div>
                    <Link to="/reviews" className="text-[9px] md:text-[10px] font-black uppercase tracking-widest border-b border-zinc-200 pb-1 hover:border-black hover:text-zinc-600 transition-all">
                        View All Reviews
                    </Link>
                </div>

                {/* CAROUSEL WRAPPER */}
                <div className="relative group/review-scroller min-h-[300px]">
                    {/* Navigation Buttons */}
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 z-30 p-4 bg-white/80 backdrop-blur-md rounded-full border border-zinc-200 shadow-xl hover:bg-black hover:text-white hover:border-black transition-all group-active:scale-95 md:opacity-0 group-hover/review-scroller:opacity-100"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute -right-4 md:-right-12 top-1/2 -translate-y-1/2 z-30 p-4 bg-white/80 backdrop-blur-md rounded-full border border-zinc-200 shadow-xl hover:bg-black hover:text-white hover:border-black transition-all group-active:scale-95 md:opacity-0 group-hover/review-scroller:opacity-100"
                    >
                        <ChevronRight size={24} />
                    </button>

                    {loading ? (
                        <div className="flex gap-4 overflow-x-hidden py-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-[280px] md:w-[400px] aspect-[4/5] bg-zinc-100 animate-pulse rounded-[2rem] shrink-0" />
                            ))}
                        </div>
                    ) : (
                        <div 
                            ref={scrollRef}
                            className="flex gap-4 overflow-x-auto no-scrollbar py-4 snap-x snap-mandatory scroll-smooth"
                        >
                            {reviews.map((item, idx) => {
                                const r = item.review || item;
                                const media = getMediaFromReview(item);
                                const hasMedia = media.length > 0;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => openModal(item, idx)}
                                        className="w-[280px] md:w-[400px] bg-white border border-zinc-200 flex flex-col group/card hover:shadow-xl transition-shadow duration-500 cursor-pointer mx-2 shrink-0 snap-center"
                                    >
                                        {/* MEDIA AREA (Top 60%) */}
                                        <div className="h-[250px] md:h-[400px] bg-zinc-100 relative overflow-hidden border-b border-zinc-100">
                                            {hasMedia ? (
                                                <div className="w-full h-full relative">
                                                    {media[0].type === 'video' ? (
                                                        <video src={resolveMediaURL(media[0].url)} muted loop autoPlay playsInline className="w-full h-full object-cover transition-all duration-700" />
                                                    ) : (
                                                        <img src={resolveMediaURL(media[0].url)} alt="" className="w-full h-full object-cover transition-all duration-700" />
                                                    )}

                                                    {/* Count Badge */}
                                                    {media.length > 1 && (
                                                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest rounded-md">
                                                            +{media.length - 1} More
                                                        </div>
                                                    )}

                                                    {/* Type Badge */}
                                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold text-black uppercase tracking-widest rounded-md">
                                                        {media[0].type === 'video' ? 'Video Showcase' : 'Verified Photo'}
                                                    </div>

                                                    {/* Expand Overlay - Pure Minimalist */}
                                                    <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500 shadow-2xl border border-zinc-100">
                                                            <Maximize2 size={16} className="text-zinc-900" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900">Experience Full Details</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-zinc-50 p-6 md:p-8 whitespace-normal">
                                                    <p className="font-sans text-xl md:text-2xl text-zinc-300 text-center leading-tight">
                                                        "{r.comment?.substring(0, 50)}..."
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* CONTENT AREA (Bottom 40%) */}
                                        <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-white whitespace-normal">
                                            <div className="flex gap-0.5 mb-4">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={14} fill="black" className="text-black" />
                                                ))}
                                            </div>

                                            <p className="font-sans text-sm md:text-base mb-6 line-clamp-6 leading-relaxed text-zinc-600 font-medium font-medium whitespace-normal">
                                                "{r.comment}"
                                            </p>

                                            <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-lg">
                                                        {(r.name || "U").charAt(0)}
                                                    </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900 line-clamp-1">{r.name}</p>
                                                            <div className="flex items-center gap-1">
                                                                <CheckCircle2 size={9} className="text-blue-600 fill-blue-50" />
                                                                <p className="text-[8px] text-zinc-400 font-black uppercase tracking-widest whitespace-nowrap">Verified Buyer</p>
                                                            </div>
                                                        </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-colors">
                                                    <ArrowUpRight size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default FeaturedReviews;
