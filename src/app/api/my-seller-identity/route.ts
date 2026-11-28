import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import type { SellerIdentity } from "@/types/seller.types";

export const dynamic = "force-dynamic";

// 본인 신원정보(휴대폰·이메일 원문 포함) 조회. 어떤 캐시에도 남지 않게 하고 응답을 로그에 남기지 않는다.
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { data } = await cmsApiFetch<{ data: SellerIdentity | null }>(
      "/api/v1/my-seller-identity",
      { accessToken },
    );
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(
      "[api/my-seller-identity GET]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "신원정보를 불러오지 못했습니다." }, { status: 500 });
  }
}
