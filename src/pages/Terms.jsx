import React from 'react';

const Terms = () => {
    return (
        <div className="bg-white min-h-screen pt-40 pb-20 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Terms of Service</h1>

                <section className="space-y-2">
                    <h2 className="text-sm font-black uppercase">1. Acceptance of Terms</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-sm font-black uppercase">2. Use License</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Permission is granted to temporarily download one copy of the materials (information or software) on SLOOK's website for personal, non-commercial transitory viewing only.
                    </p>
                </section>

                <section className="space-y-2">
                    <h2 className="text-sm font-black uppercase">3. Governing Law</h2>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Any claim relating to SLOOK's website shall be governed by the laws of the State, without regard to its conflict of law provisions.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Terms;
