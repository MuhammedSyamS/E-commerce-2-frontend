import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ProductCard from './ProductCard';

const RecentlyViewed = ({ currentProductId }) => {
    const [items, setItems] = useState([]);
    const scrollerRef = useRef(null);

    useEffect(() => {
        const updateHistory = () => {
            let history = [];
            try {
                history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
            } catch (e) {
                console.error("Recently Viewed Parse Error");
                history = [];
            }
            // Filter out current product
            const filtered = (Array.isArray(history) ? history : [])
                .filter(p => (p._id || p.id) !== currentProductId);
            setItems(filtered);
        };

        updateHistory();
        window.addEventListener('storage', updateHistory);
        return () => window.removeEventListener('storage', updateHistory);
    }, [currentProductId]);

    const scroll = (direction) => {
        if (scrollerRef.current) {
            const el = scrollerRef.current;
            const width = el.clientWidth;
            const scrollAmount = direction === 'left' ? -width * 0.8 : width * 0.8;
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (items.length === 0) return null;

    return (
        <section className="container-responsive py-12 md:py-24 relative bg-zinc-50 border-t border-zinc-100">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter">Recently Viewed</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-1">Pick up where you left off</p>
                </div>
                <Link to="/shop" className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors border-b border-zinc-200">View All</Link>
            </div>

            <div className="relative flex items-center group/scroller">
                <button
                    onClick={() => scroll('left')}
                    className="absolute -left-2 md:-left-20 top-[30%] md:top-[35%] -translate-y-1/2 z-50 text-black hover:text-zinc-600 transition-all hover:scale-110 active:scale-95"
                >
                    <ChevronLeft className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} />
                </button>
                <button
                    onClick={() => scroll('right')}
                    className="absolute -right-2 md:-right-20 top-[30%] md:top-[35%] -translate-y-1/2 z-50 text-black hover:text-zinc-600 transition-all hover:scale-110 active:scale-95"
                >
                    <ChevronRight className="w-8 h-8 md:w-16 md:h-16" strokeWidth={1} />
                </button>

                <div
                    ref={scrollerRef}
                    className="flex gap-3 md:gap-4 w-full overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-0 pb-10"
                >
                    {items.map((product) => (
                        <div key={product._id} className="w-[181.03px] md:w-auto md:min-w-[20%] lg:min-w-[16%] snap-start md:snap-start flex-shrink-0">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentlyViewed;
