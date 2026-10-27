import { FeatureCardSkeleton } from "@/components/skeletons/FeatureCardSkeleton";
import { SectionHeadingSkeleton } from "@/components/skeletons/SectionHeadingSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";
import { Skeleton } from "@/components/ui/skeleton";

// /layer(에이전시 랜딩)는 사이드바 없는 풀스크린 히어로 페이지라, 상위 (public)/loading.tsx
// (마켓플레이스용 사이드바+캐러셀+상품그리드 스켈레톤)를 그대로 물려받으면 완전히 다른
// 레이아웃이 잠깐 나타났다 사라지는 전환이 생긴다. 이 페이지는 데이터 fetch가 끝날 때까지
// 전체가 한 번에 렌더되므로(내부 Suspense 스트리밍 없음), 히어로+추천 대상 섹션의 치수만
// 동일하게 맞춘 전용 스켈레톤을 둔다.
export default function LayerLoading() {
  return (
    <SkeletonRegion className="flex flex-col">
      <section className="flex min-h-[100vh] flex-col items-center justify-center gap-8 px-6 pb-12 pt-28">
        <Skeleton className="h-9 w-72 max-w-full rounded-full" />
        <SectionHeadingSkeleton
          titleWidths={["w-32", "w-48", "w-64", "w-40"]}
          titleHeight="h-14"
          descriptionWidths={["w-72", "w-80", "w-64"]}
          className="gap-8"
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 w-32 rounded-full" />
          <Skeleton className="h-12 w-36 rounded-full" />
        </div>
      </section>

      <section className="border-b border-gf-border bg-white px-6 pb-24 pt-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeadingSkeleton
            showLabel
            titleWidths={["w-64"]}
            descriptionWidths={["w-72"]}
            className="mb-12 gap-2"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <FeatureCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </SkeletonRegion>
  );
}
