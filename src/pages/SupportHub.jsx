import React, { useState } from 'react';
import api from '../api/instance';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import { Search, ChevronDown, MessageCircle, Mail, Phone, ShieldCheck, Loader2, Send } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import ChatWidget from '../components/ChatWidget';

const SupportHub = () => {
    const [search, setSearch] = useState('');
    const [activeFAQ, setActiveFAQ] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const { user } = useStore();
    const { addToast } = useToast();

    const [ticketData, setTicketData] = useState({ subject: '', message: '' });
    const [showForm, setShowForm] = useState(false);

    React.useEffect(() => {
        const handleOpenChat = () => setIsChatOpen(true);
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    const handleTicketSubmit = async (e) => {
        e.preventDefault();
        if (!user) return addToast('Please login to submit a ticket', 'error');

        setIsSubmitting(true);
        try {
            await api.post('/support', ticketData);
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
        { q: "Do you ship internationally?", a: "Currently, we ship only within India. We are working on expanding our reach globally soon!", cat: "Shipping" },
        { q: "Can I cancel my order?", a: "Orders can be cancelled before they are shipped. Visit 'My Orders' to see the cancellation option.", cat: "Ordering" }
    ];

    const filteredFAQs = faqs.filter(f =>
        f.q.toLowerCase().includes(search.toLowerCase()) ||
        f.cat.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white min-h-screen pt-44 md:pt-52 pb-20 overflow-x-hidden">
            <Helmet>
                <title>Support Hub | SLOOK</title>
            </Helmet>

            <div className="container mx-auto px-6 max-w-4xl relative">
                <div className="text-center mb-16">
                    <div className="w-fit mx-auto px-3 py-1 bg-zinc-100 rounded-full mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold text-zinc-500 font-inter">Live agents online</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 leading-none">
                        Support <span className="text-zinc-200">Hub</span>
                    </h1>
                    <p className="text-[11px] font-bold text-zinc-400 font-inter">Resolution Redefined</p>
                </div>

                {/* --- SEARCH BAR --- */}
                <div className="relative mb-20 group max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-8 flex items-center text-zinc-300 group-focus-within:text-black transition-colors">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search keywords (e.g. returns, points, shipping)..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-zinc-50/50 backdrop-blur-sm border border-zinc-100 rounded-[2.5rem] py-8 pl-18 pr-8 text-sm font-bold outline-none focus:border-black focus:bg-white transition-all shadow-sm focus:shadow-xl focus:shadow-black/5"
                    />
                </div>

                {/* --- QUICK CONTACT --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {[
                        { 
                            icon: <MessageCircle strokeWidth={2.5} />, 
                            title: "Live Chat", 
                            sub: "Direct response", 
                            action: "Open Chat", 
                            color: "bg-black text-white", 
                            onClick: () => {
                                const currentExpiry = user?.chatEnabledUntil ? new Date(user.chatEnabledUntil).getTime() : 0;
                                const isChatActive = currentExpiry > Date.now();
                                if (isChatActive) {
                                    setIsChatOpen(true);
                                } else {
                                    document.getElementById('still-need-help')?.scrollIntoView({ behavior: 'smooth' });
                                    addToast("Please submit a ticket to unlock live chat", "info");
                                }
                            }
                        },
                        { 
                            icon: <Mail strokeWidth={2.5} />, 
                            title: "Email Us", 
                            sub: "24h SLA", 
                            action: "Send Email", 
                            color: "bg-zinc-100 text-black", 
                            href: "mailto:help.slook@gmail.com" 
                        },
                        { 
                            icon: <Phone strokeWidth={2.5} />, 
                            title: "Voice Hub", 
                            sub: "9am - 9pm", 
                            action: "Call Now", 
                            color: "bg-zinc-100 text-black", 
                            href: "tel:+918007566548" 
                        }
                    ].map((item, i) => (
                        <div key={i} 
                            onClick={item.onClick}
                            className={`p-10 rounded-[2.5rem] border border-zinc-100 hover:shadow-2xl hover:shadow-black/5 transition-all cursor-pointer group flex flex-col items-center text-center ${item.color.includes('bg-black') ? 'bg-black text-white' : 'bg-white hover:border-black'}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transform group-hover:scale-110 transition-transform ${item.color.includes('bg-black') ? 'bg-zinc-800' : 'bg-zinc-100'}`}>
                                {item.icon}
                            </div>
                            <h3 className="font-black text-xl mb-1">{item.title}</h3>
                            <p className={`text-[11px] font-bold mb-8 font-inter ${item.color.includes('bg-black') ? 'text-zinc-500' : 'text-zinc-400'}`}>{item.sub}</p>
                            
                            {item.href ? (
                                <a href={item.href} className={`text-[10px] font-black font-inter py-3 px-6 rounded-full border transition-all ${item.color.includes('bg-black') ? 'border-zinc-800 hover:bg-white hover:text-black' : 'border-zinc-100 hover:border-black'}`}>
                                    {item.action}
                                </a>
                            ) : (
                                <button className={`text-[10px] font-black font-inter py-3 px-6 rounded-full border transition-all ${item.color.includes('bg-black') ? 'border-zinc-800 hover:bg-white hover:text-black' : 'border-zinc-100 hover:border-black'}`}>
                                    {item.action}
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* --- FAQS --- */}
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Helpful <span className="text-zinc-300">Topics</span></h2>
                            <p className="text-[10px] font-bold text-zinc-400 font-inter">Self-service resources</p>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 font-inter">{filteredFAQs.length} matching articles</p>
                    </div>

                    <div className="space-y-4">
                        {filteredFAQs.map((faq, i) => (
                            <div key={i} className="group border border-zinc-100 rounded-[2rem] overflow-hidden bg-white hover:border-black transition-all">
                                <button
                                    onClick={() => setActiveFAQ(activeFAQ === i ? null : i)}
                                    className="w-full p-8 flex items-center justify-between text-left"
                                >
                                    <div className="flex gap-6 items-center">
                                        <span className="text-[8px] font-black uppercase px-2 py-1 bg-zinc-50 rounded text-zinc-400 group-hover:bg-black group-hover:text-white transition-colors">{faq.cat}</span>
                                        <span className="text-sm font-bold font-inter">{faq.q}</span>
                                    </div>
                                    <ChevronDown size={18} className={`text-zinc-300 transition-transform duration-500 ${activeFAQ === i ? 'rotate-180 text-black' : ''}`} />
                                </button>
                                {activeFAQ === i && (
                                    <div className="px-8 pb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                                        <div className="pl-6 border-l-2 border-zinc-100 py-2">
                                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                                {faq.a}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- CHAT OVERLAY --- */}
                <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

                {/* --- FOOTER CTA --- */}
                <div id="still-need-help" className="mt-32 p-16 bg-[#0a0a0a] rounded-[3.5rem] text-center text-white relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                        <ShieldCheck size={300} />
                    </div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-none">Can't find what <br/> you need?</h2>
                        <p className="text-[11px] font-bold text-zinc-600 mb-12 font-inter">Open a high-priority support ticket</p>

                        {!showForm ? (
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-white text-black px-12 py-5 rounded-full font-bold text-[11px] hover:bg-zinc-100 transition-all hover:px-14 shadow-2xl shadow-white/10 font-inter border-none"
                            >
                                Contact Support
                            </button>
                        ) : (
                            <form onSubmit={handleTicketSubmit} className="max-w-md mx-auto space-y-4 animate-in fade-in zoom-in duration-500">
                                <input
                                    type="text"
                                    placeholder="Enter Issue Subject"
                                    required
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-xs font-bold text-white outline-none focus:border-zinc-600 transition-all"
                                    value={ticketData.subject}
                                    onChange={e => setTicketData({ ...ticketData, subject: e.target.value })}
                                />
                                <div className="relative">
                                    <textarea
                                        placeholder="Describe your issue in detail..."
                                        required
                                        rows="5"
                                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 text-xs font-bold text-white outline-none focus:border-zinc-600 transition-all resize-none"
                                        value={ticketData.message}
                                        onChange={e => setTicketData({ ...ticketData, message: e.target.value })}
                                    />
                                    <div className="absolute bottom-4 right-4 text-[8px] font-black uppercase text-zinc-700">Min 20 characters</div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-white text-black py-5 rounded-full font-bold text-[11px] flex items-center justify-center gap-2 hover:bg-zinc-100 transition-all font-inter border-none"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : 'Submit Now'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-10 border border-zinc-800 rounded-full font-bold text-[11px] text-zinc-500 hover:border-zinc-600 transition-all font-inter"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

            </div>
        </div >
    );
};

export default SupportHub;
