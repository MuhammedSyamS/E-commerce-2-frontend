import React from 'react';

const Returns = () => {
  return (
    <div className="bg-white min-h-screen pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Returns & Refunds</h1>

        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">7-Day Guarantee</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            We stand by the quality of our goods. If you are not completely satisfied with your purchase,
            you may return it within 7 days of receiving your order for a full refund or exchange.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">How to Return</h2>
          <ol className="list-decimal pl-4 space-y-2 text-xs text-zinc-500 font-medium">
            <li>Log in to your account and go to <strong>My Orders</strong>.</li>
            <li>Select the order containing the item you wish to return.</li>
            <li>Click the <strong>Return</strong> button next to the item.</li>
            <li>Select your reason, choose Refund or Exchange, and submit.</li>
            <li>We will review your request and schedule a pickup.</li>
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black uppercase tracking-tight">Condition</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Items must be unworn, devoid of any scratches or damage, and in their original packaging to be eligible for a refund.
            <br /><br />
            <strong>IMPORTANT:</strong> Returns and exchanges will <strong>ONLY</strong> be accepted if you provide an <strong>Unboxing Video</strong> showing the package condition and the product defect clearly. Requests without video proof will be rejected.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Returns;