import React from 'react';

const About = () => {
    return (
        <div className="bg-white min-h-screen pt-40 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-12">
                <div className="space-y-4 text-center">
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">The Mission</h1>
                    <p className="text-lg font-bold text-zinc-400 max-w-lg mx-auto">
                        "Curating essentials for the modern lifestyle."
                    </p>
                </div>

                <div className="space-y-6 text-sm font-medium text-zinc-600 leading-loose">
                    <p>
                        <strong className="text-black">SLOOK</strong> exists to bridge the gap between utility and aesthetic. We believe that the objects you surround yourself with should not just function—they should inspire.
                    </p>
                    <p>
                        Every product in our collection is selected with intention. Whether it's daily carry, home goods, or apparel, we refuse to compromise on quality. Our direct-to-consumer model allows us to bring you premium goods without the traditional retail markup.
                    </p>
                    <p>
                        When you choose SLOOK, you aren't just buying a product. You are investing in a standard of living.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
