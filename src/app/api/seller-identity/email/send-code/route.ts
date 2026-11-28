import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 가입용 /api/auth/email/*는 비로그인도 열려 있어, 신청 폼은 로그인을 요구하는 별도 경로를 쓴다.
export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "이메일을 입력해주세요." }, { status: 400 });
    }

    const data = await cmsApiFetch<{ success: true; expiresIn: number }>(
      "/api/v1/auth/email/send-code",
      { method: "POST", body: JSON.stringify({ email }) },
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(
      "[api/seller-identity/email/send-code]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "인증메일 발송에 실패했습니다." }, { status: 500 });
  }
}
