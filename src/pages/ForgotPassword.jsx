import React, { useState, useEffect } from 'react';
import api from '../api/instance';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Mail, ShieldCheck, Lock, ArrowLeft, Loader2, RotateCcw } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0); // Timer state
  const { addToast } = useToast();

  const navigate = useNavigate();
  const API_URL = "/users";

  // Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await api.post(`${API_URL}/forgot-password`, {
        email: email.toLowerCase().trim()
      });
      setStep(2);
      setTimer(60); // Start 60s countdown
    } catch (err) {
      addToast(err.response?.data?.message || "Error sending code", "error");
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`${API_URL}/reset-password`, {
        email: email.toLowerCase().trim(),
        code: code.trim(),
        newPassword
      });
      addToast("PASSWORD UPDATED SUCCESSFULLY", "success");
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || "Invalid or Expired Code", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 pt-44 md:pt-52 pb-20">
      <div className="max-w-sm w-full">
        <button
          onClick={() => step === 1 ? navigate('/login') : setStep(1)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-12 hover:text-black transition-all"
        >
          <ArrowLeft size={14} /> {step === 1 ? 'Back to Login' : 'Back to Email'}
        </button>

        <h1 className="text-3xl font-black uppercase tracking-tighter mb-8 leading-none">
          Reset <span className="text-red-500">Password</span>
        </h1>

        <form onSubmit={step === 1 ? handleSendOtp : handleReset} className="space-y-6">
          {step === 1 ? (
            <div className="border-b border-zinc-200 py-4 focus-within:border-black transition-colors">
              <input
                type="email" placeholder="ENTER REGISTERED EMAIL" required
                className="w-full bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border-b border-zinc-200 py-4 focus-within:border-black transition-colors">
                <input
                  type="text" placeholder="6-DIGIT CODE" required maxLength="6"
                  className="w-full bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest"
                  value={code} onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="border-b border-zinc-200 py-4 focus-within:border-black transition-colors">
                <input
                  type="password" placeholder="NEW PASSWORD" required
                  className="w-full bg-transparent outline-none text-[10px] font-bold uppercase tracking-widest"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {/* RESEND TIMER UI */}
              <div className="flex justify-between items-center px-1">
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  {timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code?"}
                </p>
                <button
                  type="button"
                  disabled={timer > 0 || loading}
                  onClick={handleSendOtp}
                  className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${timer > 0 ? 'text-zinc-200' : 'text-black hover:underline'}`}
                >
                  <RotateCcw size={10} /> Resend
                </button>
              </div>
            </div>
          )}

          <button className="w-full bg-black text-white py-5 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center justify-center transition-all active:scale-95 shadow-xl">
            {loading ? <Loader2 className="animate-spin" size={16} /> : step === 1 ? "Get Reset Code" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
