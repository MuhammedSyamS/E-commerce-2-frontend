import React, { useEffect, useState } from 'react';
import api from '../api/instance';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { Star, ChevronLeft, ChevronRight, Trash2, Calendar, Quote, X } from 'lucide-react';

const UserReviews = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);

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
            {/* GLOBAL LIGHTBOX (Gallery Mode) */}
            {selectedReview && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
                    onClick={() => setSelectedReview(null)}
                >
                    <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 bg-white/10 rounded-full z-50">
                        <X size={24} />
                    </button>

                    <div className="relative w-full max-w-5xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>

                        {/* PREV BUTTON */}
                        {selectedReview.images?.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newIndex = (selectedReview.index - 1 + selectedReview.images.length) % selectedReview.images.length;
                                    setSelectedReview({ ...selectedReview, index: newIndex, image: selectedReview.images[newIndex] });
                                }}
                                className="absolute left-4 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all z-20"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        )}

                        <img
                            src={selectedReview.image}
                            alt="Full View"
                            className="w-auto h-auto max-w-[90vw] max-h-[80vh] object-contain rounded-xl shadow-2xl animate-in fade-in zoom-in duration-300 select-none"
                        />

                        {/* NEXT BUTTON */}
                        {selectedReview.images?.length > 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const newIndex = (selectedReview.index + 1) % selectedReview.images.length;
                                    setSelectedReview({ ...selectedReview, index: newIndex, image: selectedReview.images[newIndex] });
                                }}
                                className="absolute right-4 p-3 rounded-full bg-black/50 text-white hover:bg-white hover:text-black transition-all z-20"
                            >
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>

                    <p className="text-white/80 text-lg md:text-xl font-medium italic text-center max-w-2xl leading-relaxed mt-8">
                        "{selectedReview.comment}"
                    </p>
                    {selectedReview.images?.length > 1 && (
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-4">
                            Image {selectedReview.index + 1} of {selectedReview.images.length}
                        </p>
                    )}
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
                        {reviews.map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm relative group hover:shadow-md transition-all">

                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-6">
                                        <img src={item.productImage} alt={item.productName} className="w-20 h-20 object-cover rounded-2xl bg-zinc-100" />
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

                                            return allImages.map((img, idx) => (
                                                <img
                                                    key={idx}
                                                    src={img}
                                                    alt="User Upload"
                                                    onClick={() => setSelectedReview({
                                                        image: img,
                                                        images: allImages,
                                                        index: idx,
                                                        comment: item.review.comment
                                                    })}
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
