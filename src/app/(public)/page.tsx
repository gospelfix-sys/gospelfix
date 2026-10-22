import { Suspense } from "react";
import { Metadata } from "next";
import { serverFetch } from "@/lib/serverFetch";
import { getProductPriceState } from "@/lib/discount";
import { getCategoryLabel, Product } from "@/types/product.types";
import { getProductCategories } from "@/lib/api/categories";
import { ProductCard } from "@/components/products/ProductCard";
import { FilterDropdown } from "@/components/products/FilterDropdown";
import { LayerShell } from "@/components/layer/LayerShell";
import { HeroCarousel } from "@/components/layer/HeroCarousel";
import { CategoryTabs } from "@/components/layer/CategoryTabs";

export const metadata: Metadata = {
  title: "모다(MODA) | 만드는 사람들이 모이는 곳",
  description:
    "다양한 포지션의 전문 크리에이터가 만든 작품과, 그 결과물이 필요한 클라이언트가 만나는 곳. 업종별 AI 홈페이지부터 대시보드, 이커머스까지 완성형 템플릿을 구매 즉시 오픈하세요. 가스펄픽스가 만든 크리에이터 마켓플레이스 모다입니다.",
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
      <HeroCarousel />

      {/* ── 모든 템플릿 갤러리 ── */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="gf-section-label">Gallery</span>
            <h2 className="gf-section-title">
              {currentCategory === "all"
                ? "모든 템플릿"
                : (categoryLabelMap[currentCategory] ?? getCategoryLabel(currentCategory))}
            </h2>
          </div>
          <p className="mb-1 text-sm text-gf-gray2">
            총 <strong className="text-gf-black">{products.length}개</strong>의 템플릿
          </p>
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <CategoryTabs currentCategory={currentCategory} categories={categories} />
          <Suspense>
            <div className="flex items-center gap-2">
              <FilterDropdown
                paramKey="sort"
                placeholder="추천"
                options={[
                  { value: "recommended", label: "추천" },
                  { value: "popular", label: "인기 있는" },
                  { value: "recent", label: "최근" },
                ]}
              />
              <FilterDropdown
                paramKey="price"
                placeholder="가격"
                options={[
                  { value: "", label: "전체" },
                  { value: "free", label: "무료" },
                  { value: "premium", label: "프리미엄" },
                ]}
              />
            </div>
          </Suspense>
        </div>

        {products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-gf-border bg-gf-white">
            <p className="mb-2 text-lg font-semibold text-gf-black">템플릿이 없습니다</p>
            <p className="text-sm text-gf-gray2">해당 카테고리의 템플릿이 준비 중입니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
