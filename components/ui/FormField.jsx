import { cn } from "@/lib/design-tokens";

export default function FormField({
  label,
  required = false,
  error,
  hint,
  children,
  className = "",
  labelClassName = "",
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          className={cn(
            "text-xs font-semibold text-[#0B3A67]",
            labelClassName
          )}
        >
          {label}
          {required && <span className="ml-1 text-[#DC2626]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs font-medium text-[#DC2626]">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-[#94A3B8]">{hint}</p>
      )}
    </div>
  );
}