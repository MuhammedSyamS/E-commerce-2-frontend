import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useToast } from '../context/ToastContext';
import api from '../api/instance';
import { GoogleLogin as GoogleAuthButton } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setUser, user, syncGuestWishlist } = useStore();
  const { addToast } = useToast();

  const isStaff = (u) => u && (u.isAdmin || ['manager', 'client_support_executive', 'digital_marketing_executive'].includes(u.role));

  useEffect(() => {
    if (user) {
      if (isStaff(user)) navigate('/admin');
      else navigate('/account');
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/users/google-login', {
        token: credentialResponse.credential
      });

      if (res.data.token) {
        setUser(res.data);
        syncGuestWishlist(); // Sync any guest items
        addToast("Logged in with Google", "success");
        if (isStaff(res.data)) navigate('/admin');
        else navigate('/account');
      }
    } catch (err) {
      console.error(err);
      addToast("Google Login Failed", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post('/users/login', {
        email: email.toLowerCase().trim(),
        password
      });

      setUser(data);
      syncGuestWishlist(); // Sync any guest items
      addToast(`WELCOME BACK, ${data.firstName.toUpperCase()}`, "success");
      
      if (data.role === 'admin' || data.role === 'manager') {
        navigate('/admin/dashboard');
      } else {
        navigate('/account');
      }
    } catch (err) {
      const msg = err.response?.data?.message || "AUTHENTICATION FAILED. PLEASE TRY AGAIN.";
      addToast(msg.toUpperCase(), "error");
      console.error("Login Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 pt-44 md:pt-52 pb-20">
      <div className="w-full max-w-md">
        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tighter text-center mb-2">Welcome <span className="text-red-500">Back</span></h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center mb-8">Login to your studio account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500 font-bold uppercase text-xs md:text-[10px] tracking-widest"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500 font-bold uppercase text-xs md:text-[10px] tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-[10px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-black transition"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 font-black uppercase tracking-widest text-sm md:text-sm hover:bg-zinc-900 transition active:scale-95">
            {loading ? 'Authenticating...' : 'LogIn'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-[10px] md:text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-2 text-gray-400">Or continue with</span></div>
        </div>

        <div className="flex justify-center">
          <GoogleAuthButton
            onSuccess={handleGoogleSuccess}
            onError={() => addToast("Login Failed", "error")}
            type="standard"
            theme="filled_black"
            size="large"
            text="continue_with"
            shape="pill"
          />
        </div>

        <div className="mt-8 text-center flex flex-col gap-4 items-center">
          <Link to="/register" className="text-xs md:text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
