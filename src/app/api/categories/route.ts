import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { FALLBACK_PRODUCT_CATEGORIES, ProductCategory } from "@/types/product.types";

export const dynamic = "force-dynamic";

interface CmsListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// cms.api 호출 실패(엔드포인트 미배포, 리소스 토글 OFF로 인한 404 포함) 시 빈 배열이
// 아니라 정적 기본값으로 폴백한다 — 카테고리는 업로드 화면의 필수 선택지라 빈 배열이면
// 상품 등록 자체가 막히므로, referral-banners류의 "실패 시 빈 배열" 패턴을 쓰지 않는다.
export async function GET() {
  try {
    const { data } = await cmsApiFetch<CmsListResponse<ProductCategory>>(
      "/api/v1/product-categories?limit=50",
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/categories] cms.api 호출 실패", error);
    return NextResponse.json(FALLBACK_PRODUCT_CATEGORIES.filter((c) => c.value !== "all"));
  }
}
