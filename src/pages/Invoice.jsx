import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { Loader2 } from 'lucide-react';

const Invoice = () => {
    const { id } = useParams();
    const { user } = useStore();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // If user is not logged in, they can't view (unless we add a public token system later)
                if (!user?.token) {
                    setError("Please login to view invoice");
                    setLoading(false);
                    return;
                }

                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
            } catch (err) {
                console.error(err);
                setError("Invoice not found or unauthorized");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, user]);

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin" size={40} />
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen text-red-500 font-bold uppercase">
            {error}
        </div>
    );

    if (!order) return null;

    return (
        <div className="max-w-3xl mx-auto p-10 bg-white min-h-screen text-zinc-900 font-sans print:p-0">
            {/* HEADER */}
            <div className="flex justify-between items-start mb-10 border-b border-zinc-900 pb-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">HighPhaus</h1>
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Premium Streetwear</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold uppercase tracking-widest text-zinc-300">Invoice</h2>
                    <p className="font-mono text-sm font-bold mt-2">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </div>

            {/* BILL TO / SHIP TO */}
            <div className="grid grid-cols-2 gap-10 mb-12">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Billed To</h3>
                    <p className="font-bold">{order.user?.firstName} {order.user?.lastName}</p>
                    <p className="text-sm text-zinc-600">{order.user?.email}</p>
                    <p className="text-sm text-zinc-600 capitalize">{order.paymentMethod} Payment</p>
                </div>
                <div className="text-right">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Shipped To</h3>
                    <p className="font-bold">{order.shippingAddress.address}</p>
                    <p className="text-sm text-zinc-600">
                        {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    </p>
                    <p className="text-sm text-zinc-600">Tel: {order.shippingAddress.phone}</p>
                </div>
            </div>

            {/* ITEMS */}
            <div className="mb-10">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-zinc-200">
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">Item</th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Qty</th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Price</th>
                            <th className="py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4">
                                    <p className="font-bold text-sm">{item.name}</p>
                                    {item.selectedVariant && (
                                        <p className="text-xs text-zinc-500">
                                            Size: {item.selectedVariant.size} | Color: {item.selectedVariant.color}
                                        </p>
                                    )}
                                </td>
                                <td className="py-4 text-right font-mono text-sm">{item.qty}</td>
                                <td className="py-4 text-right font-mono text-sm">₹{item.price.toLocaleString()}</td>
                                <td className="py-4 text-right font-mono font-bold text-sm">₹{(item.price * item.qty).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* TOTALS */}
            <div className="flex justify-end mb-12">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Subtotal</span>
                        <span className="font-mono">₹{order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0).toLocaleString()}</span>
                    </div>
                    {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Discount</span>
                            <span className="font-mono">-₹{order.discountAmount.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Shipping</span>
                        <span className="font-mono">₹{order.shippingPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl font-black border-t border-zinc-900 pt-2 mt-2">
                        <span>Total</span>
                        <span>₹{order.totalPrice.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="text-center border-t border-zinc-100 pt-8 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-black text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition shadow-lg"
                >
                    Print Invoice
                </button>
            </div>
            <div className="text-center text-[10px] text-zinc-400 mt-8 hidden print:block">
                Thank you for shopping with HighPhaus. Needs help? Contact support@highphaus.com
            </div>
        </div>
    );
};

export default Invoice;
