
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/instance';
import Price from '../components/Price';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import {
  ArrowLeft, MapPin, CreditCard, Truck, Package,
  Loader2, ChevronRight, Star, AlertTriangle, RotateCcw,
  Calendar, CheckCircle, Copy, Clock, ShieldCheck, Box
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
  const [returnFiles, setReturnFiles] = useState([]); // Array of URLs
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Exchange Logic
  const [variants, setVariants] = useState([]);
  const [variantsLoading, setVariantsLoading] = useState(false);
  const [selectedExchangeVariant, setSelectedExchangeVariant] = useState(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises)
      .then(base64s => {
        setReturnFiles(prev => [...prev, ...base64s]);
        addToast(`Attached ${files.length} proof file(s)`, "success");
      })
      .catch(err => {
        console.error("Upload failed", err);
        addToast("Failed to process files", "error");
      })
      .finally(() => {
        setUploading(false);
        setUploadProgress(0);
      });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user?.token) return;
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}`);
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
    <div className="min-h-screen bg-zinc-50/50 pt-24 md:pt-32 pb-20 font-sans text-[#1a1a1a]">
      {/* Increased Max Width for Desktop Table View */}
      <div className="container-responsive">

        {/* BREADCRUMB / BACK */}
        {/* BREADCRUMB / BACK */}
        <button
          onClick={() => {
            if (user?.role === 'admin' || user?.role === 'manager' || user?.permissions?.includes('manage_orders')) {
              navigate('/admin/orders');
            } else {
              navigate('/my-orders');
            }
          }}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 hover:text-black transition-colors"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to {user?.role === 'admin' || user?.role === 'manager' || user?.permissions?.includes('manage_orders') ? 'Orders' : 'Order History'}
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
              <h1 className="!text-lg md:!text-3xl font-black uppercase tracking-tighter mb-4">
                Order #{order._id?.slice(-6).toUpperCase()}
              </h1>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{order._id}</span>
                  <button onClick={() => { navigator.clipboard.writeText(order._id); addToast("ID Copied!", "success") }} className="text-zinc-400 hover:text-black transition-colors" title="Copy ID">
                    <Copy size={12} />
                  </button>
                </div>

                <button
                  onClick={async () => {
                    try {
                      addToast("Generating Invoice...", "info");
                      const response = await api.get(`/orders/${order._id}/invoice`, {
                        responseType: 'blob'
                      });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `invoice-${order._id}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    } catch (err) {
                      addToast("Failed to download invoice", "error");
                    }
                  }}
                  className="flex items-center gap-2 !text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-black text-white px-3 py-1.5 md:px-5 md:py-2 rounded-full hover:bg-zinc-800 transition-all shadow-md active:scale-95"
                >
                  <Package size={14} className="w-3 h-3 md:w-4 md:h-4" /> Download Invoice
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Amount</span>
            <Price amount={order.totalPrice} className="!text-2xl md:!text-4xl font-black tracking-tighter" />
          </div>
        </div>

        {/* UNBOXING REMINDER FOR DELIVERED ORDERS */}
        {order.orderStatus === 'Delivered' && (
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-8 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-600">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-700 mb-1">Unboxing Reminder</h4>
              <p className="text-[11px] font-bold text-orange-800 leading-relaxed uppercase tracking-tight">
                Please ensure you have recorded an <strong>Unboxing Video</strong>. It is <strong>Mandatory</strong> for any return or exchange requests.
              </p>
            </div>
          </div>
        )}

        {/* ORDER TRACKING */}
        <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 lg:p-12 shadow-sm border border-zinc-100 mb-6 md:mb-8 overflow-hidden relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2">Shipment Status</p>
              <h2 className="!text-xl md:!text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                <Truck className="text-black" size={20} />
                {order.returnId ? (
                  <div className="flex flex-col">
                    <span className="text-orange-500 flex items-center gap-2 !text-xs md:!text-sm">
                      Track {order.returnType === 'Exchange' ? 'Exchange' : 'Return'}: {order.returnId}
                      <span className="!text-[8px] md:!text-[10px] bg-orange-100 px-2 py-0.5 rounded-full text-orange-600 not-italic">
                        {order.returnQty} {order.returnQty === 1 ? 'PC' : 'PCS'}
                      </span>
                    </span>
                    {order.returnTrackingId && (
                      <span className="!text-[9px] md:!text-[10px] text-zinc-400 font-bold tracking-widest not-italic mt-1">
                        {order.returnType === 'Exchange' ? 'EXC' : 'RTN'} TRK: {order.returnTrackingId} <span className="text-zinc-200">/</span> {order.returnCourier || 'LOGISTICS'}
                      </span>
                    )}
                    {order.returnPickupDate && (
                      <span className="text-[9px] text-zinc-500 font-black not-italic mt-0.5 uppercase tracking-widest">
                        Pickup: {new Date(order.returnPickupDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} ({order.returnPickupMethod})
                      </span>
                    )}
                    {order.returnIdFull && (
                      <div className="flex items-center gap-2 mt-2 bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100 self-start">
                        <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">{order.returnIdFull}</span>
                        <button onClick={() => { navigator.clipboard.writeText(order.returnIdFull); addToast(`${order.returnType === 'Exchange' ? 'Exchange' : 'System'} ID Copied!`, "success") }} className="text-zinc-300 hover:text-black transition-colors" title="Copy System ID">
                          <Copy size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  'Tracking Your Look'
                )}
              </h2>
            </div>

            {order.orderStatus !== 'Delivered' && !['Return Requested', 'Returned'].includes(order.orderStatus) && (
              <div className="bg-zinc-50 px-4 py-3 md:px-6 md:py-4 rounded-3xl border border-zinc-100 flex items-center gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-black text-white rounded-full flex items-center justify-center animate-pulse">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="!text-[8px] md:!text-[9px] font-black uppercase tracking-widest text-zinc-400">Estimated Arrival</p>
                  <p className="!text-[10px] md:!text-xs font-black uppercase">{new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 5)).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            )}
          </div>

          <div className="relative pt-10 pb-4 overflow-x-auto no-scrollbar">
            <div className="min-w-[800px] relative px-4">
              {/* Stepper Implementation */}
              {(() => {
                const getMilestones = () => {
                  const base = [
                    { label: 'Order Placed', icon: Box, dateKey: 'createdAt', id: 'Pending' },
                    { label: 'Processing', icon: Clock, dateKey: 'processingAt', id: 'Processing' },
                    { label: 'Quality Check', icon: ShieldCheck, dateKey: 'confirmedAt', id: 'Confirmed' },
                    { label: 'In Transit', icon: Truck, dateKey: 'shippedAt', id: 'Shipped' },
                    { label: 'Delivered', icon: CheckCircle, dateKey: 'deliveredAt', id: 'Delivered' }
                  ];

                  if (order.orderStatus === 'Return Requested' || order.orderStatus === 'Returned') {
                    base.push({ label: 'Return Initiated', icon: RotateCcw, dateKey: 'returnRequestedAt', id: 'Return Requested' });
                  }
                  if (order.orderStatus === 'Returned') {
                    base.push({ label: 'Finalized', icon: ShieldCheck, dateKey: 'returnedAt', id: 'Returned' });
                  }
                  return base;
                };

                const milestones = getMilestones();
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
                const currentLevel = statusFlow[order.orderStatus] || 0;

                return (
                  <>
                    {/* Animated Progress Line */}
                    <div className="absolute top-[19px] left-0 w-full h-[2px] bg-zinc-100 z-0"></div>
                    <div
                      className="absolute top-[19px] left-0 h-[3px] bg-black z-0 transition-all duration-[2000ms] ease-in-out shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                      style={{ width: `${(currentLevel / (milestones.length - 1)) * 100}%` }}
                    ></div>

                    <div className="relative z-10 flex justify-between">
                      {milestones.map((step, idx) => {
                        const Icon = step.icon;
                        const isCompleted = currentLevel > idx;
                        const isActive = currentLevel === idx;
                        const date = order[step.dateKey];

                        return (
                          <div key={idx} className="flex flex-col items-center group w-24 md:w-32">
                            <div className={`
                              w-8 h-8 md:w-10 md:h-10 rounded-2xl flex items-center justify-center transition-all duration-700 relative border
                              ${isActive ? 'bg-black border-black text-white shadow-xl scale-110' :
                                isCompleted ? 'bg-zinc-50 border-zinc-200 text-black' :
                                  'bg-white border-zinc-100 text-zinc-200'}
                              ${isActive ? 'ring-[6px] ring-zinc-50' : ''}
                            `}>
                              <div className="flex items-center justify-center">
                                <Icon size={18} />
                              </div>
                              {isActive && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white animate-bounce" />
                              )}
                            </div>

                            <div className="mt-3 md:mt-4 text-center">
                              <p className={`!text-[8px] md:!text-[9px] font-black uppercase tracking-widest mb-1 transition-colors ${isActive ? 'text-black' : isCompleted ? 'text-zinc-600' : 'text-zinc-300'}`}>
                                {step.label}
                              </p>
                              {date && (
                                <p className="!text-[7px] md:!text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                                  {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pt-10 border-t border-zinc-100">
          {/* SHIPPING INFO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin size={16} />
              <span className="!text-[9px] md:!text-[10px] font-black uppercase tracking-widest">Shipping Address</span>
            </div>
            <div className="!text-xs md:!text-sm font-bold text-zinc-700 leading-relaxed uppercase">
              <p>{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p className="text-zinc-400 mt-1">Ph: {order.shippingAddress?.phone}</p>
            </div>
          </div>

          {/* PAYMENT INFO */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <CreditCard size={16} />
              <span className="!text-[9px] md:!text-[10px] font-black uppercase tracking-widest">Payment Method</span>
            </div>
            <div>
              <p className="!text-xs md:!text-sm font-bold text-zinc-700 uppercase">
                {order.paymentMethod === 'cod' ? 'Cash On Delivery' : order.paymentMethod}
              </p>
              <p className="!text-[9px] md:!text-[10px] font-bold text-green-600 mt-1 uppercase flex items-center gap-1">
                <CheckCircle size={12} /> Payment {order.isPaid ? 'Completed' : 'Pending'}
              </p>
            </div>
          </div>

          {/* DELIVERY STATUS */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <Truck size={16} />
              <span className="!text-[9px] md:!text-[10px] font-black uppercase tracking-widest">Delivery Details</span>
            </div>
            <div className="!text-xs md:!text-sm font-bold text-zinc-700">
              {order.isDispatched ? (
                <div className="space-y-1">
                  <p className="uppercase">{order.deliveryPartner || 'Standard Courier'}</p>
                  <p className="font-mono text-zinc-400 !text-[10px] md:!text-xs">TRK: {order.trackingId || 'Pending'}</p>
                  <button onClick={() => navigate('/track-order')} className="!text-[9px] md:!text-[10px] font-black underline mt-2 hover:text-black">
                    TRACK PACKAGE
                  </button>
                </div>
              ) : (
                <p className="text-zinc-500 font-medium">Expected dispatch within 24hrs</p>
              )}
            </div>
          </div>
        </div>

        {/* SPECIAL INSTRUCTIONS / NOTES */}
        {order.orderNote && (
          <div className="mt-8 pt-8 border-t border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-400 mb-3">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Special Delivery Instructions</span>
            </div>
            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <p className="!text-[10px] md:!text-xs font-bold text-zinc-600 leading-relaxed uppercase tracking-tight">
                "{order.orderNote}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ITEMS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="p-8 border-b border-zinc-100">
          <h2 className="!text-lg md:!text-xl font-black uppercase tracking-tight">Order Items ({order.orderItems?.length})</h2>
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
                console.log("DEBUG ORDER ITEM:", { name: item.name, product: item.product, productLink });

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
                          {item.selectedVariant && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">
                              {item.selectedVariant.size} {item.selectedVariant.color && `/ ${item.selectedVariant.color}`}
                            </p>
                          )}
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
                    <td className="py-6 px-4 text-sm font-medium font-mono"><Price amount={item.price} /></td>
                    <td className="py-6 px-4 text-center text-sm font-bold">x {item.qty}</td>
                    <td className="py-6 px-4 text-sm font-bold font-mono"><Price amount={item.price * item.qty} /></td>
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
                            {/* Check if product exists before showing review - Strict Desktop */}
                            {productLink ? (
                              <button
                                onClick={() => navigate(`/product/${productLink}#reviews`)}
                                className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-100 transition"
                              >
                                Review
                              </button>
                            ) : (
                              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider px-4 py-2">Unavailable</span>
                            )}
                            {(() => {
                              const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);
                              const daysDiff = (new Date() - deliveryDate) / (1000 * 60 * 60 * 24);
                              const isReturnable = daysDiff <= 7;

                              if (isReturnable) {
                                return (
                                  <button
                                    onClick={() => setConfirmModal({ show: true, itemId: item._id, actionType: 'return' })}
                                    className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 border border-zinc-200 px-4 py-2 rounded-full hover:bg-zinc-100 transition"
                                  >
                                    Return
                                  </button>
                                );
                              }
                              return null;
                            })()}
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
          {order.orderItems.map((item, i) => {
            const productLink = item.product?.slug || item.product?._id || item.product;
            return (
              <div key={i} className="p-6 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="w-16 h-20 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold !text-[10px] md:!text-sm uppercase leading-tight mb-1">{item.name}</h3>
                    {item.selectedVariant && (
                      <p className="!text-[9px] md:!text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                        {item.selectedVariant.size} {item.selectedVariant.color && `/ ${item.selectedVariant.color}`}
                      </p>
                    )}
                    <p className="!text-[10px] md:text-xs text-zinc-500 font-mono mb-2"><Price amount={item.price} /> x {item.qty}</p>
                    <p className="font-black !text-[11px] md:text-sm">Total: <Price amount={item.price * item.qty} /></p>

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
                            {(() => {
                              const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.updatedAt);
                              const daysDiff = (new Date() - deliveryDate) / (1000 * 60 * 60 * 24);
                              const isReturnable = daysDiff <= 7;
                              return isReturnable ? (
                                <button onClick={() => setConfirmModal({ show: true, itemId: item._id, actionType: 'return' })} className="text-[9px] font-bold border px-3 py-1.5 rounded-full uppercase">Return</button>
                              ) : null;
                            })()}
                            {/* ALWAYS SHOW REVIEW BUTTON (Mobile) */}
                            {/* ALWAYS SHOW REVIEW BUTTON (Mobile) - Strict Check */}
                            {productLink ? (
                              <button onClick={() => navigate(`/product/${productLink}#reviews`)} className="text-[9px] font-bold bg-black text-white px-3 py-1.5 rounded-full uppercase">Review</button>
                            ) : (
                              <span className="text-[9px] text-zinc-400 font-bold uppercase">Unavailable</span>
                            )}
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* CONFIRM MODAL (Same logic as before) */}
      {
        confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModal({ ...confirmModal, show: false })} />
            <div className="relative bg-white w-full max-w-md rounded-3xl p-8 animate-in zoom-in-95 shadow-2xl overflow-y-auto max-h-[90vh]">
              <h3 className="text-2xl font-black uppercase mb-2 tracking-tighter">
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
                        onClick={async () => {
                          const newType = type;
                          setConfirmModal(prev => ({ ...prev, requestType: newType }));
                          if (newType === 'Exchange') {
                            // Fetch Variants
                            setVariantsLoading(true);
                            try {
                              const item = order.orderItems.find(it => it._id === confirmModal.itemId);
                              const pId = item.product?._id || item.product;
                              const { data } = await api.get(`/products/${pId}/variants`);
                              setVariants(data.filter(v => v.stock > 0));
                            } catch (err) {
                              addToast("Failed to fetch size options", "error");
                            } finally {
                              setVariantsLoading(false);
                            }
                          }
                        }}
                        className={`flex-1 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${(confirmModal.requestType || 'Return') === type ? 'bg-black text-white shadow-md' : 'text-zinc-400 hover:text-black'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Variant Picker for Exchange */}
                  {confirmModal.requestType === 'Exchange' && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-2">Select Replacement Size/Color</label>
                      {variantsLoading ? (
                        <div className="flex items-center gap-2 p-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200 mt-1">
                          <Loader2 size={12} className="animate-spin text-zinc-400" />
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Checking Availability...</span>
                        </div>
                      ) : variants.length === 0 ? (
                        <div className="p-4 bg-red-50 rounded-xl border border-red-100 mt-1">
                          <p className="text-[10px] font-black uppercase tracking-tight text-red-600">No other variants in stock for exchange.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {variants.map((v, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedExchangeVariant(v)}
                              className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedExchangeVariant === v ? 'border-black bg-black text-white' : 'border-zinc-200 hover:border-zinc-400 text-zinc-600'
                                }`}
                            >
                              {v.size} {v.color && `/ ${v.color}`}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

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

                  {/* UNBOXING VIDEO UPLOAD */}
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <label className="text-[10px] font-black uppercase tracking-widest text-orange-600 block mb-2">
                      Unboxing Video (Mandatory)
                    </label>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-zinc-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-[10px] file:font-black file:uppercase
                          file:bg-orange-100 file:text-orange-700
                          hover:file:bg-orange-200 transaction"
                    />
                    {uploading && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-400">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1 w-full bg-orange-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* PREVIEW FILES */}
                    {returnFiles.length > 0 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                        {returnFiles.map((url, idx) => (
                          <div key={idx} className="w-16 h-16 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200 shrink-0 relative group">
                            {(url.match(/\.(mp4|mov|avi|webm)$/i) || url.startsWith('data:video/')) ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={url} alt="proof" className="w-full h-full object-cover" />
                            )}
                            <button
                              onClick={() => setReturnFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                        await api.put(`/orders/${order._id}/cancel/${confirmModal.itemId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
                        addToast("Cancelled Successfully", "success");
                      } else {
                        // Return / Exchange Request
                        if (!returnReason) return addToast("Please select a reason", "error");

                        await api.post('/returns', {
                          orderId: order._id,
                          itemId: confirmModal.itemId,
                          type: confirmModal.requestType || 'Return',
                          reason: returnReason,
                          comment: confirmModal.comment,
                          images: returnFiles,
                          selectedVariant: selectedExchangeVariant // NEW
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
