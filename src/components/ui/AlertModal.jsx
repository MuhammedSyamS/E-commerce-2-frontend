import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    // Prevent background scrolling
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    let headerColor = 'bg-blue-600';
    let Icon = Info;

    if (type === 'success') {
        headerColor = 'bg-green-600';
        Icon = CheckCircle;
    } else if (type === 'warning') {
        headerColor = 'bg-orange-500';
        Icon = AlertTriangle;
    } else if (type === 'error') {
        headerColor = 'bg-red-600';
        Icon = AlertTriangle;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className={`${headerColor} px-6 py-4 flex items-center justify-between text-white shadow-sm`}>
                    <div className="flex items-center gap-3">
                        <Icon size={20} className="text-white/90" />
                        <h3 className="font-bold text-sm uppercase tracking-wider">{title}</h3>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-zinc-600 text-sm leading-relaxed font-medium">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-white shadow-md hover:shadow-lg transition-all active:scale-95 ${headerColor} brightness-110 hover:brightness-100`}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
