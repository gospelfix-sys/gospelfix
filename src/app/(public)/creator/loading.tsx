import { LayerShell } from "@/components/layer/LayerShell";

// 사이드바/상단바는 실제 LayerShell을 그대로 재사용한다 — 손으로 맞춘 가짜 셸은 실제
// 레이아웃이 바뀔 때마다 따로 어긋나는 문제가 있다((public)/loading.tsx와 동일한 관례).
export default function CreatorLoading() {
  return (
    <LayerShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6">
        <div className="h-7 w-40 max-w-full animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-gray-100" />
      </div>
    </LayerShell>
  );
}
