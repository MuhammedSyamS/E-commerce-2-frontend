import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login for UI demo
    const mockUser = { name: "Sonia Fan", email: email, isAdmin: false };
    login(mockUser);
    navigate('/account');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-center mb-8">Login</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full border-b border-gray-300 py-3 outline-none focus:border-black placeholder-gray-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="text-right">
            <a href="#" className="text-xs text-gray-500 hover:text-black underline">Forgot your password?</a>
          </div>

          <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition">
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/register" className="text-sm font-bold uppercase tracking-wide border-b border-black pb-1 hover:text-gray-600 hover:border-gray-600">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;