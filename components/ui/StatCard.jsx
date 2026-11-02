import { cn } from "@/lib/design-tokens";

const toneClasses = {
  blue: "bg-[#EAF4FF] text-[#0075FF]",
  green: "bg-[#DCF7DF] text-[#16A34A]",
  amber: "bg-[#FEF3C7] text-[#B45309]",
  red: "bg-[#FEE2E2] text-[#DC2626]",
  slate: "bg-[#F1F5F9] text-[#64748B]",
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "blue",
  trend,
  className = "",
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[#E5EDF5] bg-white p-5 shadow-sm transition hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#64748B]">{title}</p>
          <p className="mt-2 text-3xl font-bold text-[#0B3A67]">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-semibold",
                trend.positive ? "text-[#16A34A]" : "text-[#DC2626]"
              )}
            >
              {trend.positive ? "▲" : "▼"} {trend.value}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
              toneClasses[tone] || toneClasses.blue
            )}
          >
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}