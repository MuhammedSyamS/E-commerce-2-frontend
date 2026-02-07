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
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`min-w-[320px] max-w-md px-6 py-4 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-right-10 zoom-in-95 duration-300 ${toast.type === 'success' ? 'bg-black/90 text-white backdrop-blur-xl border border-white/10' :
                            toast.type === 'error' ? 'bg-red-500/90 text-white backdrop-blur-xl' :
                                'bg-white/90 text-black border border-zinc-200 backdrop-blur-xl'
                            }`}
                    >
                        <div className={`flex-shrink-0 p-1 rounded-full ${toast.type === 'success' ? 'bg-white/20' :
                            toast.type === 'error' ? 'bg-white/20' : 'bg-black/5'
                            }`}>
                            {toast.type === 'success' && <CheckCircle size={16} className="text-white" strokeWidth={3} />}
                            {toast.type === 'error' && <AlertCircle size={16} className="text-white" strokeWidth={3} />}
                            {toast.type === 'info' && <Info size={16} className="text-black" strokeWidth={3} />}
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] flex-grow leading-none pt-0.5">{toast.message}</p>
                        <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 transition p-1 hover:bg-white/20 rounded-full">
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
