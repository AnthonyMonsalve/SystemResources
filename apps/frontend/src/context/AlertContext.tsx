import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: AlertType;
  message: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
}

interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  type?: AlertType;
}

interface AlertContextValue {
  // Toast notifications
  showToast: (message: string, type?: AlertType, duration?: number) => void;

  // Confirm dialog (returns a promise)
  confirm: (options: ConfirmOptions) => Promise<boolean>;

  // Alert dialog (informational)
  alert: (options: AlertOptions | string) => Promise<void>;

  // Internal state (used by AlertContainer)
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  confirmDialog: {
    isOpen: boolean;
    options: ConfirmOptions;
    onConfirm: () => void;
    onCancel: () => void;
  } | null;
  alertDialog: {
    isOpen: boolean;
    options: AlertOptions;
    onClose: () => void;
  } | null;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<AlertContextValue['confirmDialog']>(null);
  const [alertDialog, setAlertDialog] = useState<AlertContextValue['alertDialog']>(null);

  const showToast = useCallback((message: string, type: AlertType = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const toast: ToastMessage = { id, message, type, duration };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        onConfirm: () => {
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      const alertOptions: AlertOptions = typeof options === 'string'
        ? { message: options, type: 'info' }
        : options;

      setAlertDialog({
        isOpen: true,
        options: alertOptions,
        onClose: () => {
          setAlertDialog(null);
          resolve();
        },
      });
    });
  }, []);

  const value: AlertContextValue = {
    showToast,
    confirm,
    alert,
    toasts,
    removeToast,
    confirmDialog,
    alertDialog,
  };

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>;
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
