import React, { useState } from 'react';
import axios from 'axios';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Search, ChevronDown, MessageCircle, Mail, Phone, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const SupportHub = () => {
    const [search, setSearch] = useState('');
    const [activeFAQ, setActiveFAQ] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useStore();
    const { addToast } = useToast();

    const [ticketData, setTicketData] = useState({ subject: '', message: '' });
    const [showForm, setShowForm] = useState(false);

    // TRACKING STATE
    const [trackId, setTrackId] = useState('');
    const [trackEmail, setTrackEmail] = useState('');
    const [trackResult, setTrackResult] = useState(null);
    const [isTracking, setIsTracking] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        setIsTracking(true);
        setTrackResult(null);
        try {
            const { data } = await axios.get(`/api/returns/track/${trackId}?email=${trackEmail}`);
            setTrackResult(data);
        } catch (err) {
            addToast(err.response?.data?.message || 'Tracking failed', 'error');
        } finally {
            setIsTracking(false);
        }
    };

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        if (!user) return addToast('Please login to submit a ticket', 'error');

        setIsSubmitting(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('/api/support', ticketData, config);
            addToast('Ticket submitted successfully! Our team will reach out.', 'success');
            setShowForm(false);
            setTicketData({ subject: '', message: '' });
        } catch (err) {
            addToast('Failed to submit ticket', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const faqs = [
        { q: "How do I track my order?", a: "Once your order is shipped, you will receive a tracking ID via email and SMS. You can also track it in the 'My Orders' section of your account.", cat: "Ordering" },
        { q: "What is your return policy?", a: "We offer a 7-day hassle-free return and exchange policy for most items. Items must be unworn and in original packaging.", cat: "Returns" },
        { q: "How do loyalty points work?", a: "SLOOK Coins are earned on every purchase (₹100 = 1 Coin). You can redeem them at checkout to save on your next order.", cat: "Loyalty" },
        { q: "Do you ship internationally?", a: "Currently, we ship only within India. We are working on expanding our reach globally soon!", cat: "Shipping" },
        { q: "Can I cancel my order?", a: "Orders can be cancelled before they are shipped. Visit 'My Orders' to see the cancellation option.", cat: "Ordering" }
    ];

    const filteredFAQs = faqs.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.cat.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white min-h-screen pt-44 md:pt-52 pb-20">
            <Helmet>
                <title>Support Hub | SLOOK</title>
            </Helmet>

            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6">
                        Support <span className="text-zinc-300">Hub</span>
                    </h1>
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">How can we help you today?</p>
                </div>

                {/* --- TRACKING WIDGET --- */}
                <div className="mb-16 bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group">
                    <div className="relative z-10 max-w-2xl mx-auto text-center">
                        <h2 className="text-xl font-black uppercase tracking-widest mb-2 flex items-center justify-center gap-3">
                            <ExternalLink size={20} className="text-zinc-300" /> Track Your Request
                        </h2>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">Enter Return ID & Email to view Status</p>

                        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-4">
                            <input
                                type="text"
                                placeholder="Return ID (e.g. 65cba...)"
                                className="flex-1 bg-white border border-zinc-200 rounded-2xl p-4 text-xs font-bold outline-none focus:border-black transition-all"
                                value={trackId}
                                onChange={e => setTrackId(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Order Email"
                                className="flex-1 bg-white border border-zinc-200 rounded-2xl p-4 text-xs font-bold outline-none focus:border-black transition-all"
                                value={trackEmail}
                                onChange={e => setTrackEmail(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isTracking}
                                className="px-10 py-4 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isTracking ? <Loader2 className="animate-spin" size={14} /> : 'Track'}
                            </button>
                        </form>

                        {trackResult && (
                            <div className="mt-8 text-left bg-white border border-zinc-100 rounded-3xl p-8 animate-in fade-in slide-in-from-top-4 shadow-xl shadow-black/5">
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-zinc-50">
                                    <div>
                                        <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Live Status</p>
                                        <h3 className="text-2xl font-black uppercase tracking-tighter text-black">{trackResult.status}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Request Ref</p>
                                        <p className="text-[10px] font-black font-mono">{trackId.slice(-6).toUpperCase()}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {trackResult.timeline.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 group">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-black scale-125' : 'bg-zinc-200'}`}></div>
                                                {idx !== trackResult.timeline.length - 1 && <div className="w-[1px] h-full bg-zinc-100 my-1"></div>}
                                            </div>
                                            <div className="pb-2">
                                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${idx === 0 ? 'text-black' : 'text-zinc-400'}`}>{item.status}</p>
                                                <p className="text-xs font-medium text-zinc-500 mt-1 leading-tight">{item.note}</p>
                                                <p className="text-[8px] text-zinc-300 font-bold mt-2 uppercase">{new Date(item.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- SEARCH BAR --- */}
                <div className="relative mb-16 group">
                    <div className="absolute inset-y-0 left-6 flex items-center text-zinc-300 group-focus-within:text-black transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search keywords (e.g. returns, points, shipping)..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-3xl py-6 pl-16 pr-8 text-sm font-bold outline-none focus:border-black transition-all"
                    />
                </div>

                {/* --- QUICK CONTACT --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: <MessageCircle />, title: "Live Chat", sub: "Avg. response: 5 mins", action: "Chat Now", color: "bg-blue-50 text-blue-600" },
                        { icon: <Mail />, title: "Email Us", sub: "help.slook@gmail.com", action: "Send Email", color: "bg-amber-50 text-amber-600" },
                        { icon: <Phone />, title: "Call Hub", sub: "+91 800-SLOOK-IT", action: "Call Now", color: "bg-green-50 text-green-600" }
                    ].map((item, i) => (
                        <div key={i} className="p-8 border border-zinc-100 rounded-[2rem] hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${item.color}`}>
                                {item.icon}
                            </div>
                            <h3 className="font-black uppercase tracking-tight text-lg mb-1">{item.title}</h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-6">{item.sub}</p>
                            <button className="text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4 group-hover:text-black text-zinc-400 transition-colors">
                                {item.action}
                            </button>
                        </div>
                    ))}
                </div>

                {/* --- FAQS --- */}
                <div className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-tighter mb-8">Frequent Questions</h2>
                    {filteredFAQs.map((faq, i) => (
                        <div key={i} className="border border-zinc-100 rounded-2xl overflow-hidden">
                            <button
                                onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                                className="w-full p-6 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
                            >
                                <div className="flex gap-4 items-center">
                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-100 rounded text-zinc-500">{faq.cat}</span>
                                    <span className="text-xs font-bold uppercase tracking-wide">{faq.q}</span>
                                </div>
                                <ChevronDown size={16} className={`transition-transform duration-300 ${activeFAQ === i ? 'rotate-180' : ''}`} />
                            </button>
                            {activeFAQ === i && (
                                <div className="px-6 pb-6 animate-in slide-in-from-top-2">
                                    <p className="text-sm text-zinc-500 leading-relaxed font-medium pl-4 border-l-2 border-black">
                                        {faq.a}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- FOOTER CTA --- */}
                <div className="mt-20 p-10 bg-black rounded-[2.5rem] text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ShieldCheck size={120} />
                    </div>
                    <h2 className="text-2xl font-black uppercase mb-4">Still need help?</h2>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-8">Our expert concierge team is available 24/7</p>

                    {!showForm ? (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-white text-black px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-zinc-100 transition-transform active:scale-95"
                        >
                            Contact Concierge
                        </button>
                    ) : (
                        <form onSubmit={handleTicketSubmit} className="max-w-md mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4">
                            <input
                                type="text"
                                placeholder="Subject"
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-zinc-500"
                                value={ticketData.subject}
                                onChange={e => setTicketData({ ...ticketData, subject: e.target.value })}
                            />
                            <textarea
                                placeholder="Tell us more about your issue..."
                                required
                                rows="4"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs font-bold text-white outline-none focus:border-zinc-500 resize-none"
                                value={ticketData.message}
                                onChange={e => setTicketData({ ...ticketData, message: e.target.value })}
                            />
                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-white text-black py-4 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Submit Ticket'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-8 border border-zinc-800 rounded-full font-black uppercase text-[10px] tracking-widest text-zinc-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SupportHub;
