import Link from "next/link";

export default function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  iconClass = "bg-[#EAF4FF] text-[#0075FF]",
  valueClass = "text-[#0B3A67]",
}) {
  return (
    <Link
      href={href}
      className="
        flex
        min-h-[112px]
        items-center
        gap-3
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-4
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#0075FF]/30
        hover:shadow-md
      "
    >
      <div
        className={`
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${iconClass}
        `}
      >
        <Icon size={22} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {title}
        </p>

        <p
          className={`mt-1 text-base font-bold ${valueClass}`}
        >
          {value}
        </p>

        {description && (
          <p className="mt-1 text-[11px] leading-4 text-slate-400">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}