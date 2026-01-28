import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore'; // 1. Import useStore
import axios from 'axios';
import { ArrowLeft, Truck, MapPin, PackageCheck, Loader2 } from 'lucide-react';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useStore(); // 2. Get the logged-in user
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // 3. Add Authorization headers to the GET request
        const res = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to fetch order details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id && user?.token) fetchOrder();
    else if (!user) navigate('/login'); // Redirect if not logged in
  }, [id, user, navigate]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-zinc-300" size={40} />
    </div>
  );

  if (!order) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order Manifest Not Found</p>
      <button onClick={() => navigate('/my-orders')} className="text-xs font-bold underline uppercase">Return to History</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 pt-32 md:pt-40">
      <div className="container mx-auto px-6 max-w-5xl">
        
        <button 
          onClick={() => navigate('/my-orders')} 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black mb-10 transition"
        >
          <ArrowLeft size={14} /> Back to My Orders
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-100 pb-8 mb-12 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Order Information</p>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic transform -skew-x-3">
              #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-xs text-zinc-500 mt-2 font-medium">
              Recorded on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-100 px-6 py-3 rounded-full">
            <PackageCheck size={16} className="text-black" />
            <span className="text-[10px] font-black uppercase tracking-widest text-black">
              {order.isDelivered ? "Delivered" : "Processing"}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16 items-start">
          <div className="w-full lg:w-3/5 space-y-10">
            <h2 className="text-[10px] font-black uppercase tracking-widest border-b border-zinc-100 pb-3">Manifest</h2>
            <div className="space-y-8">
              {order.orderItems.map((item, index) => (
                <div key={index} className="flex gap-6 items-center">
                  <div className="w-20 h-24 bg-zinc-50 border border-zinc-100 rounded-sm overflow-hidden flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover grayscale-[30%]" alt={item.name} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-xs uppercase tracking-tight">{item.name}</h3>
                    <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase">Quantity: {item.qty}</p>
                    <p className="font-bold text-sm mt-3">₹{item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-2/5 space-y-8 lg:sticky lg:top-32">
            <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-3xl space-y-8">
              <div className="flex gap-4">
                <MapPin size={20} className="text-black flex-shrink-0" />
                <div className="text-[11px] leading-relaxed uppercase font-bold tracking-tight">
                  <p className="text-zinc-400 mb-2">Destination</p>
                  {/* FIXED: Using postalCode instead of zip to match schema */}
                  <p className="text-black">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p> 
                </div>
              </div>

              <div className="flex gap-4">
                <Truck size={20} className="text-black flex-shrink-0" />
                <div className="text-[11px] leading-relaxed uppercase font-bold tracking-tight">
                  <p className="text-zinc-400 mb-2">Logistics</p>
                  <p>{order.paymentMethod === 'cod' ? 'COD Verified' : 'Prepaid Studio Delivery'}</p>
                  <p className="text-green-600 mt-1">EST-SHP-{order._id.slice(0, 5).toUpperCase()}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-200">
                  <div className="flex justify-between items-end italic transform -skew-x-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Grand Total</span>
                    <span className="text-3xl font-black uppercase tracking-tighter">₹{order.totalPrice.toLocaleString()}</span>
                  </div>
              </div>
            </div>

            <button onClick={() => window.print()} className="w-full border border-zinc-200 py-4 rounded-full text-[9px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all">
              Download Invoice (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;