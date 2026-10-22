import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import { getMe } from "@/lib/api/me";
import { serverFetch } from "@/lib/serverFetch";
import { cn } from "@/lib/utils";
import { Review } from "@/types/review.types";
import { PurchasedOrder } from "@/types/order.types";
import { ReviewForm } from "./ReviewForm";

interface ReviewSectionProps {
  productId: string;
}

// Tailwind는 정적 분석으로 클래스를 스캔하므로 임의값(w-[N%])을 동적으로 조합할 수 없다.
// 10% 단위로 반올림해 이 목록에서 선택하는 방식으로 style= 없이 런타임 비율을 표현한다.
const DISTRIBUTION_BAR_WIDTH_CLASSES = [
  "w-0",
  "w-[10%]",
  "w-[20%]",
  "w-[30%]",
  "w-[40%]",
  "w-[50%]",
  "w-[60%]",
  "w-[70%]",
  "w-[80%]",
  "w-[90%]",
  "w-full",
];

function distributionBarWidthClass(count: number, total: number) {
  if (total === 0) return DISTRIBUTION_BAR_WIDTH_CLASSES[0];
  return DISTRIBUTION_BAR_WIDTH_CLASSES[Math.round((count / total) * 10)];
}

export async function ReviewSection({ productId }: ReviewSectionProps) {
  // getMe/reviews/orders는 서로 의존하지 않으므로 병렬로 가져온다.
  // orders는 page.tsx가 이미 동일 인자로 조회하므로 serverFetch를 감싼 React cache()로
  // 요청 단위 dedupe되어 실제 네트워크 왕복은 늘지 않는다.
  const [me, reviews, purchasedOrders] = await Promise.all([
    getMe(),
    serverFetch<Review[]>(`/api/reviews?productId=${encodeURIComponent(productId)}`),
    serverFetch<PurchasedOrder[]>("/api/orders"),
  ]);
  const user = me?.user ?? null;

  const average =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const existingReview = user ? (reviews.find((r) => r.user_id === user.id) ?? null) : null;

  const hasPurchased = user
    ? purchasedOrders.some((order) => order.product?.id === productId)
    : false;

  return (
    <section id="reviews" className="mt-16">
      <h2 className="mb-6 text-xl font-black tracking-[-0.03em] text-gf-black">고객 리뷰</h2>

      {/* 평점 요약 */}
      <div className="mb-6 flex flex-col gap-8 rounded-2xl border border-gf-border bg-gf-white p-6 sm:flex-row sm:items-center">
        {/* 평균 점수 */}
        <div className="flex flex-col items-center min-w-[120px]">
          <span className="text-6xl font-black tracking-[-0.04em] text-gf-black">
            {reviews.length > 0 ? average.toFixed(1) : "-"}
          </span>
          <StarRating value={average} showHalf className="mt-2" />
          <p className="mt-1 text-xs text-gf-gray2">{reviews.length}개의 리뷰</p>
        </div>

        {/* 별점 분포 */}
        <div className="flex flex-1 flex-col gap-2">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-3">
              <span className="w-3 text-right text-xs text-gf-gray2">{star}</span>
              <Star
                width={11}
                height={11}
                className="flex-shrink-0 fill-gf-orange text-gf-orange"
              />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-gf-bg">
                <div
                  className={cn(
                    "h-full rounded-full bg-gf-orange transition-all duration-500",
                    distributionBarWidthClass(count, reviews.length),
                  )}
                />
              </div>
              <span className="w-4 text-xs text-gf-gray2">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 작성 폼 */}
      <ReviewForm
        productId={productId}
        isLoggedIn={!!user}
        hasPurchased={hasPurchased}
        existingReview={
          existingReview ? { rating: existingReview.rating, content: existingReview.content } : null
        }
      />

      {/* 리뷰 목록 */}
      <div className="mt-6">
        {reviews.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-gf-border bg-gf-bg">
            <p className="text-sm text-gf-gray2">
              아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => {
              // profiles.email은 cms.api가 응답 전에 이미 마스킹해서 내려준다 (원본 이메일은 네트워크로 나가지 않음).
              // full_name이 있으면 우선 노출하고, 없을 때만 마스킹된 email로 대체한다.
              const displayName =
                review.profiles?.full_name ??
                review.profiles?.email ??
                review.user_id.slice(0, 8) + "…";
              const initial = displayName[0]?.toUpperCase() ?? "?";

              return (
                <div
                  key={review.id}
                  className="rounded-2xl border border-gf-border bg-gf-white p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gf-orange/20 bg-gf-orange/15 text-xs font-bold text-gf-orange">
                        {initial}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gf-black">{displayName}</p>
                        <p className="text-xs text-gf-gray2">
                          {new Date(review.created_at).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    </div>
                    <StarRating value={review.rating} size={14} />
                  </div>
                  {review.content && (
                    <p className="text-sm leading-relaxed text-gf-gray1">{review.content}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
