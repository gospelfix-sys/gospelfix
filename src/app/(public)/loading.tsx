import { Suspense } from "react";
import { LayerShell } from "@/components/layer/LayerShell";
import { HomeHero } from "@/components/layer/HomeHero";
import { SortTabs } from "@/components/layer/SortTabs";
import { CategoryTabs } from "@/components/layer/CategoryTabs";
import { FilterDropdown } from "@/components/products/FilterDropdown";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 상단 네비/히어로/정렬 탭/카테고리 탭/가격 필터는 상품 목록 fetch와 무관하게 즉시 렌더
// 가능한 실제 컴포넌트라 그대로 재사용한다 — 별도 스켈레톤을 손으로 맞추면 실제 레이아웃이
// 바뀔 때마다 이 파일이 따로 어긋나는 문제(과거 반복된 loading.tsx 드리프트)를 원천 차단한다.
// 상품 카드 그리드만 fetch 결과에 의존하므로 그 부분만 스켈레톤으로 남긴다.
export default function LayerLoading() {
  return (
    <LayerShell>
      <HomeHero />

      <section id="gallery" className="scroll-mt-20 px-6 pb-16 lg:px-10">
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <Suspense fallback={null}>
            <SortTabs />
          </Suspense>
          <CategoryTabs currentCategory="" />
          <Suspense fallback={null}>
            <FilterDropdown paramKey="price" placeholder="가격" options={[]} />
          </Suspense>
        </div>

        {/* 카드 그리드만 fetch 결과에 의존하므로 스켈레톤으로 둔다 */}
        <SkeletonRegion className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </SkeletonRegion>
      </section>
    </LayerShell>
  );
}
