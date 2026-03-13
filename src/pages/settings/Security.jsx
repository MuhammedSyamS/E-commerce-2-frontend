import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import api from '../../api/instance';
import { Lock, ArrowLeft, ShieldCheck, Save, Eye, EyeOff } from 'lucide-react';

const Security = () => {
    const navigate = useNavigate();
    const { user, setUser } = useStore();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSendOTP = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setMessage({ type: 'error', text: "Please fill all password fields first" });
            return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match!" });
            return;
        }

        try {
            setSendingOtp(true);
            await api.post('/users/security/send-otp', {});
            setOtpSent(true);
            setMessage({ type: 'success', text: "Verification code sent to your email!" });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || "Failed to send code" });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!otpSent) {
            setMessage({ type: 'error', text: "Please request a verification code first" });
            return;
        }

        if (!otp) {
            setMessage({ type: 'error', text: "Please enter the verification code" });
            return;
        }

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

            const updateData = {
                firstName: user.firstName,
                lastName: user.lastName,
                password: formData.newPassword,
                currentPassword: formData.currentPassword,
                otp: otp
            };

            const { data } = await api.put('/users/profile', updateData);

            // Update Global Store
            setUser({ ...data, token: user.token });

            setMessage({ type: 'success', text: "Security Updated Successfully!" });
            setLoading(false);
            setOtpSent(false);
            setOtp('');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (err) {
            console.error("Security Update Error:", err);
            const errorMsg = err.response?.data?.message || err.message || "Update failed";
            setMessage({ type: 'error', text: errorMsg });
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
                        <h1 className="text-3xl font-black uppercase tracking-tighter">Security</h1>
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

                        <div>
                            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Current Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full bg-white border border-transparent focus:border-black rounded-xl py-3 pl-12 pr-12 outline-none font-bold text-sm transition"
                                    placeholder="Verify current password"
                                />
                            </div>
                        </div>

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

                        {otpSent && (
                            <div className="animate-in slide-in-from-top-2 duration-300">
                                <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-2">Verification Code (OTP)</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-white border border-transparent focus:border-black rounded-xl py-3 px-4 outline-none font-black text-center text-lg tracking-[0.5em] transition"
                                    placeholder="000000"
                                />
                                <p className="text-[9px] text-zinc-400 mt-2 font-bold uppercase text-center">Check your email for the 6-digit code</p>
                            </div>
                        )}

                        {!otpSent ? (
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                disabled={sendingOtp}
                                className="w-full bg-zinc-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition flex items-center justify-center gap-3 mt-4 shadow-xl"
                            >
                                {sendingOtp ? 'Sending...' : <><Lock size={16} /> Send Verification Code</>}
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-800 transition flex items-center justify-center gap-3 mt-4 shadow-xl border-2 border-white/10"
                            >
                                {loading ? 'Updating...' : <><Save size={16} /> Update Password</>}
                            </button>
                        )}

                        {otpSent && (
                            <button
                                type="button"
                                onClick={handleSendOTP}
                                className="w-full text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition"
                            >
                                Resend Code
                            </button>
                        )}
                    </form>
                </div>

            </div>
        </div>
    );
};

export default Security;
