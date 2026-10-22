import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken, clearSessionCookies } from "@/lib/cmsApi/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ user: null, profile: null }, { status: 401 });
  }

  try {
    const data = await cmsApiFetch("/api/v1/auth/me", { accessToken });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ user: null, profile: null }, { status: error.status });
    }
    console.error("[api/auth/me]", error);
    return NextResponse.json({ user: null, profile: null }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { fullName, avatarUrl } = await request.json();
    const data = await cmsApiFetch("/api/v1/auth/me", {
      method: "PATCH",
      body: JSON.stringify({ fullName, avatarUrl }),
      accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/me] PATCH", error);
    return NextResponse.json({ error: "프로필 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { currentPassword } = await request.json();
    if (!currentPassword) {
      return NextResponse.json({ error: "현재 비밀번호를 입력해주세요." }, { status: 400 });
    }

    const data = await cmsApiFetch("/api/v1/auth/me", {
      method: "DELETE",
      body: JSON.stringify({ currentPassword }),
      accessToken,
    });
    await clearSessionCookies();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/me] DELETE", error);
    return NextResponse.json({ error: "회원탈퇴 처리에 실패했습니다." }, { status: 500 });
  }
}
