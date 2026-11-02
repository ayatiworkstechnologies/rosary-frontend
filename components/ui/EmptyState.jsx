import { cn } from "@/lib/design-tokens";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#E5EDF5] bg-white px-6 py-14 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0075FF]">
          <Icon size={26} />
        </div>
      )}

      <h3 className="mt-4 text-base font-semibold text-[#0B3A67]">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-[#64748B]">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}