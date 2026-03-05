import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { MessageSquare, Star, Trash2, Eye, EyeOff, MessageCircle, X, Search, Quote, Shield } from 'lucide-react'; // Added Search, Quote, Shield

const AdminReviews = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); // Added missing state
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null); // Lightbox State

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/products/admin/reviews');
            setReviews(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const toggleVisibility = async (productId, reviewId) => {
        try {
            const { data } = await api.put(`/products/${productId}/reviews/${reviewId}/toggle`, {});

            // Optimistic Update
            setReviews(reviews.map(r =>
                r.review._id === reviewId ? { ...r, review: { ...r.review, isApproved: data.isApproved } } : r
            ));
            addToast(`Review marked as ${data.isApproved ? 'Visible' : 'Hidden'}`, "success");
        } catch (err) {
            addToast("Failed to toggle visibility", "error");
        }
    };

    const handleDelete = async (productId, reviewId) => { // Renamed to local convention if needed or keep deleteReview
        if (!window.confirm("Delete this review permanently?")) return;
        try {
            await api.delete(`/products/${productId}/reviews/${reviewId}`);
            setReviews(reviews.filter(r => r.review._id !== reviewId));
            addToast("Review Deleted", "success");
        } catch (err) {
            addToast("Delete failed", "error");
        }
    };

    const submitReply = async (productId, reviewId) => {
        if (!replyText.trim()) return;
        try {
            const { data } = await api.put(`/products/${productId}/reviews/${reviewId}/reply`, { response: replyText });

            setReviews(reviews.map(r =>
                r.review._id === reviewId ? { ...r, review: { ...r.review, adminResponse: data.adminResponse } } : r
            ));
            setReplyingTo(null);
            setReplyText('');
            addToast("Reply Posted", "success");
        } catch (err) {
            addToast("Reply failed", "error");
        }
    };

    // Filter Logic
    const filteredReviews = reviews.filter(item => {
        if (!item || !item.review) return false;
        return (
            (item.productName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.review.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.review.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    if (loading) return <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Reviews...</div>;

    return (
        <div>
            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur flex items-center justify-center p-4 animate-in fade-in"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-5 right-5 text-white/50 hover:text-white transition p-2 bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Zoomed Review"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Community</p>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter">Review <span className="text-zinc-300">Moderation</span></h1>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search Reviews..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 pr-4 py-3 bg-white border border-zinc-100 rounded-full text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-black transition w-64 shadow-sm"
                    />
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 gap-6">
                {filteredReviews.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100">
                        <MessageSquare size={48} className="mx-auto text-zinc-200 mb-4" />
                        <h3 className="text-lg font-bold">No Reviews Found</h3>
                    </div>
                ) : (
                    filteredReviews.map((item) => {
                        if (!item || !item.review) return null;
                        return (
                            <div key={item.review._id || Math.random()} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition group">

                                {/* Product Info */}
                                <div className="flex items-center gap-4 w-full md:w-1/4 min-w-[200px] border-b md:border-b-0 md:border-r border-zinc-100 pb-4 md:pb-0 md:pr-4">
                                    <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-xl object-cover bg-zinc-50" />
                                    <div>
                                        <h4 className="font-bold text-sm leading-tight mb-1">{item.productName}</h4>
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={10}
                                                    className={i < item.review.rating ? "fill-black text-black" : "text-zinc-200"}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Review Content */}
                                <div className="flex-1 relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black">
                                                {item.review.name ? item.review.name[0] : 'U'}
                                            </div>
                                            <span className="text-xs font-bold">{item.review.name}</span>
                                            <span className="text-[10px] text-zinc-400 font-medium ml-2">
                                                {new Date(item.review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            {/* Toggle Visibility */}
                                            <button
                                                onClick={() => toggleVisibility(item._id, item.review._id)}
                                                className={`p-2 rounded-lg transition ${item.review.isApproved ? 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200' : 'bg-red-50 text-red-500'}`}
                                                title={item.review.isApproved ? "Hide Review" : "Show Review"}
                                            >
                                                {item.review.isApproved ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>

                                            {/* Reply Button */}
                                            <button
                                                onClick={() => setReplyingTo(item.review._id)}
                                                className="p-2 bg-zinc-100 text-zinc-400 rounded-lg hover:bg-black hover:text-white transition"
                                                title="Reply"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pl-8 relative mb-4">
                                        <Quote size={14} className="absolute left-0 top-0 text-zinc-200" />
                                        <p className="text-sm text-zinc-600 italic leading-relaxed">
                                            {item.review.comment}
                                        </p>

                                        {/* Admin Response Display */}
                                        {item.review.adminResponse && (
                                            <div className="mt-3 bg-zinc-50 p-3 rounded-lg border-l-2 border-black">
                                                <p className="text-[10px] font-bold uppercase mb-1 flex items-center gap-1">
                                                    <Shield size={10} /> Official Response
                                                </p>
                                                <p className="text-xs text-zinc-600">{item.review.adminResponse}</p>
                                            </div>
                                        )}

                                        {/* Reply Input */}
                                        {replyingTo === item.review._id && (
                                            <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                                                <textarea
                                                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs focus:outline-none focus:border-black transition resize-none"
                                                    placeholder="Write a response..."
                                                    rows="2"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                ></textarea>
                                                <div className="flex gap-2 mt-2 justify-end">
                                                    <button onClick={() => setReplyingTo(null)} className="text-xs font-bold text-zinc-400 hover:text-black px-3 py-1">Cancel</button>
                                                    <button onClick={() => submitReply(item._id, item.review._id)} className="bg-black text-white text-xs font-bold px-4 py-1.5 rounded-lg hover:bg-zinc-800 transition">Post Reply</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Unified Media Render for Admin */}
                                    <div className="flex gap-2 mt-3 pl-8 flex-wrap">
                                        {/* Videos */}
                                        {(item.review.videos || (item.review.video ? [item.review.video] : [])).map((vid, i) => (
                                            <div key={`v-${i}`} className="w-24 h-16 bg-black rounded-lg overflow-hidden">
                                                <video src={vid} controls className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {/* Images */}
                                        {item.review.images && item.review.images.map((img, i) => (
                                            <img
                                                key={`i-${i}`}
                                                src={img}
                                                onClick={() => setSelectedImage(img)}
                                                className="w-16 h-16 rounded-lg object-cover border border-zinc-100 cursor-zoom-in hover:scale-110 transition-transform"
                                                alt="review"
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end">
                                    <button
                                        onClick={() => handleDelete(item._id, item.review._id)}
                                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition group-hover:opacity-100 opacity-0"
                                        title="Delete Review"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
