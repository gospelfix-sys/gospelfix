import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { unwrapDetail } from "@/lib/cmsApi/unwrapDetail";
import type { ProductSellerInfo } from "@/types/product.types";

// 쿠키/헤더를 읽지 않는 순수 공개 엔드포인트라 Full Route Cache로 60초간 캐시한다.
export const revalidate = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;

  try {
    const body = await cmsApiFetch<unknown>(
      `/api/v1/products/${encodeURIComponent(productId)}/seller`,
    );
    return NextResponse.json({ data: unwrapDetail<ProductSellerInfo>(body) });
  } catch (error) {
    if (error instanceof CmsApiError && error.status === 404) {
      return NextResponse.json({ data: null });
    }
    console.error("[api/product-sellers/[productId]] cms.api 호출 실패", error);
    return NextResponse.json({ error: "판매자 정보 조회에 실패했습니다." }, { status: 500 });
  }
}
