import { cn } from "@/lib/design-tokens";

export default function Skeleton({
  className = "",
  rows = 5,
  columns = 4,
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#E5EDF5] bg-white",
        className
      )}
    >
      <div className="divide-y divide-[#E5EDF5]">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="flex items-center gap-4 px-5 py-4"
          >
            {Array.from({ length: columns }).map((_, col) => (
              <div
                key={col}
                className={cn(
                  "h-4 animate-pulse rounded bg-[#F1F5F9]",
                  col === 0 ? "w-10" : "flex-1"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}