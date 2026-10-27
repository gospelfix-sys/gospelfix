import { LayerShellLoading } from "@/components/layer/LayerShellLoading";
import { FeatureCardSkeleton } from "@/components/skeletons/FeatureCardSkeleton";
import { SectionHeadingSkeleton } from "@/components/skeletons/SectionHeadingSkeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 상단 네비는 실제 LayerShell(LayerShellLoading)을 그대로 재사용한다 — 손으로 맞춘 가짜 셸은 실제
// 레이아웃이 바뀔 때마다 따로 어긋나는 문제가 있다((public)/loading.tsx와 동일한 관례).
export default function IntroduceLoading() {
  return (
    <LayerShellLoading>
      <SkeletonRegion>
        <section className="px-6 pb-16 pt-20">
          <SectionHeadingSkeleton
            showLabel
            titleWidths={["w-64", "w-56"]}
            titleHeight="h-10 sm:h-12"
            descriptionWidths={["w-[35rem]", "w-[32rem]", "w-72"]}
            className="gap-6"
          />
        </section>

        <section className="border-t border-gf-border bg-gf-white px-6 py-20">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <FeatureCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </SkeletonRegion>
    </LayerShellLoading>
  );
}
