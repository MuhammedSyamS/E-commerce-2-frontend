import React, { useState, useEffect } from 'react';
import api from '../api/instance';
import { Star, MessageSquare, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

    const [selectedReviewIdx, setSelectedReviewIdx] = useState(null);
    const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

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
        <div className="bg-white min-h-screen pt-44 md:pt-52 px-6 pb-20 text-[#1a1a1a]">
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
                                    {/* MEDIA SIDE */}
                                    <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {currentMedia ? (
                                            <>
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
                                            </>
                                        ) : (
                                            <div className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No Media Attached</div>
                                        )}
                                    </div>

                                    {/* TEXT SIDE */}
                                    <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white overflow-y-auto custom-scrollbar relative">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={14} fill={i < activeReviewItem.review.rating ? "black" : "none"} className={i < activeReviewItem.review.rating ? "text-black" : "text-zinc-200"} />
                                            ))}
                                        </div>

                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                                            {activeReviewItem.review.title || "Review"}
                                        </h3>
                                        <p className="text-zinc-600 italic leading-relaxed text-base flex-grow mb-8">
                                            "{activeReviewItem.review.comment}"
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
                <div className="mb-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4">
                        Community <span className="text-zinc-300">Voices</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-zinc-500 font-medium italic text-lg">
                        Real stories from verified customers about their experiences with our collection.
                    </p>
                </div>

                {/* STATS & FILTERS */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12 border-b border-zinc-100 pb-8">
                    <div className="flex items-end gap-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Reviews</p>
                            <p className="text-4xl font-black italic">{reviews.length}</p>
                        </div>
                        <div className="w-px h-10 bg-zinc-100"></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Average Rating</p>
                            <div className="flex items-center gap-2">
                                <p className="text-4xl font-black italic">{averageRating}</p>
                                <div className="flex text-black">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="currentColor" className={i < Math.round(averageRating) ? "text-black" : "text-zinc-200"} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 bg-zinc-50 p-1.5 rounded-xl overflow-x-auto custom-scrollbar w-full md:w-auto">
                        {['all', 5, 4, 3, 2, 1].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${filter === f
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredReviews.map((item, reviewIdx) => (
                        <div key={reviewIdx} className="bg-zinc-50 rounded-2xl p-6 flex flex-col h-full border border-transparent hover:border-zinc-200 transition-all group">

                            {/* USER INFO */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center font-bold text-[10px] uppercase shadow-sm">
                                        {(item.review.name || "A").charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-900">{item.review.name || "Guest"}</p>
                                            <CheckCircle2 size={12} className="text-blue-600 fill-blue-50" />
                                        </div>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase">{item.review.date ? new Date(item.review.date).toLocaleDateString() : 'Verified Buyer'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={10} fill={i < item.review.rating ? "black" : "none"} className={i < item.review.rating ? "text-black" : "text-zinc-200"} />
                                    ))}
                                </div>
                            </div>

                            {/* COMMENT */}
                            <div className="mb-6 flex-grow cursor-pointer group/text" onClick={() => { setSelectedReviewIdx(reviewIdx); setSelectedMediaIdx(0); }}>
                                <h3 className="font-bold text-sm mb-2 line-clamp-1 group-hover/text:underline">{item.review.title || "Great Product"}</h3>
                                <p className="text-zinc-600 italic leading-relaxed text-sm line-clamp-3">"{item.review.comment}"</p>
                                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mt-2 block group-hover/text:text-black transition-colors">Read More</span>
                            </div>

                            {/* PRODUCT LINK */}
                            <div className="pt-4 border-t border-zinc-200/50 mt-auto">
                                <Link to={`/product/${item.productSlug}`} className="group/link flex items-center justify-between w-full p-2 rounded-lg hover:bg-white transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-zinc-200 overflow-hidden">
                                            <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 group-hover/link:text-black transition-colors truncate max-w-[120px]">
                                            {item.productName}
                                        </span>
                                    </div>
                                    <ArrowUpRight size={14} className="text-zinc-300 group-hover/link:text-black transition-colors" />
                                </Link>
                            </div>

                            {/* MEDIA (IMAGES & VIDEO) */}
                            <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
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
                                            className={`relative w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform border border-zinc-200 ${media.type === 'video' ? 'bg-black' : ''}`}
                                        >
                                            {media.type === 'video' ? (
                                                <>
                                                    <video src={media.url} className="w-full h-full object-cover opacity-60" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-4 h-4 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <img src={media.url} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reviews;
