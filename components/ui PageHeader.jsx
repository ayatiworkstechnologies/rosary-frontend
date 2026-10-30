import { cn } from "@/lib/design-tokens";

export default function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className = "",
}) {
  return (
    <div className={cn("mb-6", className)}>
      {breadcrumb && (
        <nav className="mb-2 text-xs text-[#64748B]" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => (
            <span key={item.href || index}>
              {index > 0 && <span className="mx-1.5">/</span>}
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:text-[#0075FF]"
                >
                  {item.label}
                </a>
              ) : (
                <span className="text-[#94A3B8]">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-[#0B3A67] md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-[#64748B]">{description}</p>
          )}
        </div>

        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}