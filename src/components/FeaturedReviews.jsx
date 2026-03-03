import React, { useEffect, useState, useRef } from 'react';
import api from '../api/instance';
import { Star, CheckCircle2, ChevronLeft, ChevronRight, Play, Maximize2, MoreHorizontal, ArrowUpRight, X, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { resolveMediaURL } from '../utils/mediaUtils';

// MOCK DATA (High-End Editorial Tone)
const MOCK_REVIEWS = [
    {
        productName: "Obsidian Signet Ring",
        productSlug: "obsidian-ring",
        review: {
            rating: 5,
            title: "Absolute Perfection",
            comment: "The weight and finish are unparalleled. It feels like an heirloom piece from day one.",
            name: "Sarah J.",
            role: "Creative Director",
            images: ["https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
            date: "Sep 28, 2024",
            isVerifiedPurchase: true
        }
    },
    {
        productName: "Sterling Chain",
        productSlug: "sterling-silver-chain",
        review: {
            rating: 5,
            title: "Daily Staple",
            comment: "I haven't taken it off since it arrived. The craftsmanship withstands daily wear beautifully.",
            name: "Alex V.",
            role: "Architect",
            images: ["https://images.pexels.com/photos/9953654/pexels-photo-9953654.jpeg?auto=compress&cs=tinysrgb&w=800"],
            date: "Oct 12, 2024",
            isVerifiedPurchase: true
        }
    },
    {
        productName: "Minimalist Cuff",
        productSlug: "minimalist-cuff",
        review: {
            rating: 4,
            title: "Subtle Luxury",
            comment: "Understated and elegant. The matte finish is exactly what I was looking for.",
            name: "David L.",
            role: "Analyst",
            images: ["https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg?auto=compress&cs=tinysrgb&w=800"],
            date: "Nov 03, 2024",
            isVerifiedPurchase: true
        }
    },
    {
        productName: "Onyx Pendant",
        productSlug: "onyx-pendant",
        review: {
            rating: 5,
            title: "Statement Piece",
            comment: "Matches everything. The box packaging was also a delightful unboxing experience.",
            name: "Priya R.",
            role: "Owner",
            images: ["https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800"],
            date: "Aug 15, 2024",
            isVerifiedPurchase: true
        }
    },
    {
        productName: "Gold Band",
        productSlug: "gold-band",
        review: {
            rating: 5,
            title: "Worth the Wait",
            comment: "Took a bit to ship, but the quality is undeniable. Solid gold feel.",
            name: "Marcus T.",
            role: "Editor",
            images: ["https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"],
            date: "Dec 01, 2024",
            isVerifiedPurchase: true
        }
    }
];

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
                setReviews(data && data.length > 0 ? data : MOCK_REVIEWS);
            } catch (err) {
                setReviews(MOCK_REVIEWS);
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
        const rawVideos = r.videos || (r.video ? [r.video] : []);
        const rawImages = r.images || (r.reviewImage ? [r.reviewImage] : []);
        return [
            ...ensureArray(rawVideos).map(url => ({ type: 'video', url })),
            ...ensureArray(rawImages).map(url => ({ type: 'image', url }))
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
        <section className="bg-zinc-50 py-24 border-t border-zinc-200">

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

                    <div className="bg-white w-full max-w-7xl h-full md:h-[85vh] md:rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative" onClick={e => e.stopPropagation()}>

                        {/* Media Section (Left) */}
                        <div className="w-full md:w-3/5 h-[40vh] md:h-full bg-black relative flex items-center justify-center group bg-zinc-950 select-none">
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
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:scale-110 transition-all"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextMedia}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white/70 hover:text-white hover:scale-110 transition-all"
                                    >
                                        <ChevronRight size={24} />
                                    </button>
                                </>
                            )}

                            {/* Carousel Dots */}
                            {selectedReview.media?.length > 1 && (
                                <div className="absolute bottom-8 flex gap-2 z-10">
                                    {selectedReview.media.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedReview({ ...selectedReview, mediaIndex: idx, currentMedia: selectedReview.media[idx] });
                                            }}
                                            className={`w-2 h-2 rounded-full transition-all ${idx === selectedReview.mediaIndex ? 'bg-white scale-150' : 'bg-white/40 hover:bg-white/80'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section (Right) */}
                        <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col h-[60vh] md:h-full overflow-y-auto bg-white">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-xl font-sans font-bold text-zinc-900">
                                    {(selectedReview.name || "U").charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-zinc-900 leading-none mb-1">{selectedReview.name}</h4>
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">{selectedReview.role || "Verified Owner"}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill="black" className="text-black" />
                                    ))}
                                </div>
                                <h3 className="text-2xl font-sans mb-4 text-zinc-900">"{selectedReview.title || "Product Review"}"</h3>
                                <p className="text-zinc-600 leading-loose text-base font-light">
                                    {selectedReview.comment}
                                </p>

                                {selectedReview.adminResponse && (
                                    <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mt-6">
                                        <p className="text-[10px] font-black uppercase text-zinc-900 mb-2 flex items-center gap-1">
                                            <Zap size={10} fill="black" /> Official Response
                                        </p>
                                        <p className="text-xs text-zinc-500">{selectedReview.adminResponse}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-auto pt-8 border-t border-zinc-100">
                                <Link to={`/product/${selectedReview.productSlug}`} className="group flex items-center justify-between p-4 rounded-xl border border-zinc-200 hover:border-black transition-colors">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-zinc-400 mb-1">Purchased Product</p>
                                        <p className="font-bold text-sm">{selectedReview.productName}</p>
                                    </div>
                                    <ArrowRight className="text-zinc-300 group-hover:text-black transition-colors" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-[1440px] mx-auto px-6 md:px-24">

                {/* HEADER */}
                <div className="flex justify-between items-end mb-12">
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
                                    className="min-w-[300px] md:min-w-[400px] bg-white border border-zinc-200 snap-start flex flex-col group hover:shadow-xl transition-shadow duration-500 cursor-pointer"
                                >
                                    {/* MEDIA AREA (Top 60%) */}
                                    <div className="h-[300px] md:h-[400px] bg-zinc-100 relative overflow-hidden border-b border-zinc-100">
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
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-50 p-8">
                                                <p className="font-sans text-3xl text-zinc-300 text-center leading-tight">
                                                    "{r.comment?.substring(0, 50)}..."
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTENT AREA (Bottom 40%) */}
                                    <div className="p-8 flex flex-col flex-1 relative bg-white">
                                        <div className="flex gap-0.5 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} fill="black" className="text-black" />
                                            ))}
                                        </div>

                                        <h3 className="font-sans text-xl mb-4 line-clamp-3 leading-relaxed">
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
