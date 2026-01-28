import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, MapPin, Heart, ChevronRight, ShoppingBag, Truck } from 'lucide-react';

const Account = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-52 bg-white">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest mb-4">Session Expired</p>
          <button onClick={() => navigate('/login')} className="bg-black text-white px-8 py-3 uppercase text-[10px] font-black">
            Login to View Account
          </button>
        </div>
      </div>
    );
  }

  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Member';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white pb-20 pt-52">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 border-b border-gray-100 pb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400 mb-2">Member Portal</p>
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic transform -skew-x-3">My Account</h1>
            <p className="text-gray-500 mt-2 font-medium">Greetings, {user.firstName} {user.lastName || 'User'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-black px-6 py-3 hover:bg-black hover:text-white transition-all mt-6 md:mt-0">
            <LogOut size={14} /> Secure Logout
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          
          {/* LEFT: DASHBOARD NAV */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* --- NEW: TRACK ORDER BUTTON (BLACK STYLE) --- */}
              <button 
                onClick={() => navigate('/track-order')}
                className="group flex items-center justify-between p-8 bg-black text-white rounded-xl hover:bg-zinc-800 transition-all shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <Truck size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase italic">Track Order</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Real-time Logistics</p>
                  </div>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform text-white" />
              </button>

              {/* ORDERS LINK */}
              <button 
                onClick={() => navigate('/my-orders')}
                className="group flex items-center justify-between p-8 border border-gray-100 rounded-xl hover:border-black transition-all bg-gray-50/50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Package size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase">Orders History</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Manage Manifests</p>
                  </div>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>

              {/* WISHLIST LINK */}
              <button 
                onClick={() => navigate('/wishlist')}
                className="group flex items-center justify-between p-8 border border-gray-100 rounded-xl hover:border-black transition-all bg-gray-50/50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Heart size={24} className="text-black" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase">Wishlist</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Saved Favorites</p>
                  </div>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>

              {/* SHOP LINK */}
              <button 
                onClick={() => navigate('/shop')}
                className="group flex items-center justify-between p-8 border border-gray-100 rounded-xl hover:border-black transition-all bg-gray-50/50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <ShoppingBag size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase">Studio Shop</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">New Collections</p>
                  </div>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT: ACCOUNT DETAILS */}
          <div className="space-y-8">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Profile Details</h2>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-full font-bold">
                  {user.firstName ? user.firstName.charAt(0) : 'U'}
                </div>
                <div>
                  <p className="font-bold text-sm uppercase">{displayName}</p>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{user.email}</p>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-200">
                <div className="flex gap-4">
                  <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                  <div className="text-[11px] font-bold uppercase tracking-tight leading-relaxed">
                    <p className="text-gray-400 mb-1">Status</p>
                    <p>Verified Member</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}; 

export default Account;