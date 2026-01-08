import type { ReactNode } from "react";
import { Modal } from "./Modal";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
  busy?: boolean;
};

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmTone = "primary",
  onConfirm,
  onClose,
  busy,
}: ConfirmModalProps) {
  const confirmClassName =
    confirmTone === "danger"
      ? "bg-red-600 text-white"
      : "bg-slate-900 text-white";

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-xl border border-slate-200 text-slate-700 font-medium px-4 py-2 transition shadow-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex justify-center rounded-xl font-medium px-4 py-2 transition shadow-sm disabled:opacity-60 ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {description ? <div className="text-sm text-slate-600">{description}</div> : null}
    </Modal>
  );
}
