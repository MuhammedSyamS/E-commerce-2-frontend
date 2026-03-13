import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/instance';
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
                if (!user?.token) {
                    setError("Please login to view invoice");
                    setLoading(false);
                    return;
                }
                const { data } = await api.get(`/orders/${id}`);
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
        <div className="flex items-center justify-center min-h-screen bg-zinc-50">
            <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-screen text-red-500 text-xs font-bold uppercase tracking-widest">
            {error}
        </div>
    );

    if (!order) return null;

    const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price || 0) * (item.qty || 0), 0);
    const invoiceNo = `SLK-${order._id.slice(-8).toUpperCase()}`;
    const orderDate = new Date(order.createdAt);
    const paidDate = order.paidAt ? new Date(order.paidAt) : null;

    return (
        <div className="min-h-screen bg-zinc-100 flex items-start justify-center py-8 px-4 print:bg-white print:py-0 print:px-0">
            <div className="w-full max-w-[580px] bg-white shadow-xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">

                {/* ── HEADER ── */}
                <div className="bg-zinc-950 text-white px-6 py-5 flex justify-between items-center print:bg-black">
                    <div>
                        <h1 className="text-xl font-black uppercase tracking-tight italic">SLOOK</h1>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-zinc-400 mt-0.5 font-bold">Premium E-Commerce Studio</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Tax Invoice / Bill of Supply</p>
                        <p className="text-xs font-black font-mono mt-0.5">#{invoiceNo}</p>
                    </div>
                </div>

                {/* ── COMPANY TAX INFO (MNC STYLE) ── */}
                <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-100 grid grid-cols-2 gap-4">
                    <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider space-y-0.5">
                        <p>GSTIN: <span className="text-zinc-800">27AAAAA0000A1Z5</span></p>
                        <p>PAN: <span className="text-zinc-800">AAAAA0000A</span></p>
                    </div>
                    <div className="text-right text-[8px] text-zinc-500 font-bold uppercase tracking-wider space-y-0.5">
                        <p>Place of Supply: <span className="text-zinc-800">{order.shippingAddress.city.toUpperCase()}</span></p>
                        <p>Reverse Charge: <span className="text-zinc-800">NO</span></p>
                    </div>
                </div>

                {/* ── META BAR ── */}
                <div className="grid grid-cols-3 bg-zinc-50 border-b border-zinc-100 text-center divide-x divide-zinc-200">
                    <div className="py-2.5 px-3">
                        <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400">Order Date</p>
                        <p className="text-[10px] font-bold mt-0.5">{orderDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div className="py-2.5 px-3">
                        <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400">Payment</p>
                        <p className="text-[10px] font-bold mt-0.5 uppercase">{order.paymentMethod}</p>
                    </div>
                    <div className="py-2.5 px-3">
                        <p className="text-[7px] font-black uppercase tracking-widest text-zinc-400">Status</p>
                        <p className={`text-[10px] font-bold mt-0.5 uppercase ${order.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.isPaid ? 'Paid' : 'Pending'}
                        </p>
                    </div>
                </div>

                {/* ── BILL TO / SHIP TO ── */}
                <div className="grid grid-cols-2 gap-4 px-6 py-4 border-b border-zinc-100">
                    <div>
                        <h3 className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Billed To</h3>
                        <p className="text-xs font-bold leading-tight">{order.user?.firstName} {order.user?.lastName}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{order.user?.email}</p>
                        {order.user?.phone && <p className="text-[10px] text-zinc-500">{order.user.phone}</p>}
                    </div>
                    <div className="text-right">
                        <h3 className="text-[7px] font-black uppercase tracking-widest text-zinc-400 mb-1.5">Ship To</h3>
                        <p className="text-xs font-bold leading-tight">{order.shippingAddress.address}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p className="text-[10px] text-zinc-500">{order.shippingAddress.phone}</p>
                    </div>
                </div>

                {/* ── ITEMS TABLE ── */}
                <div className="px-6 py-4">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-200">
                                <th className="text-left py-2 text-[7px] font-black uppercase tracking-widest text-zinc-400 w-[10%]">#</th>
                                <th className="text-left py-2 text-[7px] font-black uppercase tracking-widest text-zinc-400">Description</th>
                                <th className="text-center py-2 text-[7px] font-black uppercase tracking-widest text-zinc-400 w-[12%]">HSN</th>
                                <th className="text-center py-2 text-[7px] font-black uppercase tracking-widest text-zinc-400 w-[10%]">Qty</th>
                                <th className="text-right py-2 text-[7px] font-black uppercase tracking-widest text-zinc-400 w-[18%]">Rate</th>
                                <th className="text-right py-2 text-[7px] font-black uppercase tracking-widest text-zinc-400 w-[18%]">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {order.orderItems.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-2.5 text-[10px] text-zinc-400 font-mono">{String(index + 1).padStart(2, '0')}</td>
                                    <td className="py-2.5">
                                        <p className="text-[10px] font-bold leading-tight">{item.name}</p>
                                        {item.selectedVariant && (
                                            <p className="text-[8px] text-zinc-400 mt-0.5">
                                                {item.selectedVariant.size && `Size: ${item.selectedVariant.size}`}
                                                {item.selectedVariant.size && item.selectedVariant.color && ' · '}
                                                {item.selectedVariant.color && `Color: ${item.selectedVariant.color}`}
                                            </p>
                                        )}
                                    </td>
                                    <td className="py-2.5 text-center text-[9px] font-mono text-zinc-400">610910</td>
                                    <td className="py-2.5 text-center text-[10px] font-mono font-bold">{item.qty}</td>
                                    <td className="py-2.5 text-right text-[10px] font-mono">₹{(item.price || 0).toLocaleString()}</td>
                                    <td className="py-2.5 text-right text-[10px] font-mono font-bold">₹{((item.price || 0) * (item.qty || 0)).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── TOTALS ── */}
                <div className="px-6 pb-4">
                    <div className="ml-auto w-56 space-y-1.5 border-t border-zinc-200 pt-3">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">Subtotal</span>
                            <span className="font-mono">₹{subtotal.toLocaleString()}</span>
                        </div>
                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-[10px] text-emerald-600">
                                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                                <span className="font-mono">-₹{(order.discountAmount || 0).toLocaleString()}</span>
                            </div>
                        )}
                        {order.loyaltyPointsUsed > 0 && (
                            <div className="flex justify-between text-[10px] text-purple-600">
                                <span>SLOOK Coins ({order.loyaltyPointsUsed})</span>
                                <span className="font-mono">-₹{(order.loyaltyDiscount || 0).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">Shipping</span>
                            <span className="font-mono">{(order.shippingPrice || 0) === 0 ? 'FREE' : `₹${(order.shippingPrice || 0).toLocaleString()}`}</span>
                        </div>
                        {order.taxPrice > 0 && (
                            <div className="flex justify-between text-[10px]">
                                <span className="text-zinc-500">Tax (GST)</span>
                                <span className="font-mono">₹{(order.taxPrice || 0).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm font-black border-t-2 border-zinc-900 pt-2 mt-2">
                            <span className="uppercase tracking-wider">Grand Total</span>
                            <span className="font-mono">₹{(order.totalPrice || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* ── PAYMENT INFO ── */}
                {order.isPaid && (
                    <div className="mx-6 mb-4 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                        <div>
                            <p className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Payment Confirmed</p>
                            <p className="text-[10px] font-bold text-emerald-700 mt-0.5">
                                {paidDate?.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {paidDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        {order.paymentResult?.id && (
                            <p className="text-[9px] font-mono text-emerald-500 font-bold">TXN: {order.paymentResult.id.slice(-12)}</p>
                        )}
                    </div>
                )}

                {/* ── ORDER STATUS ── */}
                <div className="mx-6 mb-4 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                    <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Order Status</p>
                        <p className={`text-[10px] font-bold mt-0.5 uppercase ${
                            order.orderStatus === 'Delivered' ? 'text-emerald-600' :
                            order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned' ? 'text-red-600' :
                            'text-zinc-700'
                        }`}>{order.orderStatus || 'Processing'}</p>
                    </div>
                    {order.isDelivered && order.deliveredAt && (
                        <p className="text-[9px] text-zinc-400 font-bold">
                            Delivered: {new Date(order.deliveredAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                    )}
                </div>

                {/* ── FOOTER ── */}
                {/* ── FOOTER (MNC STYLE) ── */}
                <div className="bg-zinc-50 border-t border-zinc-100 px-6 py-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Registered Office</p>
                            <p className="text-[9px] font-bold leading-relaxed text-zinc-600">
                                SLOOK FASHION PRIVATE LIMITED<br />
                                102, Premium Heights, Business District<br />
                                Mumbai, Maharashtra - 400001
                            </p>
                        </div>
                        <div className="text-right space-y-4">
                            <div>
                                <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Authorized Signatory</p>
                                <div className="h-10 w-32 ml-auto mb-1 border-b border-zinc-200 flex items-end justify-center">
                                    <p className="text-[9px] font-mono italic text-zinc-400 pb-1">SLOOK Digital Sign</p>
                                </div>
                                <p className="text-[8px] text-zinc-400 font-bold uppercase">For SLOOK FASHION PVT. LTD.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-zinc-200 flex justify-between items-center opacity-50">
                        <p className="text-[7px] font-bold uppercase tracking-widest">support@slook.in • www.slook.in</p>
                        <p className="text-[7px] text-zinc-400 uppercase tracking-widest">Computer Generated - No Signature Required</p>
                    </div>
                </div>

                {/* ── PRINT BUTTON ── */}
                <div className="text-center py-4 border-t border-zinc-100 print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="bg-zinc-900 text-white px-6 py-2.5 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-black transition shadow-lg hover:shadow-xl"
                    >
                        Download / Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
