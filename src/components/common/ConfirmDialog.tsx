import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white border border-slate-300 shadow-2xl p-6 z-10">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 shrink-0 border ${
              isDestructive ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-serif font-bold text-slate-900">{title}</h4>
            <p className="text-xs font-serif text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-serif font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-xs font-serif font-semibold text-white tracking-wider uppercase border transition-colors ${
              isDestructive
                ? 'bg-rose-700 hover:bg-rose-800 border-rose-900'
                : 'bg-blue-900 hover:bg-blue-950 border-blue-950'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
