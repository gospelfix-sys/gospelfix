import { serverFetch } from "@/lib/serverFetch";
import { Review } from "@/types/review.types";
import { ReviewCountButton } from "@/components/products/ReviewCountButton";

interface ReviewCountBadgeProps {
  productId: string;
}

// ReviewSection의 리뷰 조회와 URL이 완전히 같아 React cache()로 dedupe되므로
// 이 컴포넌트가 추가돼도 실제 네트워크 호출은 늘지 않는다.
export async function ReviewCountBadge({ productId }: ReviewCountBadgeProps) {
  const reviews = await serverFetch<Review[]>(
    `/api/reviews?productId=${encodeURIComponent(productId)}`,
  );
  return <ReviewCountButton count={reviews.length} />;
}
