import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const Icon =
    toast.type === 'warning'
      ? AlertCircle
      : toast.type === 'info'
      ? Info
      : CheckCircle2;

  const iconColor =
    toast.type === 'warning'
      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
      : toast.type === 'info'
      ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
      : 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';

  return (
    <div
      className="pointer-events-auto p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xl flex items-start gap-3 animate-in slide-in-from-right-4 duration-150"
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-slate-900 dark:text-white font-semibold text-xs">{toast.title}</div>
        {toast.description && (
          <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-snug">
            {toast.description}
          </div>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition shrink-0 cursor-pointer p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};



