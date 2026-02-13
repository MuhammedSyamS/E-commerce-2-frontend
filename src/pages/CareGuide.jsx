import React from 'react';

const CareGuide = () => {
    return (
        <div className="bg-white min-h-screen pt-40 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Product Care</h1>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    Your SLOOK products are designed to last. To ensure longevity and performance, please follow these general care guidelines.
                </p>

                <section className="space-y-2">
                    <h2 className="text-sm font-black uppercase">1. General Maintenance</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Keep items clean and dry. For most products, a soft, damp cloth is best for cleaning. Avoid harsh chemicals or abrasive materials that could damage finishes.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-sm font-black uppercase">2. Storage</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        When not in use, store your items in a cool, dry place. Proper storage prevents wear and environmental damage.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-sm font-black uppercase">3. Specific Care</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Refer to individual product packaging or labels for specific care instructions, especially for electronics, textiles, or specialized materials.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default CareGuide;
