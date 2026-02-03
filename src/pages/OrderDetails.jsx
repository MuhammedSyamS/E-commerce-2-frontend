import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, MapPin, CreditCard, Truck, Package, Loader2, ChevronRight, Star, AlertTriangle, X, RotateCcw } from 'lucide-react';


const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const { addToast } = useToast();
  const [order, setOrder] = useState(null);
  const [allProducts, setAllProducts] = useState([]); // For recommendations
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ show: false, itemId: null, actionType: 'cancel' }); // actionType: 'cancel' | 'return'
  const [returnReason, setReturnReason] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.token) return;

      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setOrder(data);

        // Fetch products for recommendations (simple fetch all for now)
        const prodRes = await axios.get('http://localhost:5000/api/products');
        setAllProducts(prodRes.data || []);

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
            <p className="text-[10px] font-bold text-zinc-400 mt-1 tracking-widest">
              ID: {order._id}
            </p>
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
              <span className={`w-2 h-2 rounded-full ${order.isDelivered ? 'bg-green-500' : (order.isDispatched ? 'bg-purple-500' : 'bg-orange-500')}`}></span>
              <p className={`text-xs font-black uppercase ${order.isDelivered ? 'text-green-600' : (order.isDispatched ? 'text-purple-600' : 'text-orange-500')}`}>
                {order.isDelivered ? `Delivered` : (order.isDispatched ? `Shipped` : 'Processing')}
              </p>
            </div>

            {/* Courier Info */}
            {order.isDispatched && (
              <div className="mt-2 text-[10px] uppercase font-bold text-zinc-500 space-y-1">
                {order.deliveryPartner && <p>Courier: <span className="text-black">{order.deliveryPartner}</span></p>}
                {order.trackingId && <p>Tracking ID: <span className="text-black">{order.trackingId}</span></p>}
              </div>
            )}

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
            const isCancelled = item.status === 'Cancelled';
            const isReturned = item.status === 'Return Requested' || item.status === 'Returned' || item.status === 'Exchange Requested';

            return (
              <div
                key={i}
                className={`flex items-center gap-6 md:gap-10 group border-b border-zinc-50 pb-8 hover:border-zinc-200 transition-colors ${isCancelled || isReturned ? 'opacity-50 grayscale' : ''}`}
                onClick={(e) => {
                  if (isClickable && !isCancelled) {
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
                  <div className="flex items-center gap-4">
                    <p className="font-black text-lg md:text-2xl uppercase tracking-tight italic leading-tight group-hover:translate-x-1 transition-transform">{item.name}</p>
                    {isCancelled && <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Cancelled</span>}
                    {isReturned && (
                      <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {item.status === 'Exchange Requested' ? 'Exchange Req.' : 'Return Req.'}
                      </span>
                    )}
                  </div>

                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-2 tracking-widest">
                    Unit Price: ₹{(item.price || 0).toLocaleString()} &nbsp; | &nbsp; Qty: {item.qty}
                  </p>

                  <div className="flex gap-3 mt-4">
                    {/* WRITE REVIEW BUTTON */}
                    {isClickable && !isCancelled && order.isDelivered && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${targetLink}#reviews`);
                        }}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest bg-black text-white px-5 py-3 rounded-full hover:bg-zinc-800 transition-colors shadow-md"
                      >
                        <Star size={12} /> Write a Review
                      </button>
                    )}

                    {/* RETURN / EXCHANGE BUTTON */}
                    {isClickable && !isCancelled && !isReturned && order.isDelivered && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setReturnReason(""); // Reset reason
                          setConfirmModal({ show: true, itemId: item._id, actionType: 'return' });
                        }}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest border border-zinc-200 text-zinc-600 px-5 py-3 rounded-full hover:bg-zinc-50 transition-colors"
                      >
                        <RotateCcw size={12} /> Return / Exchange
                      </button>
                    )}

                    {/* CANCEL ORDER BUTTON */}
                    {!order.isDispatched && !order.isDelivered && !isCancelled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({ show: true, itemId: item._id, actionType: 'cancel' });
                        }}
                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest border border-red-200 text-red-500 px-5 py-3 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Package size={12} /> Cancel Item
                      </button>
                    )}
                  </div>

                  {/* Snapshot mode: If product is missing, just don't show the link or error */}
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

        {/* YOU MAY ALSO LIKE */}
        {allProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-zinc-100">
            <h2 className="text-xs font-black uppercase italic mb-8 tracking-widest text-zinc-300 text-center">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {allProducts.slice(0, 4).map(item => (
                <Link key={item._id} to={`/product/${item.slug}`} className="group text-left space-y-2">
                  <div className="aspect-[4/5] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-50 transition-transform group-hover:scale-95">
                    <img src={item.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <p className="text-[10px] font-black uppercase truncate">{item.name}</p>
                  <p className="text-[11px] font-bold italic">₹{item.price?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* CONFIRMATION MODAL */}
      {
        confirmModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, show: false })}></div>
            <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${confirmModal.actionType === 'cancel' ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-black'}`}>
                {confirmModal.actionType === 'cancel' ? <AlertTriangle size={24} /> : <RotateCcw size={24} />}
              </div>
              <h3 className="text-xl font-black uppercase text-center mb-2 italic tracking-tighter">
                {confirmModal.actionType === 'cancel' ? 'Cancel Item?' : 'Return Request'}
              </h3>
              <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-wide mb-8">
                {confirmModal.actionType === 'cancel'
                  ? "Are you sure you want to cancel this item? This action cannot be undone."
                  : "Start a return or exchange request? Please tell us why."}
              </p>

              {/* REASON INPUT */}
              {confirmModal.actionType === 'return' && (
                <div className="mb-8">
                  <textarea
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="E.g. Size too small, Damaged item..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs font-medium outline-none focus:border-black h-24 resize-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  className="py-4 rounded-xl font-black uppercase text-[10px] tracking-widest border border-zinc-200 hover:bg-zinc-50 transition"
                >
                  Dismiss
                </button>
                <button
                  onClick={async () => {
                    if (confirmModal.actionType === 'cancel') {
                      try {
                        await axios.put(`http://localhost:5000/api/orders/${order._id}/cancel/${confirmModal.itemId}`, {}, {
                          headers: { Authorization: `Bearer ${user.token}` }
                        });
                        addToast("Item Cancelled Successfully", "success");
                        window.location.reload();
                      } catch (err) {
                        addToast(err.response?.data?.message || "Cancellation failed", "error");
                      }
                    } else {
                      if (!returnReason.trim()) {
                        addToast("Please provide a reason", "error");
                        return;
                      }
                      try {
                        await axios.put(`http://localhost:5000/api/orders/${order._id}/return/${confirmModal.itemId}`,
                          { reason: returnReason, actionType: 'return' },
                          { headers: { Authorization: `Bearer ${user.token}` } }
                        );
                        addToast("Return Request Submitted", "success");
                        window.location.reload();
                      } catch (err) {
                        addToast(err.response?.data?.message || "Return request failed", "error");
                      }
                    }
                    setConfirmModal({ ...confirmModal, show: false });
                  }}
                  className={`py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-white transition shadow-lg ${confirmModal.actionType === 'cancel'
                    ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                    : 'bg-black hover:bg-zinc-800 shadow-zinc-200'
                    }`}
                >
                  {confirmModal.actionType === 'cancel' ? 'Yes, Cancel' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default OrderDetails;