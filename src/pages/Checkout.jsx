import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowLeft, Smartphone, CreditCard, Landmark, Truck, CheckCircle2, Wallet, Star, Gift, Zap } from 'lucide-react';
import api from '../api/instance';
import Price from '../components/Price';

const Checkout = () => {
  const { user, setUser, coupon } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const [step, setStep] = useState('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteSettings, setSiteSettings] = useState({ taxRate: 0, shippingCharge: 0, freeShippingThreshold: 0 });

  // Enhanced cart item resolution: Support for "Buy Now" (Single Item Checkout)
  const cartItems = location.state?.checkoutSingleItem ? [location.state.checkoutSingleItem] : (user?.cart || []);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null); // { code, discountAmount }
  const [discountError, setDiscountError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  const loyaltyDiscount = useLoyaltyPoints ? Math.min(calculateSubtotal(), user?.loyaltyPoints || 0) : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setDiscountError('');
    try {
      const { data } = await api.post('/marketing/verify-coupon', {
        code: couponCode,
        cartTotal: calculateSubtotal(),
        userId: user?._id || user?.id
      });

      setCouponApplied({ code: data.code, discountAmount: data.discount }); // mapped from 'discount'
      addToast('Coupon Applied Successfully!', 'success');
    } catch (error) {
      setDiscountError(error.response?.data?.message || 'Invalid Coupon');
      setCouponApplied(null);
      addToast(error.response?.data?.message || 'Invalid Coupon', 'error');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setDiscountError('');
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.price || item.product?.price || 0;
      const qty = item.quantity || 1;
      return acc + (price * qty);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const discountAmount = couponApplied ? couponApplied.discountAmount : (coupon ? coupon.discount : 0);

  const taxPrice = (subtotal * (siteSettings.taxRate / 100));
  const shippingPrice = subtotal >= siteSettings.freeShippingThreshold ? 0 : siteSettings.shippingCharge;
  const total = Math.max(0, subtotal - discountAmount + taxPrice + shippingPrice);

  const getDeliveryEstimate = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return `Arriving by ${deliveryDate.toLocaleDateString('en-US', options)}`;
  };

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    alternatePhone: '',
    orderNote: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setSiteSettings(data);
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();

    if (cartItems.length === 0 && !isSubmitting) {
      navigate('/shop');
    }
  }, [cartItems.length, navigate, isSubmitting]);

  const paymentRef = useRef(null);

  const goToSelection = (e) => {
    e.preventDefault();
    setStep('selection');

    // Scroll directly to the payment/step indicator section
    setTimeout(() => {
      if (paymentRef.current) {
        paymentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
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
          state: formData.state,
          postalCode: formData.zip,
          phone: formData.phone,
          alternatePhone: formData.alternatePhone
        },
        paymentMethod: step,
        totalPrice: total, // Send the final total (including tax/shipping)
        taxPrice,
        shippingPrice,
        discountAmount,
        couponCode: couponApplied?.code || (coupon?.code || ''),
        orderNote: isGift ? `GIFT: ${giftNote}` : formData.orderNote,
        isGift
      };

      // 2. Branch: Online Payment (Razorpay) - Handle ALL non-COD methods
      if (step !== 'cod') {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const finalAmountToPay = total;

        console.log("PAYMENT: Starting Flow for method:", step);
        // A. Fetch Key
        const { data: { key } } = await api.get('/payments/key');
        console.log("PAYMENT: Key Fetched:", key);

        // B. Create Order on Server
        const { data: paymentOrder } = await api.post('/payments/create-order', { amount: finalAmountToPay }, config);
        console.log("PAYMENT: Order Created:", paymentOrder);

        // C. Check for MOCK Mode
        if (key === 'rzp_test_placeholder' || paymentOrder.id.startsWith('order_mock_')) {
          console.log("PAYMENT: Mock Mode Detected - Simulating...");
          addToast("Simulating Secure Payment...", "success");

          // Simulate Delay
          setTimeout(async () => {
            try {
              // Create Local Order First
              const orderRes = await api.post('/orders', orderData, config);
              console.log("PAYMENT: Local Order Created:", orderRes.data._id);

              // Verify Mock
              await api.post('/payments/verify', {
                razorpay_order_id: paymentOrder.id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature_bypass', // Backend ignores this for mock orders
                orderId: orderRes.data._id
              }, config);
              console.log("PAYMENT: Verification Success");

              // Clear Cart & Redirect
              await api.delete('/cart/clear', config);
              // Update User from response (if provided)
              if (orderRes.data.user) {
                setUser({ ...orderRes.data.user, token: user.token });
              } else {
                setUser({ ...user, cart: [] });
              }
              navigate('/order-success', { state: { orderId: orderRes.data.order?._id || orderRes.data._id }, replace: true });
            } catch (mockErr) {
              console.error("PAYMENT: Mock Error:", mockErr);
              addToast("Mock Payment Failed", "error");
              setIsSubmitting(false);
            }
          }, 2000);
          return;
        }

        // D. REAL RAZORPAY FLOW
        const res = await loadRazorpay();
        if (!res) {
          addToast("Razorpay SDK failed to load. Are you online?", "error");
          setIsSubmitting(false);
          return;
        }

        const options = {
          key: key,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: "SLOOK",
          description: "Luxury Purchase",
          image: "https://cdn-icons-png.flaticon.com/512/3119/3119338.png", // Use valid image
          order_id: paymentOrder.id,
          handler: async function (response) {
            console.log("✅ RAZORPAY HANDLER FIRED:", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              has_signature: !!response.razorpay_signature
            });
            try {
              // Create Local Order (Pending)
              let orderRes;
              try {
                orderRes = await api.post('/orders', orderData, config);
              } catch (orderErr) {
                const msg = orderErr.response?.data?.message || "Order creation failed";
                console.error("ORDER CREATE ERROR:", orderErr);
                addToast(`Order failed: ${msg}`, "error");
                setIsSubmitting(false);
                return;
              }

              // Verify payment with backend
              try {
                await api.post('/payments/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderId: orderRes.data._id
                }, config);
              } catch (verifyErr) {
                const msg = verifyErr.response?.data?.message || "Signature verification failed";
                console.error("VERIFY ERROR:", verifyErr.response?.data);
                addToast(`Payment verification failed: ${msg}`, "error");
                setIsSubmitting(false);
                return;
              }

              // Clear Cart
              await api.delete('/cart/clear', config);
              if (orderRes.data.user) {
                setUser({ ...orderRes.data.user, token: user.token });
              } else {
                setUser({ ...user, cart: [] });
              }
              navigate('/order-success', { state: { orderId: orderRes.data.order?._id || orderRes.data._id }, replace: true });

            } catch (vErr) {
              console.error("HANDLER UNEXPECTED ERROR:", vErr);
              addToast(vErr.response?.data?.message || "Payment processing failed. Please contact support.", "error");
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: user.email,
            contact: formData.phone
          },
          theme: {
            color: "#000000"
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
              addToast("Payment Cancelled", "info");
            }
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
          addToast(response.error.description || "Payment Failed", "error");
          setIsSubmitting(false);
        });
        rzp1.open();
        // setIsSubmitting(false); // Valid to keep true until modal behaves

      } else {
        // 3. Branch: COD / Manual
        const { data } = await api.post(
          '/orders',
          orderData,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        // Clear cart
        await api.delete('/cart/clear', {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (data.user) {
          setUser({ ...data.user, token: user.token });
        } else {
          setUser({ ...user, cart: [] });
        }
        navigate('/order-success', { state: { orderId: data.order?._id || data._id }, replace: true });
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
      <div className="container-responsive">

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

        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12">
          Secure Checkout
        </h1>

        {/* GRID LAYOUT: LEFT (FORM) | RIGHT (SUMMARY) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          <div className="lg:col-span-7 xl:col-span-8 order-1 scroll-mt-40 md:scroll-mt-52" ref={paymentRef}>

            {/* STEP INDICATOR (Optional visual aid) */}
            <div className="flex items-center gap-4 mb-10 !text-[9px] md:!text-[10px] font-black uppercase tracking-widest text-zinc-300">
              <span className={`flex items-center gap-2 ${step === 'shipping' ? 'text-black' : 'text-green-500'}`}>
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-current flex items-center justify-center">1</span> Shipping
              </span>
              <div className="w-8 h-px bg-zinc-200"></div>
              <span className={`flex items-center gap-2 ${step !== 'shipping' ? 'text-black' : ''}`}>
                <span className="w-4 h-4 md:w-5 md:h-5 rounded-full border border-current flex items-center justify-center">2</span> Payment
              </span>
            </div>

            {/* STEP 1: SHIPPING FORM */}
            {step === 'shipping' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="!text-[16px] md:!text-[20px] font-black uppercase tracking-tight mb-8">Shipping Details</h2>

                <form id="checkout-form" onSubmit={goToSelection} className="space-y-8">
                  {user?.addresses?.length > 0 && (
                    <div className="mb-10">
                      <p className="text-sm md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Saved Locations</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.addresses.map((addr, i) => (
                          <div key={i} onClick={() => {
                            setFormData({ ...formData, address: addr.street, city: addr.city, state: addr.state || '', zip: addr.zip, phone: addr.phone || formData.phone, alternatePhone: addr.alternatePhone || formData.alternatePhone });
                          }} className="p-5 border border-zinc-200 rounded-2xl cursor-pointer hover:border-black hover:bg-zinc-50 transition-all text-left">
                            <p className="font-bold text-sm md:text-xs uppercase mb-1">{addr.label}</p>
                            <p className="text-sm md:text-[11px] text-zinc-500 leading-relaxed font-medium">{addr.street}, {addr.city}{addr.state ? `, ${addr.state}` : ''}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 my-8">
                        <div className="h-px bg-zinc-100 flex-1"></div>
                        <span className="!text-[8px] md:!text-[9px] font-black uppercase text-zinc-300">OR ENTER NEW</span>
                        <div className="h-px bg-zinc-100 flex-1"></div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">First Name</label>
                      <input type="text" required className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">Last Name</label>
                      <input type="text" required className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">Address</label>
                    <input type="text" required className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">City</label>
                      <input type="text" required className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">State</label>
                      <input type="text" required className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">Postal Code</label>
                    <input type="text" required className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                  </div>

                  {/* PREMIUM GIFT OPTIONS */}
                  <div className={`p-6 rounded-3xl space-y-6 border transition-all duration-500 ${isGift ? 'bg-zinc-950 text-white border-black shadow-2xl' : 'bg-zinc-50 border-zinc-100'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl shadow-sm transition-colors ${isGift ? 'bg-white/10' : 'bg-white'}`}><Gift size={18} className={isGift ? 'text-white' : 'text-zinc-900'} /></div>
                        <div>
                          <p className="!text-[11px] md:!text-[13px] font-black uppercase tracking-tight">Elite Gift Packaging</p>
                          <p className={`!text-[9px] md:!text-[11px] font-bold uppercase tracking-widest ${isGift ? 'text-zinc-500' : 'text-zinc-400'}`}>Handmade wrap & personal note</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGift(!isGift)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isGift ? 'bg-amber-500' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isGift ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {isGift && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <textarea
                          placeholder="WRITE A NOTE..."
                          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-[10px] font-bold uppercase h-24 outline-none focus:border-white transition-all text-white placeholder:text-zinc-600"
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">Phone</label>
                      <input type="tel" required className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="!text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-400">Alternate Phone <span className="text-[8px] font-normal tracking-normal lowercase">(Optional)</span></label>
                      <input type="tel" className="!text-[12px] md:!text-[14px] w-full border-b border-zinc-200 py-2 outline-none focus:border-black bg-transparent font-bold" value={formData.alternatePhone} onChange={e => setFormData({ ...formData, alternatePhone: e.target.value })} />
                    </div>
                  </div>

                </form>
              </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {step !== 'shipping' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">

                {/* COUPON SECTION IN PAYMENT */}
                <div className="mb-10 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap size={18} className="text-zinc-900" />
                    <h3 className="!text-[11px] md:!text-[13px] font-black uppercase tracking-widest">Apply Coupon</h3>
                  </div>

                  {couponApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 p-4 rounded-2xl">
                      <div>
                        <p className="text-[10px] md:text-xs font-black uppercase text-green-700 tracking-widest">{couponApplied.code}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">
                          Savings applied
                        </p>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 relative">
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-white border border-zinc-200 rounded-2xl px-4 py-3 !text-[11px] md:!text-xs font-bold uppercase tracking-widest outline-none focus:border-black transition-colors"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="bg-black text-white px-6 rounded-2xl !text-[10px] md:!text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isValidatingCoupon ? 'Wait' : 'Apply'}
                      </button>
                    </div>
                  )}
                  {discountError && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-2 ml-2">{discountError}</p>
                  )}
                </div>

                <h2 className="!text-sm md:!text-lg font-black uppercase tracking-tight mb-8">Select Payment Method</h2>

                <div className="space-y-4">
                  {[
                    { id: 'upi', name: 'UPI / QR Code', icon: <Smartphone />, desc: 'Google Pay, PhonePe, Paytm' },
                    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard />, desc: 'Visa, Mastercard, RuPay' },
                    { id: 'netbanking', name: 'Net Banking', icon: <Landmark />, desc: 'All Indian Banks' },
                    { id: 'wallet', name: 'Wallets', icon: <Wallet />, desc: 'Paytm, PhonePe, Amazon Pay' },
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
                          <h3 className="!text-[11px] md:!text-[13px] font-black uppercase tracking-wide">{method.name}</h3>
                          <p className={`!text-[9px] md:!text-[10px] font-medium mt-1 uppercase tracking-widest ${step === method.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{method.desc}</p>
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

              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY (STICKY) */}
          <div className="lg:col-span-5 xl:col-span-4 order-2">
            <div className="bg-zinc-50 p-8 rounded-[2rem] border border-zinc-100 lg:sticky lg:top-32">
              <h3 className="!text-[12px] md:!text-[14px] font-black uppercase tracking-widest mb-6 border-b border-zinc-200 pb-4">Bag Summary</h3>

              <div className="space-y-4 mb-8 custom-scrollbar max-h-[40vh] overflow-y-auto pr-2">
                {cartItems.map((item, idx) => {
                  const itemName = item.name || item.product?.name || 'Item';
                  const itemPrice = item.price || item.product?.price || 0;
                  const itemQty = item.quantity || 1;
                  const itemImg = item.image || item.product?.image;

                  return (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-10 h-14 md:w-12 md:h-16 bg-white rounded-lg border border-zinc-200 overflow-hidden shrink-0">
                        {itemImg && <img src={itemImg} alt={itemName} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="!text-[11px] md:!text-xs font-bold uppercase truncate">{itemName}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="!text-[9px] md:!text-[10px] text-zinc-500 font-mono">Qty: {itemQty}</span>
                          <Price amount={itemPrice} className="!text-[10px] md:!text-[11px] font-bold" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-dashed border-zinc-200 pt-6">
                {/* LOYALTY POINTS REDEMPTION */}
                {user?.loyaltyPoints > 0 && (
                  <div className={`p-4 rounded-2xl border transition-all cursor-pointer mb-4 ${useLoyaltyPoints ? 'bg-amber-50 border-amber-200' : 'bg-white border-zinc-100'}`} onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-full ${useLoyaltyPoints ? 'bg-amber-400 text-white' : 'bg-zinc-100 text-zinc-400'}`}><Star size={10} fill="currentColor" /></div>
                        <div>
                          <p className="!text-[10px] md:!text-[11px] font-black uppercase tracking-tight">Redeem {Math.min(user.loyaltyPoints, subtotal)} Coins</p>
                          <p className="!text-[8px] md:!text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Saves ₹{Math.min(user.loyaltyPoints, subtotal)} on this order</p>
                        </div>
                      </div>
                      <div className={`w-8 h-4 rounded-full relative transition-colors ${useLoyaltyPoints ? 'bg-amber-400' : 'bg-zinc-200'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${useLoyaltyPoints ? 'left-4.5' : 'left-0.5'}`} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between !text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Subtotal</span>
                  <Price amount={subtotal} />
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between !text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-green-600">
                    <span>Coupon Discount</span>
                    <Price amount={discountAmount} />
                  </div>
                )}
                {loyaltyDiscount > 0 && (
                  <div className="flex justify-between !text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-amber-600">
                    <span>Loyalty Redemption</span>
                    <span>-₹{loyaltyDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between !text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Tax ({siteSettings.taxRate}%)</span>
                  <Price amount={taxPrice} />
                </div>
                <div className="flex justify-between !text-[10px] md:!text-[12px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'FREE' : <Price amount={shippingPrice} />}</span>
                </div>
                <div className="flex justify-between !text-[14px] md:!text-base font-black uppercase pt-2">
                  <span>Total</span>
                  <Price amount={Math.max(0, total - loyaltyDiscount)} className="!text-[18px] md:!text-xl" />
                </div>
              </div>

              {/* DELIVERY ESTIMATE */}
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-3 text-zinc-400 mb-2">
                  <Truck size={14} />
                  <span className="!text-[10px] md:!text-[12px] font-black uppercase tracking-widest">Estimated Delivery</span>
                </div>
                <p className="!text-[11px] md:!text-[13px] font-bold text-black">{getDeliveryEstimate()}</p>
                <p className="!text-[9px] md:!text-[11px] text-zinc-400 mt-1">Standard Shipping to {formData.city || 'your city'}</p>
              </div>


              {/* ACTION BUTTON */}
              <div className="mt-8">
                {step === 'shipping' ? (
                  <button
                    form="checkout-form"
                    type="submit"
                    className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 !text-[12px] md:!text-[14px]"
                  >
                    Confirm Shipping
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={step === 'selection' || isSubmitting}
                    className={`w-full py-5 rounded-full font-black uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 !text-[12px] md:!text-[14px] ${step === 'selection' || isSubmitting
                      ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none transform-none'
                      : 'bg-black text-white hover:bg-zinc-900'
                      }`}
                  >
                    {isSubmitting ? 'Confirming...' : 'Complete Payment'}
                  </button>
                )}

                <p className="!text-[9px] md:!text-[10px] text-zinc-400 text-center mt-4 font-bold uppercase tracking-widest">
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
