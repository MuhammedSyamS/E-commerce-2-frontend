import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { Save, Bell, Shield, Globe, User, ToggleLeft, ToggleRight, Truck } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';

const AdminSettings = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState({
        siteName: '',
        supportEmail: '',
        maintenanceMode: false,
        emailNotifications: true,
        orderAlerts: true,
        marketingEmails: false,
        taxRate: 0,
        shippingCharge: 0,
        freeShippingThreshold: 0,
        minDeliveryDays: 3,
        maxDeliveryDays: 7,
        manifestLogo: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setSettings(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleSave = async () => {
        try {
            await api.put('/settings', settings);
            addToast("Settings Updated Successfully", "success");
        } catch (err) {
            addToast("Failed to save settings", "error");
        }
    };

    // Sub-components for Tabs
    const GeneralSettings = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Platform Name</label>
                    <input
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleChange}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Support Email</label>
                    <input
                        name="supportEmail"
                        value={settings.supportEmail}
                        onChange={handleChange}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-widest text-xs">Financial Configuration</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Tax Rate (%)</label>
                        <input
                            type="number"
                            name="taxRate"
                            value={settings.taxRate}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Shipping Charge</label>
                        <input
                            type="number"
                            name="shippingCharge"
                            value={settings.shippingCharge}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Free Shipping Over</label>
                        <input
                            type="number"
                            name="freeShippingThreshold"
                            value={settings.freeShippingThreshold}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl flex items-center justify-between">
                <div>
                    <h4 className="font-bold text-orange-900 mb-1">Maintenance Mode</h4>
                    <p className="text-xs text-orange-700">Disable the store for customers temporarily.</p>
                </div>
                <button onClick={() => handleToggle('maintenanceMode')} className="text-orange-500 hover:text-orange-700 transition">
                    {settings.maintenanceMode ? <ToggleRight size={40} className="fill-current" /> : <ToggleLeft size={40} />}
                </button>
            </div>
        </div>
    );

    const NotificationSettings = () => (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {[
                { id: 'orderAlerts', label: 'New Order Alerts', desc: 'Get notified when a new order is placed.' },
                { id: 'emailNotifications', label: 'System Emails', desc: 'Receive system health reports.' },
                { id: 'marketingEmails', label: 'Marketing Campaigns', desc: 'Auto-send marketing emails to users.' }
            ].map(item => (
                <div key={item.id} className="bg-white border border-zinc-100 p-6 rounded-xl flex items-center justify-between hover:shadow-md transition">
                    <div>
                        <h4 className="font-bold text-zinc-900 mb-1">{item.label}</h4>
                        <p className="text-xs text-zinc-400">{item.desc}</p>
                    </div>
                    <button onClick={() => handleToggle(item.id)} className={`transition ${settings[item.id] ? 'text-black' : 'text-zinc-300'}`}>
                        {settings[item.id] ? <ToggleRight size={40} className="fill-current" /> : <ToggleLeft size={40} />}
                    </button>
                </div>
            ))}
        </div>
    );

    const LogisticsSettings = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-6 rounded-xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-widest text-xs">Delivery Window Estimations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Min Delivery Days</label>
                        <input
                            type="number"
                            name="minDeliveryDays"
                            value={settings.minDeliveryDays}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Max Delivery Days</label>
                        <input
                            type="number"
                            name="maxDeliveryDays"
                            value={settings.maxDeliveryDays}
                            onChange={handleChange}
                            className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                        />
                    </div>
                </div>
                <p className="text-[10px] text-zinc-400 mt-4 italic font-medium">These values are used to calculate the "Estimated Delivery" range shown to customers during checkout.</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-widest text-xs">Manifest Configuration</h4>
                <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Branded Logo URL (for Manifests)</label>
                    <input
                        name="manifestLogo"
                        value={settings.manifestLogo}
                        onChange={handleChange}
                        placeholder="https://example.com/logo-black.png"
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-bold focus:outline-none focus:border-black transition"
                    />
                </div>
            </div>
        </div>
    );

    const SecuritySettings = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200">
                <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-widest text-xs">Admin Access Control</h4>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">
                        {user.firstName?.[0]}
                    </div>
                    <div>
                        <p className="font-bold">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-zinc-500">Super Administrator</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-green-100 text-green-600 text-[10px] font-bold uppercase rounded-full">Active</span>
                </div>
                <button className="w-full bg-white border border-zinc-300 text-black font-bold py-3 rounded-lg hover:bg-zinc-100 transition uppercase text-xs tracking-widest cursor-not-allowed opacity-50">
                    Manage Admin Roles (Use Users Tab)
                </button>
            </div>
        </div>
    );

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={16} /> },
        { id: 'logistics', label: 'Logistics', icon: <Truck size={16} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
        { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    ];

    if (loading) return <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Loading Configuration...</div>;

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">Platform <span className="text-zinc-300">Settings</span></h1>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Manage your store configuration</p>
                </div>
                <button onClick={handleSave} className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-zinc-800 transition shadow-lg">
                    <Save size={16} /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1 space-y-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-white shadow-md text-black scale-105' : 'text-zinc-400 hover:bg-white/50 hover:text-black'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 min-h-[400px]">
                        {activeTab === 'general' && <GeneralSettings />}
                        {activeTab === 'logistics' && <LogisticsSettings />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'security' && <SecuritySettings />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
