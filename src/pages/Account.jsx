import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import {
  LogOut,
  Package,
  MapPin,
  Heart,
  CreditCard,
  Bell,
  Settings,
  ShieldCheck,
  Star,
  Truck,
  User,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react';

const Account = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="text-center p-8">
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500 mb-6">Session Expired</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-black text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
          >
            Login to Account
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User';

  const SidebarLink = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all duration-300 group"
    >
      <Icon size={18} className="group-hover:scale-110 transition-transform" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );

  const ActionCard = ({ icon: Icon, title, description, onClick, dark = false }) => (
    <button
      onClick={onClick}
      className={`relative group p-6 flex flex-col items-start justify-between w-full h-48 text-left rounded-2xl transition-all duration-300 hover:-translate-y-1
        ${dark ? 'bg-zinc-900 text-white shadow-xl shadow-zinc-900/20' : 'bg-white text-black border border-zinc-100 hover:border-zinc-300 hover:shadow-lg'}`}
    >
      <div className={`p-3 rounded-xl mb-4 ${dark ? 'bg-zinc-800' : 'bg-zinc-50'}`}>
        <Icon size={22} strokeWidth={1.5} />
      </div>

      <div className="w-full mt-auto">
        <div className="flex justify-between items-end w-full">
          <div>
            <h3 className="text-base font-bold tracking-tight mb-1">{title}</h3>
            <p className={`text-[10px] font-medium uppercase tracking-wider ${dark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              {description}
            </p>
          </div>
          <div className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ChevronRight size={18} />
          </div>
        </div>
      </div>
    </button>
  );

  // Helper for Mobile Settings Grid Card
  const MobileSettingCard = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="p-6 bg-white border border-zinc-100 rounded-2xl flex flex-col items-start gap-4 hover:border-black transition-colors shadow-sm"
    >
      <div className="p-2 bg-zinc-50 rounded-lg">
        <Icon size={20} className="text-black" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
    </button>
  );

  return (
    <div className="bg-zinc-50 min-h-screen pt-40 lg:pt-48 pb-20">

      {/* WRAPPER FOR SIDEBAR & MAIN */}
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto items-start">

        {/* SIDEBAR - STICKY DESKTOP */}
        <aside className="hidden lg:flex flex-col w-72 bg-zinc-950 text-white sticky top-40 rounded-3xl p-8 h-[calc(100vh-12rem)] justify-between ml-6 shadow-2xl">
          <div className="overflow-y-auto custom-scrollbar pr-2">
            {/* BRAND / BACK */}
            <button onClick={() => navigate('/')} className="flex items-center gap-3 text-zinc-500 hover:text-white transition-colors mb-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] hover:tracking-[0.3em] transition-all">← Back</span>
            </button>

            {/* PROFILE SUMMARY */}
            <div className="mb-10 flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-sm border border-zinc-700">
                {user.firstName ? user.firstName.charAt(0) : 'U'}
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide">{displayName}</p>
                <p className="text-[10px] text-zinc-500 font-mono">My Account</p>
              </div>
            </div>

            {/* SETTINGS LINKS */}
            <div className="space-y-1">
              <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Navigation</p>
              <SidebarLink icon={User} label="Profile" onClick={() => navigate('/account/edit')} />
              <SidebarLink icon={MapPin} label="Addresses" onClick={() => navigate('/account/addresses')} />
              <SidebarLink icon={CreditCard} label="Payments" onClick={() => navigate('/account/payments')} />
              <SidebarLink icon={Bell} label="Notifications" onClick={() => navigate('/account/notifications')} />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <LogOut size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </aside>

        {/* MOBILE HEADER - RELATIVE */}
        <div className="lg:hidden w-full px-6 mb-8">
          <div className="bg-zinc-950 text-white rounded-2xl p-6 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center font-bold text-xs">
                {user.firstName ? user.firstName.charAt(0) : 'U'}
              </div>
              <span className="text-sm font-bold">{displayName}</span>
            </div>
            <button onClick={handleLogout} className="p-2 bg-zinc-900 rounded-lg text-zinc-400">
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 w-full px-6 lg:px-12">

          <header className="mb-10 max-w-4xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400 mb-2">Member Dashboard</p>
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-black">
              Overview
            </h1>
          </header>

          {/* PRIMARY ACTIONS GRID - SYMMETRIC 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mb-16">

            {/* ORDERS */}
            <ActionCard
              dark={true}
              icon={Package}
              title="Orders"
              description="Manage Shipments"
              onClick={() => navigate('/my-orders')}
            />

            {/* WISHLIST */}
            <ActionCard
              icon={Heart}
              title="Wishlist"
              description="Saved Items"
              onClick={() => navigate('/wishlist')}
            />

            {/* TRACKING */}
            <ActionCard
              icon={Truck}
              title="Track Order"
              description="Live Status"
              onClick={() => navigate('/track-order')}
            />

            {/* REVIEWS */}
            <ActionCard
              icon={Star}
              title="Reviews"
              description="My Feedback"
              onClick={() => navigate('/my-reviews')}
            />

          </div>

          {/* MOBILE ONLY SETTINGS GRID */}
          <div className="lg:hidden">
            <div className="flex items-center gap-3 mb-6">
              <Settings size={18} className="text-zinc-400" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Account Settings</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <MobileSettingCard icon={User} label="Profile" onClick={() => navigate('/account/edit')} />
              <MobileSettingCard icon={MapPin} label="Addresses" onClick={() => navigate('/account/addresses')} />
              <MobileSettingCard icon={CreditCard} label="Payments" onClick={() => navigate('/account/payments')} />
              <MobileSettingCard icon={Bell} label="Notifications" onClick={() => navigate('/account/notifications')} />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Account;