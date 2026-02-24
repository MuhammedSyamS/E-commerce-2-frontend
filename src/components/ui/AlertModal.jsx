import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (type === 'success') onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [isOpen, type, onClose]);

    const config = {
        success: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50/50', border: 'border-green-100' },
        warning: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50/50', border: 'border-orange-100' },
        error: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50/50', border: 'border-red-100' },
        info: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100' }
    };

    const { icon: Icon, color, bg, border } = config[type] || config.info;

    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[10000] w-full max-w-sm px-4 pointer-events-none">
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`pointer-events-auto bg-white/90 backdrop-blur-md ${border} border shadow-2xl shadow-black/5 rounded-2xl overflow-hidden p-4 flex gap-4 items-start`}
            >
                <div className={`p-2 rounded-xl ${bg} ${color}`}>
                    <Icon size={20} strokeWidth={2.5} />
                </div>

                <div className="flex-1 space-y-1 pr-6">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-black">{title}</h3>
                    <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tight italic">
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 hover:bg-zinc-100 rounded-full transition-colors text-zinc-300 hover:text-black"
                >
                    <X size={14} />
                </button>
            </motion.div>
        </div>
    );
};

export default AlertModal;
