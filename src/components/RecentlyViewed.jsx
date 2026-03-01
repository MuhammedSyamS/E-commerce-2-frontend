import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ChevronRight } from 'lucide-react';
import Price from './Price';

const RecentlyViewed = ({ currentProductId }) => {
    const [items, setItems] = useState([]);

    useEffect(() => {
        const updateHistory = () => {
            let history = [];
            try {
                history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            } catch (e) {
                console.error("Recently Viewed Parse Error");
                history = [];
            }
            // Filter out current product and limit to 4 items
            const filtered = (Array.isArray(history) ? history : [])
                .filter(p => (p._id || p.id) !== currentProductId)
                .slice(0, 4);
            setItems(filtered);
        };

        updateHistory();

        // Listen for storage changes in other tabs (optional but good)
        window.addEventListener('storage', updateHistory);
        return () => window.removeEventListener('storage', updateHistory);
    }, [currentProductId]);

    if (items.length === 0) return null;

    return (
        <section className="mt-20 pt-10 border-t border-zinc-100">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="font-black uppercase tracking-tighter" style={{ fontSize: 'clamp(14px, 4vw, 24px)' }}>Recently <span className="text-zinc-300">Viewed</span></h2>
                    <p className="font-black uppercase tracking-[0.3em] text-zinc-400 mt-1" style={{ fontSize: 'clamp(8px, 1.5vw, 10px)' }}>Pick up where you left off</p>
                </div>
                <Link to="/shop" className="font-black uppercase tracking-widest text-zinc-400 hover:text-black flex items-center gap-1 transition-colors" style={{ fontSize: 'clamp(8px, 1.5vw, 10px)' }}>
                    Explore More <ChevronRight size={12} />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {items.map((product) => (
                    <Link
                        key={product._id}
                        to={`/product/${product.slug || product._id}`}
                        className="group block bg-white rounded-[2rem] p-4 border border-zinc-100 hover:border-black hover:shadow-2xl hover:shadow-black/5 transition-all duration-500 hover:-translate-y-2"
                    >
                        <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4 bg-zinc-50 relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-black uppercase tracking-tight line-clamp-1 mb-1" style={{ fontSize: 'clamp(9px, 2vw, 14px)' }}>{product.name}</h4>
                        <div className="flex justify-between items-center">
                            <Price amount={product.price} className="font-black" style={{ fontSize: 'clamp(10px, 2vw, 14px)' }} />
                            <div className="flex items-center gap-1 font-black uppercase tracking-widest text-zinc-300 group-hover:text-black transition-colors" style={{ fontSize: 'clamp(7px, 1.5vw, 12px)' }}>
                                <Eye size={10} /> View
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default RecentlyViewed;
