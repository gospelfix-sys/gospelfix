import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();
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
    console.error("[api/auth/phone/send-code]", error);
    return NextResponse.json({ error: "인증번호 발송에 실패했습니다." }, { status: 500 });
  }
}
