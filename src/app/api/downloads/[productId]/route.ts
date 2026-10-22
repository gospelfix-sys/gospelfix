import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

// signed URL은 5분만 유효하므로, 이 라우트는 클릭 시점마다 매번 새로 발급받아 즉시
// 리다이렉트한다 — 페이지를 미리 렌더링해서 URL을 저장해두면 나중에 열었을 때 만료된다.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  try {
    const { productId } = await params;

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const data = await cmsApiFetch<{ url: string }>(`/api/v1/downloads/${productId}`, {
      accessToken,
    });

    return NextResponse.redirect(data.url);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[downloads/[productId]] unexpected error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
