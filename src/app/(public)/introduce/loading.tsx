import { LayerShell } from "@/components/layer/LayerShell";

// 상단 네비는 실제 LayerShell을 그대로 재사용한다 — 손으로 맞춘 가짜 셸은 실제
// 레이아웃이 바뀔 때마다 따로 어긋나는 문제가 있다((public)/loading.tsx와 동일한 관례).
export default function IntroduceLoading() {
  return (
    <LayerShell>
      <section className="flex flex-col items-center gap-6 px-6 pt-20 pb-16">
        <div className="h-3 w-24 animate-pulse rounded bg-gf-border" />
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-64 max-w-full animate-pulse rounded bg-gf-border" />
          <div className="h-10 w-48 max-w-full animate-pulse rounded bg-gf-border" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-80 max-w-full animate-pulse rounded bg-gf-white" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-gf-white" />
        </div>
      </section>

      <section className="border-t border-gf-border bg-gf-white px-6 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-gf-border bg-gf-bg" />
          ))}
        </div>
      </section>
    </LayerShell>
  );
}
