import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export const runtime = "nodejs";

export async function POST() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const data = await cmsApiFetch("/api/v1/auth/seller-request", {
      method: "POST",
      accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/seller-request]", error);
    return NextResponse.json({ error: "판매자 신청에 실패했습니다." }, { status: 500 });
  }
}
