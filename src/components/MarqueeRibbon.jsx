import React from 'react';

const MarqueeRibbon = ({ children, speed = 60, pauseOnHover = true, className = "" }) => {
  return (
    <div className={`relative flex overflow-x-hidden ${className}`}>
      <div className={`flex whitespace-nowrap animate-marquee-ribbon ${pauseOnHover ? 'hover:[animation-play-state:paused]' : ''}`}>
        <div className="flex shrink-0">
          {children}
        </div>
        <div className="flex shrink-0">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-ribbon {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-ribbon {
          animation: marquee-ribbon ${speed}s linear infinite;
          display: flex;
          width: max-content;
        }
      `}</style>
    </div>
  );
};

export default MarqueeRibbon;
