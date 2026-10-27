"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, type Variants } from "motion/react";
import { ProductPriceState } from "@/lib/discount";
import { cn, formatPrice } from "@/lib/utils";
import { getCategoryLabel, Product } from "@/types/product.types";
import { PRESS_TRANSITION } from "@/components/ui/motionPresets";

// 카드가 많아 마운트 시 애니메이션 없이 호버·탭 제스처에만 반응한다(whileHover는 터치 에뮬레이션 호버를 무시).
// 카드는 살짝만 떠오르고, 썸네일은 프레임(overflow-hidden) 안에서 조금 더 천천히 확대된다.
const cardVariants: Variants = {
  hover: { y: -4, transition: { duration: 0.25, ease: "easeOut" } },
  tap: { scale: 0.985, transition: PRESS_TRANSITION },
};
const thumbnailVariants: Variants = {
  hover: { scale: 1.04, transition: { duration: 0.35, ease: "easeOut" } },
};

interface ProductCardProps {
  product: Product;
  /* 추천(PICK) 배지 표시 여부 */
  isPick?: boolean;
  /* 신규(NEW) 배지 표시 여부 — 생성일 기준 30일 이내이면 page.tsx에서 계산 후 전달 */
  isNew?: boolean;
  /* isNew와 동일하게 page.tsx(서버 컴포넌트)에서 계산 후 전달 */
  priceState: ProductPriceState;
}

// 홈 갤러리 카드: 큰 4:3 썸네일 + 하단 제목/가격/카테고리 (테두리·푸터 없음)
export function ProductCard({
  product,
  isPick = false,
  isNew = false,
  priceState,
}: ProductCardProps) {
  /* 카테고리 한국어 레이블 */
  const categoryLabel = getCategoryLabel(product.category);

  return (
    <Link href={`/detail/${product.slug}`} scroll={false} className="group block no-underline">
      <motion.article
        variants={cardVariants}
        whileHover="hover"
        whileTap="tap"
        className="flex flex-col gap-3"
      >
        {/* 썸네일 — 기존 세로형(1080x1350) 원본을 가로 프레임에 상단 기준으로 크롭.
            isolate: 확대 중인 자식이 Safari에서 둥근 모서리 클리핑을 벗어나지 않게 한다 */}
        <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl bg-gf-white">
          {product.thumbnail_url ? (
            <motion.div variants={thumbnailVariants} className="absolute inset-0">
              <Image
                src={product.thumbnail_url}
                alt={product.name}
                fill
                className="object-cover object-top"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            </motion.div>
          ) : (
            /* 썸네일 없을 때 플레이스홀더 */
            <div className="flex h-full items-center justify-center text-sm font-medium text-gf-gray2">
              미리보기 없음
            </div>
          )}

          {/* PICK / NEW 배지 (우측 상단, 우선순위: PICK > NEW).
              gf-black은 다크 스코프에서 밝은 색이라 NEW는 비반전 색(흰 배경/검정 글씨)을 쓴다 */}
          {(isPick || isNew) && (
            <span
              className={cn(
                "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide",
                isPick ? "bg-gf-orange text-white" : "bg-white text-black",
              )}
            >
              {isPick ? "Pick" : "New"}
            </span>
          )}
        </div>

        {/* 제목 + 가격 */}
        <div className="flex flex-col gap-1 px-1">
          <div className="flex items-start justify-between gap-3">
            {/* 터치 기기에서 hover가 눌린 채 남지 않도록 hover 지원 환경에서만 색을 바꾼다 */}
            <h3 className="truncate text-[15px] font-bold leading-snug text-gf-black transition-colors duration-200 [@media(hover:hover)]:group-hover:text-gf-orange">
              {product.name}
            </h3>

            {/* 가격 (0원이면 FREE로 노출, 할인 기간 활성 시에만 정가 취소선 + 할인율 —
                카드는 상시 공급원가 취소선을 보여주지 않던 기존 스코프를 유지) */}
            <span className="flex shrink-0 flex-col items-end">
              {priceState.discount && priceState.strikethroughPrice != null && (
                <span className="text-[11px] leading-none text-gf-gray2 line-through">
                  {formatPrice(priceState.strikethroughPrice)}
                </span>
              )}
              <span className="font-en text-[15px] font-black tracking-[-0.02em] text-gf-orange">
                {product.price === 0 ? (
                  "FREE"
                ) : (
                  <>
                    {priceState.effectivePrice.toLocaleString("ko-KR")}
                    <span className="ml-0.5 text-[12px] font-bold text-gf-black">원</span>
                    {priceState.discount && priceState.discount.percent > 0 && (
                      <span className="ml-1 text-[11px] font-bold">
                        {priceState.discount.percent}%
                      </span>
                    )}
                  </>
                )}
              </span>
            </span>
          </div>

          <p className="text-xs text-gf-gray2">{categoryLabel}</p>
        </div>
      </motion.article>
    </Link>
  );
}
