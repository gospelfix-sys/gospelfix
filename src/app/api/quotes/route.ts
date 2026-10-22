import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 로그인 여부는 cms.api가 Bearer 토큰으로 선택적으로 확인한다 (없어도 공개 제출 가능)
    const accessToken = await getAccessToken();

    const data = await cmsApiFetch<{ id: string }>("/api/v1/quotes", {
      method: "POST",
      accessToken: accessToken ?? undefined,
      body: JSON.stringify(body),
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/quotes] unexpected error:", error);
    return NextResponse.json({ error: "견적 제출에 실패했습니다." }, { status: 500 });
  }
}
