import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, ChevronRight, ShoppingBag, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore'; // 1. Import your store

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useStore(); // 2. Access user from Zustand
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      // 3. Ensure user and token exist before fetching
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}` // 4. Use token from store
          }
        };
        
        // 5. URL matches your router.route('/myorders')
        const res = await axios.get('http://localhost:5000/api/orders/myorders', config);
        
        const data = Array.isArray(res.data) ? res.data : (res.data.orders || []);
        setOrders(data);
      } catch (err) {
        console.error("Fetch Error:", err.response?.data?.message || err.message);
        setOrders([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white pt-40">
      <Loader2 className="animate-spin text-black" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 pt-52 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic transform -skew-x-3">
            My <span className="text-zinc-300">Orders</span>
          </h1>
          <div className="h-1 w-20 bg-black mt-4"></div>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="border border-gray-100 p-8 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 hover:border-black transition duration-500 hover:shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-zinc-50 rounded-full">
                    <Package size={24} className="text-black" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reference</p>
                    <p className="font-black text-sm tracking-tighter">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-12">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                    <p className={`text-[10px] font-black uppercase mt-1 ${order.isDelivered ? 'text-green-600' : 'text-orange-500'}`}>
                      {order.isDelivered ? 'Delivered' : 'Processing'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount</p>
                    <p className="text-sm font-black uppercase">₹{order.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/order/${order._id}`)}
                  className="px-10 py-4 bg-black text-white font-black uppercase tracking-[0.2em] text-[10px] hover:bg-zinc-800 transition shadow-lg active:scale-95"
                >
                  Track Order
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
            <ShoppingBag size={48} className="mx-auto text-zinc-200 mb-6" />
            <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No orders found in history</p>
            <button onClick={() => navigate('/shop')} className="mt-8 bg-black text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px]">Start Shopping</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;