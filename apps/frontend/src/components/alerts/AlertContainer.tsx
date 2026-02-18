import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useAlert } from '../../context/AlertContext';

export function AlertContainer() {
  const { toasts, removeToast, confirmDialog, alertDialog } = useAlert();

  return (
    <>
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border-2 backdrop-blur-sm animate-slide-in-right ${
              toast.type === 'success'
                ? 'bg-green-50/95 border-green-200 text-green-800'
                : toast.type === 'error'
                  ? 'bg-red-50/95 border-red-200 text-red-800'
                  : toast.type === 'warning'
                    ? 'bg-yellow-50/95 border-yellow-200 text-yellow-800'
                    : 'bg-blue-50/95 border-blue-200 text-blue-800'
            }`}
          >
            <FontAwesomeIcon
              icon={
                toast.type === 'success'
                  ? faCheckCircle
                  : toast.type === 'error'
                    ? faExclamationCircle
                    : toast.type === 'warning'
                      ? faExclamationTriangle
                      : faInfoCircle
              }
              className="text-xl mt-0.5 flex-shrink-0"
            />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current opacity-60 hover:opacity-100 transition flex-shrink-0"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                {confirmDialog.options.title}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-slate-600">{confirmDialog.options.message}</p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={confirmDialog.onCancel}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                {confirmDialog.options.cancelText || 'Cancelar'}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-white transition ${
                  confirmDialog.options.type === 'danger'
                    ? 'bg-red-600 hover:bg-red-700'
                    : confirmDialog.options.type === 'warning'
                      ? 'bg-yellow-600 hover:bg-yellow-700'
                      : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {confirmDialog.options.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Dialog */}
      {alertDialog?.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
            {/* Header */}
            {alertDialog.options.title && (
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">
                  {alertDialog.options.title}
                </h2>
              </div>
            )}

            {/* Body */}
            <div className="p-6">
              <div className="flex items-start gap-3">
                <FontAwesomeIcon
                  icon={
                    alertDialog.options.type === 'success'
                      ? faCheckCircle
                      : alertDialog.options.type === 'error'
                        ? faExclamationCircle
                        : alertDialog.options.type === 'warning'
                          ? faExclamationTriangle
                          : faInfoCircle
                  }
                  className={`text-2xl mt-0.5 ${
                    alertDialog.options.type === 'success'
                      ? 'text-green-600'
                      : alertDialog.options.type === 'error'
                        ? 'text-red-600'
                        : alertDialog.options.type === 'warning'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                  }`}
                />
                <p className="flex-1 text-slate-700">{alertDialog.options.message}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={alertDialog.onClose}
                className="w-full px-4 py-2.5 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition"
              >
                {alertDialog.options.confirmText || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
