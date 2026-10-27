import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { unwrapDetail } from "@/lib/cmsApi/unwrapDetail";
import { Product } from "@/types/product.types";

// 쿠키/헤더를 읽지 않는 순수 공개 엔드포인트라 Full Route Cache로 60초간 캐시한다.
export const revalidate = 60;

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const body = await cmsApiFetch<unknown>(`/api/v1/products/${encodeURIComponent(slug)}`);
    return NextResponse.json({ data: unwrapDetail<Product>(body) });
  } catch (error) {
    if (error instanceof CmsApiError && error.status === 404) {
      return NextResponse.json({ data: null });
    }
    console.error("[api/products/[slug]] cms.api 호출 실패", error);
    return NextResponse.json({ error: "상품 조회에 실패했습니다." }, { status: 500 });
  }
}
