import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import api from '../../api/instance';
import { Bell, ArrowLeft, Info, Package, Tag, Check, CheckCheck, Trash2, ArrowRight, Truck, Mail, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
  const { user } = useStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // all, orders, offers

  // Stats for badges
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'orders') return notifications.filter(n => n.type === 'order' || n.title.toLowerCase().includes('order'));
    if (activeTab === 'offers') return notifications.filter(n => n.type === 'promo' || n.title.toLowerCase().includes('offer') || n.title.toLowerCase().includes('drop'));
    return notifications;
  }, [notifications, activeTab]);

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
      setIsSubscribed(true);
      alert('Notifications Enabled! You will now receive alerts for new drops.');
    } catch (err) {
      console.error(err);
      alert('Failed to subscribe. Please ensure you allowed permissions.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pt-16 md:pt-32 lg:pt-40 pb-20 font-sans selection:bg-black selection:text-white">
      <div className="container mx-auto px-4 md:px-6 max-w-4xl">

        {/* TOP GLASSMORPHISM HEADER */}
        <div className="relative mb-10 md:mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-12 relative z-10 p-6 md:p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-xl shadow-zinc-200/50 overflow-hidden"
          >
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50/50 rounded-full -ml-16 -mb-16 blur-3xl"></div>

            <div className="relative space-y-2">
              <button
                onClick={() => navigate('/account')}
                className="group flex items-center gap-2 text-zinc-400 font-bold text-[9px] md:text-[10px] uppercase tracking-mega hover:text-black transition-all mb-4"
              >
                <div className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-100 group-hover:bg-black group-hover:text-white transition-all">
                  <ArrowLeft size={10} className="group-hover:-translate-x-0.5 transition-transform" />
                </div>
                Return to Account
              </button>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-900 flex items-center gap-3">
                Inbox
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center px-4 py-1.5 bg-red-600 text-white text-[9px] md:text-xs font-black rounded-full shadow-lg shadow-red-200 animate-pulse tracking-widest whitespace-nowrap ml-4">
                    {unreadCount} NEW
                  </span>
                )}
              </h1>
              <p className="text-[11px] md:text-sm text-zinc-500 font-medium tracking-tight">
                Your destination for order updates, restocks, and exclusive collection alerts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto self-end md:self-center">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-white border border-zinc-200 text-zinc-600 px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all rounded-xl flex items-center justify-center gap-2 shadow-sm group"
                >
                  <CheckCheck size={14} className="group-hover:scale-110 transition-transform" /> Mark All Read
                </button>
              )}
              <button
                onClick={subscribeToPush}
                disabled={isSubscribed}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 rounded-xl w-full sm:w-auto ${isSubscribed
                  ? 'bg-zinc-50 text-emerald-600 shadow-none cursor-default border border-emerald-100'
                  : 'bg-black text-white hover:shadow-black/20 hover:scale-[1.02] active:scale-95'
                  }`}
              >
                {isSubscribed ? <><CheckCheck size={14} /> Alerts Active</> : <><Bell size={14} /> Get Updates</>}
              </button>
            </div>
          </motion.div>
        </div>

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 mb-8 bg-zinc-100/50 p-1.5 rounded-2xl border border-zinc-200/50 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Activity', icon: Mail },
            { id: 'orders', label: 'Order Updates', icon: Package },
            { id: 'offers', label: 'Store Leads', icon: Sparkles },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-black shadow-md shadow-zinc-200/50'
                : 'text-zinc-400 hover:text-zinc-600 hover:bg-white/50'
                }`}
            >
              <tab.icon size={13} className={activeTab === tab.id ? "text-blue-600" : ""} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENT SECTION */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 bg-white rounded-2xl shadow-sm animate-pulse border border-zinc-100"></div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 md:py-48 rounded-[2.5rem] bg-white border border-zinc-100 shadow-sm text-center px-10"
          >
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 bg-zinc-100 rounded-full animate-ping opacity-20 scale-150"></div>
              <Bell size={32} className="text-zinc-200" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Nothing to show yet</h3>
            <p className="text-zinc-500 text-sm mt-2 max-w-[200px] leading-relaxed mx-auto">
              Your inbox is clear! We'll alert you here for any status changes or special drops.
            </p>
            {activeTab !== 'all' && (
              <button
                onClick={() => setActiveTab('all')}
                className="mt-8 text-[10px] font-black uppercase tracking-mega text-blue-600 hover:text-black transition-colors"
              >
                View all activity
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif, idx) => (
                <motion.div
                  layout
                  key={notif._id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  onClick={() => {
                    if (!notif.isRead) markAsRead(notif._id);
                    let targetUrl = notif.data?.url;
                    if (targetUrl && targetUrl.includes('/account/orders/')) {
                      targetUrl = targetUrl.replace('/account/orders/', '/order/');
                    }
                    if (targetUrl) navigate(targetUrl);
                    else if (notif.type === 'order') navigate('/my-orders');
                  }}
                  className={`
                          group relative p-4 md:p-8 rounded-[1.75rem] transition-all duration-500 cursor-pointer border
                          ${!notif.isRead
                      ? 'bg-white border-blue-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] hover:shadow-[0_25px_60px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1'
                      : 'bg-white/40 border-transparent grayscale hover:grayscale-0 hover:bg-white hover:border-zinc-100'
                    }
                      `}
                >
                  {/* Unread Indicator Glow */}
                  {!notif.isRead && (
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                      <span className="text-[8px] font-black text-blue-600 uppercase tracking-mega opacity-0 group-hover:opacity-100 transition-opacity">Just now</span>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    </div>
                  )}

                  <div className="flex gap-4 md:gap-8 items-start">
                    {/* Left: Enhanced Badge */}
                    <div className="shrink-0 relative">
                      {notif.data?.image ? (
                        <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl overflow-hidden border border-zinc-100 shadow-sm group-hover:shadow-md transition-all duration-500 group-hover:scale-105">
                          <img src={notif.data.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] flex items-center justify-center border transition-transform duration-500 group-hover:scale-110 ${notif.type === 'order' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                          notif.type === 'promo' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            'bg-zinc-50 border-zinc-100 text-zinc-500'
                          }`}>
                          {notif.type === 'order' ? <Package size={20} className="md:size-[24px]" /> : notif.type === 'promo' ? <Tag size={20} className="md:size-[24px]" /> : <Info size={20} className="md:size-[24px]" />}
                        </div>
                      )}
                    </div>

                    {/* Middle: Text Content */}
                    <div className="flex-1 min-w-0 pt-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                        <h4 className={`text-base md:text-xl font-bold tracking-tight truncate pr-12 md:pr-0 ${!notif.isRead ? 'text-zinc-900 font-extrabold' : 'text-zinc-500'}`}>
                          {notif.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap bg-zinc-50 px-2 py-0.5 rounded-full border border-zinc-100">
                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[9px] md:text-[10px] font-medium text-zinc-300">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <p className={`text-[12px] md:text-[15px] leading-relaxed mb-6 max-w-2xl ${!notif.isRead ? 'text-zinc-600 font-medium' : 'text-zinc-400'}`}>
                        {notif.message}
                      </p>

                      {/* Rich Actions / Links */}
                      <div className="flex flex-wrap items-center gap-4">
                        {notif.type === 'order' && (
                          <div className="flex flex-wrap items-center gap-2 w-full">
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/my-orders'); }}
                              className="px-6 py-2.5 bg-black text-white text-[10px] font-black uppercase tracking-mega rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
                            >
                              <Truck size={14} strokeWidth={3} /> Track Package
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate('/support'); }}
                              className="px-6 py-2.5 bg-white border border-zinc-200 text-zinc-900 text-[10px] font-black uppercase tracking-mega rounded-xl hover:border-black hover:bg-zinc-50 transition-all flex items-center gap-2"
                            >
                              <Info size={14} /> View Details
                            </button>
                          </div>
                        )}

                        {notif.type !== 'order' && notif.data?.url && (
                          <div className="group/btn flex items-center gap-2 text-[10px] font-black uppercase tracking-mega text-blue-600 hover:text-blue-700 transition-colors">
                            Explore Now <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
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

        <div className="mt-16 pt-8 border-t border-zinc-100 text-center">
          <p className="text-[10px] font-black uppercase tracking-mega text-zinc-300">
            End of Activity
          </p>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
