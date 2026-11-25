import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken, clearSessionCookies } from "@/lib/cmsApi/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // 비로그인은 에러가 아니라 "사용자 없음"이라는 정상 응답이다. 401로 돌려주면 모든 공개 페이지
  // 방문마다 브라우저 콘솔에 빨간 에러가 남는다. 호출부(AuthProvider·useAuth)는 user ?? null로 처리한다.
  // 로그인 직후 refreshAuthUser()가 예전 "사용자 없음" 응답을 받지 않도록 200도 캐시하지 않는다.
  const noStore = { headers: { "Cache-Control": "no-store" } };

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ user: null, profile: null }, noStore);
  }

  try {
    const data = await cmsApiFetch("/api/v1/auth/me", { accessToken });
    return NextResponse.json(data, noStore);
  } catch (error) {
    if (error instanceof CmsApiError) {
      // 만료·무효 토큰도 비로그인과 같게 취급한다. 그 외 4xx/5xx는 serverFetch가 message를 읽도록
      // 다른 handler와 같은 { error } 형태로 상태를 그대로 전달한다.
      if (error.status === 401) return NextResponse.json({ user: null, profile: null }, noStore);
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/auth/me]", error);
    return NextResponse.json({ error: "사용자 정보를 불러오지 못했습니다." }, { status: 500 });
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
