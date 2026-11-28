import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 알림톡 발송 비용·남용을 막기 위해 로그인한 사용자만 요청할 수 있다.
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { phone } = (await request.json()) as { phone?: string };
    if (!phone) {
      return NextResponse.json({ error: "휴대폰 번호를 입력해주세요." }, { status: 400 });
    }

    const data = await cmsApiFetch<{ success: true; expiresIn: number }>(
      "/api/v1/auth/phone/send-code",
      { method: "POST", body: JSON.stringify({ phone }) },
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(
      "[api/seller-identity/phone/send-code]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "인증번호 발송에 실패했습니다." }, { status: 500 });
  }
}
