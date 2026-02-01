import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, MapPin, Heart, ChevronRight, Truck, Star } from 'lucide-react';

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

              {/* ORDERS LINK */}
              <button
                onClick={() => navigate('/my-orders')}
                className="group flex items-center justify-between p-8 bg-black text-white rounded-xl hover:bg-zinc-800 transition-all shadow-xl"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white/10 rounded-lg">
                    <Package size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase italic">Orders History</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Manage Manifests</p>
                  </div>
                </div>
                <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform text-white" />
              </button>

              {/* REVIEWS LINK */}
              <button
                onClick={() => navigate('/my-reviews')}
                className="group flex items-center justify-between p-8 border border-gray-100 rounded-xl hover:border-black transition-all bg-gray-50/50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Star size={24} className="text-black" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase">My Reviews</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Your Contributions</p>
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

              {/* TRACK ORDER LINK (Restored) */}
              <button
                onClick={() => navigate('/track-order')}
                className="group flex items-center justify-between p-8 border border-gray-100 rounded-xl hover:border-black transition-all bg-gray-50/50"
              >
                <div className="flex items-center gap-5">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Truck size={24} className="text-black" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm uppercase">Track Order</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Logistics</p>
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

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <button onClick={() => navigate('/account/edit')} className="w-full flex justify-between items-center p-4 bg-white border border-zinc-100 rounded-xl hover:border-black transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-50 rounded-lg"><MapPin size={16} /></div>
                    <span className="text-xs font-bold uppercase">Edit Profile</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>

                <button onClick={() => navigate('/account/addresses')} className="w-full flex justify-between items-center p-4 bg-white border border-zinc-100 rounded-xl hover:border-black transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-50 rounded-lg"><MapPin size={16} /></div>
                    <span className="text-xs font-bold uppercase">Address Book</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>

                <button onClick={() => navigate('/account/notifications')} className="w-full flex justify-between items-center p-4 bg-white border border-zinc-100 rounded-xl hover:border-black transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-50 rounded-lg"><MapPin size={16} /></div>
                    <span className="text-xs font-bold uppercase">Notifications</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>

                <button onClick={() => navigate('/account/payments')} className="w-full flex justify-between items-center p-4 bg-white border border-zinc-100 rounded-xl hover:border-black transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-50 rounded-lg"><MapPin size={16} /></div>
                    <span className="text-xs font-bold uppercase">Saved Cards</span>
                  </div>
                  <ChevronRight size={14} className="text-zinc-400" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Account;