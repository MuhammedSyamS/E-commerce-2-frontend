import React from 'react';

const Marquee = ({ text, items = [], reverse = false }) => {
  const content = items.length > 0 
    ? items.map(item => item.text).join(" • ") + " • "
    : text || "Premium Artifacts • High Quality • Studio Drops • Handpicked Originals • ";

  return (
    <div className="relative flex overflow-x-hidden bg-black py-4 border-y border-zinc-800">
      <div className={`flex whitespace-nowrap animate-marquee ${reverse ? 'flex-row-reverse' : ''}`}>
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 px-10">
            {content}
          </span>
        ))}
      </div>
      <div className={`absolute top-4 flex whitespace-nowrap animate-marquee2 ${reverse ? 'flex-row-reverse' : ''}`}>
        {[...Array(6)].map((_, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 px-10">
            {content}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes marquee2 {
          0% { transform: translateX(100%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Marquee;
