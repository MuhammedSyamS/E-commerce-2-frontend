import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Smartphone, CreditCard, Landmark, Truck } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
  const { user, setUser } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState('shipping'); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = user?.cart || [];
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const total = subtotal;

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
    window.scrollTo(0,0); 
  };

  const goToPayment = (type) => { 
    setStep(type); 
    window.scrollTo(0,0); 
  };

  const handlePlaceOrder = async () => {
    if (!user?.token) return alert("Please login again to continue");
    
    setIsSubmitting(true);
    try {
      const orderData = {
        orderItems: cartItems.map(item => ({
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
          product: item.product || item._id 
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

      const { data } = await axios.post(
        'http://localhost:5000/api/orders', 
        orderData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      setUser({ ...user, cart: [] });
      navigate('/order-success', { state: { orderId: data._id }, replace: true });
    } catch (err) {
      alert(err.response?.data?.message || "Order failed. Please check details.");
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0 && !isSubmitting) return null;

  return (
    <div className="bg-white min-h-screen pt-44 md:pt-48 pb-20 font-sans text-[#1a1a1a]">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <button 
          onClick={() => {
            if (step === 'shipping') navigate(-1);
            else if (step === 'selection') setStep('shipping');
            else setStep('selection');
          }} 
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-8 hover:text-black transition"
        >
          <ArrowLeft size={16} /> {step === 'shipping' ? 'Back to Bag' : 'Change Method'}
        </button>

        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 italic transform -skew-x-3">
          Secure <span className="text-zinc-300">Checkout</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* SIDEBAR SUMMARY */}
          <div className="lg:w-2/5 w-full order-first lg:order-last bg-zinc-50 p-8 rounded-3xl border border-zinc-100 lg:sticky lg:top-32">
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-8 border-b border-zinc-200 pb-4">Bag Summary</h2>
            
            <div className="space-y-5 mb-8">
              {cartItems.map(item => (
                <div key={item.product || item._id} className="flex justify-between items-start text-xs font-bold uppercase tracking-tight">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[150px] mb-1">{item.name}</span>
                    <span className="text-[9px] text-zinc-400">
                      {item.quantity} x ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-6 font-black text-2xl flex justify-between uppercase italic transform -skew-x-2">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            {/* MAIN ACTION BUTTON */}
            <div className="hidden lg:block space-y-4 mt-10">
               {step === 'shipping' ? (
                <button form="checkout-form" type="submit" className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-all">
                  <ShieldCheck size={20} /> Continue to Payment
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder} 
                  disabled={step === 'selection' || isSubmitting} 
                  className={`w-full py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-lg active:scale-95 ${step === 'selection' || isSubmitting ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-900'}`}
                >
                  {isSubmitting ? 'Confirming...' : step === 'selection' ? 'Select Method Above' : 'Complete Purchase'}
                </button>
              )}
            </div>
          </div>

          <div className="lg:w-3/5 w-full">
            {/* STEP 1: SHIPPING */}
            {step === 'shipping' && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-zinc-100 pb-4">1. Shipping Details</h2>
                <form id="checkout-form" onSubmit={goToSelection} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input type="text" placeholder="First Name" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent font-bold uppercase text-[10px] md:text-base tracking-widest" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    <input type="text" placeholder="Last Name" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent font-bold uppercase text-[10px] md:text-base tracking-widest" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Full Delivery Address" required className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent font-bold uppercase text-[10px] md:text-base tracking-widest" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input type="text" placeholder="City" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent font-bold uppercase text-[10px] md:text-base tracking-widest" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    <input type="text" placeholder="ZIP / Postal Code" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent font-bold uppercase text-[10px] md:text-base tracking-widest" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                  </div>
                  <input type="tel" placeholder="Phone Number" required className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent font-bold uppercase text-[10px] md:text-base tracking-widest" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  
                  {/* MOBILE ONLY BUTTON */}
                  <button type="submit" className="lg:hidden w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3">
                    <ShieldCheck size={20} /> Continue
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: METHOD SELECTION */}
            {step === 'selection' && (
              <div className="animate-in slide-in-from-right duration-500">
                <h2 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-zinc-100 pb-4">2. Payment Method</h2>
                <div className="grid gap-4">
                  {[
                    { id: 'upi', name: 'UPI / QR', icon: <Smartphone />, desc: 'GPay, PhonePe, BHIM' },
                    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard />, desc: 'Secure Encryption' },
                    { id: 'cod', name: 'Cash On Delivery', icon: <Truck />, desc: 'Pay when you receive' }
                  ].map(m => (
                    <button key={m.id} onClick={() => goToPayment(m.id)} className="flex items-center p-6 border border-zinc-100 rounded-2xl hover:border-black transition-all text-left bg-zinc-50/50 group">
                      <div className="p-4 bg-white rounded-full mr-6 border border-zinc-100 group-hover:scale-110 transition-transform">{m.icon}</div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{m.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: FINAL CONFIRMATION (REMOVED REDUNDANT BUTTON) */}
            {['upi', 'card', 'cod'].includes(step) && step !== 'selection' && (
              <div className="animate-in zoom-in duration-300 space-y-6">
                <h2 className="text-xs font-black uppercase tracking-widest border-b border-zinc-100 pb-4">3. Confirm Details</h2>
                <div className="p-10 bg-zinc-50 rounded-[2rem] border border-dashed border-zinc-200 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    {step === 'upi' ? <Smartphone size={24}/> : step === 'card' ? <CreditCard size={24}/> : <Truck size={24}/>}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">Billing with</p>
                  <p className="font-black text-xl uppercase italic transform -skew-x-3">
                    {step === 'upi' ? 'UPI / QR Payment' : step === 'card' ? 'Credit / Debit Card' : 'Cash On Delivery'}
                  </p>
                  
                  {/* MOBILE ONLY FINAL ACTION */}
                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={isSubmitting} 
                    className="lg:hidden mt-10 w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px]"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Purchase'}
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;