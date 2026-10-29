"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import {
  PRESS_SCALE,
  PRESS_TRANSITION,
  SEGMENT_INDICATOR_TRANSITION,
} from "@/components/ui/motionPresets";

interface SortOption {
  value: string;
  label: string;
}

// 서버(api/products)가 받는 sort 값 그대로 사용. sort 쿼리가 없으면 추천이 활성.
const SORT_OPTIONS: SortOption[] = [
  { value: "recommended", label: "추천" },
  { value: "popular", label: "인기" },
  { value: "recent", label: "최근" },
];
const DEFAULT_SORT = "recommended";

// 탭 피드백은 라벨에만 준다 — 버튼 전체를 줄이면 인디케이터의 layout 측정이 함께 틀어진다.
const labelVariants: Variants = {
  tap: { scale: PRESS_SCALE, transition: PRESS_TRANSITION },
};

// 정렬 세그먼트 컨트롤. 카테고리·가격 등 다른 쿼리는 유지하고 sort만 갱신한다.
export function SortTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? DEFAULT_SORT;
  // 서버 응답(URL 갱신)을 기다리지 않고 누른 즉시 인디케이터가 이동하도록 선택값을 먼저 반영한다.
  // URL이 실제로 바뀌면 그 값을 따른다.
  const [pendingSort, setPendingSort] = useState<string | null>(null);
  const activeSort = pendingSort ?? currentSort;

  useEffect(() => {
    setPendingSort(null);
  }, [currentSort]);

  function handleSelect(value: string) {
    setPendingSort(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_SORT) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const queryString = params.toString();
    // 정렬 변경 시 스크롤이 맨 위로 튀지 않도록 scroll: false
    router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
  }

  return (
    <div
      role="tablist"
      aria-label="정렬"
      className="inline-flex shrink-0 rounded-full border border-gf-border bg-gf-white p-1"
    >
      {SORT_OPTIONS.map((option) => {
        // ui/Tab은 밑줄형이라 알약 세그먼트와 맞지 않고, layoutId 인디케이터·자식 variants 전파가
        // 필요해 motion.button을 직접 쓴다.
        const isActive = activeSort === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(option.value)}
            whileTap="tap"
            className={cn(
              "relative whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              isActive ? "text-black" : "text-gf-gray2 hover:text-gf-black",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sort-tabs-indicator"
                transition={SEGMENT_INDICATOR_TRANSITION}
                className="absolute inset-0 rounded-full bg-white"
              />
            )}
            <motion.span variants={labelVariants} className="relative block">
              {option.label}
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}
