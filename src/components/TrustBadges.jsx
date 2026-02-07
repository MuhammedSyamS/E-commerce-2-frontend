import React from 'react';
import { Truck, ShieldCheck, Award, RefreshCcw } from 'lucide-react';

const TrustBadges = () => {
    const badges = [
        { icon: <Truck size={20} />, title: "Free Shipping", subtitle: "On orders over ₹999" },
        { icon: <ShieldCheck size={20} />, title: <span>Secure <span className="text-red-500">Checkout</span></span>, subtitle: "SSL Encrypted" },
        { icon: <Award size={20} />, title: "Authentic", subtitle: "100% Original" },
        { icon: <RefreshCcw size={20} />, title: "Easy Returns", subtitle: "7-Day Policy" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-b border-zinc-100 my-8">
            {badges.map((badge, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-2 group">
                    <div className="p-3 bg-zinc-50 rounded-full text-zinc-900 group-hover:scale-110 transition-transform">
                        {badge.icon}
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-[10px] font-black uppercase tracking-widest">{badge.title}</h4>
                        <p className="text-[9px] text-zinc-400 font-medium">{badge.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrustBadges;
