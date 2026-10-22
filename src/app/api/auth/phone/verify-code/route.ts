import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { phone, code } = await request.json();
    if (!phone || !code) {
      return NextResponse.json(
        { error: "휴대폰 번호와 인증번호를 입력해주세요." },
        { status: 400 },
      );
    }

    const data = await cmsApiFetch<{ success: true; phoneVerificationToken: string }>(
      "/api/v1/auth/phone/verify-code",
      { method: "POST", body: JSON.stringify({ phone, code }) },
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/phone/verify-code]", error);
    return NextResponse.json({ error: "인증번호 확인에 실패했습니다." }, { status: 500 });
  }
}
