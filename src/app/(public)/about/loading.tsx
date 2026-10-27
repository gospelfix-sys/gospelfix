import { FeatureCardSkeleton } from "@/components/skeletons/FeatureCardSkeleton";
import { SectionHeadingSkeleton } from "@/components/skeletons/SectionHeadingSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 상위 (public)/loading.tsx(홈 다크 스켈레톤)를 물려받으면 /about 진입 직전에 홈 화면이 비친다.
// 소개 페이지의 첫 화면(히어로 + "두 가지 방식" 섹션)과 같은 라이트 배경·간격의 스켈레톤을 둔다.
export default function AboutLoading() {
  return (
    <SkeletonRegion className="flex flex-col bg-gf-bg">
      <section className="px-6 pb-20 pt-28">
        <SectionHeadingSkeleton
          showLabel
          titleWidths={["w-80", "w-64"]}
          titleHeight="h-10 sm:h-12"
          descriptionWidths={["w-[36rem]", "w-[32rem]", "w-80"]}
          className="mx-auto max-w-3xl"
        />
      </section>

      <section className="px-6 pb-24 pt-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeadingSkeleton
            showLabel
            titleWidths={["w-72"]}
            descriptionWidths={["w-96"]}
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FeatureCardSkeleton className="min-h-64 p-8" />
            <FeatureCardSkeleton className="min-h-64 p-8" />
          </div>
        </div>
      </section>
    </SkeletonRegion>
  );
}
