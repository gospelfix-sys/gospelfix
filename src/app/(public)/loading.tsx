import { Suspense } from "react";
import { LayerShell } from "@/components/layer/LayerShell";
import { HeroCarousel } from "@/components/layer/HeroCarousel";
import { CategoryTabs } from "@/components/layer/CategoryTabs";
import { FilterDropdown } from "@/components/products/FilterDropdown";

// 사이드바/상단바/히어로/카테고리 탭/정렬·가격 필터는 상품 목록 fetch와 무관하게 즉시 렌더
// 가능한 실제 컴포넌트라 그대로 재사용한다 — 별도 스켈레톤을 손으로 맞추면 실제 레이아웃이
// 바뀔 때마다 이 파일이 따로 어긋나는 문제(과거 반복된 loading.tsx 드리프트)를 원천 차단한다.
// 상품 카드 그리드만 fetch 결과에 의존하므로 그 부분만 스켈레톤으로 남긴다.
export default function LayerLoading() {
  return (
    <LayerShell>
      <HeroCarousel />

      <section className="px-6 py-10 lg:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-gray-200 animate-pulse" />
            <div className="h-7 w-40 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="mb-1 h-4 w-24 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <CategoryTabs currentCategory="" />
          <Suspense>
            <div className="flex items-center gap-2">
              <FilterDropdown paramKey="sort" placeholder="추천" options={[]} />
              <FilterDropdown paramKey="price" placeholder="가격" options={[]} />
            </div>
          </Suspense>
        </div>

        {/* 카드 그리드 스켈레톤 — ProductCard 실제 구조(rounded-2xl 카드 + 썸네일 비율)와 동일 치수 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-gf-border bg-gf-white shadow-[0_4px_16px_rgba(0,0,0,0.09)]"
            >
              <div className="aspect-[1080/1350] animate-pulse bg-gray-200" />
              <div className="space-y-2 p-5 pb-4">
                <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                <div className="h-3 w-full rounded bg-gray-100 animate-pulse" />
              </div>
              <div className="flex items-center justify-between border-t border-gf-border px-5 py-3.5">
                <div className="h-3 w-20 rounded bg-gray-100 animate-pulse" />
                <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </LayerShell>
  );
}
