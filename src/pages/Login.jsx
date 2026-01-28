import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  // --- MATCHED: Pulling 'setUser' from store ---
  const { setUser, user } = useStore();

  useEffect(() => {
    if (user) navigate('/account');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // --- MATCHED: Path must be /api/users/login ---
      const res = await axios.post('http://localhost:5000/api/users/login', { 
        email: email.toLowerCase().trim(), 
        password 
      });

      if (res.data && res.data.token) {
        // --- MATCHED: Using the correct function from Zustand ---
        setUser(res.data); 
        navigate('/account');
      }
    } catch (err) {
      // If the backend returns 401, this shows "Incorrect Password"
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 pt-52 pb-20">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-center mb-2 italic">Welcome Back</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] text-center mb-8">Login to your studio account</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500 font-bold uppercase text-[10px] tracking-widest"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500 font-bold uppercase text-[10px] tracking-widest"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-zinc-900 transition active:scale-95">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/register" className="text-[10px] font-bold uppercase tracking-widest border-b border-black pb-1">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;