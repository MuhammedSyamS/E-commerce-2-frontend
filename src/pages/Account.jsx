import React from 'react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package } from 'lucide-react';

const Account = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-6 py-12 md:py-20">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">My Account</h1>
          <p className="text-gray-500">Welcome back, {user.name}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-bold uppercase underline hover:text-gray-500 mt-4 md:mt-0">
          <LogOut size={16} /> Log Out
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-12">
        {/* Order History */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Order History</h2>
          
          {/* Mock Order Item */}
          <div className="border border-gray-200 p-6 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-sm">Order #1024</p>
                <p className="text-xs text-gray-500">Placed on Jan 15, 2026</p>
              </div>
              <span className="bg-gray-100 text-xs font-bold px-3 py-1 rounded-full">Processing</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                 <Package size={20} />
              </div>
              <div className="flex-1">
                 <p className="text-sm font-medium">Eagle Adjustable Ring x 1</p>
                 <p className="text-sm font-medium">Batman Ring x 1</p>
              </div>
              <p className="font-bold text-sm">Rs. 1,798</p>
            </div>
          </div>

          <div className="text-center py-10 bg-gray-50 border border-dashed border-gray-300">
            <p className="text-gray-500 text-sm">No other orders found.</p>
          </div>
        </div>

        {/* Address Details */}
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide mb-6">Account Details</h2>
          <div className="bg-gray-50 p-6">
            <p className="font-bold mb-1">{user.name}</p>
            <p className="text-gray-600 text-sm mb-4">{user.email}</p>
            <p className="text-gray-600 text-sm">
              India<br/>
              Kerala<br/>
              695141
            </p>
            <button className="text-xs font-bold underline mt-4">View Addresses (1)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;