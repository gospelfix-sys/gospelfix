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
  // 인터셉트 상세 모달(/detail/...)이 열리면 URL이 바뀌어 sort 쿼리가 사라진다. 그대로 따르면
  // 모달 뒤에서 활성 탭이 "추천"으로 바뀌었다가 닫힐 때 원래 탭으로 미끄러져 돌아오므로,
  // 마운트된 목록 경로에 있을 때의 sort만 반영하고 그 외 경로에서는 마지막 값을 유지한다.
  // 홈 목록 전용 전제다 — 라우트 간에 유지되는 레이아웃으로 옮기면 "처음 경로" 기준이 깨진다.
  const [listPathname] = useState(pathname);
  const isOnList = pathname === listPathname;
  const urlSort = searchParams.get("sort") ?? DEFAULT_SORT;
  const [listSort, setListSort] = useState(urlSort);
  if (isOnList && urlSort !== listSort) {
    setListSort(urlSort);
  }
  const currentSort = isOnList ? urlSort : listSort;
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
    router.push(`${listPathname}${queryString ? `?${queryString}` : ""}`, { scroll: false });
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
              isActive ? "text-gf-white" : "text-gf-gray2 hover:text-gf-black",
            )}
          >
            {isActive && (
              // 상세 모달을 닫으면 URL 변경으로 이 컴포넌트가 재렌더되는데, 그 시점 body가 아직
              // position:fixed(top:-scrollY)라 측정 좌표가 scrollY만큼 어긋나 알약이 위에서 내려온다.
              // 활성 탭이 바뀔 때만 레이아웃을 측정하게 해 탭 전환 외의 재렌더는 무시한다.
              <motion.span
                layoutId="sort-tabs-indicator"
                layoutDependency={activeSort}
                transition={SEGMENT_INDICATOR_TRANSITION}
                className="absolute inset-0 rounded-full bg-gf-black"
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
