import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, CreditCard, Bell, ShieldCheck, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';

const Settings = () => {
    const navigate = useNavigate();
    const { user } = useStore();

    const handleNavigation = (path) => {
        navigate(path);
    };

    const SettingCard = ({ icon: Icon, title, description, path }) => (
        <button
            onClick={() => handleNavigation(path)}
            className="bg-white border border-zinc-100 hover:border-black p-6 rounded-2xl flex items-center justify-between text-left group transition-all duration-300"
        >
            <div className="flex items-center gap-4">
                <div className="bg-zinc-50 p-3 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                    <Icon size={20} />
                </div>
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">{description}</p>
                </div>
            </div>
            <ChevronRight size={18} className="text-zinc-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
        </button>
    );

    return (
        <div className="min-h-screen bg-zinc-50 pt-40 lg:pt-48 pb-20 px-6">
            <div className="max-w-3xl mx-auto">

                {/* HEADER */}
                <div className="mb-12">
                    <button onClick={() => navigate('/account')} className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black mb-4 transition-colors">
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black uppercase tracking-tighter">Account <span className="text-red-500">Settings</span></h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mt-2">
                        Manage your personal preferences
                    </p>
                </div>

                {/* SETTINGS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SettingCard
                        icon={User}
                        title="Edit Profile"
                        description="Name, Email & Personal Details"
                        path="/account/edit"
                    />
                    <SettingCard
                        icon={MapPin}
                        title="Address Book"
                        description="Manage Shipping Addresses"
                        path="/account/addresses"
                    />
                    <SettingCard
                        icon={CreditCard}
                        title="Payments"
                        description="Saved Cards & Billing"
                        path="/account/payments"
                    />
                    <SettingCard
                        icon={Bell}
                        title="Notifications"
                        description="Email & Alert Preferences"
                        path="/account/notifications"
                    />
                    <SettingCard
                        icon={ShieldCheck}
                        title="Security"
                        description="Password & Login History"
                        path="/account/security"
                    />
                </div>

            </div>
        </div>
    );
};

export default Settings;
