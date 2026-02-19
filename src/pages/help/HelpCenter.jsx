import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageSquare, BookOpen, ChevronRight, Phone, Mail } from 'lucide-react';
import { useStore } from '../../store/useStore';

const HelpCenter = () => {
    const { user } = useStore();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const faqs = [
        { q: "How do I track my order?", a: "You can track your order in the 'My Orders' section or by using the 'Track Order' link in the footer." },
        { q: "What is your return policy?", a: "We offer a 7-day return policy for unused items with original tags. Visit 'Returns & Exchanges' for more." },
        { q: "Do you ship internationally?", a: "Currently, we ship within India. International shipping is coming soon." },
        { q: "How can I cancel my order?", a: "You can cancel your order from 'My Orders' before it is dispatched." }
    ];

    const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-zinc-50 pt-40 pb-20">
            {/* HERO SECTION */}
            <div className="bg-black text-white py-20 px-6 text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6">How can we help?</h1>
                <div className="relative max-w-2xl mx-auto">
                    <input
                        type="text"
                        placeholder="Search for answers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-4 pl-12 pr-6 rounded-full text-black font-bold outline-none focus:ring-4 ring-white/20"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                </div>
            </div>

            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {/* OPTION 1: MY TICKETS */}
                    <div onClick={() => navigate('/help/tickets')} className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                            <MessageSquare size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase mb-2">My Support Tickets</h3>
                        <p className="text-zinc-500 text-sm mb-6">View status of your requests or submit a new issue.</p>
                        <span className="text-xs font-bold uppercase tracking-widest underline decoration-zinc-300">View Tickets</span>
                    </div>

                    {/* OPTION 2: CONTACT US (DUMMY) */}
                    <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all group text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                            <Phone size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase mb-2">Contact Us</h3>
                        <p className="text-zinc-500 text-sm mb-6">Need urgent help? Reach out to our customer care.</p>
                        <div className="flex justify-center gap-4 text-xs font-bold uppercase">
                            <a href="tel:+919876543210" className="hover:underline">Call</a>
                            <span>•</span>
                            <a href="mailto:support@slook.com" className="hover:underline">Email</a>
                        </div>
                    </div>

                    {/* OPTION 3: CARE GUIDE */}
                    <Link to="/care-guide" className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl transition-all group text-center">
                        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                            <BookOpen size={28} />
                        </div>
                        <h3 className="text-xl font-black uppercase mb-2">Product Care</h3>
                        <p className="text-zinc-500 text-sm mb-6">Learn how to take care of your premium products.</p>
                        <span className="text-xs font-bold uppercase tracking-widest underline decoration-zinc-300">Read Guide</span>
                    </Link>
                </div>

                {/* FAQ SECTION */}
                <div className="bg-white rounded-[3rem] p-10 md:p-16 border border-zinc-100">
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredFaqs.map((faq, i) => (
                            <div key={i} className="bg-zinc-50 p-6 rounded-2xl">
                                <h4 className="font-bold text-lg mb-2 flex items-start gap-2">
                                    <span className="text-zinc-300">Q.</span> {faq.q}
                                </h4>
                                <p className="text-zinc-600 text-sm ml-6">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;
