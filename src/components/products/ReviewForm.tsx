"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance, { isAxiosError } from "@/lib/axios/instance";

const RATING_LABELS = ["", "별로예요", "아쉬워요", "보통이에요", "좋아요", "최고예요"];

interface ReviewFormProps {
  productId: string;
  isLoggedIn: boolean;
  hasPurchased: boolean;
  existingReview: { rating: number; content: string | null } | null;
}

export function ReviewForm({
  productId,
  isLoggedIn,
  hasPurchased,
  existingReview,
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [content, setContent] = useState(existingReview?.content ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { openAuthModal } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="rounded-2xl border border-gf-border bg-gf-white p-6 text-center">
        <p className="text-sm text-gf-gray2">
          리뷰를 작성하려면{" "}
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="font-semibold text-gf-orange underline-offset-4 hover:underline outline-none"
          >
            로그인
          </button>
          이 필요합니다.
        </p>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="rounded-2xl border border-gf-border bg-gf-white p-6 text-center">
        <p className="text-sm text-gf-gray2">상품을 구매한 고객만 리뷰를 작성할 수 있습니다.</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/reviews", { productId, rating, content: content.trim() || null });
      window.location.reload();
    } catch (error) {
      const data = isAxiosError(error)
        ? (error.response?.data as { error?: string } | undefined)
        : undefined;
      setError(data?.error ?? "저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-gf-border bg-gf-white p-6 flex flex-col gap-4"
    >
      <p className="text-sm font-bold text-gf-black">
        {existingReview ? "내 리뷰 수정" : "리뷰 작성"}
      </p>

      {/* 별점 선택 */}
      <div className="flex items-center gap-1">
        <StarRating value={rating} size={30} interactive onChange={setRating} />
        {rating > 0 && (
          <span className="ml-2 text-sm font-semibold text-gf-orange">{RATING_LABELS[rating]}</span>
        )}
      </div>

      {/* 텍스트 입력 */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="사용 후기를 남겨주세요 (선택사항)"
        rows={4}
        className="w-full resize-none rounded-lg border border-gf-border bg-gf-bg px-3 py-2.5 text-sm text-gf-black outline-none transition-colors placeholder:text-gf-gray2 focus:border-gf-orange"
      />

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "저장 중..." : existingReview ? "수정하기" : "리뷰 등록"}
        </Button>
      </div>
    </form>
  );
}
