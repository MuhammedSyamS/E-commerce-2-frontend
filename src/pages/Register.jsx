import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../store/useStore';

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const navigate = useNavigate();
  const setUser = useStore((state) => state.setUser);

  // --- AUTO-VANISH STATUS MESSAGE ---
  useEffect(() => {
    if (status.msg) {
      const timer = setTimeout(() => {
        setStatus({ type: '', msg: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status.msg]);

  // --- OTP TIMER LOGIC ---
  useEffect(() => {
    let interval;
    if (showOtp && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  // --- STEP 1: SEND OTP ---
  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatus({ type: '', msg: '' });
    try {
      // UPDATED URL: Changed from /api/auth to /api/users
      await axios.post('http://localhost:5000/api/users/send-otp', { email: formData.email });
      setShowOtp(true);
      setTimer(60);
      setCanResend(false);
      setStatus({ type: 'success', msg: 'OTP SENT TO YOUR EMAIL' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || "COULD NOT SEND OTP" });
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY OTP & CREATE ACCOUNT ---
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // UPDATED URL: Changed from /api/auth to /api/users
      const { data } = await axios.post('http://localhost:5000/api/users/register', {
        ...formData,
        code: otp.join('')
      });
      
      setStatus({ type: 'success', msg: 'ACCOUNT CREATED SUCCESSFULLY!' });
      
      // Save user to Zustand store and localStorage
      setUser(data); 

      // Brief delay so user sees success message before redirect
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || "INVALID CODE" });
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    // Auto-focus next input
    if (e.target.nextSibling && val) e.target.nextSibling.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 pt-52 pb-20">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-center mb-2">
          {showOtp ? "Verify OTP" : "Create Account"}
        </h1>

        <div className="mb-4 h-12">
          {status.msg && (
            <div className={`p-3 text-xs font-bold uppercase tracking-widest text-center ${
              status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-black text-white'
            }`}>
              {status.msg}
            </div>
          )}
        </div>

        {!showOtp ? (
          <div className="space-y-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="First Name" 
                  className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500" 
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500" 
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                  required 
                />
              </div>
              <input 
                type="email" 
                placeholder="Email" 
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition">
                {loading ? "Sending OTP..." : "Create Account"}
              </button>
            </form>
            <div className="text-center mt-4">
              <p className="text-sm font-medium text-gray-500">
                Already a user? <Link to="/login" className="text-black font-bold uppercase tracking-wide border-b border-black pb-1 ml-1">Login</Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <form onSubmit={handleOtpVerify} className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((data, i) => (
                  <input key={i} type="text" maxLength="1" className="w-12 h-14 border-b-2 border-gray-300 text-center text-xl font-bold focus:border-black outline-none" value={data} onChange={(e) => handleOtpChange(e, i)} />
                ))}
              </div>
              <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest">
                {loading ? "Verifying..." : "Verify & Create"}
              </button>
            </form>
            <div className="text-center">
              {canResend ? (
                <button onClick={handleRegisterSubmit} className="text-xs font-bold uppercase border-b border-black pb-1">Resend OTP</button>
              ) : (
                <p className="text-xs text-gray-400 font-bold uppercase">Resend in {timer}s</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;