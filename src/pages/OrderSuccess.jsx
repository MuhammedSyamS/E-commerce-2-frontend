import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

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

        <div className="bg-zinc-50 p-6 rounded-2xl mb-10 border border-zinc-200 inline-block w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Order Reference</p>
          <p className="text-xl md:text-2xl font-black font-mono tracking-widest select-all text-zinc-800">
            #{orderId.slice(-8).toUpperCase()}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 font-mono">{orderId}</p>
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