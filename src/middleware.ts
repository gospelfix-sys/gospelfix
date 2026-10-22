import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  EXPIRES_AT_COOKIE,
  baseCookieOptions as cookieOptions,
} from "@/lib/cmsApi/cookies";

const PROTECTED_PATHS = ["/mypage"];
const REFRESH_MARGIN_SECONDS = 300; // 만료 5분 전이면 미리 갱신
const REFRESH_TIMEOUT_MS = 1500; // cms.api가 느려도 페이지 응답을 무한정 블로킹하지 않도록 상한

interface RefreshedSession {
  session: { access_token: string; refresh_token: string; expires_at: number };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  let accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const expiresAt = Number(request.cookies.get(EXPIRES_AT_COOKIE)?.value ?? 0);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const isProtectedPath = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // 공개 페이지(상세페이지 등 대부분의 트래픽)에서는 여기서 갱신을 시도하지 않는다 —
  // 다운스트림 Route Handler들이 이미 인증 실패에 관대하게 설계돼 있어(빈 배열/null 반환)
  // 토큰이 살짝 stale해도 페이지가 깨지지 않으며, 실제 갱신은 AuthProvider가 마운트 시
  // 백그라운드로 트리거하는 /api/auth/refresh가 처리한다.
  // /mypage(보호 경로)는 SSR 시점에 유효한 토큰이 있어야 개인화 데이터와 리다이렉트 판단이
  // 올바르므로, 여기서만 동기 갱신을 유지하되 타임아웃을 둬 무한정 블로킹되지 않게 한다.
  if (isProtectedPath && refreshToken && expiresAt - nowSeconds < REFRESH_MARGIN_SECONDS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS);
    try {
      const refreshRes = await fetch(`${process.env.CMS_API_BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": process.env.CMS_API_KEY ?? "" },
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal,
      });

      if (refreshRes.ok) {
        const { session }: RefreshedSession = await refreshRes.json();
        accessToken = session.access_token;
        const expiresDate = new Date(session.expires_at * 1000);
        response.cookies.set(ACCESS_TOKEN_COOKIE, session.access_token, {
          ...cookieOptions,
          expires: expiresDate,
        });
        response.cookies.set(REFRESH_TOKEN_COOKIE, session.refresh_token, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 30,
        });
        response.cookies.set(EXPIRES_AT_COOKIE, String(session.expires_at), {
          ...cookieOptions,
          expires: expiresDate,
        });
      } else if (refreshRes.status === 401) {
        // refresh_token 자체가 무효 — 로그아웃 상태로 취급
        accessToken = undefined;
        response.cookies.delete(ACCESS_TOKEN_COOKIE);
        response.cookies.delete(REFRESH_TOKEN_COOKIE);
        response.cookies.delete(EXPIRES_AT_COOKIE);
      }
    } catch (error) {
      console.error("[middleware] session refresh failed:", error);
      // 타임아웃(AbortError) 포함, 갱신에 실패해도 기존 accessToken이 아직 유효할 수 있으니 통과시킨다.
    } finally {
      clearTimeout(timer);
    }
  }

  if (!accessToken && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  // /api/*는 제외한다 — serverFetch()가 SSR 중 자기 자신의 Route Handler를 호출할 때마다
  // 매번 이 미들웨어를 다시 통과하면서 토큰 refresh를 중복 호출하게 되고, 그 내부 요청에서
  // 갱신된 쿠키는 브라우저로 전달되지 않아 그대로 버려진다. API 라우트는 각자
  // getAccessToken()으로 인증을 직접 판단하므로 미들웨어의 선제 refresh가 필요 없다.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
