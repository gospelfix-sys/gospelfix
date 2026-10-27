import { ComingSoonSkeleton } from "@/components/skeletons/ComingSoonSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 상위 (public)/loading.tsx(홈 다크 스켈레톤)를 물려받으면 /guide 진입 직전에 홈 화면이 비친다.
// 이용가이드와 같은 라이트 배경의 "준비 중" 자리표시를 둔다.
export default function GuideLoading() {
  return (
    <SkeletonRegion className="bg-gf-bg">
      <ComingSoonSkeleton titleWidth="w-36" />
    </SkeletonRegion>
  );
}
