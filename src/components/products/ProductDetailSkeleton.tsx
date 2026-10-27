import { Skeleton } from "@/components/ui/skeleton";

// ProductDetailView의 "옵션(왼쪽) + 상품 정보 사이드바(오른쪽, 380px)" 2단 그리드 자리표시.
// 모바일에서는 실제와 같이 상품 정보가 위, 옵션이 아래로 쌓인다(order 클래스 동일).
export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1200px] flex-col gap-10 pb-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        {/* 상품 정보: 정보 티켓 + 카테고리 알약 + 제목 + 설명 + 가격 + 구매 버튼 */}
        <div className="flex flex-col gap-6 lg:order-2">
          <Skeleton className="h-40 w-full rounded-2xl bg-gf-white" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-7 w-11/12" />
            <Skeleton className="h-7 w-2/3" />
            <Skeleton className="mt-1 h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>

        {/* 옵션: 제목 + 옵션 카드 목록 */}
        <div className="flex flex-col gap-4 lg:order-1">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl bg-gf-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
