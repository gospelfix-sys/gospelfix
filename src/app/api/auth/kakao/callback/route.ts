import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { consumeKakaoOAuthStateCookie, setSessionCookies } from "@/lib/cmsApi/session";

export const runtime = "nodejs";

interface KakaoLoginResponse {
  user: { id: string; email?: string };
  session: { access_token: string; refresh_token: string; expires_at: number };
  isNewUser: boolean;
}

function redirectToLogin(origin: string, next: string, view: string, kakaoError: string) {
  const target = new URL("/login", origin);
  target.searchParams.set("next", next);
  target.searchParams.set("view", view);
  target.searchParams.set("kakaoError", kakaoError);
  return NextResponse.redirect(target);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const kakaoDenied = url.searchParams.get("error");

  const oauthState = await consumeKakaoOAuthStateCookie();
  if (!oauthState) {
    return redirectToLogin(url.origin, "/", "login", "state");
  }

  const { next, view, referralCode } = oauthState;

  if (kakaoDenied || !code || stateParam !== oauthState.state) {
    return redirectToLogin(url.origin, next, view, "denied");
  }

  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!redirectUri) {
    console.error(
      "[api/auth/kakao/callback] KAKAO_REDIRECT_URI 환경변수가 설정되지 않았습니다.",
    );
    return redirectToLogin(url.origin, next, view, "config");
  }

  try {
    const data = await cmsApiFetch<KakaoLoginResponse>("/api/v1/auth/kakao", {
      method: "POST",
      body: JSON.stringify({ code, redirectUri, referralCode }),
    });

    await setSessionCookies({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    });

    const target = new URL(next, url.origin);
    if (data.isNewUser) target.searchParams.set("kakaoNewUser", "1");
    return NextResponse.redirect(target);
  } catch (error) {
    if (error instanceof CmsApiError) {
      console.error("[api/auth/kakao/callback]", error.status, error.message);
    } else {
      console.error("[api/auth/kakao/callback]", error);
    }
    return redirectToLogin(url.origin, next, view, "failed");
  }
}
