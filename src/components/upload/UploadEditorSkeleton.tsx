import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 서버 단계(loading.tsx)와 클라이언트 단계(인증·수정 대상 작품 조회 중)가 같은 치수를 써야
// 스켈레톤 → 빈 화면 → 에디터로 깜빡이지 않는다. loading.tsx에서도 쓰이므로 "use client"를 달지 않는다.
// 치수는 UploadEditorHeader(h-16, 닫기/초안저장/게시) + UploadWorkEditor 2단 본문에 맞춘다.
export function UploadEditorSkeleton() {
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
