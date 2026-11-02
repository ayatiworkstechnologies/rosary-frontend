"use client";

import { cn } from "@/lib/design-tokens";

const variantClasses = {
  primary:
    "bg-[#0075FF] text-white hover:bg-[#005FD1] focus:ring-[#0075FF]/30",
  secondary:
    "border border-[#E5EDF5] bg-white text-[#0B3A67] hover:bg-[#F7F9FC] focus:ring-[#0075FF]/20",
  danger:
    "bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#DC2626]/30",
  ghost:
    "bg-transparent text-[#64748B] hover:bg-[#F7F9FC] hover:text-[#0B3A67]",
  outline:
    "border border-[#E5EDF5] bg-transparent text-[#0B3A67] hover:bg-[#F7F9FC]",
};

const sizeClasses = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  leftIcon,
  rightIcon,
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      {...props}
    >
      {leftIcon}
      {children}
      {rightIcon}
    </button>
  );
}