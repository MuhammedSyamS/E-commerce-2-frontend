import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { Package, Truck, Check, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const AdminOrders = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/orders/admin/all', config);
            setOrders(data);
        } catch (err) {
            console.error("Orders Error", err);
        } finally {
            setLoading(false);
        }
    };

    const [activeTab, setActiveTab] = useState('All');

    useEffect(() => {
        fetchOrders();
    }, [user.token]);

    // TRACKING MODAL STATE
    const [trackingModal, setTrackingModal] = useState({ open: false, orderId: null });
    const [trackingData, setTrackingData] = useState({ partner: '', trackingId: '' });

    const handleStatusChange = (orderId, newStatus) => {
        if (newStatus === 'Shipped') {
            setTrackingModal({ open: true, orderId });
        } else {
            updateStatus(orderId, newStatus);
        }
    };

    const confirmShipment = async () => {
        if (!trackingData.partner || !trackingData.trackingId) {
            addToast("Please enter Tracking Details", "error");
            return;
        }
        await updateStatus(trackingModal.orderId, 'Shipped', trackingData);
        setTrackingModal({ open: false, orderId: null });
        setTrackingData({ partner: '', trackingId: '' });
    };

    const updateStatus = async (id, status, extraData = {}) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status, ...extraData }, config);
            fetchOrders();
            addToast(`Order marked as ${status}`, "success");
        } catch (err) {
            addToast("Status update failed", "error");
        }
    };
    const deleteOrder = async (id) => {
        if (!window.confirm("Are you sure you want to delete this order?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/orders/${id}`, config);
            setOrders(orders.filter(o => o._id !== id));
            addToast("Order deleted", "success");
        } catch (err) {
            addToast("Delete failed", "error");
        }
    };

    const tabs = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

    const filteredOrders = orders.filter(order => {
        // Fallback for older orders without explicit status
        const s = order.orderStatus || (order.isDelivered ? 'Delivered' : order.isDispatched ? 'Shipped' : 'Pending');

        if (activeTab === 'All') return true;
        return s === activeTab;
    });

    return (
        <div className="relative">
            {/* TRACKING MODAL */}
            {trackingModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-zinc-50 rounded-full"><Truck size={24} /></div>
                            <div>
                                <h3 className="text-xl font-black italic uppercase">Ship Order</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Enter Tracking Details</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-zinc-400">Delivery Partner</label>
                                <input
                                    type="text"
                                    placeholder="e.g. FedEx, BlueDart"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 ring-black transition-all"
                                    value={trackingData.partner}
                                    onChange={(e) => setTrackingData({ ...trackingData, partner: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase tracking-widest ml-1 text-zinc-400">Tracking ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. TRK123456789"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 font-bold text-sm focus:ring-2 ring-black transition-all"
                                    value={trackingData.trackingId}
                                    onChange={(e) => setTrackingData({ ...trackingData, trackingId: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={() => setTrackingModal({ open: false, orderId: null })}
                                className="flex-1 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-zinc-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmShipment}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-lg shadow-black/20"
                            >
                                Confirm Shipment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mb-12">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Logistics</p>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Order <span className="text-zinc-300">Management</span></h1>
            </div>

            {/* TABS */}
            <div className="flex gap-4 mb-8 border-b border-zinc-100 pb-1 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-[10px] font-black uppercase tracking-widest py-2 px-4 rounded-full transition-all whitespace-nowrap ${activeTab === tab
                            ? 'bg-black text-white'
                            : 'text-zinc-400 hover:text-black hover:bg-zinc-50'
                            }`}
                    >
                        {tab}
                        <span className="ml-2 opacity-50 text-[8px]">
                            {/* Simple Count Badge */}
                            ({orders.filter(o => {
                                const s = o.orderStatus || (o.isDelivered ? 'Delivered' : o.isDispatched ? 'Shipped' : 'Pending');
                                if (tab === 'All') return true;
                                return s === tab;
                            }).length})
                        </span>
                    </button>
                ))}
            </div>

            <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                <th className="px-8 py-6">Order ID</th>
                                <th className="px-8 py-6">Items</th> {/* Added Items Column */}
                                <th className="px-8 py-6">Customer</th>
                                <th className="px-8 py-6">Date</th>
                                <th className="px-8 py-6">Total</th>
                                <th className="px-8 py-6">Payment</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filteredOrders.map(order => (
                                <tr key={order._id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-8 py-6 font-mono text-xs text-zinc-500">#{order._id.slice(-6)}</td>

                                    {/* Items Summary */}
                                    <td className="px-8 py-6">
                                        <div className="text-[10px] font-bold uppercase truncate max-w-[150px]" title={order.orderItems?.map(i => i.name).join(', ')}>
                                            {order.orderItems?.[0]?.name || 'No Items'}
                                            {order.orderItems?.length > 1 && <span className="text-zinc-400 ml-1">+{order.orderItems.length - 1} more</span>}
                                        </div>
                                    </td>

                                    <td className="px-8 py-6">
                                        <div className="text-xs font-bold uppercase">{order.user?.firstName || 'Guest'} {order.user?.lastName || ''}</div>
                                        <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wide">{order.user?.email || 'No Email'}</div>
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-6 text-sm font-black text-zinc-800">₹{order.totalPrice.toLocaleString()}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${order.isPaid ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                {order.isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                            <span className="text-[8px] font-mono text-zinc-400 uppercase">{order.paymentMethod}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-2">
                                            <div className="relative group/status w-fit">
                                                <select
                                                    value={order.orderStatus || (order.isDelivered ? 'Delivered' : order.isDispatched ? 'Shipped' : 'Pending')}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    className={`appearance-none pl-3 pr-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest cursor-pointer outline-none border border-transparent hover:border-zinc-200 transition-all ${(order.orderStatus === 'Cancelled' || order.orderStatus === 'Returned') ? 'bg-red-50 text-red-600' :
                                                        order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600' :
                                                            order.orderStatus === 'Shipped' ? 'bg-purple-50 text-purple-600' :
                                                                'bg-zinc-100 text-zinc-600'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Packed">Packed</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                    <option value="Returned">Returned</option>
                                                </select>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <Check size={12} className="opacity-50" />
                                                </div>
                                            </div>
                                            {order.trackingId && (
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md w-fit">
                                                    <Truck size={10} />
                                                    <span>{order.deliveryPartner}: {order.trackingId}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/order/${order._id}`} className="p-2 bg-white border border-zinc-100 rounded-lg hover:border-black transition-colors" title="View Details">
                                                <Eye size={14} />
                                            </Link>

                                            {/* Delete for Cancelled/Returned or cleanup */}
                                            {['Cancelled', 'Returned'].includes(order.orderStatus) && (
                                                <button onClick={() => deleteOrder(order._id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors" title="Delete Record">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
