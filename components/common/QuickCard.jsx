import Link from "next/link";

export default function QuickCard({
  title,
  icon: Icon,
  href,
  className = "bg-[#EAF4FF] text-[#0075FF]",
}) {
  if (!href) {
    return null;
  }

  return (
    <Link
      href={href}
      className="
        rounded-2xl
        border
        border-[#E4EDF7]
        bg-white
        p-3
        text-center
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
          mx-auto
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          ${className}
        `}
      >
        {Icon && <Icon size={19} />}
      </div>

      <p className="mt-2 text-xs font-semibold text-[#0B3A67]">
        {title}
      </p>
    </Link>
  );
}