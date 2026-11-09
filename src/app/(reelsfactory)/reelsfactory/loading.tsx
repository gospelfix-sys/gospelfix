import { SkeletonRegion } from "@/components/skeletons/SkeletonRegion";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReelsfactoryLoading() {
  return (
    <SkeletonRegion className="min-h-dvh bg-rf-ink px-6 py-16 md:pl-28">
      <div className="flex flex-col gap-6">
        <Skeleton className="h-4 w-24 bg-rf-cream/20" />
        <Skeleton className="h-24 w-3/4 bg-rf-cream/20 md:h-40" />
        <Skeleton className="h-24 w-2/3 bg-rf-cream/20 md:h-40" />
        <Skeleton className="h-24 w-1/2 bg-rf-cream/20 md:h-40" />
      </div>
    </SkeletonRegion>
  );
}
