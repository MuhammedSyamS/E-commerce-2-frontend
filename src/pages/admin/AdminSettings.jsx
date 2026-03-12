import React, { useState, useEffect } from 'react';
import api from '../../api/instance';
import { Save, Bell, Shield, Globe, User, ToggleLeft, ToggleRight, Truck, Image, Plus, Trash2, ArrowUp, ArrowDown, Upload, MessageSquare } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';

// --- SUB-COMPONENTS (Moved outside for performance) ---

const GeneralSettings = ({ settings, handleChange, handleToggle }) => (
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

const NotificationSettings = ({ settings, handleToggle }) => (
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

const LogisticsSettings = ({ settings, handleChange }) => (
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

const HeroSettings = ({ settings, setSettings, addToast }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-zinc-900 uppercase tracking-widest text-xs">Home Hero Carousel</h4>
            <button
                onClick={() => setSettings(prev => ({ ...prev, heroSlides: [...(prev.heroSlides || []), { img: '', title: '', subtitle: '', link: '' }] }))}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition"
            >
                <Plus size={14} /> Add Slide
            </button>
        </div>

        <div className="space-y-4">
            {settings.heroSlides?.map((slide, idx) => (
                <div key={idx} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:border-black transition group">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* PREVIEW & UPLOAD */}
                        <div className="w-full md:w-32 h-32 bg-zinc-100 rounded-xl overflow-hidden relative border border-zinc-100 shrink-0">
                            {slide.img ? (
                                <img src={slide.img} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <Image size={24} />
                                </div>
                            )}
                            <button
                                onClick={() => document.getElementById(`hero-upload-${idx}`).click()}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                            >
                                <Upload size={16} />
                            </button>
                            <input
                                id={`hero-upload-${idx}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                    const uploadData = new FormData();
                                    uploadData.append('file', file);
                                    try {
                                        const { data } = await api.post('/upload', uploadData, {
                                            headers: { 'Content-Type': 'multipart/form-data' }
                                        });
                                        const newSlides = [...settings.heroSlides];
                                        newSlides[idx].img = data.filePath;
                                        setSettings({ ...settings, heroSlides: newSlides });
                                    } catch (err) {
                                        addToast("Upload failed", "error");
                                    }
                                }}
                            />
                        </div>

                        {/* INPUTS */}
                        <div className="flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Title (e.g. The 2026 Collection)"
                                    className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] font-bold uppercase focus:outline-none focus:border-black"
                                    value={slide.title}
                                    onChange={(e) => {
                                        const newSlides = [...settings.heroSlides];
                                        newSlides[idx].title = e.target.value;
                                        setSettings({ ...settings, heroSlides: newSlides });
                                    }}
                                />
                                <input
                                    placeholder="Subtitle (e.g. Modern Essentials)"
                                    className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] font-bold uppercase focus:outline-none focus:border-black"
                                    value={slide.subtitle}
                                    onChange={(e) => {
                                        const newSlides = [...settings.heroSlides];
                                        newSlides[idx].subtitle = e.target.value;
                                        setSettings({ ...settings, heroSlides: newSlides });
                                    }}
                                />
                            </div>
                            <input
                                placeholder="Link URL (e.g. /shop)"
                                className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] font-bold focus:outline-none focus:border-black"
                                value={slide.link}
                                onChange={(e) => {
                                    const newSlides = [...settings.heroSlides];
                                    newSlides[idx].link = e.target.value;
                                    setSettings({ ...settings, heroSlides: newSlides });
                                }}
                            />
                        </div>

                        {/* ACTIONS */}
                        <div className="flex md:flex-col gap-2 justify-end">
                            <button
                                onClick={() => {
                                    if (idx === 0) return;
                                    const newSlides = [...settings.heroSlides];
                                    [newSlides[idx], newSlides[idx - 1]] = [newSlides[idx - 1], newSlides[idx]];
                                    setSettings({ ...settings, heroSlides: newSlides });
                                }}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-black disabled:opacity-30"
                                disabled={idx === 0}
                            >
                                <ArrowUp size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    if (idx === settings.heroSlides.length - 1) return;
                                    const newSlides = [...settings.heroSlides];
                                    [newSlides[idx], newSlides[idx + 1]] = [newSlides[idx + 1], newSlides[idx]];
                                    setSettings({ ...settings, heroSlides: newSlides });
                                }}
                                className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-black disabled:opacity-30"
                                disabled={idx === settings.heroSlides.length - 1}
                            >
                                <ArrowDown size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    const newSlides = settings.heroSlides.filter((_, i) => i !== idx);
                                    setSettings({ ...settings, heroSlides: newSlides });
                                }}
                                className="p-2 hover:bg-red-50 rounded-lg transition text-zinc-400 hover:text-red-500"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {(!settings.heroSlides || settings.heroSlides.length === 0) && (
                <div className="py-20 text-center border-2 border-dashed border-zinc-100 rounded-[2rem]">
                    <Image className="mx-auto text-zinc-200 mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">No Dynamic Slides Configured</p>
                    <p className="text-[9px] text-zinc-300 mt-2 font-medium">Home page will show default hardcoded collection.</p>
                </div>
            )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 mt-8">
            <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-zinc-900 uppercase tracking-widest text-[10px]">Scrolling Marquee Items</h4>
                <button
                    onClick={() => setSettings(prev => ({ ...prev, marqueeMessages: [...(prev.marqueeMessages || []), { text: '', link: '' }] }))}
                    className="flex items-center gap-2 bg-zinc-100 text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition"
                >
                    <Plus size={14} /> Add Item
                </button>
            </div>
            
            <div className="space-y-3">
                {settings.marqueeMessages?.map((msg, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-3 items-center group/item bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                            <input
                                placeholder="Message (e.g. SUMMER SALE •)"
                                className="w-full p-3 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold uppercase focus:outline-none focus:border-black transition"
                                value={msg.text}
                                onChange={(e) => {
                                    const newMsgs = [...settings.marqueeMessages];
                                    newMsgs[idx].text = e.target.value;
                                    setSettings({ ...settings, marqueeMessages: newMsgs });
                                }}
                            />
                            <input
                                placeholder="Link URL (Optional)"
                                className="w-full p-3 bg-white border border-zinc-200 rounded-lg text-[10px] font-bold focus:outline-none focus:border-black transition"
                                value={msg.link}
                                onChange={(e) => {
                                    const newMsgs = [...settings.marqueeMessages];
                                    newMsgs[idx].link = e.target.value;
                                    setSettings({ ...settings, marqueeMessages: newMsgs });
                                }}
                            />
                        </div>
                        <div className="flex gap-1">
                            <button
                                onClick={() => {
                                    const newMsgs = settings.marqueeMessages.filter((_, i) => i !== idx);
                                    setSettings({ ...settings, marqueeMessages: newMsgs });
                                }}
                                className="p-2 text-zinc-400 hover:text-red-500 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                
                {(!settings.marqueeMessages || settings.marqueeMessages.length === 0) && (
                    <div className="py-8 text-center border border-dashed border-zinc-200 rounded-xl">
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">No Marquee Items Added</p>
                        <p className="text-[8px] text-zinc-300 mt-1 uppercase">Using default marquee content</p>
                    </div>
                )}
            </div>
            <p className="text-[9px] text-zinc-400 mt-4 italic font-medium">Add multiple items to create a continuous scrolling bar. Items will be separated automatically.</p>
        </div>
    </div>
);

const TopBannerSettings = ({ settings, setSettings }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-zinc-900 uppercase tracking-widest text-xs">Top Navbar Banners</h4>
            <button
                onClick={() => setSettings(prev => ({ ...prev, topNavbarMessages: [...(prev.topNavbarMessages || []), { text: '', link: '' }] }))}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition"
            >
                <Plus size={14} /> Add Message
            </button>
        </div>

        <div className="space-y-4">
            {settings.topNavbarMessages?.map((msg, idx) => (
                <div key={idx} className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm hover:border-black transition flex flex-col md:flex-row gap-4 items-center group">
                    <div className="flex-1 space-y-4 w-full">
                        <input
                            placeholder="Announcement Text (e.g. Free Shipping on orders over $50)"
                            className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] font-bold uppercase focus:outline-none focus:border-black"
                            value={msg.text}
                            onChange={(e) => {
                                const newMsgs = [...settings.topNavbarMessages];
                                newMsgs[idx].text = e.target.value;
                                setSettings({ ...settings, topNavbarMessages: newMsgs });
                            }}
                        />
                        <input
                            placeholder="Optional Link URL (e.g. /shop)"
                            className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-[11px] font-bold focus:outline-none focus:border-black"
                            value={msg.link}
                            onChange={(e) => {
                                const newMsgs = [...settings.topNavbarMessages];
                                newMsgs[idx].link = e.target.value;
                                setSettings({ ...settings, topNavbarMessages: newMsgs });
                            }}
                        />
                    </div>
                    
                    <div className="flex md:flex-col gap-2 justify-end w-full md:w-auto">
                        <button
                            onClick={() => {
                                if (idx === 0) return;
                                const newMsgs = [...settings.topNavbarMessages];
                                [newMsgs[idx], newMsgs[idx - 1]] = [newMsgs[idx - 1], newMsgs[idx]];
                                setSettings({ ...settings, topNavbarMessages: newMsgs });
                            }}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-black disabled:opacity-30"
                            disabled={idx === 0}
                        >
                            <ArrowUp size={16} />
                        </button>
                        <button
                            onClick={() => {
                                if (idx === settings.topNavbarMessages.length - 1) return;
                                const newMsgs = [...settings.topNavbarMessages];
                                [newMsgs[idx], newMsgs[idx + 1]] = [newMsgs[idx + 1], newMsgs[idx]];
                                setSettings({ ...settings, topNavbarMessages: newMsgs });
                            }}
                            className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-black disabled:opacity-30"
                            disabled={idx === settings.topNavbarMessages.length - 1}
                        >
                            <ArrowDown size={16} />
                        </button>
                        <button
                            onClick={() => {
                                const newMsgs = settings.topNavbarMessages.filter((_, i) => i !== idx);
                                setSettings({ ...settings, topNavbarMessages: newMsgs });
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg transition text-zinc-400 hover:text-red-500"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}

            {(!settings.topNavbarMessages || settings.topNavbarMessages.length === 0) && (
                <div className="py-10 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
                    <MessageSquare className="mx-auto text-zinc-200 mb-4" size={32} />
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">No Banner Messages Content</p>
                    <p className="text-[9px] text-zinc-300 mt-2 font-medium">Top global banner will be hidden entirely.</p>
                </div>
            )}
        </div>
    </div>
);

const SecuritySettings = ({ user }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200">
            <h4 className="font-bold text-zinc-900 mb-4 uppercase tracking-widest text-xs">Admin Access Control</h4>
            <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">
                    {user?.firstName?.[0]}
                </div>
                <div>
                    <p className="font-bold">{user?.firstName} {user?.lastName}</p>
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

// --- MAIN COMPONENT ---

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
        manifestLogo: '',
        heroSlides: [],
        topNavbarMessages: [],
        marqueeText: '',
        marqueeMessages: []
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
            // Notify other components (like Navbar) that settings changed
            window.dispatchEvent(new Event('settings-updated'));
        } catch (err) {
            addToast("Failed to save settings", "error");
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: <Globe size={16} /> },
        { id: 'hero', label: 'Hero', icon: <Image size={16} /> },
        { id: 'topbanner', label: 'Top Banner', icon: <MessageSquare size={16} /> },
        { id: 'logistics', label: 'Logistics', icon: <Truck size={16} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
        { id: 'security', label: 'Security', icon: <Shield size={16} /> },
    ];

    if (loading) return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 animate-pulse">Loading Configuration...</div>
        </div>
    );

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Platform <span className="text-zinc-300">Settings</span></h1>
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
                        {activeTab === 'general' && <GeneralSettings settings={settings} handleChange={handleChange} handleToggle={handleToggle} />}
                        {activeTab === 'hero' && <HeroSettings settings={settings} setSettings={setSettings} addToast={addToast} />}
                        {activeTab === 'topbanner' && <TopBannerSettings settings={settings} setSettings={setSettings} />}
                        {activeTab === 'logistics' && <LogisticsSettings settings={settings} handleChange={handleChange} />}
                        {activeTab === 'notifications' && <NotificationSettings settings={settings} handleToggle={handleToggle} />}
                        {activeTab === 'security' && <SecuritySettings user={user} />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
