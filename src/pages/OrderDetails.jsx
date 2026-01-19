import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Truck, MapPin } from 'lucide-react';

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock Data for UI Demo
  const order = {
    id: id || "ORD-8821",
    date: "Jan 18, 2026",
    status: "Shipped",
    total: 1798,
    items: [
      { name: "Eagle Adjustable Ring", price: 799, qty: 1, image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=200" },
      { name: "Batman Ring", price: 999, qty: 1, image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200" }
    ]
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-10">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-8 transition">
          <ArrowLeft size={16} /> Back to Orders
        </button>

        <div className="flex justify-between items-end border-b border-gray-100 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Order #{order.id}</h1>
            <p className="text-sm text-gray-500">Placed on {order.date}</p>
          </div>
          <span className="bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left: Items */}
          <div className="md:col-span-2 space-y-8">
            <h2 className="text-sm font-bold uppercase tracking-widest mb-4">Items</h2>
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4">
                <div className="w-20 h-24 bg-gray-100 rounded overflow-hidden">
                  <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                </div>
                <div className="flex-1 py-1">
                  <h3 className="font-bold text-sm uppercase">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">Qty: {item.qty}</p>
                  <p className="font-medium mt-2">Rs. {item.price}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Info */}
          <div className="bg-gray-50 p-6 rounded-xl h-fit">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Delivery Details</h2>
            
            <div className="flex gap-3 mb-6">
              <MapPin size={18} className="text-gray-400 mt-1" />
              <div className="text-sm text-gray-600">
                <p className="font-bold text-black mb-1">Shipping Address</p>
                <p>Sonia Fan</p>
                <p>123 Fashion Street</p>
                <p>Varkala, Kerala, 695141</p>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <Truck size={18} className="text-gray-400 mt-1" />
              <div className="text-sm text-gray-600">
                <p className="font-bold text-black mb-1">Shipping Method</p>
                <p>Express Delivery</p>
                <p className="text-xs text-green-600 font-bold mt-1">Tracking: TRK-990231</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
               <div className="flex justify-between font-black text-lg">
                 <span>Total</span>
                 <span>Rs. {order.total}</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;