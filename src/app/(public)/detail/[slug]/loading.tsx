import { ProductDetailSkeleton } from "@/components/products/ProductDetailSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 상품 상세 직접 진입 시 상위 (public)/loading.tsx(홈 상품그리드 스켈레톤)를 물려받으면 전혀
// 다른 레이아웃이 잠깐 비친다. 실제 상세와 같은 라이트 배경·여백의 2단 자리표시를 둔다.
export default function ProductDetailLoading() {
  return (
    <SkeletonRegion className="min-h-screen bg-gf-bg">
      <div className="max-w-[2400px] px-6 pb-10 pt-20 lg:px-[40px]">
        <ProductDetailSkeleton />
      </div>
    </SkeletonRegion>
  );
}
