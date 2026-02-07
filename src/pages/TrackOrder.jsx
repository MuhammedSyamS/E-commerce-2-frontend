import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Search, Package, MapPin, Truck, CheckCircle, Clock } from 'lucide-react';

const TrackOrder = () => {
  const { user } = useStore();
  const { addToast } = useToast();

  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!user) {
      addToast("Please login to track your orders", "error");
      return;
    }
    if (!orderId) {
      addToast("Please enter an Order ID", "error");
      return;
    }

    setLoading(true);
    setOrder(null);

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/orders/${orderId.trim()}?t=${Date.now()}`, config);
      setOrder(data);
    } catch (err) {
      console.error(err);
      addToast("Order not found or access denied", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- TIMELINE LOGIC ---
  const getSteps = (order) => {
    const s = order.orderStatus || (order.isDelivered ? 'Delivered' : order.isDispatched ? 'Shipped' : 'Pending');

    // Status Priority Map
    const statusMap = {
      'Pending': 0,
      'Confirmed': 1,
      'Packed': 2,
      'Shipped': 3,
      'Delivered': 4,
      'Cancelled': -1,
      'Returned': -1
    };

    const currentLevel = statusMap[s] || 0;

    const steps = [
      { label: 'Placed', icon: Package, date: order.createdAt, active: true },
      { label: 'Confirmed', icon: CheckCircle, date: order.createdAt, active: currentLevel >= 1 },
      { label: 'Shipped', icon: Truck, date: order.dispatchedAt, active: currentLevel >= 3 },
      { label: 'Delivered', icon: MapPin, date: order.deliveredAt, active: currentLevel >= 4 }
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-white pt-40 lg:pt-48 pb-20 px-6">
      <div className="max-w-3xl mx-auto">

        {/* HEAD */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Track <span className="text-red-500">Order</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Enter your Order ID to see live status</p>
        </div>

        {/* SEARCH INPUT */}
        <form onSubmit={handleTrack} className="flex gap-4 mb-16 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="ORDER ID (E.G. 64f2...)"
              className="w-full bg-zinc-50 border border-zinc-200 py-4 pl-12 pr-4 rounded-full text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-all"
            />
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
          </div>
          <button type="submit" disabled={loading} className="bg-black text-white px-8 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition disabled:opacity-50">
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {/* TIMELINE DISPLAY */}
        {order && (
          <div className="bg-zinc-50 p-8 md:p-12 rounded-[2.5rem] border border-zinc-100 animate-in slide-in-from-bottom duration-500">
            {/* ORDER INFO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-zinc-200 pb-8 gap-6">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Order #{order._id.slice(-8)}</p>
                <h2 className="text-2xl font-black uppercase tracking-tight">{order.orderItems[0].name} {order.orderItems.length > 1 && `+ ${order.orderItems.length - 1} more`}</h2>
              </div>
              <div className="text-left md:text-right">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Expected Delivery</p>
                <p className="text-lg font-bold uppercase tracking-tight text-green-600">
                  {order.isDelivered ? "Delivered" : "Coming Soon"}
                </p>
              </div>
            </div>

            {/* VISUAL TIMELINE */}
            <div className="relative mb-8">
              {/* PROGRESS BAR BG */}
              <div className="absolute top-6 left-0 w-full h-1 bg-zinc-200 rounded-full"></div>

              {/* ACTIVE PROGRESS BAR */}
              <div
                className="absolute top-6 left-0 h-1 bg-black rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: (() => {
                    const s = order.orderStatus || 'Pending';
                    if (s === 'Delivered') return '100%';
                    if (s === 'Shipped') return '66%';
                    if (s === 'Packed' || s === 'Confirmed') return '33%';
                    return '0%';
                  })()
                }}
              ></div>

              <div className="relative flex justify-between">
                {getSteps(order).map((step, index) => (
                  <div key={index} className={`flex flex-col items-center gap-4 transition-all duration-500 delay-${index * 200}`}>
                    {/* ICON CIRCLE */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-500 ${step.active ? 'bg-black border-black text-white' : 'bg-white border-zinc-200 text-zinc-300'
                      }`}>
                      <step.icon size={18} />
                    </div>

                    {/* TEXT */}
                    <div className="text-center">
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${step.active ? 'text-black' : 'text-zinc-300'}`}>{step.label}</p>
                      {step.date && step.active && (
                        <p className="text-[9px] font-bold text-zinc-400">{new Date(step.date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;