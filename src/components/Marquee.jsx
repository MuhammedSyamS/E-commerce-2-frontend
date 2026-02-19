import React from 'react';

const Marquee = ({ text, reverse = false }) => {
  return (
    <div className="relative flex overflow-x-hidden bg-black py-4 border-y border-zinc-800">
      <div className={`flex whitespace-nowrap animate-marquee ${reverse ? 'flex-row-reverse' : ''}`}>
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 px-10">
            {text}
          </span>
        ))}
      </div>
      <div className={`absolute top-4 flex whitespace-nowrap animate-marquee2 ${reverse ? 'flex-row-reverse' : ''}`}>
        {[...Array(10)].map((_, i) => (
          <span key={i} className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40 px-10">
            {text}
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
          animation: marquee 80s linear infinite;
        }
        .animate-marquee2 {
          animation: marquee2 80s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Marquee;
