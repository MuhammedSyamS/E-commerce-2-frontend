import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { io } from 'socket.io-client';

const AdminSupport = () => {
    const { user } = useStore();
    const { addToast } = useToast();

    // State
    const [viewMode, setViewMode] = useState('tickets'); // 'tickets' or 'contacts'
    const [tickets, setTickets] = useState([]);
    const [contacts, setContacts] = useState([]); // New state for contacts
    const [loading, setLoading] = useState(true);

    // Selection
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null); // New selection state

    // Reply Form
    const [reply, setReply] = useState('');
    const [statusUpdate, setStatusUpdate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();

        // --- SOCKET.IO ---
        const socket = io();

        socket.on('new-ticket', (data) => {
            addToast(`New Support Ticket: ${data.subject}`, "info");
            fetchData();
        });

        socket.on('new-contact', (data) => {
            addToast(`New Guest Inquiry: ${data.name}`, "info");
            fetchData();
        });

        return () => {
            socket.disconnect();
        };
    }, [viewMode, user?.token]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (viewMode === 'tickets') {
                const { data } = await api.get('/support/admin/all');
                setTickets(data);
            } else {
                const { data } = await api.get('/support/admin/contacts');
                setContacts(data);
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/support/${selectedTicket._id}`,
                { adminResponse: reply, status: statusUpdate || selectedTicket.status }
            );
            addToast("Ticket Updated", "success");
            setSelectedTicket(null);
            setReply('');
            fetchData();
        } catch (err) {
            addToast("Update Failed", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSelectTicket = async (ticket) => {
        setSelectedTicket(ticket);
        setStatusUpdate(ticket.status);
        setReply('');

        // Mark as read if not already
        if (!ticket.isReadByAdmin) {
            try {
                await api.put(`/support/${ticket._id}`,
                    { isReadByAdmin: true }
                );
                // Update local state to reflect read status
                setTickets(prev => prev.map(t => t._id === ticket._id ? { ...t, isReadByAdmin: true } : t));
            } catch (err) {
                console.error("Failed to mark ticket as read:", err);
            }
        }
    };

    const handleSelectContact = async (contact) => {
        setSelectedContact(contact);

        // Mark as read if not already (backend uses readByAdmin for contacts)
        if (!contact.readByAdmin && contact.status === 'New') {
            try {
                await api.put(`/support/admin/contacts/${contact._id}`,
                    { status: 'Read' }
                );
                // Update local state
                setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, readByAdmin: true, status: 'Read' } : c));
            } catch (err) {
                console.error("Failed to mark enquiry as read:", err);
            }
        }
    };

    if (loading && !tickets.length && !contacts.length) return <div className="p-10 text-center text-xs font-bold uppercase animate-pulse">Loading Dashboard...</div>;

    const openTickets = tickets.filter(t => t.status === 'Open').length;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Customer Care</p>
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter">Support <span className="text-zinc-300">Tickets</span></h1>
                </div>

                {/* TABS */}
                <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button
                        onClick={() => { setViewMode('tickets'); setSelectedContact(null); setSelectedTicket(null); }}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'tickets' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Tickets
                    </button>
                    <button
                        onClick={() => { setViewMode('contacts'); setSelectedTicket(null); setSelectedContact(null); }}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'contacts' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Inquiries
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* LIST */}
                <div className="lg:col-span-2 space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">

                    {viewMode === 'tickets' ? (
                        // TICKETS LIST
                        tickets.length > 0 ? tickets.map(ticket => (
                            <div key={ticket._id}
                                onClick={() => handleSelectTicket(ticket)}
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
                                <h3 className="font-bold text-sm mb-1 line-clamp-1">{ticket.subject}</h3>
                                <p className="text-xs text-zinc-500 mb-2">From: {ticket.user?.firstName}</p>
                                {!ticket.isReadByAdmin && <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase transition-all animate-pulse">New</span>}
                            </div>
                        )) : <div className="text-center py-10 text-zinc-400 text-xs">No tickets found.</div>
                    ) : (
                        // CONTACTS LIST
                        contacts.length > 0 ? contacts.map(contact => (
                            <div key={contact._id}
                                onClick={() => handleSelectContact(contact)}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${selectedContact?._id === contact._id ? 'border-black bg-zinc-50 ring-1 ring-black' : 'border-zinc-100 bg-white'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${contact.status === 'New' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                        {contact.status === 'New' ? 'New Inquiry' : 'Inquiry'}
                                    </span>
                                    <span className="text-[9px] font-bold text-zinc-400">{new Date(contact.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-bold text-sm mb-1 line-clamp-1">{contact.subject || 'No Subject'}</h3>
                                <p className="text-xs text-zinc-500 mb-2">From: {contact.name}</p>
                                {!contact.readByAdmin && <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold uppercase transition-all animate-pulse">New</span>}
                            </div>
                        )) : <div className="text-center py-10 text-zinc-400 text-xs">No inquiries found.</div>
                    )}
                </div>

                {/* DETAIL VIEW */}
                <div className="lg:col-span-2">
                    {viewMode === 'tickets' ? (
                        // TICKET DETAILS
                        selectedTicket ? (
                            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl sticky top-8 animation-fade-in">
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
                            <div className="h-64 flex items-center justify-center text-zinc-300 font-bold uppercase text-xs tracking-widest border-2 border-dashed border-zinc-100 rounded-3xl">
                                Select a ticket to manage
                            </div>
                        )
                    ) : (
                        // CONTACT DETAILS
                        selectedContact ? (
                            <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl sticky top-8 animation-fade-in">
                                <div className="mb-6 border-b border-zinc-100 pb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Guest Inquiry</p>
                                    <h3 className="font-black text-xl uppercase italic">{selectedContact.subject || 'No Subject'}</h3>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-zinc-400">Sender</label>
                                        <p className="font-medium text-sm">{selectedContact.name}</p>
                                        <p className="text-zinc-500 text-xs">{selectedContact.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold uppercase text-zinc-400">Date</label>
                                        <p className="font-medium text-xs">{new Date(selectedContact.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 mb-8">
                                    <label className="text-[9px] font-bold uppercase text-zinc-400 block mb-2">Message</label>
                                    <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap">
                                        {selectedContact.message}
                                    </p>
                                </div>

                                <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                                    className="block w-full text-center bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all">
                                    Reply via Email
                                </a>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-zinc-300 font-bold uppercase text-xs tracking-widest border-2 border-dashed border-zinc-100 rounded-3xl">
                                Select an inquiry to view
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSupport;

