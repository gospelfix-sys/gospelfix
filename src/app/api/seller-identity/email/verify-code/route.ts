import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { email, code } = (await request.json()) as { email?: string; code?: string };
    if (!email || !code) {
      return NextResponse.json({ error: "이메일과 인증번호를 입력해주세요." }, { status: 400 });
    }

    const data = await cmsApiFetch<{ success: true; emailVerificationToken: string }>(
      "/api/v1/auth/email/verify-code",
      { method: "POST", body: JSON.stringify({ email, code }) },
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(
      "[api/seller-identity/email/verify-code]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "인증번호 확인에 실패했습니다." }, { status: 500 });
  }
}
