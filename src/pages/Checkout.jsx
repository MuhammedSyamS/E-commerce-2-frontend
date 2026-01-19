import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Smartphone, CreditCard, Landmark, ChevronLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, user } = useStore();
  const navigate = useNavigate();
  
  // --- STEPS: 'shipping' -> 'selection' -> 'upi' | 'card' | 'netbanking' ---
  const [step, setStep] = useState('shipping'); 

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const total = subtotal;

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '', city: '', zip: '', phone: ''
  });

  // Handle transitions
  const goToSelection = (e) => { e.preventDefault(); setStep('selection'); window.scrollTo(0,0); };
  const goToPayment = (type) => { setStep(type); window.scrollTo(0,0); };

  if (cart.length === 0) return <div className="h-screen flex items-center justify-center font-bold">CART EMPTY</div>;

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="container mx-auto px-6 py-10">
        
        {/* Back Button Logic */}
        <button 
          onClick={() => {
            if (step === 'shipping') navigate(-1);
            else if (step === 'selection') setStep('shipping');
            else setStep('selection');
          }} 
          className="flex items-center gap-2 text-sm text-gray-500 mb-8 hover:text-black transition"
        >
          <ArrowLeft size={16} /> {step === 'shipping' ? 'Back to Cart' : 'Back'}
        </button>

        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-10">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* LEFT: DYNAMIC VIEW AREA */}
          <div className="lg:w-2/3">
            
            {/* 1. SHIPPING FORM */}
            {step === 'shipping' && (
              <div className="animate-in fade-in duration-500">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b pb-2">Shipping Information</h2>
                <form id="checkout-form" onSubmit={goToSelection} className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="First Name" required className="border-b py-2 outline-none focus:border-black" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    <input type="text" placeholder="Last Name" required className="border-b py-2 outline-none focus:border-black" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                  <input type="text" placeholder="Full Address" required className="w-full border-b py-2 outline-none focus:border-black" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="City" required className="border-b py-2 outline-none focus:border-black" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                    <input type="text" placeholder="Zip" required className="border-b py-2 outline-none focus:border-black" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                  </div>
                  <input type="tel" placeholder="Phone" required className="w-full border-b py-2 outline-none focus:border-black" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </form>
              </div>
            )}

            {/* 2. METHOD SELECTION */}
            {step === 'selection' && (
              <div className="animate-in slide-in-from-right duration-500">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b pb-2">Select Payment Method</h2>
                <div className="grid gap-4">
                  {[
                    { id: 'upi', name: 'UPI / QR', icon: <Smartphone />, desc: 'Google Pay, PhonePe, BHIM' },
                    { id: 'card', name: 'Card', icon: <CreditCard />, desc: 'Debit & Credit Cards' },
                    { id: 'netbanking', name: 'Net Banking', icon: <Landmark />, desc: 'All Indian Banks' }
                  ].map(m => (
                    <button key={m.id} onClick={() => goToPayment(m.id)} className="flex items-center p-6 border-2 border-gray-100 rounded-2xl hover:border-black transition-all text-left">
                      <div className="p-3 bg-gray-100 rounded-full mr-4">{m.icon}</div>
                      <div>
                        <p className="font-bold text-sm uppercase">{m.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. UPI UI */}
            {step === 'upi' && (
              <div className="animate-in zoom-in duration-300 text-center space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2">Pay via UPI</h2>
                <div className="bg-gray-50 p-10 rounded-3xl inline-block border-2 border-black">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MisoSilver" alt="QR" className="mx-auto mb-4" />
                  <p className="text-[10px] font-bold uppercase text-gray-400">Scan QR Code to Pay</p>
                </div>
                <input type="text" placeholder="Enter UPI ID (e.g. name@okaxis)" className="block w-full border-b-2 py-4 text-center outline-none focus:border-black font-bold" />
              </div>
            )}

            {/* 4. CARD UI */}
            {step === 'card' && (
              <div className="animate-in zoom-in duration-300 space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2">Card Details</h2>
                <div className="space-y-4">
                  <input type="text" placeholder="Card Number" className="w-full border-b py-3 outline-none focus:border-black" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Expiry (MM/YY)" className="border-b py-3 outline-none focus:border-black" />
                    <input type="password" placeholder="CVV" className="border-b py-3 outline-none focus:border-black" />
                  </div>
                  <input type="text" placeholder="Cardholder Name" className="w-full border-b py-3 outline-none focus:border-black" />
                </div>
              </div>
            )}

            {/* 5. NET BANKING UI */}
            {step === 'netbanking' && (
              <div className="animate-in zoom-in duration-300 space-y-6">
                <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-2">Choose Your Bank</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {['HDFC', 'SBI', 'ICICI', 'AXIS', 'KOTAK', 'BOB'].map(bank => (
                    <button key={bank} className="p-4 border-2 border-gray-100 rounded-xl hover:border-black font-bold uppercase text-xs transition">{bank}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: SUMMARY (STAYS THE SAME) */}
          <div className="lg:w-1/3 bg-gray-50 p-8 h-fit rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-center text-xs font-bold uppercase">
                  <span>{item.name} x {item.qty}</span>
                  <span>Rs. {item.price * item.qty}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 font-black text-lg flex justify-between uppercase tracking-tighter">
              <span>Total</span>
              <span>Rs. {total}</span>
            </div>

            {/* DYNAMIC BUTTON LOGIC */}
            {step === 'shipping' ? (
              <button form="checkout-form" type="submit" className="w-full bg-black text-white py-4 mt-8 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <ShieldCheck size={18} /> Pay Securely
              </button>
            ) : (
              <button 
                onClick={() => {
                   if (step !== 'selection') {
                     // Simulate API call for final payment
                     setTimeout(() => navigate('/order-success'), 1500);
                   }
                }}
                disabled={step === 'selection'}
                className={`w-full py-4 mt-8 font-bold uppercase tracking-widest transition shadow-xl ${step === 'selection' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-zinc-800'}`}
              >
                {step === 'selection' ? 'Select a method' : `Confirm Payment Rs. ${total}`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;