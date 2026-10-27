import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SectionHeadingSkeletonProps {
  /** gf-section-label 알약 자리를 그릴지 */
  showLabel?: boolean;
  /** 제목 줄마다의 너비 클래스(예: ["w-64", "w-48"]) — 실제 제목 줄 수와 맞춘다 */
  titleWidths: string[];
  /** 제목 한 줄 높이 클래스. 실제 글자 크기의 line-height와 맞춘다 */
  titleHeight?: string;
  /** 설명 줄마다의 너비 클래스 */
  descriptionWidths?: string[];
  className?: string;
}

// 가운데 정렬된 "라벨 알약 + 제목 + 설명" 블록. 소개·에이전시·준비 중 페이지의 히어로와
// 섹션 머리가 모두 이 모양이라 줄 수·너비만 바꿔 재사용한다.
export function SectionHeadingSkeleton({
  showLabel = false,
  titleWidths,
  titleHeight = "h-8",
  descriptionWidths = [],
  className,
}: SectionHeadingSkeletonProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {showLabel && <Skeleton className="h-[22px] w-24 rounded-full" />}
      <div className="flex w-full flex-col items-center gap-2">
        {titleWidths.map((width, i) => (
          <Skeleton key={i} className={cn("max-w-full", titleHeight, width)} />
        ))}
      </div>
      {descriptionWidths.length > 0 && (
        <div className="flex w-full flex-col items-center gap-2">
          {descriptionWidths.map((width, i) => (
            <Skeleton key={i} className={cn("h-4 max-w-full", width)} />
          ))}
        </div>
      )}
    </div>
  );
}
