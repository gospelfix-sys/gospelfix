import { Skeleton } from "@/components/ui/skeleton";

// ProductCard 실제 구조(4:3 썸네일 + 제목/카테고리 줄)와 같은 치수의 자리표시.
// 썸네일은 실제 카드 썸네일 배경(gf-white)과 같은 톤이라 이미지가 들어올 때 면이 튀지 않는다.
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/3] rounded-2xl bg-gf-white" />
      <div className="flex flex-col gap-2 px-1">
        <Skeleton className="h-4 w-3/4 bg-gf-white" />
        <Skeleton className="h-3 w-16 bg-gf-white" />
      </div>
    </div>
  );
}
