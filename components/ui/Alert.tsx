import React, { useEffect, useState } from 'react';
import { Button } from './Button';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  type: AlertType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  title,
  message,
  confirmText = 'אישור',
  cancelText = 'ביטול',
  showCancel = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setIsRendered(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          gradient: 'from-green-500 via-emerald-500 to-teal-500',
          bg: 'bg-green-50',
          icon: 'fa-check-circle text-green-600',
          iconBg: 'bg-green-100',
          buttonClass: 'bg-green-600 hover:bg-green-700 shadow-green-200'
        };
      case 'error':
        return {
          gradient: 'from-red-500 via-rose-500 to-pink-500',
          bg: 'bg-red-50',
          icon: 'fa-exclamation-circle text-red-600',
          iconBg: 'bg-red-100',
          buttonClass: 'bg-red-600 hover:bg-red-700 shadow-red-200'
        };
      case 'warning':
        return {
          gradient: 'from-orange-500 via-amber-500 to-yellow-500',
          bg: 'bg-orange-50',
          icon: 'fa-exclamation-triangle text-orange-600',
          iconBg: 'bg-orange-100',
          buttonClass: 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
        };
      case 'info':
        return {
          gradient: 'from-blue-500 via-indigo-500 to-purple-500',
          bg: 'bg-blue-50',
          icon: 'fa-info-circle text-blue-600',
          iconBg: 'bg-blue-100',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
        };
      case 'confirm':
        return {
          gradient: 'from-indigo-500 via-purple-500 to-pink-500',
          bg: 'bg-indigo-50',
          icon: 'fa-question-circle text-indigo-600',
          iconBg: 'bg-indigo-100',
          buttonClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
        };
      default:
        return {
          gradient: 'from-gray-500 via-slate-500 to-gray-600',
          bg: 'bg-gray-50',
          icon: 'fa-info-circle text-gray-600',
          iconBg: 'bg-gray-100',
          buttonClass: 'bg-gray-600 hover:bg-gray-700 shadow-gray-200'
        };
    }
  };

  const styles = getAlertStyles();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-[150] flex items-center justify-center p-4 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Alert Content */}
      <div
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header gradient */}
        <div className={`h-2 bg-gradient-to-r ${styles.gradient}`} />

        <div className={`${styles.bg} p-6`}>
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className={`mx-auto w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center shadow-sm`}>
              <i className={`fas ${styles.icon} text-2xl`} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {title}
            </h3>

            {/* Message */}
            <p className="text-gray-700 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white px-6 pb-6">
          {type === 'confirm' || showCancel ? (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
                className="!py-3 !text-base !rounded-xl"
              >
                {cancelText}
              </Button>
              <Button
                fullWidth
                onClick={handleConfirm}
                className={`!py-3 !text-base !rounded-xl ${styles.buttonClass}`}
              >
                {confirmText}
              </Button>
            </div>
          ) : (
            <Button
              fullWidth
              onClick={onClose}
              className={`!py-3 !text-base !rounded-xl ${styles.buttonClass}`}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Alert Manager Hook
export const useAlert = () => {
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: AlertType;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      confirmText?: string;
      cancelText?: string;
      showCancel?: boolean;
    }
  ) => {
    setAlert({
      isOpen: true,
      type,
      title,
      message,
      ...options
    });
  };

  const hideAlert = () => {
    setAlert(prev => ({ ...prev, isOpen: false }));
  };

  const AlertContainer = () => (
    <Alert
      {...alert}
      onClose={hideAlert}
    />
  );

  return {
    showAlert,
    hideAlert,
    AlertContainer,
    showSuccess: (title: string, message: string) => showAlert('success', title, message),
    showError: (title: string, message: string) => showAlert('error', title, message),
    showWarning: (title: string, message: string) => showAlert('warning', title, message),
    showInfo: (title: string, message: string) => showAlert('info', title, message),
    showConfirm: (
      title: string,
      message: string,
      onConfirm: () => void,
      confirmText?: string,
      cancelText?: string
    ) => showAlert('confirm', title, message, { onConfirm, confirmText, cancelText, showCancel: true })
  };
};