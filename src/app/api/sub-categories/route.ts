import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { FALLBACK_SUB_CATEGORIES, ProductCategory } from "@/types/product.types";

export const dynamic = "force-dynamic";

interface CmsListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// api/categories/route.ts와 동일한 이유로 실패 시 정적 기본값(15종)으로 폴백한다.
export async function GET() {
  try {
    const { data } = await cmsApiFetch<CmsListResponse<ProductCategory>>(
      "/api/v1/product-sub-categories?limit=50",
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/sub-categories] cms.api 호출 실패", error);
    return NextResponse.json(FALLBACK_SUB_CATEGORIES);
  }
}
