import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast, ToastType } from '../components/ui/Toast';
import { Alert, AlertType } from '../components/ui/Alert';

interface NotificationContextType {
  // Toast methods
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  
  // Alert methods
  showAlert: (
    type: AlertType,
    title: string,
    message: string,
    options?: {
      onConfirm?: () => void;
      confirmText?: string;
      cancelText?: string;
      showCancel?: boolean;
    }
  ) => void;
  showSuccessAlert: (title: string, message: string) => void;
  showErrorAlert: (title: string, message: string) => void;
  showWarningAlert: (title: string, message: string) => void;
  showInfoAlert: (title: string, message: string) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  // Toast state
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    duration?: number;
  }>>([]);

  // Alert state
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

  // Toast methods
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

  const showSuccess = (message: string, title?: string) => showToast(message, 'success', title);
  const showError = (message: string, title?: string) => showToast(message, 'error', title);
  const showWarning = (message: string, title?: string) => showToast(message, 'warning', title);
  const showInfo = (message: string, title?: string) => showToast(message, 'info', title);

  // Alert methods
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

  const showSuccessAlert = (title: string, message: string) => showAlert('success', title, message);
  const showErrorAlert = (title: string, message: string) => showAlert('error', title, message);
  const showWarningAlert = (title: string, message: string) => showAlert('warning', title, message);
  const showInfoAlert = (title: string, message: string) => showAlert('info', title, message);
  
  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText?: string,
    cancelText?: string
  ) => showAlert('confirm', title, message, { onConfirm, confirmText, cancelText, showCancel: true });

  const contextValue: NotificationContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAlert,
    showSuccessAlert,
    showErrorAlert,
    showWarningAlert,
    showInfoAlert,
    showConfirm
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Toast Container */}
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

      {/* Alert Container */}
      <Alert
        {...alert}
        onClose={hideAlert}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};