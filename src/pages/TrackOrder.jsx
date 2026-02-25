import React, { useState } from 'react';
import api from '../api/instance';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Search, Truck, CheckCircle, AlertCircle,
  Loader, Box, ShieldCheck, MapPin, ArrowRight,
  Navigation, Fingerprint, Clock, RotateCcw, RefreshCcw, Copy
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext'; // Assuming ToastContext exists

const TrackOrder = () => {
  const location = useLocation();
  const { addToast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get('type') || 'order'; // 'order', 'return', 'exchange'

  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getPageConfig = () => {
    switch (type) {
      case 'return':
        return {
          title: 'Track',
          subtitle: 'Return',
          label: 'Return ID / System ID',
          placeholder: 'RTN-XXXXXXXX',
          buttonText: 'Trace Return'
        };
      case 'exchange':
        return {
          title: 'Track',
          subtitle: 'Exchange',
          label: 'Exchange ID / System ID',
          placeholder: 'EXC-XXXXXXXX',
          buttonText: 'Trace Exchange'
        };
      default:
        return {
          title: 'Track',
          subtitle: 'Order',
          label: 'Order ID',
          placeholder: 'ID CODE',
          buttonText: 'Trace Order'
        };
    }
  };

  const config = getPageConfig();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const { data } = await api.post('/orders/track', { orderId, email });
      setOrderData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Trace failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMilestones = () => {
    // RETURN / EXCHANGE FLOW
    if (type === 'return' || type === 'exchange') {
      return [
        { label: 'Requested', icon: Box, status: 'Requested' },
        { label: 'Approved', icon: CheckCircle, status: 'Approved' },
        { label: 'Pick-up', icon: Truck, status: ['Pickup Scheduled', 'Picked Up', 'In Transit'] },
        { label: 'Quality Check', icon: ShieldCheck, status: ['Received', 'QC Pending', 'QC Passed', 'QC Failed'] },
        { label: 'Resolved', icon: RotateCcw, status: ['Refund Initiated', 'Refund Completed', 'Replacement Sent', 'Exchanged'] }
      ];
    }

    // STANDARD ORDER FLOW
    const base = [
      { label: 'Order Placed', icon: Box, dateKey: 'createdAt' },
      { label: 'Processing', icon: Clock, dateKey: 'processingAt' },
      { label: 'Quality Check', icon: ShieldCheck, dateKey: 'confirmedAt' },
      { label: 'In Transit', icon: Truck, dateKey: 'shippedAt' },
      { label: 'Delivered', icon: CheckCircle, dateKey: 'deliveredAt' }
    ];

    if (orderData?.orderStatus === 'Return Requested' || orderData?.orderStatus === 'Returned') {
      base.push({ label: 'Return', icon: RotateCcw, dateKey: 'returnRequestedAt' });
    }
    if (orderData?.orderStatus === 'Returned') {
      base.push({ label: 'Finalized', icon: ShieldCheck, dateKey: 'returnedAt' });
    }
    return base;
  };

  const getStepStatus = (index, milestone) => {
    if (!orderData) return 'pending';

    // RETURN / EXCHANGE LOGIC
    if (type === 'return' || type === 'exchange') {
      const milestones = getMilestones();
      const currentStatus = orderData.returnStatus || 'Requested';

      // Find current milestone index
      let activeIdx = -1;
      for (let i = 0; i < milestones.length; i++) {
        const targetStatus = milestones[i].status;
        if (Array.isArray(targetStatus)) {
          if (targetStatus.includes(currentStatus)) activeIdx = i;
        } else {
          if (targetStatus === currentStatus) activeIdx = i;
        }
      }

      // If status is "Resolved" category, it might be later in the list
      if (activeIdx === -1) {
        // Check if resolved statuses are present
        const resolved = ['Refund Initiated', 'Refund Completed', 'Replacement Sent', 'Exchanged', 'Replacement Delivered'];
        if (resolved.includes(currentStatus)) activeIdx = 4;
        else if (['Received', 'QC Pending', 'QC Passed', 'QC Failed'].includes(currentStatus)) activeIdx = 3;
        else if (['Pickup Scheduled', 'Picked Up', 'In Transit'].includes(currentStatus)) activeIdx = 2;
        else if (currentStatus === 'Approved') activeIdx = 1;
        else activeIdx = 0;
      }

      if (activeIdx > index) return 'completed';
      if (activeIdx === index) return 'active';
      return 'pending';
    }

    // STANDARD ORDER LOGIC
    const statusFlow = {
      'Pending': 0,
      'Processing': 1,
      'Confirmed': 2,
      'Dispatched': 3,
      'Shipped': 3,
      'Delivered': 4,
      'Return Requested': 5,
      'Returned': 6
    };
    const currentLevel = statusFlow[orderData.orderStatus] || 0;
    if (currentLevel > index) return 'completed';
    if (currentLevel === index) return 'active';
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-white text-[#1a1a1a] pt-20 pb-20 px-4 md:px-10 selection:bg-black selection:text-white flex flex-col justify-center items-center">
      <div className="max-w-4xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
            {config.title} <span className="text-zinc-300">{config.subtitle}</span>
          </h1>
        </motion.div>

        {/* Tracking Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-50 border border-zinc-100 p-1 flex flex-col items-center rounded-[2rem] shadow-sm relative group"
        >
          <form onSubmit={handleSubmit} className="w-full p-8 md:p-10 flex flex-col md:flex-row gap-6 items-end relative z-10">
            <div className="flex-1 w-full space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-2">{config.label}</label>
              <input
                type="text" required value={orderId} onChange={(e) => setOrderId(e.target.value)}
                placeholder={config.placeholder}
                className="w-full bg-white border border-zinc-200 py-3 px-5 rounded-xl text-base font-black tracking-widest focus:outline-none focus:border-black transition-all placeholder:text-zinc-200"
              />
            </div>
            <div className="flex-1 w-full space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-400 ml-2">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="w-full bg-white border border-zinc-200 py-3 px-5 rounded-xl text-base font-black tracking-widest focus:outline-none focus:border-black transition-all placeholder:text-zinc-200"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full md:w-auto px-10 h-14 bg-black text-white rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <>{config.buttonText} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full px-8 pb-8"
              >
                <div className="p-4 bg-red-50 border border-red-100 text-red-500 rounded-xl flex items-center gap-4">
                  <AlertCircle size={16} />
                  <p className="text-[9px] font-black uppercase tracking-widest">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {orderData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-12"
            >
              <div className="text-center group pt-8 flex flex-col items-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2">Live Status</p>
                <h3 className="text-3xl font-black uppercase italic text-black tracking-tighter flex items-center gap-3">
                  <Truck className="text-black" size={28} />
                  {orderData.orderStatus}
                </h3>
                <p className="text-[10px] items-center justify-center font-bold text-zinc-400 mt-2 uppercase flex flex-col gap-1">
                  {orderData.returnId ? (
                    <>
                      <span className="text-orange-500 font-black flex items-center gap-2">
                        {orderData.returnType === 'Exchange' ? 'EXC' : 'RTN'} ID: {orderData.returnId}
                        <span className="text-[8px] bg-orange-100 px-2 py-0.5 rounded-full text-orange-600">
                          {orderData.returnQty} {orderData.returnQty === 1 ? 'PC' : 'PCS'}
                        </span>
                      </span>
                      {orderData.returnTrackingId && (
                        <span className="text-zinc-400 font-bold">
                          {orderData.returnType === 'Exchange' ? 'EXC' : 'RTN'} TRK: {orderData.returnTrackingId} <span className="text-zinc-200">/</span> {orderData.returnCourier || 'LOGISTICS PARTNER'}
                        </span>
                      )}
                      {orderData.returnIdFull && (
                        <div className="flex items-center gap-2 mt-1 bg-zinc-900/50 px-2 py-1 rounded-md border border-zinc-800 self-center">
                          <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{orderData.returnIdFull}</span>
                          <button onClick={() => { navigator.clipboard.writeText(orderData.returnIdFull); addToast(`${orderData.returnType === 'Exchange' ? 'Exchange' : 'System'} ID Copied!`, "success") }} className="text-zinc-600 hover:text-zinc-400 transition-colors" title="Copy System ID">
                            <Copy size={10} />
                          </button>
                        </div>
                      )}
                      {orderData.returnPickupDate && (
                        <span className="text-[9px] text-zinc-500 font-black mt-1">
                          PICKUP: {new Date(orderData.returnPickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ({orderData.returnPickupMethod})
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="flex gap-2">
                      {orderData.trackingId} <span className="text-zinc-200">/</span> {orderData.deliveryPartner || 'SLOOK DISPATCH'}
                    </span>
                  )}
                </p>
              </div>

              {/* Progress Stepper */}
              <div className="py-12 px-4 md:px-0 max-w-3xl mx-auto w-full">
                <div className="relative flex justify-between text-center">
                  <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-100 -translate-y-1/2" />

                  {getMilestones().map((m, idx) => {
                    const status = getStepStatus(idx, m);
                    const isActive = status === 'active';
                    const isCompleted = status === 'completed';
                    const Icon = m.icon;
                    const date = orderData[m.dateKey];

                    return (
                      <div key={idx} className="relative z-10 flex flex-col items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 border ${isActive ? 'bg-black border-black text-white shadow-lg scale-110' :
                          isCompleted ? 'bg-zinc-50 border-zinc-200 text-black' :
                            'bg-white border-zinc-100 text-zinc-200'
                          }`}>
                          <Icon size={20} />
                        </div>
                        <div className="absolute top-16 text-center flex flex-col items-center gap-1 w-24">
                          <p className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-black' : isCompleted ? 'text-zinc-500' : 'text-zinc-200'}`}>
                            {m.label}
                          </p>
                          {date && (
                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                              {formatDate(date)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-8 flex justify-center py-6">
                <Link to="/support" className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.6em] text-zinc-400 hover:text-black transition-all group">
                  <div className="w-8 h-px bg-zinc-100 group-hover:bg-black transition-all" />
                  Support Hub
                  <div className="w-8 h-px bg-zinc-100 group-hover:bg-black transition-all" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackOrder;
