import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface FeatureCardSkeletonProps {
  className?: string;
}

// gf-feature-card(아이콘 사각형 + 제목 + 설명 2줄) 자리표시. 카드 테두리·배경은 실제 카드와 같은
// 토큰(gf-gray3 테두리, gf-bg 배경)을 써서 교체 순간 카드 윤곽이 바뀌지 않게 한다.
export function FeatureCardSkeleton({ className }: FeatureCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-gf-gray3 bg-gf-bg p-6",
        className,
      )}
    >
      <Skeleton className="size-10 rounded-xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}
