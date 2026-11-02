"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/design-tokens";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toneClasses = {
  success: "border-[#DCF7DF] bg-white",
  error: "border-[#FEE2E2] bg-white",
  warning: "border-[#FEF3C7] bg-white",
  info: "border-[#EAF4FF] bg-white",
};

const iconTones = {
  success: "text-[#16A34A]",
  error: "text-[#DC2626]",
  warning: "text-[#F59E0B]",
  info: "text-[#0075FF]",
};

export default function Toast({
  id,
  message,
  description,
  type = "info",
  duration = 4000,
  onClose,
}) {
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(id), 200);
    }, duration);

    return () => clearTimeout(timerRef.current);
  }, [duration, id, onClose]);

  const Icon = icons[type] || icons.info;

  return (
    <div
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-xl border shadow-lg",
        toneClasses[type] || toneClasses.info,
        visible ? "animate-in slide-in-from-right" : "animate-out slide-out-to-right",
        "transition-all duration-200"
      )}
      role="alert"
    >
      <div className={cn("mt-0.5", iconTones[type] || iconTones.info)}>
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#0B3A67]">{message}</p>
        {description && (
          <p className="mt-0.5 text-xs text-[#64748B]">{description}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          clearTimeout(timerRef.current);
          setVisible(false);
          setTimeout(() => onClose?.(id), 200);
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#94A3B8] transition hover:bg-[#F7F9FC] hover:text-[#0B3A67]"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// Toast container + provider
export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex w-full flex-col gap-2 px-4 sm:px-0 sm:w-auto"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          description={toast.description}
          type={toast.type}
          duration={toast.duration}
          onClose={onDismiss}
        />
      ))}
    </div>
  );
}

// Hook for toast management
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const addToast = ({ message, description, type = "info", duration = 4000 }) => {
    const id = `toast-${nextId.current++}`;
    setToasts((previous) => [...previous, { id, message, description, type, duration }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setToasts([]);
  };

  return { toasts, addToast, removeToast, clearAll };
}