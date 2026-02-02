import React, { useEffect } from 'react';
import { useToast } from '@/context/ToastContext';

interface ToastItemProps {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ id, type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  const bgColor = {
    success: 'bg-green-900 border-green-700',
    error: 'bg-red-900 border-red-700',
    info: 'bg-blue-900 border-blue-700',
    warning: 'bg-yellow-900 border-yellow-700',
  }[type];

  const textColor = {
    success: 'text-green-100',
    error: 'text-red-100',
    info: 'text-blue-100',
    warning: 'text-yellow-100',
  }[type];

  const icon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }[type];

  return (
    <div className={`${bgColor} border rounded-lg p-4 mb-3 flex items-start gap-3 animate-slideIn`}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <p className={`${textColor} text-sm font-medium`}>{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className={`${textColor} hover:opacity-75 flex-shrink-0 text-xl leading-none`}
      >
        ×
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm">
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
