import Link from "next/link";
import { FALLBACK_PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product.types";
import { cn } from "@/lib/utils";

interface CategoryTabsProps {
  currentCategory: string;
  // cms.api에서 동적으로 조회한 대분류 목록("all" 미포함). 부모((public)/page.tsx)가
  // Server Component라 자연스럽게 전달 가능 — 미전달 시((public)/loading.tsx의 즉시
  // 렌더 스켈레톤)에는 정적 fallback 값을 쓴다.
  categories?: ProductCategory[];
}

// "모든 템플릿" 갤러리 섹션 전용 카테고리 탭. 사이드바(LayerSidebar)의 "홈" 링크와 별개로,
// 이 탭 행 자체에서도 "전체"를 눌러 필터를 초기화할 수 있도록 전체 대분류 목록을 그대로
// 노출한다(전체 + 개별 카테고리).
// FilterDropdown의 트리거/선택 항목과 동일한 pill 버튼 톤(흰 배경 ↔ 오렌지 활성)을 맞춘다.
export function CategoryTabs({ currentCategory, categories }: CategoryTabsProps) {
  const tabs = [
    { value: "all", label: "전체" },
    ...(categories ?? FALLBACK_PRODUCT_CATEGORIES.filter((c) => c.value !== "all")),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((cat) => {
        const isActive = currentCategory === cat.value;
        const href = cat.value === "all" ? "/" : `/?category=${cat.value}`;
        return (
          <Link
            key={cat.value}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "shrink-0 whitespace-nowrap rounded-full border px-4 py-2.5 text-sm font-semibold no-underline transition-colors",
              isActive
                ? "border-gf-orange bg-gf-orange-bg text-gf-orange"
                : "border-gf-border bg-gf-white text-gf-black hover:bg-gf-bg",
            )}
          >
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}
