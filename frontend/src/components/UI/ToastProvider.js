import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onClose }) => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
    loading: '⏳'
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200',
    loading: 'bg-gray-50 border-gray-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
    loading: 'text-gray-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${bgColors[toast.type]} ${textColors[toast.type]}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 text-xl mr-3">
          {toast.type === 'loading' ? (
            <div className="animate-spin text-lg">{icons[toast.type]}</div>
          ) : (
            icons[toast.type]
          )}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <h4 className="font-semibold text-sm">{toast.title}</h4>
          )}
          <p className="text-sm">{toast.message}</p>
          {toast.description && (
            <p className="text-xs mt-1 opacity-75">{toast.description}</p>
          )}
          {toast.action && (
            <div className="mt-2">
              <button
                onClick={toast.action.onClick}
                className="text-xs font-medium underline hover:no-underline"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>
        {toast.type !== 'loading' && (
          <button
            onClick={() => onClose(toast.id)}
            className="ml-4 text-lg opacity-70 hover:opacity-100 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
      
      {toast.progress !== undefined && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${toast.progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
};

const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove toast after duration (except for loading toasts)
    if (newToast.type !== 'loading' && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, duration: 8000, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    loading: (message, options = {}) => addToast({ type: 'loading', message, duration: 0, ...options }),
    promise: async (promise, options = {}) => {
      const loadingId = addToast({
        type: 'loading',
        message: options.loading || 'Processing...',
        duration: 0
      });

      try {
        const result = await promise;
        removeToast(loadingId);
        addToast({
          type: 'success',
          message: options.success || 'Operation completed successfully',
          duration: 3000
        });
        return result;
      } catch (error) {
        removeToast(loadingId);
        addToast({
          type: 'error',
          message: options.error || error.message || 'Operation failed',
          duration: 8000
        });
        throw error;
      }
    }
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearAllToasts,
    toast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
