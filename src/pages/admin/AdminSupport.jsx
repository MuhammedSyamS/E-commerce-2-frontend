import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';

const AdminSupport = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reply, setReply] = useState('');
    const [statusUpdate, setStatusUpdate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data } = await axios.get('/api/support/admin/all', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setTickets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.put(`/api/support/${selectedTicket._id}`,
                { adminResponse: reply, status: statusUpdate || selectedTicket.status },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            addToast("Ticket Updated", "success");
            setSelectedTicket(null);
            setReply('');
            fetchTickets();
        } catch (err) {
            addToast("Update Failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading Support Dashboard...</div>;

    const openTickets = tickets.filter(t => t.status === 'Open').length;

    return (
        <div>
            <div className="mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Customer Care</p>
                <h1 className="text-4xl font-black uppercase italic tracking-tighter">Support <span className="text-zinc-300">Desk</span></h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* LIST */}
                <div className="lg:col-span-2 space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
                    {tickets.map(ticket => (
                        <div key={ticket._id}
                            onClick={() => { setSelectedTicket(ticket); setStatusUpdate(ticket.status); setReply(''); }}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${selectedTicket?._id === ticket._id ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-zinc-100 bg-white'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${ticket.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                                    ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                        'bg-zinc-100 text-zinc-600'
                                    }`}>
                                    {ticket.status}
                                </span>
                                <span className="text-[9px] font-bold text-zinc-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="font-bold text-sm mb-1">{ticket.subject}</h3>
                            <p className="text-xs text-zinc-500 mb-2">From: {ticket.user?.firstName}</p>
                            {!ticket.isReadByAdmin && <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase">New</span>}
                        </div>
                    ))}
                </div>

                {/* DETAIL / REPLY */}
                <div className="lg:col-span-2">
                    {selectedTicket ? (
                        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl sticky top-8">
                            <h3 className="font-black text-xl uppercase italic mb-4">{selectedTicket.subject}</h3>
                            <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-6 text-sm leading-relaxed text-zinc-700">
                                {selectedTicket.message}
                            </div>

                            {selectedTicket.adminResponse && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 text-xs text-blue-800">
                                    <span className="font-bold uppercase block mb-1">Last Response:</span>
                                    {selectedTicket.adminResponse}
                                </div>
                            )}

                            <form onSubmit={handleUpdate} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 block mb-2">Update Status</label>
                                    <select className="w-full bg-zinc-50 p-3 rounded-xl font-bold text-xs uppercase"
                                        value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}>
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-zinc-400 block mb-2">Reply to User</label>
                                    <textarea className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-sm h-32 outline-none focus:border-black resize-none"
                                        placeholder="Type your response..."
                                        value={reply} onChange={e => setReply(e.target.value)} />
                                </div>
                                <button disabled={submitting} className="w-full bg-black text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs">
                                    {submitting ? 'Updating...' : 'Send Update'}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-zinc-300 font-bold uppercase text-xs tracking-widest border-2 border-dashed border-zinc-100 rounded-3xl">
                            Select a ticket to manage
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;
