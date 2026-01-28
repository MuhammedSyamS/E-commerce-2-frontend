import React from 'react';

const TrackOrder = () => {
  return (
    <div className="min-h-screen pt-40 flex flex-col items-center px-6">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">Track Order</h1>
      <div className="w-full max-w-md space-y-6">
        <input 
          type="text" 
          placeholder="ORDER NUMBER (E.G. #HP1234)" 
          className="w-full border-b border-zinc-200 py-4 outline-none focus:border-black transition-all"
        />
        <button className="w-full bg-black text-white py-5 text-[10px] font-black uppercase tracking-[0.4em]">
          Track Status
        </button>
      </div>
    </div>
  );
};

export default TrackOrder; // THIS LINE IS REQUIRED