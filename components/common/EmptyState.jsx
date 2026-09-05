export default function EmptyState({ title, description }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F5F9FF] px-5 py-10">
      <section className="w-full max-w-2xl rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.10)] sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#0075FF]">
          Rosary School Portal
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[#0F3B78]">{title}</h1>
        <p className="mt-4 text-slate-500">
          {description || "This section is ready for content."}
        </p>
      </section>
    </main>
  );
}
