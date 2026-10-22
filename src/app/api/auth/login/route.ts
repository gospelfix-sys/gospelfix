import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { setSessionCookies } from "@/lib/cmsApi/session";

export const runtime = "nodejs";

interface LoginResponse {
  user: { id: string; email?: string };
  session: { access_token: string; refresh_token: string; expires_at: number };
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "이메일과 비밀번호를 입력해주세요." }, { status: 400 });
    }

    const data = await cmsApiFetch<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    await setSessionCookies({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    });

    return NextResponse.json({ user: data.user });
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/login]", error);
    return NextResponse.json({ error: "로그인에 실패했습니다." }, { status: 500 });
  }
}
