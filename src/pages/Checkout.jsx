import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowLeft, Smartphone, CreditCard, Landmark, Truck, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
  const { user, setUser, coupon } = useStore();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [step, setStep] = useState('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Robust cart item resolution
  const cartItems = user?.cart || [];
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.price || item.product?.price || 0;
    const qty = item.quantity || 1;
    return acc + (price * qty);
  }, 0);

  const discount = coupon ? coupon.discount : 0;
  const total = Math.max(0, subtotal - discount);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  });

  useEffect(() => {
    if (cartItems.length === 0 && !isSubmitting) {
      navigate('/shop');
    }
  }, [cartItems.length, navigate, isSubmitting]);

  const goToSelection = (e) => {
    e.preventDefault();
    setStep('selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPayment = (type) => {
    setStep(type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!user?.token) return addToast("Please login again to continue", "error");

    setIsSubmitting(true);
    try {
      // 1. Prepare Order Data
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name || item.product?.name || 'Unknown Item',
          qty: item.quantity || 1,
          image: item.image || item.product?.image,
          price: item.price || item.product?.price || 0,
          selectedVariant: item.selectedVariant,
          product: item.product?._id || item.product || item._id
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.zip,
          phone: formData.phone
        },
        paymentMethod: step,
        totalPrice: total,
      };

      // 2. Branch: Online Payment (Razorpay)
      if (step === 'razorpay' || step === 'card' || step === 'upi') {
        // A. Load SDK
        const res = await loadRazorpay();
        if (!res) {
          addToast("Razorpay SDK failed to load. Are you online?", "error");
          setIsSubmitting(false);
          return;
        }

        // B. Create Order on Server (Razorpay)
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: paymentOrder } = await axios.post('http://localhost:5000/api/payments/create-order', { amount: total }, config);

        // C. Open Razorpay Options
        const options = {
          key: "rzp_test_placeholder", // REPLACE WITH ENV VAR IN PROD
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: "HighPhaus",
          description: "Luxury Purchase",
          image: "https://example.com/logo.png", // Add your logo here
          order_id: paymentOrder.id,
          handler: async function (response) {
            try {
              // D. Verify Payment on Server & Create Local Order
              // Wait, usually we create local order FIRST as 'Pending', then update to 'Paid'.
              // But effectively, let's create the order properly now.

              // Strategy: Create Order DB -> then Verify? 
              // Or Verify -> then Create Order DB?
              // Standard: Create Order (Pending) -> Pay -> Update to Paid.

              const orderRes = await axios.post('http://localhost:5000/api/orders', orderData, config);

              await axios.post('http://localhost:5000/api/payments/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: orderRes.data._id
              }, config);

              // Clear Cart
              await axios.delete('http://localhost:5000/api/cart/clear', config);
              setUser({ ...user, cart: [] });

              navigate('/order-success', { state: { orderId: orderRes.data._id }, replace: true });

            } catch (vErr) {
              addToast("Payment Verification Failed", "error");
              console.error(vErr);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: user.email,
            contact: formData.phone
          },
          theme: {
            color: "#000000"
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
        setIsSubmitting(false); // Modal is open, we can unblock UI or keep it blocked? 
        // Usually keep blocked or let modal handle it.

      } else {
        // 3. Branch: COD / Manual
        const { data } = await axios.post(
          'http://localhost:5000/api/orders',
          orderData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // Clear cart
        await axios.delete('http://localhost:5000/api/cart/clear', {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        setUser({ ...user, cart: [] });
        navigate('/order-success', { state: { orderId: data._id }, replace: true });
      }

    } catch (err) {
      console.error("Order Error:", err);
      const msg = err.response?.data?.message || "Order failed. Please check details.";
      addToast(msg, "error");
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isSubmitting) return null;

  return (
    <div className="bg-white min-h-screen pt-44 md:pt-52 pb-20 font-sans text-[#1a1a1a]">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* TOP NAV */}
        <button
          onClick={() => {
            if (step === 'shipping') navigate(-1);
            else if (step === 'selection') setStep('shipping');
            else setStep('selection');
          }}
          className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 hover:text-black transition"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          {step === 'shipping' ? 'Back to Bag' : 'Change Method'}
        </button>

        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 italic transform -skew-x-3">
          Secure <span className="text-red-500">Checkout</span>
        </h1>

        {/* GRID LAYOUT: LEFT (FORM) | RIGHT (SUMMARY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* LEFT COLUMN: FORMS & ACTIONS */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">

            {/* STEP INDICATOR (Optional visual aid) */}
            <div className="flex items-center gap-4 mb-10 text-[10px] font-black uppercase tracking-widest text-zinc-300">
              <span className={`flex items-center gap-2 ${step === 'shipping' ? 'text-black' : 'text-green-500'}`}>
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">1</span> Shipping
              </span>
              <div className="w-8 h-px bg-zinc-200"></div>
              <span className={`flex items-center gap-2 ${step !== 'shipping' ? 'text-black' : ''}`}>
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">2</span> Payment
              </span>
            </div>

            {/* STEP 1: SHIPPING FORM */}
            {step === 'shipping' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-black uppercase tracking-tight mb-8">Shipping Details</h2>

                <form id="checkout-form" onSubmit={goToSelection} className="space-y-8">
                  {user?.addresses?.length > 0 && (
                    <div className="mb-10">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Saved Locations</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.addresses.map((addr, i) => (
                          <div key={i} onClick={() => {
                            setFormData({ ...formData, address: addr.street, city: addr.city, zip: addr.zip, phone: addr.phone || formData.phone });
                          }} className="p-5 border border-zinc-200 rounded-2xl cursor-pointer hover:border-black hover:bg-zinc-50 transition-all text-left">
                            <p className="font-bold text-xs uppercase mb-1">{addr.label}</p>
                            <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">{addr.street}, {addr.city}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 my-8">
                        <div className="h-px bg-zinc-100 flex-1"></div>
                        <span className="text-[9px] font-black uppercase text-zinc-300">OR ENTER NEW</span>
                        <div className="h-px bg-zinc-100 flex-1"></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">First Name</label>
                      <input type="text" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Last Name</label>
                      <input type="text" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Address</label>
                    <input type="text" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">City</label>
                      <input type="text" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Postal Code</label>
                      <input type="text" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone</label>
                    <input type="tel" required className="w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>

                  {/* MOBILE CONTINUE BUTTON */}
                  <div className="lg:hidden pt-8">
                    <button type="submit" className="w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs">
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {step !== 'shipping' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-xl font-black uppercase tracking-tight mb-8">Select Payment Method</h2>

                <div className="space-y-4">
                  {[
                    { id: 'upi', name: 'UPI / QR Code', icon: <Smartphone />, desc: 'Google Pay, PhonePe, Paytm' },
                    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard />, desc: 'Visa, Mastercard, RuPay' },
                    { id: 'cod', name: 'Cash On Delivery', icon: <Truck />, desc: 'Pay with cash upon delivery' }
                  ].map(method => (
                    <div key={method.id} onClick={() => step !== 'selection' && setStep(method.id)} className={`
                          relative overflow-hidden rounded-2xl border transition-all duration-300
                          ${step === method.id ? 'border-black bg-zinc-900 text-white shadow-xl scale-[1.02]' : 'border-zinc-200 bg-white hover:border-zinc-300 cursor-pointer'}
                       `}>
                      <button onClick={() => goToPayment(method.id)} className="w-full p-6 md:p-8 flex items-center text-left">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-6 text-xl transition-colors ${step === method.id ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-sm md:text-base uppercase tracking-wide">{method.name}</h3>
                          <p className={`text-[10px] font-medium mt-1 uppercase tracking-widest ${step === method.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{method.desc}</p>
                        </div>
                        {step === method.id && <CheckCircle2 className="text-green-500" size={24} />}
                      </button>

                      {/* Saved Cards Logic */}
                      {method.id === 'card' && step === 'card' && user?.savedCards?.length > 0 && (
                        <div className="px-8 pb-8 animate-in slide-in-from-top-2">
                          <div className="h-px bg-zinc-800 w-full mb-4 opacity-50"></div>
                          <p className="text-[10px] font-bold uppercase text-zinc-500 mb-3">Saved Cards</p>
                          {user.savedCards.map((card, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800 border border-zinc-700 w-max pr-8 cursor-pointer hover:bg-zinc-700">
                              <div className="text-[10px] font-mono p-1 bg-white text-black rounded uppercase">{card.brand}</div>
                              <span className="font-mono text-xs">•••• {card.last4}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* FINAL CONFIRMATION BUTTON (MOBILE) */}
                {step !== 'selection' && (
                  <div className="lg:hidden mt-8 pt-4 border-t border-zinc-100">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={isSubmitting}
                      className="w-full bg-black text-white py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY (STICKY) */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
            <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 lg:sticky lg:top-32">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 border-b border-zinc-200 pb-4">Bag Summary</h3>

              <div className="space-y-4 mb-8 custom-scrollbar max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map((item, idx) => {
                  const itemName = item.name || item.product?.name || 'Item';
                  const itemPrice = item.price || item.product?.price || 0;
                  const itemQty = item.quantity || 1;
                  const itemImg = item.image || item.product?.image;

                  return (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-12 h-16 bg-white rounded-lg border border-zinc-200 overflow-hidden shrink-0">
                        {itemImg && <img src={itemImg} alt={itemName} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase truncate">{itemName}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-zinc-500 font-mono">Qty: {itemQty}</span>
                          <span className="text-[10px] font-bold">₹{itemPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-dashed border-zinc-200 pt-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-600">
                    <span>Discount</span>
                    <span>- ₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-black uppercase italic transform -skew-x-2 pt-2">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* DESKTOP ACTION BUTTON */}
              <div className="hidden lg:block mt-8">
                {step === 'shipping' ? (
                  <button
                    form="checkout-form"
                    type="submit"
                    className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Confirm Shipping
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={step === 'selection' || isSubmitting}
                    className={`w-full py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 ${step === 'selection' || isSubmitting
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none transform-none'
                      : 'bg-black text-white hover:bg-zinc-900'
                      }`}
                  >
                    {isSubmitting ? 'Confirming...' : 'Complete Payment'}
                  </button>
                )}

                <p className="text-[9px] text-zinc-400 text-center mt-4 font-bold uppercase tracking-widest">
                  <ShieldCheck size={12} className="inline mr-1 mb-0.5" />
                  Secure 256-bit SSL Encrypted
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;