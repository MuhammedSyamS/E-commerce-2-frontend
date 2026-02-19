import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Share2, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { useStore } from '../store/useStore';
import Price from '../components/Price';
import api from '../api/instance';

const OrderSuccess = () => {
  const { state } = useLocation(); // Get passed state
  const { user } = useStore();
  const orderId = state?.orderId || "PENDING";
  const [upsellProduct, setUpsellProduct] = React.useState(null);

  React.useEffect(() => {
    const fetchUpsell = async () => {
      try {
        const { data } = await api.get('/products');
        // Pick a trending product not in the recently viewed? Or just random for now.
        const shuffled = data.sort(() => 0.5 - Math.random());
        setUpsellProduct(shuffled[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUpsell();
  }, []);

  const shareText = `Just secured my latest look from SLOOK! 💎 Order #${orderId.slice(-8).toUpperCase()}`;
  const shareUrl = window.location.origin;

  const handleShare = (platform) => {
    let url = '';
    if (platform === 'twitter') url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;

    if (url) window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-sans text-[#1a1a1a] px-6 pt-20 pb-20">
      <div className="bg-white p-10 md:p-16 rounded-[2.5rem] shadow-xl shadow-zinc-200/50 max-w-2xl w-full text-center border border-zinc-100 animate-in zoom-in-95 duration-500">

        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
          <CheckCircle size={48} strokeWidth={2.5} />
        </div>

        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 italic transform -skew-x-3">
          Order Confirmed
        </h1>

        <p className="text-zinc-500 font-medium text-lg mb-10 leading-relaxed">
          Thank you for your purchase. We have received your order and will begin processing it shortly.
        </p>

        <div className="bg-zinc-50 p-6 rounded-2xl mb-6 border border-zinc-200 inline-block w-full">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Order Reference</p>
          <p className="text-xl md:text-2xl font-black font-mono tracking-widest select-all text-zinc-800">
            #{orderId.slice(-8).toUpperCase()}
          </p>
          <p className="text-[10px] text-zinc-400 mt-1 font-mono">{orderId}</p>
        </div>

        {/* IMPORTANT UNBOXING NOTICE */}
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6 mb-10 text-left flex gap-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-600">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-700 mb-1">Important: Return Policy</h4>
            <p className="text-[11px] font-medium text-orange-800 leading-relaxed uppercase tracking-tight">
              Please record an <strong>Unboxing Video</strong> and take pictures when your package arrives.
              Returns and exchanges will <strong>ONLY</strong> be accepted with valid video proof.
            </p>
          </div>
        </div>

        {/* SURPRISE UPSELL: ONE-TIME OFFER */}
        {upsellProduct && (
          <div className="bg-zinc-900 text-white rounded-[2rem] p-8 mb-10 relative overflow-hidden group text-left border border-zinc-800 shadow-2xl">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={120} fill="white" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-amber-400 text-black text-[8px] font-black uppercase px-2 py-1 rounded-full animate-pulse">One-Time Offer</span>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Exclusive for you</p>
              </div>

              <div className="flex gap-6 items-center">
                <div className="w-20 h-24 bg-zinc-800 rounded-2xl overflow-hidden shrink-0">
                  <img src={upsellProduct.image} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black uppercase tracking-tight mb-1">{upsellProduct.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Get it for</p>
                    <Price amount={upsellProduct.price * 0.8} className="text-lg font-black italic transform -skew-x-6 text-white" />
                    <span className="text-[10px] text-zinc-500 line-through"><Price amount={upsellProduct.price} /></span>
                  </div>
                </div>
              </div>

              <Link
                to={`/product/${upsellProduct.slug || upsellProduct._id}?offer=SLOOK20`}
                className="mt-6 w-full bg-white text-black py-4 rounded-full font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors"
              >
                Claim This Look <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* SOCIAL SHARE */}
        <div className="mb-10 text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4">Share your SLOOK Moment</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => handleShare('twitter')} className="p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all">
              <Share2 size={18} />
            </button>
            <button onClick={() => handleShare('whatsapp')} className="p-3 bg-zinc-100 rounded-full hover:bg-green-500 hover:text-white transition-all text-zinc-900">
              <Zap size={18} fill="currentColor" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/my-orders"
            className="flex items-center justify-center px-8 py-5 border-2 border-zinc-100 rounded-full font-black uppercase tracking-widest text-[10px] hover:border-black hover:bg-white transition-all"
          >
            View Order
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center px-8 py-5 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
