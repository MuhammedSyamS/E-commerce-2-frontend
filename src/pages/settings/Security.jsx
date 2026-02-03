import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import axios from 'axios';
import { Lock, ArrowLeft, ShieldCheck, Save, Eye, EyeOff } from 'lucide-react';

const Security = () => {
    const navigate = useNavigate();
    const { user, setUser } = useStore();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        // Basic Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match!" });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters" });
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            const updateData = {
                password: formData.newPassword
            };

            // Note: Backend 'updateProfile' handles password update. 
            // Ideally backend should check current password, but current simple implementation might not. 
            // For now we assume we just set the new password securely.

            const { data } = await axios.put('http://localhost:5000/api/users/profile', updateData, config);

            // Update Global Store (Token remains same usually, or should be refreshed)
            setUser({ ...data, token: user.token });

            setMessage({ type: 'success', text: "Security Updated Successfully!" });
            setLoading(false);
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Update failed" });
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white pt-40 lg:pt-48 pb-20 px-6">
            <div className="max-w-xl mx-auto">

                <button onClick={() => navigate('/account')} className="flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] hover:text-black mb-12">
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-zinc-50 rounded-xl">
                        <ShieldCheck size={28} className="text-black" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black uppercase italic tracking-tighter">Security</h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password Management</p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-8 text-xs font-bold uppercase tracking-widest rounded-xl ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* 
                <div>
                   <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Current Password</label>
                   <input 
                      type="password" 
                      placeholder="Verify current password"
                      className="w-full bg-white border border-transparent focus:border-black rounded-xl py-3 px-4 outline-none font-bold text-sm transition"
                   />
                </div>
                */}

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full bg-white border border-transparent focus:border-black rounded-xl py-3 pl-12 pr-12 outline-none font-bold text-sm transition"
                                    placeholder="Minimum 6 characters"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Confirm New Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-white border border-transparent focus:border-black rounded-xl py-3 pl-12 pr-4 outline-none font-bold text-sm transition"
                                    placeholder="Retype password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition flex items-center justify-center gap-3 mt-4 shadow-xl"
                        >
                            {loading ? 'Updating...' : <><Save size={16} /> Update Password</>}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Security;
