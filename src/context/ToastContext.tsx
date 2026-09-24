import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  copyToClipboard: (text: string, label: string) => Promise<boolean>;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const copyToClipboard = useCallback(
    async (text: string, label: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        showToast(`${label} copied to clipboard (clearing soon)`, 'success');
        return true;
      } catch {
        showToast(`Failed to copy ${label}`, 'error');
        return false;
      }
    },
    [showToast]
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, copyToClipboard }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 bg-white shadow-xl border font-serif transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'border-emerald-600/40 text-emerald-900'
                : toast.type === 'error'
                ? 'border-rose-600/40 text-rose-900'
                : 'border-blue-900/40 text-blue-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-800 shrink-0" />}
              <span className="text-xs font-serif font-medium text-slate-900">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-slate-800 transition-colors ml-3"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
