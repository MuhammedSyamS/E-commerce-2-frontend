import React from 'react';
import { useStore } from '../store/useStore';
import { User, Package, MapPin, Heart, Settings, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, wishlist, cart } = useStore();
  const navigate = useNavigate();

  // Mock data if user isn't logged in for preview purposes
  const userData = user || {
    name: "Guest User",
    email: "guest@highphaus.com",
    memberSince: "January 2026"
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-white min-h-screen pt-40 pb-20">
      <div className="container mx-auto px-6 md:px-20 lg:px-32">

        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-100 pb-12 mb-12 gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-2">Member Dashboard</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">My Account</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:opacity-70 transition"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* --- LEFT: USER INFO CARD --- */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-zinc-50 p-8 rounded-sm">
              <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-full text-xl font-black mb-6">
                {userData.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-tight">{userData.name}</h2>
                <p className="text-sm text-zinc-500">{userData.email}</p>
              </div>
              <div className="mt-8 pt-8 border-t border-zinc-200">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Member Since</p>
                <p className="text-xs font-bold">{userData.memberSince}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-zinc-100 p-4 text-center">
                <p className="text-xl font-black">{wishlist.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Wishlist</p>
              </div>
              <div className="border border-zinc-100 p-4 text-center">
                <p className="text-xl font-black">{cart.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">In Bag</p>
              </div>
            </div>
          </div>

          {/* --- RIGHT: ACTIONS & HISTORY --- */}
          <div className="lg:col-span-8 space-y-12">

            {/* Nav Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Order History", icon: <Package size={18} />, desc: "Check your shipments" },
                { label: "Saved Addresses", icon: <MapPin size={18} />, desc: "Manage delivery locations" },
                { label: "My Wishlist", icon: <Heart size={18} />, desc: "View your saved pieces" },
                { label: "Account Settings", icon: <Settings size={18} />, desc: "Update password & privacy" }
              ].map((item, i) => (
                <button key={i} className="flex items-center justify-between p-6 border border-zinc-100 hover:bg-zinc-50 transition-all text-left group">
                  <div className="flex items-center gap-4">
                    <div className="text-black">{item.icon}</div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest">{item.label}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>

            {/* Recent Orders Placeholder */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6">Recent Orders</h3>
              <div className="border border-zinc-100 rounded-sm">
                <div className="p-12 text-center">
                  <Package size={32} className="mx-auto text-zinc-200 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">No orders found</p>
                  <button
                    onClick={() => navigate('/shop')}
                    className="bg-black text-white px-8 py-3 text-[10px] font-black uppercase tracking-widest active:scale-95 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;