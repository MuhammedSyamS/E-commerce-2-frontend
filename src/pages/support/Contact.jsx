import React, { useState } from 'react';
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Sending...');
    // Simulate API call
    setTimeout(() => {
      setStatus('Message sent successfully.');
      e.target.reset();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white pt-40 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header */}
        <div className="mb-20 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Contact Us
          </h1>
          <p className="text-zinc-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.5em]">
            Reach out to the HighPhaus Studio
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Left: Contact Form */}
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  className="w-full border-b border-zinc-200 py-4 outline-none focus:border-black transition-colors bg-transparent font-medium" 
                  required 
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full border-b border-zinc-200 py-4 outline-none focus:border-black transition-colors bg-transparent font-medium" 
                  required 
                />
              </div>
              <input 
                type="text" 
                placeholder="Subject" 
                className="w-full border-b border-zinc-200 py-4 outline-none focus:border-black transition-colors bg-transparent font-medium" 
              />
              <textarea 
                rows="5" 
                placeholder="How can we help you?" 
                className="w-full border-b border-zinc-200 py-4 outline-none focus:border-black transition-colors bg-transparent font-medium resize-none" 
                required
              ></textarea>

              <button 
                type="submit" 
                className="bg-black text-white px-12 py-5 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-zinc-800 transition-all active:scale-95"
              >
                {status || 'Send Message'}
              </button>
            </form>
          </div>

          {/* Right: Contact Info */}
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              
              {/* Support */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageSquare size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Customer Support</h3>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Available Mon-Fri, 9am - 6pm EST.<br />
                  Average response time: 24h.
                </p>
              </div>

              {/* Email */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Email Us</h3>
                </div>
                <p className="text-zinc-500 text-sm">
                  support@highphaus.com<br />
                  press@highphaus.com
                </p>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Our Studio</h3>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  123 Silver Street, Design District<br />
                  New York, NY 10001
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone size={18} />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Call Us</h3>
                </div>
                <p className="text-zinc-500 text-sm">
                  +1 (234) 567-890<br />
                  International charges apply.
                </p>
              </div>

            </div>

            {/* Subtle Map Placeholder / Visual Element */}
            <div className="w-full h-64 bg-zinc-50 flex items-center justify-center grayscale opacity-50 border border-zinc-100 italic text-zinc-400 text-xs tracking-widest">
              [ Interactive Map View ]
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;