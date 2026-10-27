import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ArticleSkeletonProps {
  className?: string;
}

const PARAGRAPH_WIDTHS = ["w-full", "w-full", "w-11/12", "w-full", "w-3/4"];

// 본문형 상세(블로그 글, 인터셉트 모달 본문) 자리표시: 카테고리·날짜 줄 + 제목 2줄 + 구분선 +
// 대표 이미지 + 문단. NewsDetailContent의 header(mb-10)·구분선(mb-10) 간격과 맞춘다.
export function ArticleSkeleton({ className }: ArticleSkeletonProps) {
  return (
    <div className={cn("mx-auto w-full max-w-3xl", className)}>
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="mb-4 flex flex-col gap-2">
          <Skeleton className="h-8 w-11/12" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
      <div className="mb-10 border-t border-gf-border" />
      <Skeleton className="mb-8 aspect-[16/9] w-full rounded-2xl" />
      <div className="flex flex-col gap-3">
        {PARAGRAPH_WIDTHS.map((width, i) => (
          <Skeleton key={i} className={cn("h-4", width)} />
        ))}
      </div>
    </div>
  );
}
