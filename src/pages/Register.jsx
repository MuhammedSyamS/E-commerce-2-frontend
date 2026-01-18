import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

const Register = () => {
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const navigate = useNavigate();
  const login = useStore((state) => state.login);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate register
    const mockUser = { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, isAdmin: false };
    login(mockUser);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold uppercase tracking-tighter text-center mb-8">Create Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-5">
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

          <button type="submit" className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-gray-800 transition mt-4">
            Create
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-500">Already have an account? </span>
          <Link to="/login" className="underline font-bold ml-1">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;