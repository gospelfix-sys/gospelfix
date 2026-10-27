import { LayerShellLoading } from "@/components/layer/LayerShellLoading";
import { ArticleSkeleton } from "@/components/skeletons/ArticleSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 블로그 상세는 상위 (public)/loading.tsx(홈 상품그리드 스켈레톤)를 물려받으면 진입 직후 전혀
// 다른 레이아웃이 잠깐 비친다. 실제 상세와 같은 LayerShell(다크) + 본문 폭의 자리표시를 둔다.
export default function BlogDetailLoading() {
  return (
    <LayerShellLoading>
      <SkeletonRegion className="px-6 pb-14 pt-14 lg:px-[60px]">
        <ArticleSkeleton />
      </SkeletonRegion>
    </LayerShellLoading>
  );
}
