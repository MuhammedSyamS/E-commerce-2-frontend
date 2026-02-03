import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// MOCK DATA
const MOCK_REVIEWS = [
    {
        productName: "Sterling Silver Chain",
        productSlug: "sterling-silver-chain",
        review: { rating: 5, comment: "Absolutely stunning. The weight and finish are exactly what I was looking for.", name: "Arjun K." }
    },
    {
        productName: "Obsidian Ring",
        productSlug: "obsidian-ring",
        review: { rating: 5, comment: "The craftsmanship is top-notch. It feels substantial and the packaging was a beautiful unboxing experience.", name: "Sarah M.", images: ["https://images.pexels.com/photos/2690323/pexels-photo-2690323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"] }
    },
    {
        productName: "Minimalist Cuff",
        productSlug: "minimalist-cuff",
        review: { rating: 4, comment: "Sleek and modern. Fits perfectly and looks even better in person than in the photos.", name: "David L." }
    }
];

const FeaturedReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/products/reviews/featured');
                setReviews(data && data.length > 0 ? data : MOCK_REVIEWS);
            } catch (err) {
                console.error("Failed to fetch featured reviews", err);
                setReviews(MOCK_REVIEWS);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth * 0.8 : current.offsetWidth * 0.8;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading || reviews.length === 0) return null;

    return (
        <section className="bg-white text-zinc-900 py-32 overflow-hidden border-t border-zinc-100">

            {/* LIGHTBOX MODAL (White Theme) */}
            {/* LIGHTBOX MODAL (Gallery Mode) */}
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

            <div className="max-w-[1440px] mx-auto px-6 md:px-16 mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none mb-4">
                        Client <span className="text-zinc-400">Stories</span>
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Curated Feedback from Our Collectors</p>
                </div>

                <Link to="/shop" className="text-[10px] uppercase font-black tracking-widest border-b border-zinc-200 pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors">
                    View All Products
                </Link>
            </div>

            {/* MARQUEE-STYLE SCROLL */}
            <div className="relative w-full group">
                {/* RESTORED ABSOLUTE ARROWS */}
                <button onClick={() => scroll('left')} className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white border border-zinc-100 rounded-full shadow-xl hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={() => scroll('right')} className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-white border border-zinc-100 rounded-full shadow-xl hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 duration-300">
                    <ChevronRight size={24} />
                </button>

                <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar px-6 md:px-16 pb-16 snap-x snap-mandatory scroll-smooth">
                    {reviews.map((item, idx) => {
                        // Resolve Image: New 'images' array or Legacy 'reviewImage'
                        const displayImage = (item.review.images && item.review.images[0]) || item.review.reviewImage;
                        const allImages = item.review.images && item.review.images.length > 0
                            ? item.review.images
                            : (item.review.reviewImage ? [item.review.reviewImage] : []);

                        return (
                            <div
                                key={idx}
                                className="min-w-[340px] md:min-w-[420px] bg-white border border-zinc-100 p-8 md:p-12 rounded-[2rem] snap-center flex flex-col justify-between group/card hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                            >
                                {/* DECORATIVE QUOTE MARK */}
                                <div className="absolute top-6 right-8 text-9xl font-serif text-zinc-50 opacity-50 select-none">”</div>

                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1">
                                            {[...Array(item.review.rating)].map((_, i) => (
                                                <Star key={i} size={14} fill="black" className="text-black" />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-full">Verified Buyer</span>
                                    </div>

                                    <p className="text-xl md:text-2xl font-serif leading-relaxed text-zinc-800 italic">
                                        "{item.review.comment}"
                                    </p>

                                    {/* MULTI-IMAGE GALLERY - ENLARGED */}
                                    {allImages.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                                            {allImages.slice(0, 4).map((img, i) => (
                                                <div
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedReview({
                                                            image: img,
                                                            images: allImages,
                                                            index: i,
                                                            comment: item.review.comment
                                                        });
                                                    }}
                                                    className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-xl border border-zinc-100 overflow-hidden cursor-zoom-in hover:opacity-80 transition-opacity"
                                                >
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-10 pt-8 border-t border-zinc-50 flex items-center justify-between relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-lg">
                                            {item.review.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-zinc-900">{item.review.name}</p>
                                            <Link
                                                to={`/product/${item.productSlug}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[10px] font-bold text-zinc-400 uppercase mt-1 hover:text-black transition-colors block truncate max-w-[200px]"
                                            >
                                                {item.productName}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section >
    );
};

export default FeaturedReviews;
