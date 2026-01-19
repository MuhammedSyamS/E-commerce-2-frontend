import React, { useState } from 'react';
import { CreditCard, Smartphone, Landmark, Wallet, CheckCircle2 } from 'lucide-react';

const PaymentMethods = ({ onSelect }) => {
  const [selected, setSelected] = useState('upi');

  const methods = [
    { id: 'upi', name: 'UPI (PhonePe, Google Pay, BHIM)', icon: <Smartphone className="w-5 h-5" />, description: 'Pay instantly using your UPI ID' },
    { id: 'card', name: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" />, description: 'Visa, Mastercard, RuPay, and more' },
    { id: 'netbanking', name: 'Net Banking', icon: <Landmark className="w-5 h-5" />, description: 'All Indian major banks supported' },
    { id: 'cod', name: 'Cash on Delivery', icon: <Wallet className="w-5 h-5" />, description: 'Pay when your silver arrives' },
  ];

  const handleSelect = (id) => {
    setSelected(id);
    onSelect(id);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-gray-400">Select Payment Method</h3>
      
      {methods.map((method) => (
        <div 
          key={method.id}
          onClick={() => handleSelect(method.id)}
          className={`relative flex items-center p-5 border-2 cursor-pointer transition-all duration-300 rounded-xl ${
            selected === method.id 
            ? 'border-black bg-gray-50' 
            : 'border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className={`p-3 rounded-full mr-4 ${selected === method.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
            {method.icon}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-black uppercase tracking-tight">{method.name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{method.description}</p>
          </div>

          {selected === method.id && (
            <CheckCircle2 className="text-black w-6 h-6 animate-in zoom-in duration-300" />
          )}
        </div>
      ))}
    </div>
  );
};

export default PaymentMethods;