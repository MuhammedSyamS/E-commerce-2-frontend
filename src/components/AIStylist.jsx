import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, ShoppingBag } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Price from './Price';
import { useToast } from '../context/ToastContext';

const AIStylist = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: "Hello elite! I'm your SLOOK AI Stylist. Tell me what you're looking for (e.g., 'Wedding outfit', 'Minimalist black sneakers', or 'Summer trends')." }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const { success } = useToast();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/ai/stylist', { query: input });
            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.text,
                recommendations: data.recommendations
            }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', content: "Stylist is momentarily unavailable. Please try again." }]);
        } finally {
            setLoading(true);
            // Artificial delay for "Elite" feel
            setTimeout(() => setLoading(false), 800);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 group overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800 to-transparent opacity-50 group-hover:rotate-180 transition-transform duration-1000"></div>
                <Bot className="relative z-10" />
                <div className="absolute -top-1 -right-1">
                    <div className="bg-red-500 w-3 h-3 rounded-full animate-ping"></div>
                </div>
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-8 w-[90vw] md:w-96 h-[70vh] bg-white border border-zinc-100 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] flex flex-col z-[100] animate-in slide-in-from-bottom-8 duration-500">
            {/* Header */}
            <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                        <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-widest">SLOOK Stylist</h2>
                        <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Online & Ready</p>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors text-zinc-400">
                    <X size={20} />
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-zinc-50 rounded-2xl rounded-tr-none' : ''}`}>
                            <p className={`text-[11px] font-medium leading-relaxed p-4 ${msg.role === 'user' ? 'text-zinc-600' : 'text-zinc-800'}`}>
                                {msg.content}
                            </p>

                            {msg.recommendations && (
                                <div className="mt-4 bg-zinc-50/50 border border-zinc-100 rounded-[2rem] p-5 space-y-4 animate-in fade-in zoom-in-95 duration-500">
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Curated Mood Board</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.origin + "/shop?look=" + msg.recommendations.map(r => r._id).join(','));
                                                success("Look Link Copied!");
                                            }}
                                            className="text-[8px] font-black uppercase text-zinc-900 border border-zinc-200 px-3 py-1 rounded-full hover:bg-black hover:text-white transition-all"
                                        >
                                            Share Look
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        {msg.recommendations.map((prod, j) => (
                                            <Link
                                                key={j}
                                                to={`/product/${prod.slug}`}
                                                className="group block bg-white p-2 rounded-2xl shadow-sm hover:shadow-xl transition-all"
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <div className="aspect-[4/5] bg-zinc-50 rounded-xl overflow-hidden mb-2 relative">
                                                    <img src={prod.images?.[0] || prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="bg-black/80 text-white p-1 rounded-full backdrop-blur-sm">
                                                            <ShoppingBag size={8} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-[8px] font-black uppercase truncate leading-tight">{prod.name}</p>
                                                <Price amount={prod.price} className="text-[8px] font-bold text-zinc-400" />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-zinc-50 p-4 rounded-full">
                            <Loader2 className="animate-spin text-zinc-300" size={16} />
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-6 border-t border-zinc-50 flex gap-3">
                <input
                    type="text"
                    placeholder="Ask anything..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-full px-6 py-4 text-[11px] font-bold outline-none focus:border-black transition-all"
                />
                <button
                    disabled={loading || !input.trim()}
                    className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center disabled:bg-zinc-200 transition-colors"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default AIStylist;
