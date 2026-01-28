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

  // --- THE FIX: Add isSubmitting check to prevent redirecting to shop on success ---
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
    
    setIsSubmitting(true); // Locks the useEffect from redirecting to /shop
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

      // 1. Clear Database Cart
      await axios.delete('http://localhost:5000/api/cart/clear', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      // 2. Clear Local State
      setUser({ ...user, cart: [] });
      
      // 3. Navigate to Success Page
      // Using replace: true prevents the user from going back to an empty checkout
      navigate('/order-success', { state: { orderId: data._id }, replace: true });
    } catch (err) {
      console.error("Order Failure:", err.response?.data);
      alert(err.response?.data?.message || "Order failed. Please check details.");
      setIsSubmitting(false); // Unlock so they can fix errors and try again
    }
  };

  if (cartItems.length === 0 && !isSubmitting) return null;

  return (
    <div className="bg-white min-h-screen pt-32 md:pt-40 pb-20 font-sans">
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
          <div className="lg:w-3/5 w-full">
            {step === 'shipping' && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-zinc-100 pb-4">1. Shipping Details</h2>
                <form id="checkout-form" onSubmit={goToSelection} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input type="text" placeholder="First Name" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    <input type="text" placeholder="Last Name" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Full Delivery Address" required className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <input type="text" placeholder="City" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    <input type="text" placeholder="ZIP / Postal Code" required className="border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                  </div>
                  <input type="tel" placeholder="Phone Number" required className="w-full border-b border-zinc-200 py-3 outline-none focus:border-black bg-transparent" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </form>
              </div>
            )}

            {step === 'selection' && (
              <div className="animate-in slide-in-from-right duration-500">
                <h2 className="text-xs font-black uppercase tracking-widest mb-8 border-b border-zinc-100 pb-4">2. Payment Method</h2>
                <div className="grid gap-4">
                  {[
                    { id: 'upi', name: 'UPI / QR', icon: <Smartphone />, desc: 'GPay, PhonePe, BHIM' },
                    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard />, desc: 'Secure Encryption' },
                    { id: 'cod', name: 'Cash On Delivery', icon: <Truck />, desc: 'Pay when you receive' }
                  ].map(m => (
                    <button key={m.id} onClick={() => goToPayment(m.id)} className="flex items-center p-6 border border-zinc-100 rounded-2xl hover:border-black transition-all text-left bg-zinc-50/50">
                      <div className="p-4 bg-white rounded-full mr-6 border border-zinc-100">{m.icon}</div>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{m.name}</p>
                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {['upi', 'card', 'cod'].includes(step) && step !== 'selection' && (
               <div className="animate-in zoom-in duration-300 space-y-6">
                 <h2 className="text-xs font-black uppercase tracking-widest border-b border-zinc-100 pb-4">Confirm Order</h2>
                 <div className="p-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                   <p className="text-xs font-bold uppercase flex items-center gap-2">
                     <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                     Selected Method: {step.toUpperCase()}
                   </p>
                 </div>
               </div>
            )}
          </div>

          <div className="lg:w-2/5 w-full bg-zinc-50 p-8 rounded-3xl border border-zinc-100 lg:sticky lg:top-32">
            <h2 className="text-[10px] font-black uppercase tracking-widest mb-8 border-b border-zinc-200 pb-4">Bag Summary</h2>
            
            <div className="space-y-5 mb-8">
              {cartItems.map(item => (
                <div key={item.product || item._id} className="flex justify-between items-start text-xs font-bold uppercase tracking-tight">
                  <div className="flex flex-col">
                    <span className="truncate max-w-[150px]">{item.name}</span>
                    <span className="text-[9px] text-zinc-400">Qty: {item.quantity}</span>
                  </div>
                  <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-6 font-black text-2xl flex justify-between uppercase italic transform -skew-x-2">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <div className="space-y-4 mt-10">
              {step === 'shipping' ? (
                <button form="checkout-form" type="submit" className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all shadow-lg">
                  <ShieldCheck size={20} /> Continue to Payment
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={step === 'selection' || isSubmitting}
                  className={`w-full py-5 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-lg ${step === 'selection' || isSubmitting ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800'}`}
                >
                  {isSubmitting ? 'Confirming Order...' : step === 'selection' ? 'Select Payment' : 'Complete Purchase'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;