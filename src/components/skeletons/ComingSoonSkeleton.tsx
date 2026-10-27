import { SectionHeadingSkeleton } from "@/components/skeletons/SectionHeadingSkeleton";

interface ComingSoonSkeletonProps {
  /** 실제 페이지 제목 길이에 맞춘 너비 클래스 */
  titleWidth?: string;
}

// "콘텐츠를 준비 중입니다" 페이지(이용가이드·크리에이터·무료 리소스)의 가운데 제목+안내문 자리표시.
// 실제 페이지와 같은 min-h-[60vh] 가운데 정렬이라 교체 순간 글자 위치가 그대로 이어진다.
export function ComingSoonSkeleton({ titleWidth = "w-40" }: ComingSoonSkeletonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <SectionHeadingSkeleton
        titleWidths={[titleWidth]}
        descriptionWidths={["w-72"]}
        className="gap-3"
      />
    </div>
  );
}
