import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const Toast = ({ message, type = 'error', onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    error: <AlertCircle className="w-5 h-5" />,
    success: <CheckCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />
  };

  const colors = {
    error: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400',
    success: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    info: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    warning: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className={`fixed top-4 right-4 z-50 max-w-md bg-gradient-to-br ${colors[type]} backdrop-blur-lg border rounded-2xl p-4 shadow-2xl`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {icons[type]}
        </div>
        <div className="flex-1 text-sm text-white">
          {message}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-white/10 rounded-lg p-1 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>
    </motion.div>
  );
};

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <AnimatePresence>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </AnimatePresence>
  );
};

export default Toast;
