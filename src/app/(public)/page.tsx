import { Suspense } from "react";
import { Metadata } from "next";
import { serverFetch } from "@/lib/serverFetch";
import { getProductPriceState } from "@/lib/discount";
import { getCategoryLabel, Product } from "@/types/product.types";
import { getProductCategories } from "@/lib/api/categories";
import { ProductCard } from "@/components/products/ProductCard";
import { FilterDropdown } from "@/components/products/FilterDropdown";
import { LayerShell } from "@/components/layer/LayerShell";
import { HomeHero } from "@/components/layer/HomeHero";
import { SortTabs } from "@/components/layer/SortTabs";
import { CategoryTabs } from "@/components/layer/CategoryTabs";

const HOME_TITLE = "가스펄픽스 | 브랜딩 디자인 소재 마켓";
const HOME_DESCRIPTION =
  "CI 로고, 목업, 홈페이지, 대시보드, 이커머스 템플릿, 광고 소재(PSD·AI)까지. 브랜딩에 필요한 모든 디자인 소재를 한 곳에서 구매하세요.";

// 루트 레이아웃의 openGraph/twitter는 최상위 키 단위로 통째로 대체되므로,
// 홈의 제목·설명이 공유 미리보기에도 반영되도록 함께 지정한다.
export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: { title: HOME_TITLE, description: HOME_DESCRIPTION },
  twitter: { title: HOME_TITLE, description: HOME_DESCRIPTION },
};

interface LayerPageProps {
  searchParams: Promise<{ category?: string; sort?: string; price?: string }>;
}

function checkIsNew(createdAt: string): boolean {
  const diff = Date.now() - new Date(createdAt).getTime();
  return diff < 30 * 24 * 60 * 60 * 1000;
}

export default async function LayerPage({ searchParams }: LayerPageProps) {
  const { category, sort, price } = await searchParams;
  const currentCategory = category ?? "all";

  const query = new URLSearchParams({ category: currentCategory });
  if (sort) query.set("sort", sort);
  if (price) query.set("price", price);

  const [products, categories] = await Promise.all([
    serverFetch<Product[]>(`/api/products?${query.toString()}`),
    getProductCategories(),
  ]);
  const categoryLabelMap = Object.fromEntries(categories.map((c) => [c.value, c.label]));

  return (
    <LayerShell>
      <HomeHero />

      {/* ── 모든 템플릿 갤러리 ── */}
      <section id="gallery" className="scroll-mt-20 px-6 pb-16 lg:px-10">
        <h2 className="sr-only">
          {currentCategory === "all"
            ? "모든 디자인 소재"
            : (categoryLabelMap[currentCategory] ?? getCategoryLabel(currentCategory))}
        </h2>

        {/* 필터 한 줄: 정렬 세그먼트 / 카테고리 / 가격 (모바일은 줄바꿈) */}
        <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          <Suspense fallback={null}>
            <SortTabs />
          </Suspense>
          <CategoryTabs currentCategory={currentCategory} categories={categories} />
          <Suspense fallback={null}>
            <FilterDropdown
              paramKey="price"
              placeholder="가격"
              options={[
                { value: "", label: "전체" },
                { value: "free", label: "무료" },
                { value: "premium", label: "프리미엄" },
              ]}
            />
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gf-border bg-gf-white">
            <p className="mb-2 text-lg font-semibold text-gf-black">디자인 소재가 없습니다</p>
            <p className="text-sm text-gf-gray2">해당 카테고리의 소재가 준비 중입니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => {
              const isPick = index < 3;
              const isNew = checkIsNew(product.created_at);
              const priceState = getProductPriceState(product);
              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  isPick={isPick}
                  isNew={!isPick && isNew}
                  priceState={priceState}
                />
              );
            })}
          </div>
        )}
      </section>
    </LayerShell>
  );
}
