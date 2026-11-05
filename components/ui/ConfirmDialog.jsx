"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/design-tokens";
import { AlertTriangle, X, Loader2 } from "lucide-react";

const toneClasses = {
  danger: "bg-[#DC2626]",
  warning: "bg-[#F59E0B]",
  info: "bg-[#0075FF]",
};

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      ref={overlayRef}
      onClick={(event) => {
        if (event.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-[#E5EDF5] bg-white p-6 shadow-xl",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white",
              toneClasses[tone] || toneClasses.danger
            )}
          >
            <AlertTriangle size={22} />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-base font-bold text-[#0B3A67]"
            >
              {title}
            </h3>
            {description && (
              <p className="mt-1.5 text-sm text-[#64748B]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F7F9FC]"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E5EDF5] bg-white px-5 text-sm font-semibold text-[#0B3A67] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50",
              tone === "danger" && "bg-[#DC2626] hover:bg-[#B91C1C]",
              tone === "warning" && "bg-[#F59E0B] hover:bg-[#D97706]",
              tone === "info" && "bg-[#0075FF] hover:bg-[#005FD1]"
            )}
          >
            {loading && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}