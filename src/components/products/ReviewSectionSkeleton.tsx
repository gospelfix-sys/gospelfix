export function ReviewSectionSkeleton() {
  return (
    <section className="mt-16 animate-pulse">
      <div className="mb-6 h-6 w-24 rounded bg-gf-bg" />

      <div className="mb-6 flex flex-col gap-8 rounded-2xl border border-gf-border bg-gf-white p-6 sm:flex-row sm:items-center">
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <div className="h-14 w-16 rounded bg-gf-bg" />
          <div className="h-4 w-20 rounded bg-gf-bg" />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="h-2 flex-1 rounded-full bg-gf-bg" />
          ))}
        </div>
      </div>

      <div className="h-32 rounded-2xl border border-dashed border-gf-border bg-gf-bg" />
    </section>
  );
}
