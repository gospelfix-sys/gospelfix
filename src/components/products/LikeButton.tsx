"use client";

import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { Heart } from "lucide-react";
import { isAuthenticatedSelector } from "@/store/selectors/authSelector";
import { useAuth } from "@/hooks/useAuth";
import axiosInstance from "@/lib/axios/instance";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  productId: string;
  productSlug: string;
  initialLikeCount: number;
  className?: string;
}

// 좋아요 수를 "6.7천"/"1.2만" 형태로 축약한다. 1000 미만은 그대로 표시.
function formatLikeCount(count: number): string {
  if (count < 1000) return count.toLocaleString("ko-KR");
  if (count < 10000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}천`;
  return `${(count / 10000).toFixed(1).replace(/\.0$/, "")}만`;
}

export function LikeButton({
  productId,
  productSlug,
  initialLikeCount,
  className,
}: LikeButtonProps) {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const { openAuthModal } = useAuth();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likedByMe, setLikedByMe] = useState(false);
  const isRequestingRef = useRef(false);
  // 마운트 시 좋아요 상태를 재조회하는 동안 사용자가 먼저 클릭했다면, 그 이후 도착하는
  // stale GET 응답이 이미 확정된 최신 상태를 덮어쓰지 않도록 막는다.
  const hasInteractedRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    axiosInstance
      .get("/products/like", { params: { productId } })
      .then((res) => {
        if (!isMountedRef.current || hasInteractedRef.current) return;
        setLikeCount(res.data.like_count);
        setLikedByMe(res.data.liked_by_me);
      })
      .catch(() => {
        // 조회 실패 시 초기값(product.like_count) 유지 — 좋아요 여부는 미확정으로 둔다
      });

    return () => {
      isMountedRef.current = false;
    };
  }, [productId]);

  async function handleClick() {
    if (isRequestingRef.current) return;

    if (!isAuthenticated) {
      openAuthModal("login", `/detail/${productSlug}`);
      return;
    }

    hasInteractedRef.current = true;

    const prevLiked = likedByMe;
    const prevCount = likeCount;

    // 낙관적 업데이트 — 실패 시 아래에서 원상 복구
    setLikedByMe(!prevLiked);
    setLikeCount(prevLiked ? prevCount - 1 : prevCount + 1);

    isRequestingRef.current = true;
    try {
      const res = await axiosInstance.post("/products/like", { productId });
      if (!isMountedRef.current) return;
      setLikeCount(res.data.like_count);
      setLikedByMe(res.data.liked);
    } catch {
      if (!isMountedRef.current) return;
      setLikedByMe(prevLiked);
      setLikeCount(prevCount);
    } finally {
      isRequestingRef.current = false;
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={likedByMe}
      aria-label={likedByMe ? "좋아요 취소" : "좋아요"}
      className={cn(
        "flex h-14 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border-2 transition-colors",
        likedByMe
          ? "border-gf-orange bg-gf-orange-bg text-gf-orange"
          : "border-gf-border bg-gf-white text-gf-gray1 hover:border-gf-orange hover:text-gf-orange",
        className,
      )}
    >
      <Heart className="size-5" fill={likedByMe ? "currentColor" : "none"} />
      <span className="text-[11px] font-bold leading-none">{formatLikeCount(likeCount)}</span>
    </button>
  );
}
