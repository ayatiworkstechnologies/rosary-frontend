import { Loader2 } from "lucide-react";
import { cn } from "@/lib/design-tokens";

export default function DataTable({
  columns,
  data,
  keyField = "id",
  loading = false,
  emptyTitle = "No records found",
  emptyDescription,
  emptyIcon: EmptyIcon,
  onRowClick,
  renderCell,
  className = "",
  headerClassName = "",
  bodyClassName = "",
  rowClassName = "",
  compact = false,
}) {
  const cellPadding = compact ? "px-4 py-2.5" : "px-5 py-4";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#E5EDF5] bg-white shadow-sm",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-full">
          <thead
            className={cn(
              "bg-[#F7F9FC] text-left text-[11px] font-semibold uppercase tracking-wide text-[#64748B]",
              headerClassName
            )}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    cellPadding,
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody
            className={cn("divide-y divide-[#E5EDF5]", bodyClassName)}
          >
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-14 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Loader2
                      size={22}
                      className="animate-spin text-[#0075FF]"
                    />
                    <p className="text-sm text-[#64748B]">
                      Loading...
                    </p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-14 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    {EmptyIcon && (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF4FF] text-[#0075FF]">
                        <EmptyIcon size={26} />
                      </div>
                    )}
                    <p className="text-base font-semibold text-[#0B3A67]">
                      {emptyTitle}
                    </p>
                    {emptyDescription && (
                      <p className="max-w-sm text-sm text-[#64748B]">
                        {emptyDescription}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row[keyField]}
                  className={cn(
                    "transition hover:bg-[#F7F9FC]",
                    onRowClick && "cursor-pointer",
                    rowClassName
                  )}
                  onClick={
                    onRowClick
                      ? () => onRowClick(row)
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        cellPadding,
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className
                      )}
                    >
                      {renderCell
                        ? renderCell(row, col)
                        : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}