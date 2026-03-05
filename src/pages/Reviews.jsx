import React, { useState, useEffect } from 'react';
import api from '../api/instance';
import { Star, MessageSquare, Filter, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, 5, 4, 3, 2, 1

    const [selectedReview, setSelectedReview] = useState(null);

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
            {selectedReview && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedReview(null)}
                >
                    <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    <div className="relative w-full max-w-5xl flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>

                        {/* PREV BTN */}
                        {selectedReview.media?.length > 1 && (
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
                                className="absolute left-0 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all z-20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                            </button>
                        )}

                        {selectedReview.currentMedia?.type === 'video' ? (
                            <div className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
                                <video
                                    src={selectedReview.currentMedia.url}
                                    controls
                                    autoPlay
                                    className="w-full h-auto max-h-[80vh] mx-auto"
                                />
                            </div>
                        ) : (
                            <img
                                src={selectedReview.currentMedia?.url}
                                alt="Full View"
                                className="w-auto h-auto max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl select-none"
                            />
                        )}

                        {/* NEXT BTN */}
                        {selectedReview.media?.length > 1 && (
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
                                className="absolute right-0 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all z-20"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        )}

                    </div>
                    <div className="max-w-2xl text-center mt-6">
                        <p className="text-white/90 text-lg font-medium italic leading-relaxed">
                            "{selectedReview.comment}"
                        </p>
                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mt-2">{selectedReview.name}</p>
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
                    {filteredReviews.map((item, idx) => (
                        <div key={idx} className="bg-zinc-50 rounded-2xl p-6 flex flex-col h-full border border-transparent hover:border-zinc-200 transition-all group">

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
                            <div className="mb-6 flex-grow">
                                <h3 className="font-bold text-sm mb-2 line-clamp-1">{item.review.title || "Great Product"}</h3>
                                <p className="text-zinc-600 italic leading-relaxed text-sm">"{item.review.comment}"</p>
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
                                            onClick={() => setSelectedReview({
                                                media: allMedia,
                                                currentMedia: media,
                                                index: idx,
                                                comment: item.review.comment,
                                                name: item.review.name
                                            })}
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
