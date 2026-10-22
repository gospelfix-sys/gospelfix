import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { Product } from "@/types/product.types";

export const dynamic = "force-dynamic";

/**
 * cms.api 리스트 엔드포인트 공통 응답 형식.
 * GET /api/v1/{resource}?page=&limit= → { data, total, page, limit }
 */
interface CmsListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_SIZE = 50;
// 원래 무제한 조회였으나, cms.api가 페이지당 최대 50건만 반환하므로
// 실용적인 상한선을 두고 그 안에서 페이지네이션으로 전량을 모은다.
const MAX_PRODUCTS = 500;

// 프론트가 쓰는 값(sort=recent 등)과 cms.api가 받는 값(sort_by=created_at 등)의 이름이
// 다르므로 여기서 변환한다. "recommended"는 cms.api 기본 정렬(sort_by 미전달)과 동일.
const SORT_TO_SORT_BY: Record<string, string> = {
  popular: "like_count",
  recent: "created_at",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const price = searchParams.get("price") ?? undefined;

  const sortBy = sort ? SORT_TO_SORT_BY[sort] : undefined;
  const priceType = price === "free" || price === "premium" ? price : undefined;

  const cmsQuery = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (sortBy) cmsQuery.set("sort_by", sortBy);
  if (priceType) cmsQuery.set("price_type", priceType);

  const products: Product[] = [];
  let page = 1;

  try {
    while (products.length < MAX_PRODUCTS) {
      cmsQuery.set("page", String(page));
      const res = await cmsApiFetch<CmsListResponse<Product>>(
        `/api/v1/products?${cmsQuery.toString()}`,
      );
      products.push(...res.data);

      if (products.length >= res.total || res.data.length < PAGE_SIZE) break;
      page += 1;
    }
  } catch (error) {
    console.error("[api/products] cms.api 호출 실패", error);
    return NextResponse.json({ error: "상품 목록 조회에 실패했습니다." }, { status: 500 });
  }

  const sliced = products.slice(0, MAX_PRODUCTS);
  const result =
    category && category !== "all" ? sliced.filter((p) => p.category === category) : sliced;

  return NextResponse.json(result);
}
