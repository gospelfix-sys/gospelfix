"use client";

import Link from "next/link";
import Image from "next/image";
import { ProductPriceState } from "@/lib/discount";
import { cn, formatPrice } from "@/lib/utils";
import { getCategoryLabel, Product } from "@/types/product.types";

interface ProductCardProps {
  product: Product;
  /* 추천(PICK) 배지 표시 여부 */
  isPick?: boolean;
  /* 신규(NEW) 배지 표시 여부 — 생성일 기준 30일 이내이면 page.tsx에서 계산 후 전달 */
  isNew?: boolean;
  /* isNew와 동일하게 page.tsx(서버 컴포넌트)에서 계산 후 전달 */
  priceState: ProductPriceState;
}

export function ProductCard({
  product,
  isPick = false,
  isNew = false,
  priceState,
}: ProductCardProps) {
  /* 제작자 표시 이름: 추후 product.publisher 필드 추가 시 대체 가능 */
  const publisherName = "GOSPELFIX";

  /* 카테고리 한국어 레이블 */
  const categoryLabel = getCategoryLabel(product.category);

  return (
    <Link href={`/detail/${product.slug}`} scroll={false} className="group block no-underline">
      <article className="h-full rounded-2xl border border-gf-border overflow-hidden transition-all duration-200 hover:-translate-y-1 bg-gf-white shadow-[0_4px_16px_rgba(0,0,0,0.09)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
        {/* 썸네일 */}
        <div className="relative aspect-[1080/1350] overflow-hidden rounded-t-2xl border-b border-gf-border bg-gf-bg">
          {product.thumbnail_url ? (
            <Image
              src={product.thumbnail_url}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            /* 썸네일 없을 때 플레이스홀더 */
            <div className="flex h-full items-center justify-center text-sm font-medium text-gf-gray2">
              미리보기 없음
            </div>
          )}

          {/* 카테고리 배지 (좌측 상단) */}
          <span className="absolute left-3 top-3 rounded-full border border-gf-border px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm bg-white/90 text-gf-gray1">
            {categoryLabel}
          </span>

          {/* PICK / NEW 배지 (우측 상단, 우선순위: PICK > NEW) */}
          {(isPick || isNew) && (
            <span
              className={cn(
                "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white",
                isPick ? "bg-gf-orange" : "bg-gf-black",
              )}
            >
              {isPick ? "Pick" : "New"}
            </span>
          )}

          {/* 호버 오버레이 */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center bg-black/30">
            <span className="text-white text-xs font-bold px-4 py-2 rounded-full bg-white/20 backdrop-blur-[8px]">
              상세 보기
            </span>
          </div>
        </div>

        {/* 카드 바디 */}
        <div className="p-5 pb-4">
          <h3 className="font-bold text-[15px] leading-snug line-clamp-2 mb-1.5 min-h-[42px] text-gf-black">
            {product.name}
          </h3>
          <p className="text-xs leading-relaxed line-clamp-2 min-h-[39px] text-gf-gray2">
            {product.description}
          </p>
        </div>

        {/* 카드 푸터: 제작자 + 가격 */}
        <div className="px-5 py-3.5 border-t border-gf-border flex items-center justify-between">
          {/* 제작자 정보 */}
          <div className="flex items-center gap-2">
            {/* 제작자 아바타 (이니셜 기반) */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 bg-gf-orange-bg text-gf-orange border border-[rgba(255,85,0,0.2)]">
              {publisherName.slice(0, 1)}
            </div>
            <span className="text-[12px] font-medium text-gf-gray2">{publisherName}</span>
          </div>

          {/* 가격 (0원이면 FREE로 노출, 할인 기간 활성 시에만 정가 취소선 + 할인율 —
              카드는 상시 공급원가 취소선을 보여주지 않던 기존 스코프를 유지) */}
          <span className="flex flex-col items-end">
            {priceState.discount && priceState.strikethroughPrice != null && (
              <span className="text-[11px] leading-none text-gf-gray2 line-through">
                {formatPrice(priceState.strikethroughPrice)}
              </span>
            )}
            <span className="font-black text-[16px] font-en tracking-[-0.02em] text-gf-orange">
              {product.price === 0 ? (
                "FREE"
              ) : (
                <>
                  {priceState.effectivePrice.toLocaleString("ko-KR")}
                  <span className="text-[12px] font-bold ml-0.5 text-gf-black">원</span>
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
      </article>
    </Link>
  );
}
