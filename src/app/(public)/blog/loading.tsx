import { LayerShellLoading } from "@/components/layer/LayerShellLoading";
import { BlogCardSkeleton } from "@/components/news/BlogCardSkeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";

// 상위 (public)/loading.tsx(홈 그리드 스켈레톤)를 물려받으면 /blog 진입 직전에 홈 레이아웃이
// 비친다. 실제 LayerShell(다크) 안에 블로그 목록의 제목 + 3열 카드 그리드 자리표시를 둔다.
export default function BlogListLoading() {
  return (
    <LayerShellLoading>
      <SkeletonRegion className="mx-auto max-w-[1400px] px-6 pb-20 pt-14 lg:px-10">
        <div className="mb-10 flex flex-col gap-2">
          <Skeleton className="h-9 w-28 sm:h-10" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </SkeletonRegion>
    </LayerShellLoading>
  );
}
