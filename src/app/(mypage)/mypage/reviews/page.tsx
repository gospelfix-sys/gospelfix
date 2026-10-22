import Link from "next/link";
import { getMe } from "@/lib/api/me";
import { serverFetch } from "@/lib/serverFetch";
import { MyReview } from "@/types/review.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyStateCard } from "@/components/mypage/EmptyStateCard";

export const dynamic = "force-dynamic";

export default async function MypageReviewsPage() {
  const me = await getMe();
  const reviews = me?.user ? await serverFetch<MyReview[]>("/api/reviews/me") : [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">작성한 댓글</h1>

      {reviews.length === 0 ? (
        <EmptyStateCard message="아직 작성한 리뷰가 없습니다." />
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  {review.product ? (
                    <Link
                      href={`/detail/${review.product.slug}`}
                      className="hover:underline hover:underline-offset-2"
                    >
                      {review.product.name}
                    </Link>
                  ) : (
                    "삭제된 상품"
                  )}
                </CardTitle>
                <CardDescription>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)} ·{" "}
                  {new Date(review.created_at).toLocaleDateString("ko-KR")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{review.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
