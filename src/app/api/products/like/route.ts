import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export const dynamic = "force-dynamic";

interface LikeStatusResponse {
  like_count: number;
  liked_by_me: boolean;
}

interface LikeToggleResponse {
  like_count: number;
  liked: boolean;
}

// 공개 엔드포인트 — 로그인 상태면 liked_by_me를 함께 반환, 아니면 항상 false
export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId가 필요합니다." }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();
    const data = await cmsApiFetch<LikeStatusResponse>(`/api/v1/products/${productId}/like`, {
      accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/products/like GET] cms.api 호출 실패", error);
    return NextResponse.json({ like_count: 0, liked_by_me: false });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ error: "productId가 필요합니다." }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const data = await cmsApiFetch<LikeToggleResponse>(`/api/v1/products/${productId}/like`, {
      method: "POST",
      accessToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/products/like] unexpected error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
