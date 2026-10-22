import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { Review } from "@/types/review.types";

export const dynamic = "force-dynamic";

// 공개 엔드포인트 — accessToken 불필요
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId가 필요합니다." }, { status: 400 });
  }

  try {
    const { data } = await cmsApiFetch<{ data: Review[] }>(
      `/api/v1/reviews?product_id=${productId}`,
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/reviews GET] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId, rating, content } = await request.json();

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const data = await cmsApiFetch<{ success: true }>("/api/v1/reviews", {
      method: "POST",
      body: JSON.stringify({ productId, rating, content }),
      accessToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      // 구매하지 않은 사용자의 리뷰 작성 시도(403)를 포함해 cms.api의 상태 코드를 그대로 전달
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/reviews] unexpected error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
