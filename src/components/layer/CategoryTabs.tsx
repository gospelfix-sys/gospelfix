"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { FALLBACK_PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product.types";
import { cn } from "@/lib/utils";
import { PRESS_SCALE, PRESS_TRANSITION } from "@/components/ui/motionPresets";

const MotionLink = motion.create(Link);

interface CategoryTabsProps {
  currentCategory: string;
  // cms.api에서 동적으로 조회한 대분류 목록("all" 미포함). 부모((public)/page.tsx)가
  // Server Component라 자연스럽게 전달 가능 — 미전달 시((public)/loading.tsx의 즉시
  // 렌더 스켈레톤)에는 정적 fallback 값을 쓴다.
  categories?: ProductCategory[];
}

// 화살표 버튼 한 번에 이동하는 가로 스크롤 거리(px)
const SCROLL_STEP = 240;

// 홈 갤러리 필터 줄의 카테고리 탭. 한 줄 가로 스크롤(스크롤바 숨김) + 우측 페이드 + 화살표 버튼.
// "전체"를 눌러 필터를 초기화할 수 있도록 전체 대분류 목록을 그대로 노출한다(전체 + 개별 카테고리).
export function CategoryTabs({ currentCategory, categories }: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabs = [
    { value: "all", label: "전체" },
    ...(categories ?? FALLBACK_PRODUCT_CATEGORIES.filter((c) => c.value !== "all")),
  ];

  function handleScrollRight() {
    scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
  }

  return (
    <div className="relative min-w-0 flex-1">
      <div ref={scrollRef} className="scrollbar-hide flex gap-2 overflow-x-auto pr-16">
        {tabs.map((cat) => {
          const isActive = currentCategory === cat.value;
          const href = cat.value === "all" ? "/" : `/?category=${cat.value}`;
          return (
            <MotionLink
              key={cat.value}
              href={href}
              scroll={false}
              aria-current={isActive ? "page" : undefined}
              whileTap={{ scale: PRESS_SCALE }}
              transition={PRESS_TRANSITION}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold no-underline transition-colors",
                isActive
                  ? "border-white bg-white text-black"
                  : "border-gf-border bg-gf-white text-gf-black hover:bg-gf-border",
              )}
            >
              {cat.label}
            </MotionLink>
          );
        })}
      </div>

      {/* 우측 페이드 + 스크롤 화살표 */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center bg-gradient-to-l from-gf-bg from-50% to-transparent pl-10">
        {/* 원형 아이콘 버튼 + whileTap만 필요해 ui/Button의 rounded-lg·h-8 기본값을 전부 덮어써야 하므로
            motion.button을 직접 쓴다. */}
        <motion.button
          type="button"
          onClick={handleScrollRight}
          whileTap={{ scale: 0.9 }}
          transition={PRESS_TRANSITION}
          aria-label="카테고리 더 보기"
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-gf-border bg-gf-white text-gf-black transition-colors hover:bg-gf-border"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
