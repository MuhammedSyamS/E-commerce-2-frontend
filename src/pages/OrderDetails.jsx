import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { ArrowLeft, MapPin, CreditCard, Truck, Package, Loader2, ChevronRight, Star } from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.token) return;

      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrder(data);
      } catch (err) {
        console.error("Order Detail Error:", err);
        setError(err.response?.data?.message || "Could not load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user?.token]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black" size={32} />
    </div>
  );

  if (error || !order) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
      <p className="font-black uppercase tracking-widest text-xs mb-6">{error || "Order not found"}</p>
      <button onClick={() => navigate('/my-orders')} className="bg-black text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px]">Back to History</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-44 md:pt-52 pb-20 px-6 text-[#1a1a1a]">
      <div className="max-w-5xl mx-auto">

        <button
          onClick={() => navigate('/my-orders')}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-10 hover:text-black transition"
        >
          <ArrowLeft size={14} /> Back to History
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 mb-2">Order Reference</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
              #{order._id ? order._id.slice(-8).toUpperCase() : 'UNKNOWN'}
            </h1>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300 mb-2">Placed On</p>
            <p className="font-bold text-xs uppercase">
              {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
            </p>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 border-y border-zinc-100 py-12">
          <div className="space-y-4">
            <MapPin size={18} className="text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest">Shipping To</p>
            <p className="text-xs font-bold text-zinc-500 uppercase leading-relaxed">
              {order.shippingAddress?.address || 'No Address'}<br />
              {order.shippingAddress?.city || ''}, {order.shippingAddress?.postalCode || ''}
            </p>
          </div>
          <div className="space-y-4">
            <CreditCard size={18} className="text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest">Payment</p>
            <p className="text-xs font-bold text-zinc-500 uppercase">Method: {order.paymentMethod || 'Unknown'}</p>
            <p className="text-[10px] font-black text-green-600 uppercase mt-1">Transaction Authorized</p>
          </div>
          <div className="space-y-4">
            <Truck size={18} className="text-zinc-400" />
            <p className="text-[10px] font-black uppercase tracking-widest">Delivery Status</p>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${order.isDelivered ? 'bg-green-500' : 'bg-orange-500'}`}></span>
              <p className={`text-xs font-black uppercase ${order.isDelivered ? 'text-green-600' : 'text-orange-500'}`}>
                {order.isDelivered ? `Delivered` : 'Processing'}
              </p>
            </div>

            <button
              onClick={() => navigate('/track-order')}
              className="mt-4 text-[9px] font-bold uppercase tracking-widest border-b border-black pb-0.5 hover:text-zinc-500 transition-colors"
            >
              Track Shipment
            </button>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="space-y-8">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-zinc-300">Package Contents</h2>
          {order.orderItems.map((item, i) => {
            // Resolve product target (slug or ID) safely
            const productData = item.product || {};
            const targetLink = productData.slug || productData._id || item.product;
            const isClickable = !!targetLink && typeof targetLink !== 'object';

            return (
              <div
                key={i}
                className={`flex items-center gap-6 md:gap-10 group border-b border-zinc-50 pb-8 hover:border-zinc-200 transition-colors ${isClickable ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                onClick={(e) => {
                  if (isClickable) {
                    navigate(`/product/${targetLink}`);
                  }
                }}
              >
                <div className="w-20 h-28 md:w-28 md:h-36 bg-zinc-50 overflow-hidden rounded-2xl border border-zinc-100">
                  <img
                    src={item.image}
                    className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
                    alt={item.name}
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x400'}
                  />
                </div>
                <div className="flex-grow">
                  <p className="font-black text-lg md:text-2xl uppercase tracking-tight italic leading-tight group-hover:translate-x-1 transition-transform">{item.name}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-2 tracking-widest">
                    Unit Price: ₹{(item.price || 0).toLocaleString()} &nbsp; | &nbsp; Qty: {item.qty}
                  </p>

                  {isClickable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${targetLink}#reviews`);
                      }}
                      className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-black text-white px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors shadow-md"
                    >
                      <Star size={12} /> Write a Review
                    </button>
                  )}
                  {!isClickable && <span className="text-[10px] text-red-400 font-bold uppercase mt-2 block">Product Discontinued</span>}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="font-black text-xl italic tracking-tighter transform -skew-x-6">₹{((item.qty || 0) * (item.price || 0)).toLocaleString()}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* TOTALS */}
        <div className="mt-20 p-8 md:p-12 bg-zinc-50 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Total Charged</p>
            <p className="text-[9px] font-bold text-zinc-300 uppercase mt-1 italic">Billing inclusive of all duties and taxes</p>
          </div>
          <p className="text-5xl md:text-7xl font-black italic tracking-tighter transform -skew-x-6">₹{(order.totalPrice || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;