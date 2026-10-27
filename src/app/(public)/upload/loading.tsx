import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 상위 세그먼트의 src/app/(public)/loading.tsx는 LayerShell(사이드바+상품 목록
// 그리드) 스켈레톤이라 LayerShell을 쓰지 않는 이 전용 전체화면 에디터(page.tsx 주석 참고)와
// 레이아웃이 완전히 달라, 그대로 fallback으로 쓰이면 "엉뚱한 화면이 떴다가 확 바뀌는" 전환이
// 생긴다. 실제 UploadWorkEditor의 상단바(닫기/초안저장/게시)+2단 본문 구조와 동일한 치수로
// 맞춘 전용 스켈레톤을 둔다.
export default function LayerUploadLoading() {
  return (
    <SkeletonRegion className="min-h-dvh bg-gf-bg">
      <div className="flex min-h-dvh flex-col lg:pl-[220px]">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gf-border bg-gf-white px-4 lg:px-6">
          <Skeleton className="h-9 w-16 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-full" />
            <Skeleton className="h-9 w-16 rounded-full" />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-4 lg:flex-row lg:p-10">
          <div className="flex-1 rounded-2xl border border-gf-border bg-gf-white p-6 lg:p-8">
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-8">
              <Skeleton className="h-6 w-40" />
              <div className="flex items-center gap-8">
                <Skeleton className="size-20 rounded-xl" />
                <Skeleton className="size-20 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="w-full space-y-6 lg:w-[360px]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-xl bg-gf-white" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}
