
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft, MapPin, CreditCard, Truck, Package,
  Loader2, ChevronRight, Star, AlertTriangle, RotateCcw,
  Calendar, CheckCircle2, Copy
} from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();
  const { addToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals for Actions
  const [confirmModal, setConfirmModal] = useState({ show: false, itemId: null, actionType: 'cancel' });
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
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 px-6">
      <div className="text-center space-y-4">
        <p className="font-bold text-red-500 uppercase tracking-widest">{error || "Order Not Found"}</p>
        <button onClick={() => navigate('/my-orders')} className="bg-black text-white px-8 py-3 rounded-full uppercase tracking-widest text-xs font-bold">
          Return to Orders
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 pt-44 md:pt-52 pb-20 font-sans text-[#1a1a1a]">
      {/* Increased Max Width for Desktop Table View */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* BREADCRUMB / BACK */}
        <button
          onClick={() => navigate('/my-orders')}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Order History
        </button>

        {/* HEADER SECTION */}
        <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-zinc-100 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                  order.orderStatus === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                    order.orderStatus === 'Dispatched' ? 'bg-indigo-100 text-indigo-700' :
                      order.orderStatus === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                        order.orderStatus === 'Processing' ? 'bg-teal-100 text-teal-700' :
                          order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            order.orderStatus === 'Returned' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700' // Pending
                  }`}>
                  {order.orderStatus || 'Pending'}
                </span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                  Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-2">
                Order #{order._id?.slice(-6).toUpperCase()}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-zinc-400">ID: {order._id}</span>
                <button
                  onClick={() => window.open(`http://localhost:5000/api/orders/${order._id}/invoice?token=${user.token}`, '_blank')}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black hover:text-zinc-600 border border-black px-3 py-1 rounded-full transition-colors"
                >
                  <Copy size={12} /> Download Invoice
                </button>
              </div>
              <span>ID: {order._id}</span>
              <button onClick={() => navigator.clipboard.writeText(order._id)} className="hover:text-black" title="Copy ID">
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Amount</span>
            <span className="text-4xl md:text-5xl font-black tracking-tighter italic">
              ₹{order.totalPrice?.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-zinc-100">
          {/* SHIPPING INFO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Shipping Address</span>
            </div>
            <div className="text-sm font-bold text-zinc-700 leading-relaxed uppercase">
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p className="text-zinc-400 mt-1">Ph: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* PAYMENT INFO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <CreditCard size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Payment Method</span>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-700 uppercase">
                {order.paymentMethod === 'cod' ? 'Cash On Delivery' : order.paymentMethod}
              </p>
              <p className="text-[10px] font-bold text-green-600 mt-1 uppercase flex items-center gap-1">
                <CheckCircle2 size={12} /> Payment {order.isPaid ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>

          {/* DELIVERY STATUS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <Truck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Delivery Details</span>
            </div>
            <div className="text-sm font-bold text-zinc-700">
              {order.isDispatched ? (
                <div className="space-y-1">
                  <p className="uppercase">{order.deliveryPartner || 'Standard Courier'}</p>
                  <p className="font-mono text-zinc-400 text-xs">TRK: {order.trackingId || 'Pending'}</p>
                  <button onClick={() => navigate('/track-order')} className="text-[10px] font-black underline mt-2 hover:text-black">
                    TRACK PACKAGE
                  </button>
                </div>
              ) : (
                <p className="text-zinc-500 italic">Expected dispatch within 24hrs</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ITEMS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-8 border-b border-zinc-100">
          <h2 className="text-xl font-black uppercase tracking-tight italic">Order Items ({order.orderItems?.length})</h2>
        </div>

        {/* DESKTOP TABLE VIEW (Visible on lg+) */}
        <div className="hidden lg:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <th className="py-6 px-8">Product Details</th>
                <th className="py-6 px-4">Unit Price</th>
                <th className="py-6 px-4 text-center">Quantity</th>
                <th className="py-6 px-4">Total</th>
                <th className="py-6 px-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.orderItems.map((item, i) => {
                const productLink = item.product?.slug || item.product?._id || item.product;
                const isLinkable = typeof productLink === 'string'; // Fallback check

                return (
                  <tr key={i} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-20 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <Link
                            to={isLinkable ? `/product/${productLink}` : '#'}
                            className={`font-bold text-sm uppercase block mb-1 ${isLinkable ? 'hover:underline' : 'pointer-events-none'}`}
                          >
                            {item.name}
                          </Link>
                          {/* Status Badges */}
                          {/* Status Badges - Comprehensive */}
                          {item.status === 'Cancelled' && <span className="bg-red-100 text-red-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Cancelled</span>}

                          {item.status === 'Return Requested' && <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Return Pending</span>}
                          {item.status === 'Returned' && <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Returned</span>}

                          {item.status === 'Exchange Requested' && <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Exchange Pending</span>}
                          {item.status === 'Exchanged' && <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Exchanged</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-4 text-sm font-medium font-mono">₹{item.price.toLocaleString()}</td>
                    <td className="py-6 px-4 text-center text-sm font-bold">x {item.qty}</td>
                    <td className="py-6 px-4 text-sm font-bold font-mono">₹{(item.price * item.qty).toLocaleString()}</td>
                    <td className="py-6 px-8 text-right">
                      <div className="flex justify-end gap-3 opacity-100 lg:opacity-50 lg:group-hover:opacity-100 transition-opacity">
                        {/* Logic for Cancel/Return Buttons */}
                        {!order.isDispatched && item.status === 'Ordered' && (
                          <button
                            onClick={() => setConfirmModal({ show: true, itemId: item._id, actionType: 'cancel' })}
                            className="text-[9px] font-bold uppercase tracking-wider text-red-500 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition"
                          >
                            Cancel
                          </button>
                        )}
                        {order.isDelivered && item.status === 'Ordered' && (
                          <>
                            <button
                              onClick={() => navigate(`/product/${productLink}#reviews`)}
                              className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-100 transition"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => setConfirmModal({ show: true, itemId: item._id, actionType: 'return' })}
                              className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-100 transition"
                            >
                              Return
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MOBILE LIST VIEW (Visible on < lg) */}
        <div className="lg:hidden divide-y divide-zinc-100">
          {order.orderItems.map((item, i) => (
            <div key={i} className="p-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="w-20 h-24 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm uppercase leading-tight mb-1">{item.name}</h3>
                  <p className="text-xs text-zinc-500 font-mono mb-2">₹{item.price.toLocaleString()} x {item.qty}</p>
                  <p className="font-black text-sm">Total: ₹{(item.price * item.qty).toLocaleString()}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.status === 'Cancelled' ? (
                      <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded font-bold uppercase">Cancelled</span>
                    ) : (
                      !order.isDispatched ? (
                        <button
                          onClick={() => setConfirmModal({ show: true, itemId: item._id, actionType: 'cancel' })}
                          className="text-[9px] font-bold text-red-500 uppercase border border-red-200 px-3 py-1.5 rounded-full"
                        >
                          Cancel Item
                        </button>
                      ) : order.isDelivered ? (
                        <div className="flex gap-2">
                          <button onClick={() => setConfirmModal({ show: true, itemId: item._id, actionType: 'return' })} className="text-[9px] font-bold border px-3 py-1.5 rounded-full uppercase">Return</button>
                          <button onClick={() => navigate(`/product/${item.product?.slug || item.product}#reviews`)} className="text-[9px] font-bold bg-black text-white px-3 py-1.5 rounded-full uppercase">Review</button>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

      {/* CONFIRM MODAL (Same logic as before) */ }
  {
    confirmModal.show && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 px-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, show: false })} />
        <div className="relative bg-white w-full max-w-md rounded-3xl p-8 animate-in zoom-in-95 shadow-2xl overflow-y-auto max-h-[90vh]">
          <h3 className="text-2xl font-black uppercase italic mb-2 tracking-tighter">
            {confirmModal.actionType === 'cancel' ? 'Confirm Cancellation' : 'Request Service'}
          </h3>

          {confirmModal.actionType === 'cancel' ? (
            <p className="text-zinc-500 text-sm font-medium mb-6">
              Are you sure you want to remove this item from your order? Refund will be processed to original source.
            </p>
          ) : (
            <div className="space-y-4 mb-6">
              {/* Type Selector */}
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                {['Return', 'Exchange'].map(type => (
                  <button
                    key={type}
                    onClick={() => setConfirmModal(prev => ({ ...prev, requestType: type }))}
                    className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${(confirmModal.requestType || 'Return') === type ? 'bg-black text-white shadow-md' : 'text-zinc-400 hover:text-black'
                      }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Reason Select */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Reason</label>
                <select
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-black appearance-none"
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                >
                  <option value="">Select a reason...</option>
                  <option value="Damaged Product">Damaged Product</option>
                  <option value="Wrong Item">Wrong Item Received</option>
                  <option value="Size/Fit Issue">Size/Fit Issue</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Change of Mind">Change of Mind</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Comment Area */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Additional Comments</label>
                <textarea
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-black h-24 resize-none"
                  placeholder="Please provide more details..."
                  value={confirmModal.comment || ''}
                  onChange={e => setConfirmModal(prev => ({ ...prev, comment: e.target.value }))}
                />
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={() => setConfirmModal({ ...confirmModal, show: false })}
              className="flex-1 py-4 border border-zinc-200 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-zinc-50"
            >
              Dismiss
            </button>
            <button
              onClick={async () => {
                try {
                  if (confirmModal.actionType === 'cancel') {
                    await axios.put(`http://localhost:5000/api/orders/${order._id}/cancel/${confirmModal.itemId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
                    addToast("Cancelled Successfully", "success");
                  } else {
                    // Return / Exchange Request
                    if (!returnReason) return addToast("Please select a reason", "error");

                    await axios.post('http://localhost:5000/api/returns', {
                      orderId: order._id,
                      itemId: confirmModal.itemId,
                      type: confirmModal.requestType || 'Return',
                      reason: returnReason,
                      comment: confirmModal.comment
                    }, { headers: { Authorization: `Bearer ${user.token}` } });

                    addToast(`${confirmModal.requestType || 'Return'} Requested Successfully`, "success");
                  }
                  setTimeout(() => window.location.reload(), 1000); // Small delay to allow toast
                } catch (e) {
                  addToast(e.response?.data?.message || "Action Failed", "error");
                }
              }}
              className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] rounded-xl text-white shadow-xl ${confirmModal.actionType === 'cancel' ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-zinc-800'}`}
            >
              Confirm
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