import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { io } from 'socket.io-client';

const AdminSupport = () => {
    const { user } = useStore();
    const { addToast } = useToast();

    // State
    const [viewMode, setViewMode] = useState('tickets'); // 'tickets', 'contacts', or 'chat'
    const [tickets, setTickets] = useState([]);
    const [contacts, setContacts] = useState([]); 
    const [activeChats, setActiveChats] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Selection
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [selectedContact, setSelectedContact] = useState(null); 
    const [selectedChat, setSelectedChat] = useState(null);

    // Reply Form
    const [reply, setReply] = useState('');
    const [chatMessage, setChatMessage] = useState('');
    const [statusUpdate, setStatusUpdate] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [currentTime, setCurrentTime] = useState(Date.now());
    
    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchData();

        // --- SOCKET.IO ---
        const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : window.location.origin;
        socketRef.current = io(socketUrl);

        socketRef.current.on('new-ticket', (data) => {
            addToast(`New Support Ticket: ${data.subject}`, "info");
            fetchData();
        });

        socketRef.current.on('new-contact', (data) => {
            addToast(`New Guest Inquiry: ${data.name}`, "info");
            fetchData();
        });

        socketRef.current.on('admin-receive-message', (msg) => {
            // Update active chats list
            setActiveChats(prev => {
                const existing = prev.find(c => c._id === msg.user);
                if (existing) {
                    return prev.map(c => c._id === msg.user ? { ...c, lastMessage: msg.message, lastChatAt: msg.createdAt, unreadCount: c.unreadCount + (msg.isAdmin ? 0 : 1) } : c);
                } else {
                    fetchActiveChats(); // Reload all if new chat
                    return prev;
                }
            });

            // Update history if current chat is selected
            if (selectedChat?._id === msg.user) {
                setChatHistory(prev => {
                    const isDuplicate = prev.some(m => m._id === msg._id || (m.tempId && m.tempId === msg.tempId));
                    if (isDuplicate) return prev;
                    return [...prev, msg];
                });
                api.put(`/chat/read/${msg.user}`);
            }
        });

        socketRef.current.on('chat-enabled', (data) => {
             // If we have an active chat list, refresh it to show the new expiry
             fetchActiveChats();
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, [viewMode, user?.token, selectedChat?._id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (viewMode === 'tickets') {
                const { data } = await api.get('/support/admin/all');
                setTickets(data);
            } else if (viewMode === 'contacts') {
                const { data } = await api.get('/support/admin/contacts');
                setContacts(data);
            } else {
                await fetchActiveChats();
            }
        } catch (err) {
            console.error(err);
            addToast("Failed to fetch data", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveChats = async () => {
        try {
            const { data } = await api.get('/chat/active');
            setActiveChats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectChat = async (chat) => {
        setSelectedChat(chat);
        setLoading(true);
        try {
            const { data } = await api.get(`/chat/history/${chat._id}`);
            setChatHistory(data);
            await api.put(`/chat/read/${chat._id}`);
            // Update local unread count
            setActiveChats(prev => prev.map(c => c._id === chat._id ? { ...c, unreadCount: 0 } : c));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSendChat = (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !selectedChat) return;

        const tempId = Date.now().toString();
        const optimisticMsg = {
            _id: tempId,
            tempId: tempId,
            user: selectedChat._id,
            sender: user._id,
            message: chatMessage,
            isAdmin: true,
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        // Add to history immediately
        setChatHistory(prev => [...prev, optimisticMsg]);

        const msgData = {
            userId: selectedChat._id,
            senderId: user._id,
            message: chatMessage,
            isAdmin: true,
            tempId: tempId
        };

        socketRef.current.emit('send-message', msgData);
        setChatMessage('');
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data } = await api.put(`/support/${selectedTicket._id}`,
                { adminResponse: reply, status: statusUpdate || selectedTicket.status }
            );
            addToast("Ticket Updated", "success");
            
            // Optimistic State Update
            setTickets(prev => prev.map(t => t._id === data._id ? data : t));
            
            setSelectedTicket(null);
            setReply('');
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

        if (!ticket.isReadByAdmin) {
            try {
                await api.put(`/support/${ticket._id}`, { isReadByAdmin: true });
                setTickets(prev => prev.map(t => t._id === ticket._id ? { ...t, isReadByAdmin: true } : t));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSelectContact = async (contact) => {
        setSelectedContact(contact);
        if (!contact.readByAdmin && contact.status === 'New') {
            try {
                await api.put(`/support/admin/contacts/${contact._id}`, { status: 'Read' });
                setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, readByAdmin: true, status: 'Read' } : c));
            } catch (err) {
                console.error(err);
            }
        }
    };

    if (loading && !tickets.length && !contacts.length && !activeChats.length) return <div className="p-10 text-center text-xs font-bold uppercase animate-pulse">Loading Support Desk...</div>;

    return (
        <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Omnichannel Support</p>
                    <h1 className="text-3xl font-black uppercase italic tracking-tighter">Support <span className="text-zinc-300">Desk</span></h1>
                </div>

                {/* TABS */}
                <div className="flex bg-zinc-100 p-1 rounded-xl">
                    <button
                        onClick={() => { setViewMode('tickets'); setSelectedChat(null); setSelectedTicket(null); setSelectedContact(null); fetchData(); }}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'tickets' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Tickets
                    </button>
                    <button
                        onClick={() => { setViewMode('contacts'); setSelectedChat(null); setSelectedTicket(null); setSelectedContact(null); fetchData(); }}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'contacts' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Inquiries
                    </button>
                    <button
                        onClick={() => { setViewMode('chat'); setSelectedChat(null); setSelectedTicket(null); setSelectedContact(null); fetchData(); }}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all relative ${viewMode === 'chat' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                    >
                        Live Chat
                        {activeChats.reduce((sum, c) => sum + c.unreadCount, 0) > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white ring-2 ring-zinc-100">
                                {activeChats.reduce((sum, c) => sum + c.unreadCount, 0)}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LIST */}
                <div className="lg:col-span-4 space-y-4 h-[75vh] overflow-y-auto pr-2 custom-scrollbar">

                    {viewMode === 'tickets' ? (
                        tickets.length > 0 ? tickets.map(ticket => (
                            <div key={ticket._id}
                                onClick={() => handleSelectTicket(ticket)}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${selectedTicket?._id === ticket._id ? 'border-black bg-zinc-50' : 'border-zinc-100 bg-white'}`}
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
                                <p className="text-xs text-zinc-500">From: {ticket.user?.firstName} {ticket.user?.lastName}</p>
                                {!ticket.isReadByAdmin && <span className="mt-2 inline-block text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">New</span>}
                            </div>
                        )) : <div className="text-center py-10 text-zinc-400 text-xs">No tickets found.</div>
                    ) : viewMode === 'contacts' ? (
                        contacts.length > 0 ? contacts.map(contact => (
                            <div key={contact._id}
                                onClick={() => handleSelectContact(contact)}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${selectedContact?._id === contact._id ? 'border-black bg-zinc-50' : 'border-zinc-100 bg-white'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${contact.status === 'New' ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                        {contact.status}
                                    </span>
                                    <span className="text-[9px] font-bold text-zinc-400">{new Date(contact.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="font-bold text-sm mb-1 line-clamp-1">{contact.subject || 'Inquiry'}</h3>
                                <p className="text-xs text-zinc-500">From: {contact.name}</p>
                                {!contact.readByAdmin && <span className="mt-2 inline-block text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">New</span>}
                            </div>
                        )) : <div className="text-center py-10 text-zinc-400 text-xs">No inquiries found.</div>
                    ) : (
                        // CHAT LIST
                        activeChats.length > 0 ? activeChats.map(chat => (
                                <div key={chat._id}
                                onClick={() => handleSelectChat(chat)}
                                className={`p-6 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${selectedChat?._id === chat._id ? 'border-black bg-zinc-50' : 'border-zinc-100 bg-white'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        {chat.user.chatEnabledUntil && new Date(chat.user.chatEnabledUntil).getTime() > currentTime ? (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-2 h-2 rounded-full bg-zinc-300"></div>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Locked</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400">{new Date(chat.lastChatAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="font-bold text-sm mb-1">{chat.user.firstName} {chat.user.lastName}</h3>
                                        <p className="text-xs text-zinc-400 truncate w-48">{chat.lastMessage}</p>
                                    </div>
                                    {chat.unreadCount > 0 && (
                                        <span className="w-5 h-5 bg-black text-white rounded-full text-[9px] flex items-center justify-center font-black">{chat.unreadCount}</span>
                                    )}
                                </div>
                            </div>
                        )) : <div className="text-center py-10 text-zinc-400 text-xs">No active chats.</div>
                    )}
                </div>

                {/* DETAIL VIEW */}
                <div className="lg:col-span-8">
                    {viewMode === 'tickets' ? (
                        selectedTicket ? (
                            <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-2xl h-full animate-in fade-in zoom-in">
                                <h3 className="font-black text-2xl uppercase italic mb-6 tracking-tighter">{selectedTicket.subject}</h3>
                                <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100 mb-10 text-sm leading-relaxed text-zinc-700">
                                    {selectedTicket.message}
                                </div>
                                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-black uppercase text-zinc-400 block mb-3 tracking-widest">Update Status</label>
                                            <select className="w-full bg-zinc-100 border-none p-4 rounded-2xl font-black text-[10px] uppercase outline-none focus:ring-2 ring-black transition-all"
                                                value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)}>
                                                <option value="Open">Open</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Resolved">Resolved</option>
                                                <option value="Closed">Closed</option>
                                            </select>
                                        </div>
                                        <button disabled={submitting} className="w-full bg-black text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10">
                                            {submitting ? 'Processing...' : 'Save Ticket Update'}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-zinc-400 block mb-3 tracking-widest">Admin Response</label>
                                        <textarea className="w-full bg-zinc-50 border border-zinc-100 p-6 rounded-3xl text-xs h-40 outline-none focus:border-black resize-none transition-all"
                                            placeholder="Write your response to the customer..."
                                            value={reply} onChange={e => setReply(e.target.value)} />
                                    </div>
                                </form>
                            </div>
                        ) : <EmptyState text="Select a ticket to manage" />
                    ) : viewMode === 'contacts' ? (
                        selectedContact ? (
                            <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-2xl h-full animate-in fade-in zoom-in">
                                <div className="mb-10 border-b border-zinc-100 pb-10">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Guest Enquiry</p>
                                    <h3 className="font-black text-3xl uppercase tracking-tighter italic">{selectedContact.subject || 'General Inquiry'}</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 block">Sender Name</label>
                                            <p className="font-black text-lg uppercase tracking-tight">{selectedContact.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 block">Email Address</label>
                                            <p className="font-bold text-sm text-zinc-500">{selectedContact.email}</p>
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-3 block">Message Payload</label>
                                        <p className="text-xs leading-loose text-zinc-600 font-medium italic">"{selectedContact.message}"</p>
                                    </div>
                                </div>
                                <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                                    className="inline-block bg-black text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:px-12 transition-all shadow-xl shadow-black/10">
                                    Reply via Email System
                                </a>
                            </div>
                        ) : <EmptyState text="Select an inquiry to view" />
                    ) : (
                        // CHAT INTERFACE
                        selectedChat ? (
                            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl h-[75vh] flex flex-col animate-in fade-in slide-in-from-right-10 overflow-hidden">
                                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg">
                                            {selectedChat.user.firstName[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-black uppercase tracking-tight">{selectedChat.user.firstName} {selectedChat.user.lastName}</h3>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedChat.user.email}</p>
                                        </div>
                                    </div>
                                    {selectedChat.user.chatEnabledUntil && new Date(selectedChat.user.chatEnabledUntil).getTime() > currentTime ? (
                                        <div className="px-4 py-2 bg-green-50 rounded-full flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-green-600">
                                                Active: {Math.max(0, Math.floor((new Date(selectedChat.user.chatEnabledUntil).getTime() - currentTime) / 1000))}s Left
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 bg-zinc-50 rounded-full flex items-center gap-2">
                                            <ShieldAlert className="text-zinc-400" size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Session Expired</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div ref={scrollRef} className="flex-grow p-10 overflow-y-auto space-y-6 custom-scrollbar bg-white">
                                    {chatHistory.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-5 rounded-3xl text-sm font-medium leading-relaxed ${
                                                msg.isAdmin ? 'bg-black text-white rounded-tr-none' : 'bg-zinc-100 text-black rounded-tl-none'
                                            }`}>
                                                {msg.message}
                                                <div className={`text-[8px] mt-2 uppercase font-black opacity-30 ${msg.isAdmin ? 'text-zinc-400' : 'text-zinc-500'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-8 border-t border-zinc-100 bg-white">
                                    <form onSubmit={handleSendChat} className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="Type your response..."
                                            className="flex-grow bg-zinc-50 border border-zinc-100 p-5 rounded-2xl text-xs font-bold outline-none focus:border-black transition-all"
                                            value={chatMessage}
                                            onChange={e => setChatMessage(e.target.value)}
                                        />
                                        <button className="bg-black text-white px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all">
                                            Send Msg
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ) : <EmptyState text="Start a live conversation" />
                    )}
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ text }) => (
    <div className="h-full min-h-[400px] flex items-center justify-center bg-zinc-50/50 rounded-[3rem] border-2 border-dashed border-zinc-100">
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-300 italic">{text}</p>
    </div>
);

export default AdminSupport;

