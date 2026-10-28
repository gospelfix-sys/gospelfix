import { Skeleton } from "@/components/ui/skeleton";

// BlogCard 실제 구조(592:360 썸네일 + 카테고리/제목 2줄/날짜)와 같은 치수의 자리표시.
// 썸네일 톤은 실제 카드의 빈 썸네일 배경(gf-surface)과 맞춘다.
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[592/360] rounded-2xl bg-gf-surface" />
      <div className="flex flex-col gap-1.5 px-1">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
