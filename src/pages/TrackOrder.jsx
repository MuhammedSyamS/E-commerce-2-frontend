import React, { useState } from 'react';
import axios from 'axios';
import { Package, Search, Truck, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const { data } = await axios.post('/api/orders/track', { orderId, email });
      setOrderData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to track order. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Status Stepper Logic
  const getStepStatus = (step) => {
    if (!orderData) return 'gray';

    // Status Hierarchy: Processing -> Shipped -> Delivered
    // If Cancelled, show special state?
    // For now simple happy path:

    const status = orderData.orderStatus;
    const isDispatched = orderData.isDispatched;
    const isDelivered = orderData.isDelivered;

    if (step === 'Processing') return 'green'; // Always true if order exists and not cancelled
    if (step === 'Shipped') return (isDispatched || isDelivered) ? 'green' : 'gray';
    if (step === 'Delivered') return isDelivered ? 'green' : 'gray';
    return 'gray';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header? Or assume Layout wraps it? Usually Page component is wrapped. */}

      <div className="max-w-3xl mx-auto w-full px-4 py-12 flex-grow">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID and email used for checkout.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 md:flex md:space-y-0 md:gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g., 65c4..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors uppercase"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Track
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {orderData && (
            <div className="mt-10 animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-6 mb-8 gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Order Status</div>
                  <div className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    {orderData.orderStatus}
                    {orderData.isDelivered && <CheckCircle className="w-6 h-6 text-green-500" />}
                  </div>
                  {orderData.trackingId && (
                    <div className="text-sm bg-gray-100 inline-block px-2 py-1 rounded mt-2 text-gray-600 font-mono">
                      Tracking: {orderData.trackingId} ({orderData.deliveryPartner})
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">Estimated Delivery</div>
                  <div className="text-lg font-medium text-gray-900">
                    {orderData.isDelivered ? 'Delivered' : '3-5 Business Days'}
                  </div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="relative mb-12">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full" />
                <div
                  className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                  style={{
                    width: orderData.isDelivered ? '100%' : orderData.isDispatched ? '50%' : '10%'
                  }}
                />

                <div className="relative flex justify-between">
                  {['Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                    const status = getStepStatus(step);
                    const isActive = status === 'green';

                    return (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white z-10 transition-colors ${isActive ? 'border-green-500 text-green-500' : 'border-gray-200 text-gray-300'
                          }`}>
                          {idx === 0 && <Package className="w-5 h-5" />}
                          {idx === 1 && <Truck className="w-5 h-5" />}
                          {idx === 2 && <CheckCircle className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Order Items ({orderData.items.length})</h3>
                <div className="space-y-4">
                  {orderData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://placehold.co/100' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-gray-900 font-medium truncate">{item.name}</h4>
                        <div className="text-sm text-gray-500">Qty: {item.qty}</div>
                      </div>
                      <div className="font-medium text-gray-900">₹{item.price}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="font-bold text-xl text-gray-900">₹{orderData.totalPrice}</span>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;