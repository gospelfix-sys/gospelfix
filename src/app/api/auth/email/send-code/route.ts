import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
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
    console.error("[api/auth/email/send-code]", error);
    return NextResponse.json({ error: "인증메일 발송에 실패했습니다." }, { status: 500 });
  }
}
