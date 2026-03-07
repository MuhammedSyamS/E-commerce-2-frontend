import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/instance';
import { Bell, ArrowLeft, Info, Package, Tag, Check, CheckCheck, Trash2, ArrowRight, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Stats for badges
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifs = async () => {
    try {
      const { data } = await api.get('/users/notifications');
      setNotifications(data);
    } catch (err) {
      console.error("Fetch Notifs Error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchNotifs();

    // Check Push Status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Error marking all read", err);
    }
  };

  // --- PUSH NOTIFICATION LOGIC ---
  const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

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

      await api.post('/notifications/subscribe', subscription);

      setIsSubscribed(true); // Update UI
      alert('Notifications Enabled! You will now receive alerts for new drops.');
    } catch (err) {
      console.error(err);
      alert('Failed to subscribe. Please ensure you allowed permissions.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pt-16 md:pt-32 lg:pt-40 pb-20 font-sans">
      <div className="container mx-auto px-6 max-w-4xl">

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-10 md:mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <button onClick={() => navigate('/account')} className="group flex items-center gap-2 text-zinc-400 font-medium text-[10px] md:text-xs hover:text-black mb-4 md:mb-6 transition-colors tracking-wide">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform md:size-[14px]" /> BACK TO DASHBOARD
            </button>
            <h1 className="text-xl md:text-5xl font-extrabold tracking-tight text-zinc-900 mb-1">
              Inbox
            </h1>
            <p className="text-xs md:text-sm text-zinc-500 font-medium tracking-tight">
              Stay updated on your orders and exclusive drops.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-white border border-zinc-200 text-zinc-600 px-4 py-2 md:px-5 md:py-2.5 text-[9px] md:text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 hover:border-zinc-300 transition-all rounded-lg flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
              >
                <CheckCheck size={12} className="md:size-[14px]" /> Mark all read
              </button>
            )}
            <button
              onClick={subscribeToPush}
              disabled={isSubscribed}
              className={`px-5 py-2 md:px-6 md:py-2.5 text-[9px] md:text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 rounded-lg w-full sm:w-auto ${isSubscribed
                ? 'bg-green-100 text-green-700 shadow-none cursor-default'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-200'
                }`}
            >
              {isSubscribed ? <><CheckCheck size={12} className="md:size-[14px]" /> Alerts Active</> : <><Bell size={12} className="md:size-[14px]" /> Allow Alerts</>}
            </button>
          </div>
        </div>

        {/* CONTENT SECTION */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white rounded-xl shadow-sm animate-pulse border border-zinc-100"></div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-zinc-200 rounded-2xl bg-white">
            <div className="p-4 bg-zinc-50 rounded-full mb-4">
              <Bell size={24} className="text-zinc-300" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900">All caught up</h3>
            <p className="text-zinc-500 text-sm mt-1">Check back later for updates.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {notifications.map((notif, idx) => (
                <motion.div
                  key={notif._id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);

                    let targetUrl = notif.data?.url;
                    // FIX COLD DATA: If backend sent wrong URL structure, fix it here
                    if (targetUrl && targetUrl.includes('/account/orders/')) {
                      targetUrl = targetUrl.replace('/account/orders/', '/order/');
                    }

                    if (targetUrl) navigate(targetUrl);
                    else if (notif.type === 'order') navigate('/my-orders');
                  }}
                  className={`
                          relative group p-3.5 md:p-6 rounded-xl transition-all duration-300 cursor-pointer border
                          ${!notif.isRead
                      ? 'bg-white border-zinc-200 shadow-lg shadow-zinc-100/50 hover:shadow-xl hover:shadow-zinc-200/50 hover:-translate-y-0.5'
                      : 'bg-white/60 border-transparent hover:bg-white hover:border-zinc-100'
                    }
                      `}
                >
                  {/* Unread Dot */}
                  {!notif.isRead && (
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 rounded-full shadow-sm ring-4 ring-blue-50"></div>
                  )}

                  <div className="flex gap-4 md:gap-6 items-start">

                    {/* Left: Image or Icon */}
                    <div className="shrink-0">
                      {notif.data?.image ? (
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border border-zinc-100 shadow-sm group-hover:shadow-md transition-shadow">
                          <img src={notif.data.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      ) : (
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border ${notif.type === 'order' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                          notif.type === 'promo' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            'bg-zinc-50 border-zinc-100 text-zinc-500'
                          }`}>
                          {notif.type === 'order' ? <Package size={16} className="md:size-[20px]" /> : notif.type === 'promo' ? <Tag size={16} className="md:size-[20px]" /> : <Info size={16} className="md:size-[20px]" />}
                        </div>
                      )}
                    </div>

                    {/* Middle: Text Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-baseline mb-1 pr-4 md:pr-6">
                        <h4 className={`text-[13px] md:text-base font-bold truncate ${!notif.isRead ? 'text-zinc-900' : 'text-zinc-600'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[9px] md:text-xs text-zinc-400 whitespace-nowrap md:ml-4">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className={`text-[11px] md:text-sm leading-relaxed mb-3 ${!notif.isRead ? 'text-zinc-600' : 'text-zinc-400'}`}>
                        {notif.message}
                      </p>

                      {/* Rich Actions / Links */}
                      <div className="flex flex-wrap items-center gap-3">
                        {notif.data?.url && (
                          <div className="flex items-center text-xs font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                            View Details <ArrowRight size={12} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}

                        {notif.type === 'order' && (
                          <div className="flex items-center gap-2 pt-2 w-full">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/my-orders'); }}
                              className="px-4 py-2 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-zinc-800 transition-all flex items-center gap-2"
                            >
                              <Truck size={12} /> Track Parcel
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/support'); }}
                              className="px-4 py-2 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-lg hover:border-black transition-all flex items-center gap-2"
                            >
                              <Info size={12} /> Need Help?
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
