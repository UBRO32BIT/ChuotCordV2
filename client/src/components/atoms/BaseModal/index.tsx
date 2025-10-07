import React from "react";

interface DialogProps {
  open: boolean;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  maxWidth?: string;
}

export default function BaseModal({
  open,
  title,
  children,
  footer,
  onClose,
  maxWidth = "max-w-md",
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div
        className={`rounded-lg p-6 w-full ${maxWidth} bg-[var(--dialog-bg)] text-[var(--dialog-text)] border border-[var(--dialog-border)]`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded bg-[var(--button-secondary)] hover:bg-[var(--button-secondary-hover)] text-[var(--button-text)]"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">{children}</div>
        {footer && <div className="flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}
