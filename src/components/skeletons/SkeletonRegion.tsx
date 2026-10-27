import { Suspense } from "react";
import { SkeletonPulse } from "@/components/ui/SkeletonPulse";
import { cn } from "@/lib/utils";

interface SkeletonRegionProps {
  children: React.ReactNode;
  className?: string;
  /** 스크린리더 안내 문구 */
  label?: string;
}

// 스켈레톤 화면 하나에 상태 안내를 한 번만 둔다. 블록(Skeleton)마다 읽히면 소음이 되므로
// 블록은 aria-hidden이고, 이 영역이 role="status"로 "불러오는 중"만 전달한다.
// 맥동(SkeletonPulse) 청크를 받는 동안에는 같은 블록을 정적으로 보여준다 — fallback이 없으면
// suspend가 바깥 (public)/loading.tsx까지 올라가 홈 스켈레톤이 잠깐 비친다.
export function SkeletonRegion({
  children,
  className,
  label = "불러오는 중",
}: SkeletonRegionProps) {
  return (
    <div role="status" aria-busy="true" className={cn(className)}>
      <span className="sr-only">{label}</span>
      <Suspense fallback={children}>
        <SkeletonPulse>{children}</SkeletonPulse>
      </Suspense>
    </div>
  );
}
