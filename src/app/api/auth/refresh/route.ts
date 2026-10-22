import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getRefreshToken, setSessionCookies, clearSessionCookies } from "@/lib/cmsApi/session";
import { EXPIRES_AT_COOKIE } from "@/lib/cmsApi/cookies";

export const runtime = "nodejs";

const REFRESH_MARGIN_SECONDS = 300; // 만료 5분 전이면 갱신

interface RefreshResponse {
  session: { access_token: string; refresh_token: string; expires_at: number };
}

/**
 * AuthProvider가 마운트 시 fire-and-forget으로 호출하는 백그라운드 세션 갱신 엔드포인트.
 * middleware.ts는 /mypage(보호 경로)에서만 동기 갱신을 수행하므로, 그 외 공개 페이지를 열 때
 * 액세스 토큰 만료가 임박했다면 실제 갱신은 이 라우트가 담당한다.
 */
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = await getRefreshToken();
  const expiresAt = Number(cookieStore.get(EXPIRES_AT_COOKIE)?.value ?? 0);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (!refreshToken || expiresAt - nowSeconds >= REFRESH_MARGIN_SECONDS) {
    return NextResponse.json({ refreshed: false });
  }

  try {
    const data = await cmsApiFetch<RefreshResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });

    await setSessionCookies({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    });

    return NextResponse.json({ refreshed: true });
  } catch (error) {
    if (error instanceof CmsApiError && error.status === 401) {
      // refresh_token 자체가 무효 — 로그아웃 상태로 취급
      await clearSessionCookies();
    } else {
      console.error("[api/auth/refresh]", error);
    }
    return NextResponse.json({ refreshed: false });
  }
}
