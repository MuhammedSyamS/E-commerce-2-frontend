import React, { useState, useEffect } from 'react';
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
  const [pointsRedeemed, setPointsRedeemed] = useState(0); // NEW: Loyalty Logic
  const [isGift, setIsGift] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [premiumPackaging, setPremiumPackaging] = useState(false);

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
  const packagingPrice = premiumPackaging ? 250 : 0; // Premium SLOOK Packaging

  const total = Math.max(0, subtotal - discountAmount + taxPrice + shippingPrice + packagingPrice);

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
    zip: '',
    phone: '',
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
        totalPrice: total, // Send the final total (including tax/shipping)
        taxPrice,
        shippingPrice,
        discountAmount,
        couponCode: couponApplied?.code || (coupon?.code || ''),
        pointsToRedeem: pointsRedeemed,
        orderNote: isGift ? `GIFT: ${giftNote}` : formData.orderNote,
        isGift,
        premiumPackaging
      };

      // 2. Branch: Online Payment (Razorpay) - Handle ALL non-COD methods
      if (step !== 'cod') {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const finalAmountToPay = total - (pointsRedeemed || 0);

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

                  {/* PREMIUM GIFT OPTIONS */}
                  <div className="bg-zinc-50 p-6 rounded-3xl space-y-6 border border-zinc-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><Gift size={18} className="text-zinc-900" /></div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tight">Gift Options</p>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Make it a SLOOK Moment</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsGift(!isGift)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${isGift ? 'bg-black' : 'bg-zinc-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isGift ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {isGift && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <textarea
                          placeholder="WRITE A HEARTFELT NOTE..."
                          className="w-full bg-white border border-zinc-100 rounded-2xl p-4 text-[10px] font-bold uppercase h-24 outline-none focus:border-black transition-all"
                          value={giftNote}
                          onChange={(e) => setGiftNote(e.target.value)}
                        />

                        <div
                          onClick={() => setPremiumPackaging(!premiumPackaging)}
                          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${premiumPackaging ? 'border-black bg-white shadow-md' : 'border-zinc-100 opacity-60'}`}
                        >
                          <div className="flex items-center gap-3">
                            <Zap size={16} className={premiumPackaging ? 'text-amber-400 fill-amber-400' : 'text-zinc-300'} />
                            <div>
                              <p className="text-[10px] font-black uppercase">Premium SLOOK Packaging</p>
                              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">+ ₹250.00</p>
                            </div>
                          </div>
                          {premiumPackaging && <CheckCircle2 size={16} className="text-black" />}
                        </div>
                      </div>
                    )}
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
                          <Price amount={itemPrice} className="text-[10px] font-bold" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-dashed border-zinc-200 pt-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Subtotal</span>
                  <Price amount={subtotal} />
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-green-600">
                    <span>Discount</span>
                    <Price amount={discountAmount} />
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Tax ({siteSettings.taxRate}%)</span>
                  <Price amount={taxPrice} />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  <span>Shipping</span>
                  <span>{shippingPrice === 0 ? 'FREE' : <Price amount={shippingPrice} />}</span>
                </div>
                <div className="flex justify-between text-xl font-black uppercase italic transform -skew-x-2 pt-2">
                  <span>Total</span>
                  <Price amount={total - (pointsRedeemed || 0)} />
                </div>
              </div>

              {/* DELIVERY ESTIMATE */}
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <div className="flex items-center gap-3 text-zinc-400 mb-2">
                  <Truck size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Estimated Delivery</span>
                </div>
                <p className="text-xs font-bold text-black">{getDeliveryEstimate()}</p>
                <p className="text-[9px] text-zinc-400 mt-1">Standard Shipping to {formData.city || 'your city'}</p>
              </div>

              {/* SLOOK COINS — MNC TIER CARD */}
              {(() => {
                const coins = user?.loyaltyPoints || 0;
                const tier = user?.membershipTier || 'Bronze';
                const MIN_REDEEM = 100;
                const canRedeem = coins >= MIN_REDEEM;
                const coinsToNext = MIN_REDEEM - (coins % MIN_REDEEM);
                const progressPct = Math.min(100, ((coins % MIN_REDEEM) / MIN_REDEEM) * 100);

                const tierConfig = {
                  Bronze: { bg: 'from-amber-900/10 to-amber-700/10', border: 'border-amber-800/30', badge: 'bg-gradient-to-r from-amber-700 to-amber-500', text: 'text-amber-700', icon: '🥉', next: 'Silver', nextAt: 10000 },
                  Silver: { bg: 'from-slate-400/10 to-slate-300/10', border: 'border-slate-400/30', badge: 'bg-gradient-to-r from-slate-500 to-slate-400', text: 'text-slate-600', icon: '🥈', next: 'Gold', nextAt: 50000 },
                  Gold: { bg: 'from-yellow-400/10 to-amber-300/10', border: 'border-yellow-400/30', badge: 'bg-gradient-to-r from-yellow-500 to-amber-400', text: 'text-yellow-600', icon: '🥇', next: 'Platinum', nextAt: 100000 },
                  Platinum: { bg: 'from-purple-500/10 to-indigo-400/10', border: 'border-purple-400/30', badge: 'bg-gradient-to-r from-purple-600 to-indigo-500', text: 'text-purple-600', icon: '💎', next: null, nextAt: null },
                };
                const t = tierConfig[tier] || tierConfig.Bronze;

                if (coins === 0) return null;

                return (
                  <div className={`mt-8 bg-gradient-to-br ${t.bg} rounded-2xl border ${t.border} overflow-hidden`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 pb-3">
                      <div className="flex items-center gap-3">
                        <span className={`${t.badge} text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm`}>
                          {t.icon} {tier} Member
                        </span>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${t.text} leading-none`}>{coins}</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">SLOOK Coins</p>
                      </div>
                    </div>

                    {/* Progress to next redeem */}
                    <div className="px-5 pb-4">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                          {canRedeem ? `${Math.floor(coins / MIN_REDEEM) * MIN_REDEEM} coins ready` : `${coinsToNext} more to unlock`}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400">Next redeem: {Math.ceil(coins / MIN_REDEEM) * MIN_REDEEM} coins</span>
                      </div>
                      <div className="w-full bg-black/10 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${t.badge}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-[9px] font-bold text-zinc-400 mt-1.5 uppercase tracking-widest">
                        💡 1 Coin per ₹100 (Online) / ₹500 (COD) · Tier Bonuses apply · 90-day expiry
                      </p>
                    </div>

                    {/* Redeem Action */}
                    <div className="px-5 pb-5">
                      {canRedeem ? (
                        !pointsRedeemed ? (
                          <button
                            onClick={() => {
                              if (total === 0) return addToast("Cart total is 0", "info");
                              // REFINED RULES: 
                              // 1. Max 100 coins per order
                              // 2. Max 30% of order value
                              const MAX_COINS = 100;
                              const MAX_PCT_LIMIT = Math.floor(total * 0.30);

                              const limit = Math.min(MAX_COINS, MAX_PCT_LIMIT);
                              const userBalanceAvailable = Math.floor(coins / MIN_REDEEM) * MIN_REDEEM;

                              const redeemable = Math.min(userBalanceAvailable, limit);

                              if (redeemable < MIN_REDEEM) {
                                if (limit < MIN_REDEEM) {
                                  return addToast(`Order total too low. Min 30% cap (${MAX_PCT_LIMIT}) or limit is under 100 coins.`, "info");
                                }
                                return addToast(`Minimum 100 coins required to redeem.`, "info");
                              }

                              setPointsRedeemed(redeemable);
                              addToast(`🪙 ${redeemable} Coins redeemed — You save ₹${redeemable}!`, "success");
                            }}
                            className={`w-full ${t.badge} text-white py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5`}
                          >
                            🪙 Redeem SLOOK Coins — Save up to ₹100
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-green-200">
                            <div>
                              <p className="text-[10px] font-black uppercase text-green-600 tracking-widest">✅ {pointsRedeemed} Coins Applied</p>
                              <p className="text-[9px] text-zinc-400 font-bold mt-0.5">You're saving ₹{pointsRedeemed} on this order</p>
                            </div>
                            <button onClick={() => setPointsRedeemed(0)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600 transition ml-4">Remove</button>
                          </div>
                        )
                      ) : (
                        <div className="bg-white/50 rounded-xl p-4 text-center border border-dashed border-zinc-300">
                          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">🔒 Earn {coinsToNext} more coins to unlock</p>
                          <p className="text-[9px] text-zinc-400 mt-1">Shop ₹{coinsToNext * 50} more to reach 100 coins</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

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
