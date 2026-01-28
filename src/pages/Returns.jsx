import React from 'react';

const Returns = () => {
  return (
    <div className="min-h-screen pt-40 flex flex-col items-center px-6">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Returns</h1>
      <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-12">7-Day Easy Return Policy</p>
      
      <div className="max-w-2xl text-center space-y-6">
        <p className="text-sm leading-relaxed text-zinc-600">
          Items must be in original condition and packaging. <br />
          Contact support within 7 days of delivery to initiate a return.
        </p>
        <button className="bg-black text-white px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em]">
          Start Return
        </button>
      </div>
    </div>
  );
};

export default Returns; // THIS LINE IS REQUIRED