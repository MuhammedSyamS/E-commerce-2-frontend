import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`min-w-[300px] max-w-sm p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 fade-in duration-300 ${toast.type === 'success' ? 'bg-black text-white' :
                                toast.type === 'error' ? 'bg-red-500 text-white' :
                                    'bg-white text-black border border-zinc-200'
                            }`}
                    >
                        <div className="flex-shrink-0">
                            {toast.type === 'success' && <CheckCircle size={20} className="text-green-400" />}
                            {toast.type === 'error' && <AlertCircle size={20} className="text-white" />}
                            {toast.type === 'info' && <Info size={20} className="text-zinc-400" />}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest flex-grow">{toast.message}</p>
                        <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition">
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
