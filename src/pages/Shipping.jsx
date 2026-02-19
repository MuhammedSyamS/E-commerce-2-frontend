import React from 'react';

const Shipping = () => {
    return (
        <div className="bg-white min-h-screen pt-40 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Shipping & Delivery</h1>

                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                    <p className="text-sm font-bold text-zinc-800 leading-relaxed">
                        To ensure every piece meets our strict quality standards and comes directly from our master artisans,
                        please allow <span className="text-black">7-14 days</span> for delivery.
                        This direct-to-consumer model cuts out the middleman, ensuring you get authentic luxury at an honest price.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-tight">Order Tracking</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Once your order is shipped, you will receive a tracking number via email.
                        You can also track your order status in your account dashboard.
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-tight">International Shipping</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        We currently ship worldwide. International orders may be subject to customs duties and taxes,
                        which are the responsibility of the recipient.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Shipping;
