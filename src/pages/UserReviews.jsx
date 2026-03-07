import React, { useEffect, useState } from 'react';
import api from '../api/instance';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Trash2, Calendar, Quote, X } from 'lucide-react';
import { resolveMediaURL } from '../utils/mediaUtils';

const UserReviews = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReviewIdx, setSelectedReviewIdx] = useState(null);
    const [selectedMediaIdx, setSelectedMediaIdx] = useState(0);

    useEffect(() => {
        if (!user?.token) {
            navigate('/login');
            return;
        }

        const fetchReviews = async () => {
            try {
                const { data } = await api.get('/products/reviews/my-reviews');
                setReviews(data);
            } catch (err) {
                console.error("Failed to fetch user reviews", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [user, navigate]);

    const handleDelete = async (productId, reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        try {
            await api.delete(`/products/${productId}/reviews/${reviewId}`);
            // Remove from local state
            setReviews(reviews.filter(r => r.review._id !== reviewId));
        } catch (err) {
            console.error("Failed to delete review", err);
            addToast("Failed to delete review.", "error");
        }
    };

    if (loading) return <div className="text-center pt-52">Loading your contributions...</div>;

    return (
        <div className="min-h-screen bg-zinc-50 pt-44 md:pt-52 pb-20">
            {/* LIGHTBOX MODAL (White Theme) */}
            {selectedReviewIdx !== null && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
                    onClick={() => { setSelectedReviewIdx(null); setSelectedMediaIdx(0); }}
                >
                    <button className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-[120]">
                        <X size={24} className="md:w-8 md:h-8" />
                    </button>

                    {/* OUTER NAV: PREV REVIEW */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedReviewIdx((prev) => (prev - 1 + reviews.length) % reviews.length);
                            setSelectedMediaIdx(0);
                        }}
                        className="hidden md:flex absolute left-8 p-4 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    {/* MODAL CONTENT */}
                    <div
                        className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] md:max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(() => {
                            const activeReviewItem = reviews[selectedReviewIdx];
                            // Handle both single reviewImage and array of images for backward compatibility
                            const allImages = activeReviewItem?.review?.images && activeReviewItem?.review?.images?.length > 0
                                ? activeReviewItem.review.images
                                : (activeReviewItem?.review?.reviewImage ? [activeReviewItem.review.reviewImage] : []);
                            const currentImage = allImages[selectedMediaIdx] || null;

                            return (
                                <>
                                    {/* MEDIA SIDE */}
                                    <div className="relative w-full md:w-1/2 aspect-[4/3] md:aspect-auto bg-zinc-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {currentImage ? (
                                            <>
                                                {/* INNER NAV: PREV MEDIA */}
                                                {allImages.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMediaIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
                                                        }}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-all z-20"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                )}

                                                <img src={resolveMediaURL(currentImage)} alt="Review Media" className="w-full h-full object-contain bg-black" />

                                                {/* INNER NAV: NEXT MEDIA */}
                                                {allImages.length > 1 && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedMediaIdx((prev) => (prev + 1) % allImages.length);
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black transition-all z-20"
                                                    >
                                                        <ChevronRight size={20} />
                                                    </button>
                                                )}

                                                {/* MEDIA DOTS */}
                                                {allImages.length > 1 && (
                                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                                        {allImages.map((_, i) => (
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
                                            {[...Array(activeReviewItem.review.rating || 5)].map((_, i) => (
                                                <Star key={i} size={14} fill="black" className="text-black" />
                                            ))}
                                        </div>

                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-4">
                                            {activeReviewItem.productName}
                                        </h3>
                                        <p className="text-zinc-600 italic leading-relaxed text-base flex-grow mb-8">
                                            "{activeReviewItem.review.comment}"
                                        </p>

                                        <div className="border-t border-zinc-100 pt-6 mt-auto">
                                            <p className="text-sm font-black uppercase tracking-widest text-black">
                                                {user?.firstName + " " + user?.lastName || "Me"}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">
                                                {new Date(activeReviewItem.review.createdAt || Date.now()).toLocaleDateString()}
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
                            setSelectedReviewIdx((prev) => (prev + 1) % reviews.length);
                            setSelectedMediaIdx(0);
                        }}
                        className="hidden md:flex absolute right-8 p-4 rounded-full bg-white/10 text-white hover:bg-white hover:text-black transition-all z-20"
                    >
                        <ChevronRight size={32} />
                    </button>

                    {/* MOBILE OUTER NAV */}
                    <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-[120]">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedReviewIdx((prev) => (prev - 1 + reviews.length) % reviews.length); setSelectedMediaIdx(0); }} className="p-3 bg-black text-white rounded-full">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedReviewIdx((prev) => (prev + 1) % reviews.length); setSelectedMediaIdx(0); }} className="p-3 bg-black text-white rounded-full">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-12 border-b border-zinc-200 pb-8">
                    <button onClick={() => navigate('/account')} className="p-2 hover:bg-white rounded-full transition-colors group">
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">My Reviews</h1>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Manage Your Feedback</p>
                    </div>
                </div>

                {reviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100">
                        <Star size={48} className="mx-auto text-zinc-200 mb-4" />
                        <h3 className="text-lg font-bold">No Reviews Yet</h3>
                        <p className="text-zinc-500 mb-6 text-sm">You haven't shared your thoughts on any products yet.</p>
                        <button onClick={() => navigate('/shop')} className="bg-black text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest">
                            Shop Now
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reviews.map((item, reviewIdx) => (
                            <div key={reviewIdx} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative group hover:shadow-md transition-all">

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-6">
                                        <img src={resolveMediaURL(item.productImage)} alt={item.productName} className="w-20 h-20 object-cover rounded-2xl bg-zinc-100" />
                                        <div>
                                            <Link to={`/product/${item.productSlug}`} className="font-bold text-lg hover:underline">{item.productName}</Link>
                                            <div className="flex items-center gap-1 mt-1 mb-2">
                                                {[...Array(item.review.rating)].map((_, i) => (
                                                    <Star key={i} size={14} fill="black" className="text-black" />
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                                                <Calendar size={12} />
                                                {new Date(item.review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(item._id, item.review._id)}
                                        className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="bg-zinc-50 p-6 rounded-2xl relative">
                                    <Quote size={20} className="text-zinc-200 absolute top-4 left-4" />
                                    <p className="text-zinc-600 text-sm leading-relaxed pl-8 italic">"{item.review.comment}"</p>

                                    {/* DISPLAY IMAGES */}
                                    <div className="flex gap-2 mt-4 pl-8 flex-wrap">
                                        {(() => {
                                            const allImages = item.review.images && item.review.images.length > 0 ? item.review.images : (item.review.reviewImage ? [item.review.reviewImage] : []);

                                            return allImages.map((img, mediaIdx) => (
                                                <img
                                                    key={mediaIdx}
                                                    src={resolveMediaURL(img)}
                                                    alt="User Upload"
                                                    onClick={() => {
                                                        setSelectedReviewIdx(reviewIdx);
                                                        setSelectedMediaIdx(mediaIdx);
                                                    }}
                                                    className="w-16 h-16 rounded-lg object-cover border border-zinc-200 cursor-zoom-in hover:opacity-80 transition-opacity"
                                                />
                                            ));
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserReviews;
