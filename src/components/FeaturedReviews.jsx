import React, { useEffect, useState, useRef } from 'react';
import api from '../api/instance';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Play, Maximize2, MoreHorizontal, ArrowUpRight, X, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveMediaURL } from '../utils/mediaUtils';


const FeaturedReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const scrollRef = useRef(null);

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

    const ensureArray = (data) => Array.isArray(data) ? data : [];

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -400 : 400;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

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

    if (loading) return null;

    return (
        <section className="bg-zinc-50 py-12 md:py-24 border-t border-zinc-200">

            {/* IMMERSIVE MODAL (With Navigation) */}
            {selectedReview && (
                <div
                    className="fixed inset-0 z-[100] bg-zinc-900/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-300"
                    onClick={() => setSelectedReview(null)}
                >
                    {/* CLOSE BUTTON */}
                    <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-50">
                        <X size={24} />
                    </button>

                    {/* REVIEW NAVIGATION ARROWS (Global) */}
                    <button
                        onClick={prevReview}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white/50 hover:text-white hover:bg-white/20 transition-all z-50 hidden md:block"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={nextReview}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white/50 hover:text-white hover:bg-white/20 transition-all z-50 hidden md:block"
                    >
                        <ChevronRight size={32} />
                    </button>

                    <div className="bg-white w-full max-w-7xl h-full md:h-[85vh] md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative mx-auto md:mx-4" onClick={e => e.stopPropagation()}>
                        
                        {/* Close Button (Mobile Floating) */}
                        <button 
                            onClick={() => setSelectedReview(null)}
                            className="absolute top-4 right-4 md:hidden z-[110] bg-black/50 backdrop-blur-md text-white p-2 rounded-full"
                        >
                            <X size={20} />
                        </button>

                        {/* Media Section (Left) */}
                        <div className="w-full md:w-3/5 h-[45vh] md:h-full bg-black relative flex items-center justify-center group bg-zinc-950 select-none border-b md:border-b-0 md:border-r border-zinc-100">
                            {selectedReview.currentMedia ? (
                                selectedReview.currentMedia.type === 'video' ? (
                                    <video
                                        controls
                                        autoPlay
                                        src={resolveMediaURL(selectedReview.currentMedia.url)}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={resolveMediaURL(selectedReview.currentMedia.url)}
                                        alt="Review"
                                        className="w-full h-full object-contain"
                                    />
                                )
                            ) : (
                                <div className="text-zinc-500 font-medium">No Media</div>
                            )}

                            {/* MEDIA NAVIGATION ARROWS (Local) */}
                            {selectedReview.media?.length > 1 && (
                                <>
                                    <button
                                        onClick={prevMedia}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-2 rounded-full text-white/70 hover:text-white hover:scale-110 transition-all z-20"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={nextMedia}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-2 rounded-full text-white/70 hover:text-white hover:scale-110 transition-all z-20"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}

                            {/* Carousel Dots */}
                            {selectedReview.media?.length > 1 && (
                                <div className="absolute bottom-6 flex gap-1.5 z-10">
                                    {selectedReview.media.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedReview({ ...selectedReview, mediaIndex: idx, currentMedia: selectedReview.media[idx] });
                                            }}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === selectedReview.mediaIndex ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section (Right) */}
                        <div className="w-full md:w-2/5 p-6 md:p-12 flex flex-col h-[55vh] md:h-full overflow-y-auto bg-white custom-scrollbar">
                            <div className="flex items-center gap-4 mb-6 md:mb-10">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-zinc-950 flex items-center justify-center text-lg font-sans font-bold text-white shadow-xl shadow-zinc-200">
                                    {(selectedReview.name || "U").charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-base md:text-xl font-black text-zinc-900 leading-none mb-1 uppercase tracking-tight">{selectedReview.name}</h4>
                                    <p className="text-zinc-400 text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black">{selectedReview.role || "Verified Owner"}</p>
                                </div>
                            </div>

                            <div className="mb-8 overflow-y-auto flex-1">
                                <div className="flex gap-0.5 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="black" className="text-black" />
                                    ))}
                                </div>
                                <h3 className="text-xl md:text-3xl font-sans mb-6 text-zinc-950 leading-tight italic">"{selectedReview.title || "Product Review"}"</h3>
                                <p className="text-zinc-600 leading-[1.8] text-sm md:text-lg font-medium opacity-80">
                                    {selectedReview.comment}
                                </p>

                                {selectedReview.adminResponse && (
                                    <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-100 mt-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-3 opacity-5">
                                            <Zap size={40} fill="black" />
                                        </div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-900 mb-3 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-black rounded-full" /> Official Response
                                        </p>
                                        <p className="text-xs md:text-sm text-zinc-500 leading-relaxed italic">{selectedReview.adminResponse}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-6 border-t border-zinc-100">
                                <Link 
                                    to={`/product/${selectedReview.productSlug}`} 
                                    className="group flex items-center justify-between p-4 md:p-5 rounded-[1.5rem] border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-950 hover:text-white transition-all duration-500"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {selectedReview.productImage && (
                                                <img 
                                                    src={resolveMediaURL(selectedReview.productImage)} 
                                                    className="w-12 h-12 md:w-14 md:h-14 object-cover rounded-xl shadow-sm" 
                                                    alt="" 
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-500 mb-1 font-black">Collection Item</p>
                                            <p className="font-black text-xs md:text-sm uppercase tracking-tight">{selectedReview.productName}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center text-zinc-900 group-hover:bg-white/10 group-hover:text-white transition-all">
                                        <ArrowRight size={16} />
                                    </div>
                                </Link>
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

                {/* SCROLL WRAPPER */}
                <div className="relative group/review-scroller">
                    <button onClick={() => scroll('left')} className="absolute -left-4 md:-left-20 top-[40%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-all hover:scale-110 active:scale-95">
                        <ChevronLeft className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
                    </button>
                    <button onClick={() => scroll('right')} className="absolute -right-4 md:-right-20 top-[40%] -translate-y-1/2 z-50 text-zinc-300 hover:text-black transition-all hover:scale-110 active:scale-95">
                        <ChevronRight className="w-10 h-10 md:w-16 md:h-16" strokeWidth={1} />
                    </button>

                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto pb-12 -mx-6 px-6 md:px-0 md:-mx-0 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {reviews.map((item, idx) => {
                            const r = item.review || item;

                            const media = getMediaFromReview(item);
                            const hasMedia = media.length > 0;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => openModal(item, idx)}
                                    className="min-w-[280px] md:min-w-[400px] bg-white border border-zinc-200 snap-start flex flex-col group hover:shadow-xl transition-shadow duration-500 cursor-pointer"
                                >
                                    {/* MEDIA AREA (Top 60%) */}
                                    <div className="h-[250px] md:h-[400px] bg-zinc-100 relative overflow-hidden border-b border-zinc-100">
                                        {hasMedia ? (
                                            <div className="w-full h-full relative">
                                                {media[0].type === 'video' ? (
                                                    <video src={resolveMediaURL(media[0].url)} muted loop autoPlay className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                ) : (
                                                    <img src={resolveMediaURL(media[0].url)} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                                )}

                                                {/* Count Badge */}
                                                {media.length > 1 && (
                                                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest rounded-md">
                                                        +{media.length - 1} More
                                                    </div>
                                                )}

                                                {/* Type Badge */}
                                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 text-[10px] font-bold text-black uppercase tracking-widest rounded-md">
                                                    {media[0].type === 'video' ? 'Video Review' : 'Verified Photo'}
                                                </div>

                                                {/* Expand Overlay */}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                        <Maximize2 size={16} />
                                                        <span className="text-xs font-bold uppercase tracking-widest">Read More</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Fallback Pattern for Text-Only
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-50 p-6 md:p-8">
                                                <p className="font-sans text-2xl md:text-3xl text-zinc-300 text-center leading-tight">
                                                    "{r.comment?.substring(0, 50)}..."
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT AREA (Bottom 40%) */}
                                    <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-white">
                                        <div className="flex gap-0.5 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill="black" className="text-black" />
                                            ))}
                                        </div>

                                        <h3 className="font-sans text-lg md:text-xl mb-4 line-clamp-3 leading-relaxed">
                                            "{r.comment}"
                                        </h3>

                                        <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-xs">
                                                    {(r.name || "U").charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-900">{r.name}</p>
                                                    <p className="text-[10px] text-zinc-400 font-medium">Verified Buyer</p>
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
                </div>
            </div>
        </section>
    );
};

export default FeaturedReviews;
