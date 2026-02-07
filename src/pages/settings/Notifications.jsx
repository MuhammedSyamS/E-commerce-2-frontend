import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, ArrowLeft, Info, Package, Tag } from 'lucide-react';

const Notifications = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/users/notifications', config);
        setNotifications(data);
      } catch (err) {
        console.error("Fetch Notifs Error", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchNotifs();
  }, [user]);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={20} className="text-blue-500" />;
      case 'promo': return <Tag size={20} className="text-green-500" />;
      default: return <Info size={20} className="text-zinc-500" />;
    }
  };

  // --- PUSH NOTIFICATION LOGIC ---
  const publicVapidKey = 'BBpKl_F-zOM-ujMnUcgudUiVjEIELl0oarZBM8tF9_HAn0bx_MUhxym_5anPaEA653crE40tnwxdAzo1HlIfIh4';

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator)) return alert('Push not supported');

    try {
      const register = await navigator.serviceWorker.ready;
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // Send to Backend
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/notifications/subscribe', subscription, config);

      alert('Notifications Enabled! You will now receive alerts for new drops.');
    } catch (err) {
      console.error(err);
      alert('Failed to subscribe. Please ensure you allowed permissions.');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-40 lg:pt-48 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">

        <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] hover:text-black mb-8">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Notifications</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mt-2">Updates & Alerts</p>
          </div>
          <button
            onClick={subscribeToPush}
            className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center gap-2 rounded-lg"
          >
            <Bell size={16} /> Enable Push
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-zinc-400 text-xs font-bold uppercase tracking-widest">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-zinc-200 rounded-3xl">
            <Bell size={48} className="mx-auto text-zinc-200 mb-4" />
            <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">All caught up</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, idx) => (
              <div key={idx} className="p-6 border border-zinc-100 rounded-2xl flex gap-4 hover:bg-zinc-50 transition-colors">
                <div className="p-3 bg-white border border-zinc-100 rounded-full h-fit">
                  {getIcon(notif.type)}
                </div>
                <div>
                  <div className="flex justify-between items-center w-full mb-1">
                    <h4 className="font-bold text-sm uppercase">{notif.title}</h4>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-zinc-500 text-sm leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
