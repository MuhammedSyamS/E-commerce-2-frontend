import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Truck, Clock, XCircle } from 'lucide-react';

const AdminOrders = () => {
  const navigate = useNavigate();
  
  // Mock Single Order View
  const [status, setStatus] = useState('Processing');

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    alert(`Order Status Updated to: ${newStatus}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Order Header */}
        <div className="bg-white p-6 rounded-t-xl border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter">Order #ORD-8821</h1>
            <p className="text-xs text-gray-500 mt-1">Placed by <span className="font-bold text-black">Sonia Fan</span> on Jan 18, 2026</p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold uppercase text-gray-400 mb-1">Current Status</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {status}
            </span>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-white p-6 mb-6 rounded-b-xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">Update Order Status</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => updateStatus('Processing')} className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded text-xs font-bold uppercase hover:bg-gray-50">
              <Clock size={14} /> Processing
            </button>
            <button onClick={() => updateStatus('Shipped')} className="flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded text-xs font-bold uppercase hover:bg-blue-100">
              <Truck size={14} /> Mark Shipped
            </button>
            <button onClick={() => updateStatus('Delivered')} className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 px-4 py-2 rounded text-xs font-bold uppercase hover:bg-green-100">
              <CheckCircle size={14} /> Mark Delivered
            </button>
            <button onClick={() => updateStatus('Cancelled')} className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-100 px-4 py-2 rounded text-xs font-bold uppercase hover:bg-red-100">
              <XCircle size={14} /> Cancel Order
            </button>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-widest">Items Ordered</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded"></div>
                <div>
                  <p className="font-bold text-sm">Eagle Adjustable Ring</p>
                  <p className="text-xs text-gray-500">Qty: 1</p>
                </div>
              </div>
              <p className="font-bold text-sm">Rs. 799</p>
            </div>
            {/* Total */}
            <div className="flex justify-between items-center pt-2">
              <span className="font-black text-sm uppercase">Total Amount</span>
              <span className="font-black text-lg">Rs. 799</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminOrders;