import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const OrderSuccess = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center bg-white text-center px-6">
      <div className="animate-bounce mb-6">
        <CheckCircle size={64} className="text-green-500" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4">
        Order Confirmed!
      </h1>
      
      <p className="text-gray-500 text-lg mb-8 max-w-md">
        Thank you for your purchase. We have received your order and will begin processing it shortly.
      </p>
      
      <div className="bg-gray-50 p-6 rounded-lg mb-8 border border-gray-100">
        <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Order Number</p>
        <p className="text-xl font-bold font-mono">#ORD-{Math.floor(Math.random() * 100000)}</p>
      </div>

      <div className="flex gap-4">
        <Link to="/account" className="px-8 py-3 border border-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition">
          View Order
        </Link>
        <Link to="/" className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-800 transition">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;