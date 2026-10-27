import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();
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
    console.error("[api/auth/email/verify-code]", error);
    return NextResponse.json({ error: "인증번호 확인에 실패했습니다." }, { status: 500 });
  }
}
