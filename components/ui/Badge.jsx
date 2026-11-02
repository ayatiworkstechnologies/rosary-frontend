"use client";

import { cn } from "@/lib/design-tokens";

const variantClasses = {
  primary: "bg-[#EAF4FF] text-[#0075FF] ring-1 ring-[#0075FF]/20",
  success: "bg-[#DCF7DF] text-[#16A34A] ring-1 ring-[#16A34A]/20",
  warning: "bg-[#FEF3C7] text-[#B45309] ring-1 ring-[#F59E0B]/20",
  danger: "bg-[#FEE2E2] text-[#DC2626] ring-1 ring-[#DC2626]/20",
  neutral: "bg-[#F1F5F9] text-[#64748B] ring-1 ring-[#E2E8F0]",
  outline: "bg-transparent text-[#64748B] ring-1 ring-[#E5EDF5]",
};

export default function Badge({
  variant = "primary",
  size = "sm",
  dot = false,
  className = "",
  children,
}) {
  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-[#0075FF]": variant === "primary",
            "bg-[#16A34A]": variant === "success",
            "bg-[#F59E0B]": variant === "warning",
            "bg-[#DC2626]": variant === "danger",
            "bg-[#64748B]": variant === "neutral" || variant === "outline",
          })}
        />
      )}
      {children}
    </span>
  );
}