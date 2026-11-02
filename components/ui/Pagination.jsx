import { cn } from "@/lib/design-tokens";

export default function Pagination({
  page,
  totalPages,
  total,
  PAGE_SIZE = 20,
  loading = false,
  onPageChange,
  className = "",
}) {
  const startRecord = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(page * PAGE_SIZE, total);

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let number = start; number <= end; number++) {
    pages.push(number);
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-t border-[#E5EDF5] px-5 py-4 lg:flex-row lg:items-center lg:justify-between",
        className
      )}
    >
      <p className="text-sm text-[#64748B]">
        Showing{" "}
        <span className="font-semibold text-[#0B3A67]">
          {startRecord}–{endRecord}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-[#0B3A67]">
          {total.toLocaleString()}
        </span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={loading || page <= 1}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5EDF5] px-3 text-sm font-medium text-[#0B3A67] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        {pages.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onPageChange(number)}
            disabled={loading}
            aria-current={page === number ? "page" : undefined}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-semibold transition",
              page === number
                ? "bg-[#0075FF] text-white"
                : "border border-[#E5EDF5] text-[#0B3A67] hover:bg-[#F7F9FC]"
            )}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={loading || page >= totalPages}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#E5EDF5] px-3 text-sm font-medium text-[#0B3A67] transition hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      <p className="text-sm text-[#64748B]">
        Page{" "}
        <span className="font-semibold text-[#0B3A67]">{page}</span>{" "}
        of <span className="font-semibold text-[#0B3A67]">{totalPages}</span>
      </p>
    </div>
  );
}