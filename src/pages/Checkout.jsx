import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const Checkout = () => {
  const { cart, user } = useStore();
  const navigate = useNavigate();
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '',
    city: '',
    zip: '',
    phone: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      navigate('/order-success');
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold uppercase mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="underline">Go to Shop</button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="container mx-auto px-6 py-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 mb-8 hover:text-black">
          <ArrowLeft size={16} /> Back to Cart
        </button>

        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-10">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* LEFT: Shipping Form */}
          <div className="lg:w-2/3">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b pb-2">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-500">First Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Last Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Address</label>
                <input 
                  type="text" 
                  required
                  className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-500">City</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition"
                    value={formData.city}
                    onChange={e => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Postal Code</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition"
                    value={formData.zip}
                    onChange={e => setFormData({...formData, zip: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  className="w-full border-b border-gray-300 py-2 outline-none focus:border-black transition"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="lg:w-1/3 bg-gray-50 p-8 h-fit">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={item._id} className="flex justify-between items-start text-sm">
                  <div>
                    <p className="font-bold">{item.name} <span className="text-gray-500 font-normal">x {item.qty}</span></p>
                    <p className="text-xs text-gray-500">Silver</p>
                  </div>
                  <p className="font-medium">Rs. {item.price * item.qty}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>
            </div>

            <button 
              form="checkout-form"
              type="submit" 
              className="w-full bg-black text-white py-4 mt-8 font-bold uppercase tracking-widest hover:bg-gray-800 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} /> Pay Securely
            </button>
            
            <p className="text-[10px] text-gray-400 text-center mt-4">
              Secure SSL Encrypted Payment. We accept UPI, Cards, and Netbanking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;