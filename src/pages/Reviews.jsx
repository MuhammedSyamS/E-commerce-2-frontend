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
                        className="hidden md:flex absolute left-8 p-4 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>

                    {/* MODAL CONTENT */}
                    <div
                        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
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
                                            {/* INNER NAV: PREV MEDIA */}
                                            {allMedia.length > 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMediaIdx((prev) => (prev - 1 + allMedia.length) % allMedia.length);
                                                    }}
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-all z-20"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                                </button>
                                            )}

                                            {currentMedia.type === 'video' ? (
                                                <video src={currentMedia.url} controls autoPlay className="w-full h-full object-contain bg-black" />
                                            ) : (
                                                <img src={currentMedia.url} alt="Review Media" className="w-full h-full object-contain bg-black" />
                                            )}

                                            {/* INNER NAV: NEXT MEDIA */}
                                            {allMedia.length > 1 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedMediaIdx((prev) => (prev + 1) % allMedia.length);
                                                    }}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-all z-20"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                                </button>
                                            )}

                                            {/* MEDIA DOTS */}
                                            {allMedia.length > 1 && (
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                                    {allMedia.map((_, i) => (
                                                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === selectedMediaIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TEXT SIDE */}
                                    <div className={`w-full ${currentMedia ? 'md:w-1/2' : 'md:w-full'} p-6 md:p-10 flex flex-col bg-white overflow-y-auto custom-scrollbar relative`}>
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < activeReviewItem.review.rating ? "black" : "none"} className={i < activeReviewItem.review.rating ? "text-black" : "text-zinc-200"} />
                                            ))}
                                        </div>

                                        {activeReviewItem.review.title && (
                                            <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-zinc-900">
                                                {activeReviewItem.review.title}
                                            </h3>
                                        )}
                                        <p className="text-zinc-900 font-bold leading-relaxed text-base flex-grow mb-8 md:text-lg">
                                            {activeReviewItem.review.comment}
                                        </p>

                                        <div className="border-t border-zinc-100 pt-6 mt-auto">
                                            <p className="text-sm font-black uppercase tracking-widest text-black">
                                                {activeReviewItem.review.name || "Verified Buyer"}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                                                {new Date(activeReviewItem.review.date || Date.now()).toLocaleDateString()}
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
                        className="hidden md:flex absolute right-8 p-4 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
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
                        <div key={reviewIdx} className="bg-zinc-50 rounded-2xl p-3.5 md:p-6 flex flex-col h-full border border-transparent hover:border-zinc-200 transition-all group">

                            {/* USER INFO */}
                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center font-bold text-[9px] md:text-[10px] uppercase shadow-sm">
                                        {(item.review.name || "A").charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-900">{item.review.name || "Guest"}</p>
                                            <CheckCircle2 size={10} className="text-blue-600 fill-blue-50 md:size-[12px]" />
                                        </div>
                                        <p className="text-[8px] md:text-[9px] text-zinc-400 font-bold uppercase">{item.review.date ? new Date(item.review.date).toLocaleDateString() : 'Verified Buyer'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < item.review.rating ? "black" : "none"} className={i < item.review.rating ? "text-black" : "text-zinc-200"} />
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
                                <p className={`text-zinc-900 font-bold leading-relaxed text-[13px] md:text-sm border-l-2 border-zinc-100 pl-4 ${expandedText[reviewIdx] ? '' : 'line-clamp-4'}`}>
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

                            {/* PRODUCT LINK */}
                            <div className="pt-3 md:pt-4 border-t border-zinc-100">
                                <Link to={`/product/${item.productSlug}`} className="group/link flex items-center gap-3 w-full p-2 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors border border-zinc-100">
                                    <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-zinc-200">
                                        <img src={resolveMediaURL(item.productImage)} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Reviewing</p>
                                        <p className="text-[10px] font-black uppercase tracking-tight text-zinc-900 group-hover/link:text-black transition-colors truncate">
                                            {item.productName}
                                        </p>
                                    </div>
                                    <ArrowUpRight size={14} className="text-zinc-300 group-hover/link:text-black transition-colors mr-2" />
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
