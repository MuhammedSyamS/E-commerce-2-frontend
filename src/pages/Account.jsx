import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Heart,
  User,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Star,
  RotateCcw
} from 'lucide-react';

const Account = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User';

  // Card Component
  const AccountCard = ({ icon: Icon, title, subtext, onClick, danger = false }) => (
    <button
      onClick={onClick}
      className={`group flex items-center p-6 border rounded-xl transition-all duration-300 text-left
        ${danger
          ? 'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200'
          : 'bg-white border-zinc-200 hover:border-zinc-800 hover:shadow-lg'
        }`}
    >
      <div className={`p-4 rounded-full mr-5 transition-colors
        ${danger ? 'bg-red-100/50 text-red-600' : 'bg-zinc-50 text-zinc-900 group-hover:bg-black group-hover:text-white'}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <h3 className={`font-bold text-lg mb-1 ${danger ? 'text-red-700' : 'text-zinc-900'}`}>{title}</h3>
        <p className={`text-sm ${danger ? 'text-red-500' : 'text-zinc-500'}`}>{subtext}</p>
      </div>
      <ChevronRight size={20} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${danger ? 'text-red-400' : 'text-zinc-400'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-44 md:pt-52">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">
            My Account
          </h1>
          <p className="text-zinc-500 text-lg">
            Welcome back, <span className="text-black font-semibold">{displayName}</span>
          </p>
        </div>

        {/* Grid Layout - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <AccountCard
            icon={Package}
            title="My Orders"
            subtext="Track active shipments & history"
            onClick={() => navigate('/my-orders')}
          />

          <AccountCard
            icon={Heart}
            title="Wishlist"
            subtext="Your curated collection"
            onClick={() => navigate('/wishlist')}
          />

          <AccountCard
            icon={RotateCcw}
            title="Returns & Exchanges"
            subtext="Track your requests"
            onClick={() => navigate('/my-returns')}
          />

          <AccountCard
            icon={User}
            title="Profile"
            subtext="Personal details & preferences"
            onClick={() => navigate('/account/edit')}
          />

          <AccountCard
            icon={MapPin}
            title="Addresses"
            subtext="Manage shipping locations"
            onClick={() => navigate('/account/addresses')}
          />

          <AccountCard
            icon={Star}
            title="My Reviews"
            subtext="Feedback you have shared"
            onClick={() => navigate('/my-reviews')}
          />

          <AccountCard
            icon={CreditCard}
            title="Payments"
            subtext="Saved cards & billing info"
            onClick={() => navigate('/account/payments')}
          />

          <AccountCard
            icon={Bell}
            title="Notifications"
            subtext="Offers & order updates"
            onClick={() => navigate('/account/notifications')}
          />

          <AccountCard
            icon={ShieldCheck}
            title="Security"
            subtext="Password & account protection"
            onClick={() => navigate('/account/security')}
          />

          <AccountCard
            icon={LogOut}
            title="Sign Out"
            subtext="Securely log out of device"
            onClick={handleLogout}
            danger={true}
          />

        </div>
      </div>
    </div>
  );
};

export default Account;