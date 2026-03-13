import React from 'react';
import { Share2, Twitter, Facebook, MessageCircle } from 'lucide-react';

const SocialShare = ({ url, title }) => {
    const shareUrls = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
    };

    const handleShare = (platform) => {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    };

    return (
        <div className="flex items-center gap-4 mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-400">
                <Share2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 hover:bg-white hover:text-sky-500 rounded-full transition shadow-sm hover:shadow-md"
                >
                    <Twitter size={18} />
                </button>
                <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 hover:bg-white hover:text-blue-600 rounded-full transition shadow-sm hover:shadow-md"
                >
                    <Facebook size={18} />
                </button>
                <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-2 hover:bg-white hover:text-green-500 rounded-full transition shadow-sm hover:shadow-md"
                >
                    <MessageCircle size={18} />
                </button>
            </div>
        </div>
    );
};

export default SocialShare;
