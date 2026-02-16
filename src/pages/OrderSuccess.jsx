import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const OrderSuccess = () => {
  const { state } = useLocation(); // Get passed state
  const orderId = state?.orderId || "PENDING";

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans text-[#1a1a1a] px-6 pt-20 pb-20">
      <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 max-w-2xl w-full text-center border border-zinc-100 animate-in zoom-in-95 duration-500">

        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
          <CheckCircle size={48} strokeWidth={2.5} />
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 italic transform -skew-x-3">
          Order Confirmed
        </h1>

        <p className="text-zinc-500 font-medium text-lg mb-10 leading-relaxed">
          Thank you for your purchase. We have received your order and will begin processing it shortly.
        </p>

        <div className="bg-zinc-50 p-6 rounded-2xl mb-6 border border-zinc-200 inline-block w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Order Reference</p>
          <p className="text-xl md:text-2xl font-black font-mono tracking-widest select-all text-zinc-800">
            #{orderId.slice(-8).toUpperCase()}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 font-mono">{orderId}</p>
        </div>

        {/* IMPORTANT UNBOXING NOTICE */}
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-10 text-left flex gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-700 mb-1">Important: Return Policy</h4>
            <p className="text-[11px] font-medium text-orange-800 leading-relaxed uppercase tracking-tight">
              Please record an <strong>Unboxing Video</strong> and take pictures when your package arrives.
              Returns and exchanges will <strong>ONLY</strong> be accepted with valid video proof.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/my-orders"
            className="flex items-center justify-center px-8 py-5 border-2 border-zinc-100 rounded-full font-black uppercase tracking-widest text-[10px] hover:border-black hover:bg-white transition-all"
          >
            View Order
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center px-8 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
