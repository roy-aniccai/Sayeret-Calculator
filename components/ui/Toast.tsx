import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  title?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
  title
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(false);
    }
  }, [isVisible, duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'fa-check-circle text-green-600',
          accent: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'fa-exclamation-circle text-red-600',
          accent: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 border-orange-200',
          icon: 'fa-exclamation-triangle text-orange-600',
          accent: 'bg-orange-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'fa-info-circle text-blue-600',
          accent: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          icon: 'fa-info-circle text-gray-600',
          accent: 'bg-gray-500'
        };
    }
  };

  const styles = getToastStyles();

  if (!isVisible && !isAnimating) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[200] transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`max-w-sm w-full ${styles.bg} border-2 rounded-xl shadow-lg overflow-hidden`}>
        {/* Accent bar */}
        <div className={`h-1 ${styles.accent}`} />
        
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className={`fas ${styles.icon} text-xl`} />
            </div>
            <div className="mr-3 flex-1">
              {title && (
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {title}
                </h4>
              )}
              <p className="text-sm text-gray-700 leading-relaxed">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-sm" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Toast Manager Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    duration?: number;
  }>>([]);

  const showToast = (
    message: string,
    type: ToastType = 'info',
    title?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type, title, duration }]);
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 z-[200] space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          title={toast.title}
          duration={toast.duration}
          isVisible={true}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );

  return {
    showToast,
    ToastContainer,
    showSuccess: (message: string, title?: string) => showToast(message, 'success', title),
    showError: (message: string, title?: string) => showToast(message, 'error', title),
    showWarning: (message: string, title?: string) => showToast(message, 'warning', title),
    showInfo: (message: string, title?: string) => showToast(message, 'info', title)
  };
};