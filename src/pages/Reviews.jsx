import React, { useState, useEffect } from 'react';
import api from '../api/instance';
import { Star, MessageSquare, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { resolveMediaURL } from '../utils/mediaUtils';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

    const [selectedReviewIdx, setSelectedReviewIdx] = useState(null);
    const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);
    const [expandedText, setExpandedText] = useState({});

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/products/reviews/all');
                setReviews(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch reviews", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const filteredReviews = reviews.filter(r => {
        if (filter === 'all') return true;
        return Math.floor(r.review.rating) === Number(filter);
    });

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    if (loading) return <div className="min-h-screen flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Reviews...</div>;

    return (
        <div className="bg-white min-h-screen pt-16 md:pt-32 lg:pt-40 px-6 pb-20 text-[#1a1a1a] selection:bg-black selection:text-white">
            <Helmet>
                <title>Customer Reviews | SLOOK</title>
                <meta name="description" content="Read what our customers are saying about SLOOK." />
            </Helmet>

            {/* LIGHTBOX MODAL */}
            {selectedReviewIdx !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
                    onClick={() => { setSelectedReviewIdx(null); setSelectedMediaIdx(0); }}
                >
                    <button className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-[120]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    {/* OUTER NAV: PREV REVIEW */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReviewIdx((prev) => (prev - 1 + filteredReviews.length) % filteredReviews.length);
                            setSelectedMediaIdx(0);
                        }}
                        className="hidden md:flex absolute left-8 text-black/20 hover:text-black transition-all z-20 group flex-col items-center gap-2"
                    >
                        <ChevronLeft size={48} strokeWidth={1.5} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">PREV</span>
                    </button>

                    {/* MODAL CONTENT */}
                    <div
                        className="relative w-full max-w-7xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(() => {
                            const activeReviewItem = filteredReviews[selectedReviewIdx];
                            const videos = activeReviewItem?.review?.videos || (activeReviewItem?.review?.video ? [activeReviewItem.review.video] : []);
                            const images = activeReviewItem?.review?.images || [];
                            const allMedia = [
                                ...videos.map(v => ({ type: 'video', url: v })),
                                ...images.map(i => ({ type: 'image', url: i }))
                            ];
                            const currentMedia = allMedia[selectedMediaIdx] || null;

                            return (
                                <>
                                    {/* MEDIA SIDE - Only show if media exists */}
                                    {currentMedia && (
                                        <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {/* INNER NAVIGATION ARROWS (Lowered) */}
                                            {allMedia.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMediaIdx((prev) => (prev - 1 + allMedia.length) % allMedia.length);
                                                        }}
                                                        className="absolute left-6 bottom-10 p-3 rounded-full bg-black/40 backdrop-blur-md text-white/60 hover:bg-white hover:text-black transition-all z-20"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMediaIdx((prev) => (prev + 1) % allMedia.length);
                                                        }}
                                                        className="absolute right-6 bottom-10 p-3 rounded-full bg-black/40 backdrop-blur-md text-white/60 hover:bg-white hover:text-black transition-all z-20"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                </>
                                            )}

                                            {currentMedia.type === 'video' ? (
                                                <video src={resolveMediaURL(currentMedia.url)} controls autoPlay className="w-full h-full object-contain bg-black" />
                                            ) : (
                                                <img src={resolveMediaURL(currentMedia.url)} alt="Review Media" className="w-full h-full object-contain bg-black" />
                                            )}

                                            {/* MEDIA DOTS */}
                                            {allMedia.length > 1 && (
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                                    {allMedia.map((_, i) => (
                                                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === selectedMediaIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* ABSOLUTE PRODUCT REFERENCE OVERLAY */}
                                            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-30 pointer-events-none">
                                                <div className="flex items-center gap-2 px-2.5 py-1 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl">
                                                    <div className="w-7 h-7 rounded-lg bg-white overflow-hidden border border-white/5 shrink-0">
                                                        <img src={resolveMediaURL(activeReviewItem.productImage)} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[6px] font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-0.5">Reviewing</p>
                                                        <p className="text-[8px] font-black uppercase tracking-widest text-white truncate max-w-[100px]">{activeReviewItem.productName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TEXT SIDE */}
                                    <div className={`w-full ${currentMedia ? 'md:w-1/2' : 'md:w-full'} p-6 md:p-14 flex flex-col bg-white overflow-y-auto custom-scrollbar relative`}>
                                        {/* USER INFO AT TOP */}
                                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-zinc-50">
                                            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center font-black text-xs text-white shadow-xl">
                                                {(activeReviewItem.review.name || "V").charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-zinc-900 leading-none">
                                                        {activeReviewItem.review.name || "Verified Buyer"}
                                                    </p>
                                                    <div className="flex gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={11} fill={i < activeReviewItem.review.rating ? "black" : "none"} className={i < activeReviewItem.review.rating ? "text-black" : "text-zinc-200"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                    Verified Perspectives
                                                </p>
                                            </div>
                                        </div>


                                        {activeReviewItem.review.title && (
                                            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-4 text-zinc-900 leading-tight">
                                                {activeReviewItem.review.title}
                                            </h3>
                                        )}
                                        <p className="text-zinc-900 font-medium leading-relaxed text-[13px] md:text-base flex-grow mb-8 whitespace-pre-line">
                                            "{activeReviewItem.review.comment}"
                                        </p>

                                        <div className="border-t border-zinc-50 pt-6 mt-auto">
                                            <p className="text-[7px] md:text-[8px] text-zinc-400 font-bold uppercase tracking-widest">
                                                {new Date(activeReviewItem.review.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>

                    {/* OUTER NAV: NEXT REVIEW */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReviewIdx((prev) => (prev + 1) % filteredReviews.length);
                            setSelectedMediaIdx(0);
                        }}
                        className="hidden md:flex absolute right-8 text-black/20 hover:text-black transition-all z-20 group flex-col items-center gap-2"
                    >
                        <ChevronRight size={48} strokeWidth={1.5} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">NEXT</span>
                    </button>

                    {/* MOBILE OUTER NAV */}
                    <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-[120]">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedReviewIdx((prev) => (prev - 1 + filteredReviews.length) % filteredReviews.length); setSelectedMediaIdx(0); }} className="p-3 bg-black text-white rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedReviewIdx((prev) => (prev + 1) % filteredReviews.length); setSelectedMediaIdx(0); }} className="p-3 bg-black text-white rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </div>
                </div>
            )}


            <div className="max-w-5xl mx-auto">
                {/* HEADER */}
                <div className="mb-10 md:mb-16 text-center">
                    <h1 className="text-2xl md:text-6xl font-black uppercase tracking-tighter mb-2 md:mb-4">
                        Community <span className="text-zinc-300">Voices</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-zinc-500 font-medium text-sm md:text-lg px-2">
                        Real stories from verified customers about their experiences with our collection.
                    </p>
                </div>

                {/* STATS & FILTERS */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 md:gap-8 mb-8 md:mb-12 border-b border-zinc-100 pb-6 md:pb-8">
                    <div className="flex items-end gap-3 md:gap-6">
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 md:mb-1">Reviews</p>
                            <p className="text-2xl md:text-4xl font-black">{reviews.length}</p>
                        </div>
                        <div className="w-px h-6 md:h-10 bg-zinc-100"></div>
                        <div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5 md:mb-1">Rating</p>
                            <div className="flex items-center gap-1 md:gap-2">
                                <p className="text-2xl md:text-4xl font-black">{averageRating}</p>
                                <div className="flex text-black">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} className={`md:size-[14px] ${i < Math.round(averageRating) ? "text-black fill-current" : "text-zinc-200"}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1.5 bg-zinc-50 p-1 rounded-xl overflow-x-auto no-scrollbar w-full md:w-auto">
                        {['all', 5, 4, 3, 2, 1].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-black text-white shadow-md'
                                    : 'text-zinc-400 hover:bg-zinc-200 hover:text-black'
                                    }`}
                            >
                                {f === 'all' ? 'All' : `${f} Stars`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* REVIEWS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredReviews.map((item, reviewIdx) => (
                        <div key={reviewIdx} className="bg-zinc-50 rounded-2xl p-3.5 md:p-6 flex flex-col h-full border border-transparent hover:border-zinc-200 transition-all group relative overflow-hidden">

                            {/* USER INFO */}
                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-[10px] md:text-xs text-white uppercase shadow-md shrink-0">
                                        {(item.review.name || "A").charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-widest text-zinc-900 leading-none">{item.review.name || "Guest"}</p>
                                            <CheckCircle2 size={10} className="text-blue-600 fill-blue-50" />
                                        </div>
                                        <p className="text-[8px] md:text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                                            {item.review.date ? new Date(item.review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Verified Perspective'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={11} fill={i < item.review.rating ? "black" : "none"} className={i < item.review.rating ? "text-black" : "text-zinc-100"} />
                                    ))}
                                </div>
                            </div>

                            {/* COMMENT */}
                            <div
                                className="mb-4 md:mb-6 cursor-pointer group/text"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedText(prev => ({ ...prev, [reviewIdx]: !prev[reviewIdx] }));
                                }}
                            >
                                {item.review.title && (
                                    <h3 className="font-black text-[10px] md:text-xs uppercase tracking-mega mb-2 text-zinc-900">{item.review.title}</h3>
                                )}
                                <p className={`text-zinc-600 font-medium leading-[1.8] text-sm md:text-base ${expandedText[reviewIdx] ? '' : 'line-clamp-6'}`}>
                                    "{item.review.comment}"
                                </p>
                                {item.review.comment && item.review.comment.length > 100 && (
                                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-2 block group-hover/text:text-black transition-colors border-l-2 border-zinc-100 pl-4">
                                        {expandedText[reviewIdx] ? 'Show Less' : 'Read More'}
                                    </span>
                                )}
                            </div>

                            {/* MEDIA (IMAGES & VIDEO) - MOVED ABOVE PRODUCT LINK */}
                            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar py-1">
                                {(() => {
                                    const videos = item.review.videos || (item.review.video ? [item.review.video] : []);
                                    const images = item.review.images || [];
                                    const allMedia = [
                                        ...videos.map(v => ({ type: 'video', url: v })),
                                        ...images.map(i => ({ type: 'image', url: i }))
                                    ];

                                    return allMedia.map((media, idx) => (
                                        <div
                                            key={idx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedReviewIdx(reviewIdx);
                                                setSelectedMediaIdx(idx);
                                            }}
                                            className={`relative w-20 h-28 md:w-24 md:h-32 rounded-xl flex-shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform border border-zinc-100 shadow-sm ${media.type === 'video' ? 'bg-black' : ''}`}
                                        >
                                            {media.type === 'video' ? (
                                                <>
                                                    <video src={resolveMediaURL(media.url)} className="w-full h-full object-cover opacity-60" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <img src={resolveMediaURL(media.url)} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>

                            {/* ABSOLUTE PRODUCT LINK (Cornered) */}
                            <div className="absolute top-4 right-4 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
                                <Link to={`/product/${item.productSlug}`} className="flex items-center gap-2 p-1 bg-white/80 backdrop-blur rounded-lg border border-zinc-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="w-8 h-8 rounded-md bg-white overflow-hidden shrink-0 border border-zinc-100">
                                        <img src={resolveMediaURL(item.productImage)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="hidden lg:block max-w-[80px]">
                                        <p className="text-[8px] font-bold text-zinc-900 truncate leading-none">{item.productName}</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
