import React, { useState } from 'react';
import axios from 'axios';
import {
  Package, Search, Truck, CheckCircle, AlertCircle,
  Loader, Box, ShieldCheck, MapPin, ArrowRight
} from 'lucide-react';
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

  // Granular Status Mapping for SLOOK Elite
  const milestones = [
    { label: 'Order Placed', status: 'Pending', icon: Box },
    { label: 'Quality Check', status: 'Confirmed', icon: ShieldCheck },
    { label: 'Dispatched', status: 'Shipped', icon: Truck },
    { label: 'Delivered', status: 'Delivered', icon: CheckCircle }
  ];

  const getStepStatus = (index) => {
    if (!orderData) return 'pending';

    const statusFlow = {
      'Pending': 0,
      'Processing': 1,
      'Confirmed': 2,
      'Dispatched': 3,
      'Shipped': 3,
      'Delivered': 4
    };

    const currentLevel = statusFlow[orderData.orderStatus] || 0;
    if (currentLevel > index) return 'completed';
    if (currentLevel === index) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4 md:px-10 selection:bg-white selection:text-black">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none mb-4">
            Track <span className="text-zinc-500">Voyage</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">Real-time surveillance of your elite pieces</p>
        </div>

        {/* Tracking Form */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 md:p-12 rounded-[2.5rem] mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 group-focus-within:text-white transition-colors">Order Identity</label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="E.G. 65C4..."
                className="w-full bg-transparent border-b-2 border-zinc-800 py-3 text-xl font-black uppercase tracking-tighter focus:outline-none focus:border-white transition-all placeholder:text-zinc-800"
              />
            </div>
            <div className="flex-1 w-full group">
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 group-focus-within:text-white transition-colors">Authenticated Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER EMAIL"
                className="w-full bg-transparent border-b-2 border-zinc-800 py-3 text-xl font-black uppercase tracking-tighter focus:outline-none focus:border-white transition-all placeholder:text-zinc-800"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-white text-black h-[60px] px-10 rounded-full font-black uppercase italic tracking-widest hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <span>Locate</span>}
            </button>
          </form>

          {error && (
            <div className="mt-8 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center gap-4 animate-shake">
              <AlertCircle size={20} />
              <p className="text-[11px] font-black uppercase tracking-widest">{error}</p>
            </div>
          )}
        </div>

        {orderData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem]">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Live Status</p>
                <h3 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                  {orderData.orderStatus}
                  {orderData.isDelivered && <CheckCircle className="text-green-500" size={20} />}
                </h3>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] md:col-span-2 flex justify-between items-center group">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tracking Logistics</p>
                  <h3 className="text-xl font-black tracking-widest font-mono text-white">
                    {orderData.trackingId || 'INITIATING...'}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-600 mt-1 uppercase">{orderData.deliveryPartner || 'SLOOK INTERNAL'}</p>
                </div>
                <MapPin size={40} className="text-zinc-800 group-hover:text-white transition-colors" />
              </div>
            </div>

            {/* Elite Progress Stepper */}
            <div className="mb-20 px-4">
              <div className="relative flex justify-between items-center">
                {/* Backline */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-zinc-800 -translate-y-1/2" />

                {milestones.map((m, idx) => {
                  const status = getStepStatus(idx);
                  const isActive = status === 'active';
                  const isCompleted = status === 'completed';
                  const Icon = m.icon;

                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center group">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${isActive ? 'bg-white border-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)]' :
                          isCompleted ? 'bg-zinc-900 border-zinc-700 text-green-500' :
                            'bg-black border-zinc-800 text-zinc-800'
                        }`}>
                        <Icon size={24} />
                      </div>
                      <div className="absolute top-16 text-center whitespace-nowrap">
                        <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-zinc-400' : 'text-zinc-800'
                          }`}>
                          {m.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Manifest */}
            <div className="bg-zinc-900/30 rounded-[3rem] border border-zinc-800 p-10 overflow-hidden">
              <div className="flex items-center justify-between mb-10 border-b border-zinc-800 pb-6">
                <h4 className="text-xs font-black uppercase italic tracking-[0.3em]">Order Manifest</h4>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{orderData.items.length} ELITE COMPONENTS</span>
              </div>

              <div className="space-y-8">
                {orderData.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-8 group">
                    <div className="w-24 h-24 bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 group-hover:border-zinc-500 transition-colors flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { e.target.src = 'https://placehold.co/200?text=SLOOK' }}
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-black uppercase tracking-tighter group-hover:translate-x-2 transition-transform">{item.name}</h5>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1">QUANTITY: {item.qty}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black italic">₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Acquisition Total</span>
                <span className="text-3xl font-black italic">₹{orderData.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <Link to="/support" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-colors">
                Report Issue <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
