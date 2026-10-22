"use client";

import { useMemo, useState } from "react";
import { Tab } from "@/components/ui/Tab";
import { MyProductCard } from "@/components/mypage/MyProductCard";
import { EmptyStateCard } from "@/components/mypage/EmptyStateCard";
import { cn } from "@/lib/utils";
import type { SellerProduct } from "@/types/product.types";

type StatusFilter = "all" | "pending" | "selling" | "rejected" | "suspended";

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "승인 전" },
  { key: "selling", label: "판매중" },
  { key: "rejected", label: "비승인" },
  { key: "suspended", label: "판매 중지" },
];

// review_status(status)+is_active 조합을 판매자가 이해하기 쉬운 5개 상태 탭으로 매핑한다.
// draft(초안 저장만 하고 미제출)와 approved+is_active=false(관리자 반려 이후 등 예외 상태)는
// 둘 다 "판매 중이 아님"이라는 공통점으로 묶어 "판매 중지"에 함께 넣는다.
function getStatusBucket(product: SellerProduct): Exclude<StatusFilter, "all"> {
  if (product.status === "pending") return "pending";
  if (product.status === "approved" && product.is_active) return "selling";
  if (product.status === "rejected") return "rejected";
  return "suspended";
}

export function MyProductsList({ products }: { products: SellerProduct[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = {
      all: products.length,
      pending: 0,
      selling: 0,
      rejected: 0,
      suspended: 0,
    };
    for (const product of products) {
      result[getStatusBucket(product)] += 1;
    }
    return result;
  }, [products]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? products
        : products.filter((product) => getStatusBucket(product) === filter),
    [products, filter],
  );

  return (
    <div className="space-y-4">
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-gf-border">
        {FILTERS.map((item) => (
          <Tab
            key={item.key}
            active={filter === item.key}
            onClick={() => setFilter(item.key)}
            className={cn(
              filter === item.key
                ? "border-gf-orange text-gf-orange"
                : "border-transparent text-gf-gray2 hover:text-gf-black",
            )}
          >
            {item.label} {counts[item.key]}
          </Tab>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyStateCard message="해당 상태의 상품이 없습니다." />
      ) : (
        <div className="space-y-3">
          {filtered.map((product) => (
            <MyProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
