import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../api/instance';
import { Share2 } from 'lucide-react';

const SharedWishlist = () => {
    const { userId } = useParams();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSharedWishlist = async () => {
            try {
                const { data } = await api.get(`/wishlist/shared/${userId}`);
                setWishlistItems(data);
            } catch (err) {
                console.error("Error fetching shared wishlist:", err);
                setError("This wishlist is private or does not exist.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchSharedWishlist();
    }, [userId]);

    if (loading) {
        return <div className="min-h-screen pt-52 text-center uppercase font-black tracking-widest text-[10px] text-zinc-400">Loading Collection...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen pt-52 text-center">
                <p className="text-red-500 font-bold uppercase tracking-widest mb-4">{error}</p>
                <Link to="/shop" className="underline text-xs font-bold">Return to Shop</Link>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pt-52 pb-20">
            <div className="container mx-auto px-6 max-w-7xl">

                <div className="mb-16 text-center">
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic transform -skew-x-3">
                        Shared Collection
                    </h1>
                    <div className="h-1 w-12 bg-black mx-auto mb-4"></div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">
                        Curated Selection • {wishlistItems.length} Items
                    </p>
                </div>

                {wishlistItems.length > 0 ? (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                        {wishlistItems.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                            // No custom onAddToCart needed, ProductCard handles it for the current user (if logged in)
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-zinc-50 rounded-[40px] border border-zinc-100">
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-8">This collection is empty</p>
                        <Link to="/shop" className="inline-block border-b-2 border-black pb-1 font-black uppercase tracking-widest text-[10px] hover:text-zinc-500 hover:border-zinc-500 transition-all">
                            Start Your Own
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SharedWishlist;
