import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import type { OAuthProvider } from "@/types/auth.types";
import { cmsApiFetch, CmsApiError } from "./client";
import { consumeOAuthStateCookie, setOAuthStateCookie, setSessionCookies } from "./session";
import { sanitizeInternalPath } from "@/lib/utils";

// 서버 전용(Route Handler에서만 import). 카카오·구글이 공유하는 인가 시작/콜백 흐름이다.

interface OAuthProviderConfig {
  authorizeUrl: string;
  scope: string;
  /** provider별 추가 인가 파라미터(예: 구글 계정 선택 강제) */
  extraParams?: Record<string, string>;
  /** cms.api 로그인 엔드포인트 */
  cmsPath: string;
  getClientId: () => string | undefined;
  getRedirectUri: () => string | undefined;
}

const PROVIDERS: Record<OAuthProvider, OAuthProviderConfig> = {
  kakao: {
    authorizeUrl: "https://kauth.kakao.com/oauth/authorize",
    scope: "account_email",
    cmsPath: "/api/v1/auth/kakao",
    getClientId: () => process.env.KAKAO_CLIENT_ID,
    getRedirectUri: () => process.env.KAKAO_REDIRECT_URI,
  },
  google: {
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    scope: "openid email profile",
    extraParams: { prompt: "select_account" },
    cmsPath: "/api/v1/auth/google",
    getClientId: () => process.env.GOOGLE_CLIENT_ID,
    getRedirectUri: () => process.env.GOOGLE_REDIRECT_URI,
  },
};

interface OAuthLoginResponse {
  user: { id: string; email?: string };
  session: { access_token: string; refresh_token: string; expires_at: number };
  isNewUser: boolean;
}

// /login 페이지가 oauthError/provider를 읽어 모달에 실패 메시지를 띄운다.
function redirectToLogin(
  origin: string,
  next: string,
  view: string,
  provider: OAuthProvider,
  oauthError: string,
) {
  const target = new URL("/login", origin);
  target.searchParams.set("next", next);
  target.searchParams.set("view", view);
  target.searchParams.set("provider", provider);
  target.searchParams.set("oauthError", oauthError);
  return NextResponse.redirect(target);
}

/** 인가 요청을 시작한다: state 쿠키를 심고 provider 인가 페이지로 리다이렉트. */
export async function handleOAuthStart(request: Request, provider: OAuthProvider) {
  const config = PROVIDERS[provider];
  const url = new URL(request.url);
  const next = sanitizeInternalPath(url.searchParams.get("next"));
  const view = url.searchParams.get("view") === "signup" ? "signup" : "login";
  const referralCode = url.searchParams.get("referralCode") ?? undefined;

  const clientId = config.getClientId();
  const redirectUri = config.getRedirectUri();
  if (!clientId || !redirectUri) {
    console.error(
      `[api/auth/${provider}] ${provider.toUpperCase()}_CLIENT_ID / ${provider.toUpperCase()}_REDIRECT_URI 환경변수가 설정되지 않았습니다.`,
    );
    return redirectToLogin(url.origin, next, view, provider, "config");
  }

  const state = randomUUID();
  await setOAuthStateCookie({ provider, state, next, view, referralCode });

  const authorizeUrl = new URL(config.authorizeUrl);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", config.scope);
  for (const [key, value] of Object.entries(config.extraParams ?? {})) {
    authorizeUrl.searchParams.set(key, value);
  }

  return NextResponse.redirect(authorizeUrl);
}

/** 콜백을 처리한다: state 검증 → cms.api 로그인 → 세션 쿠키 → next 복귀. */
export async function handleOAuthCallback(request: Request, provider: OAuthProvider) {
  const config = PROVIDERS[provider];
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const providerDenied = url.searchParams.get("error");

  const oauthState = await consumeOAuthStateCookie();
  if (!oauthState) {
    return redirectToLogin(url.origin, "/", "login", provider, "state");
  }

  const { next, view, referralCode } = oauthState;

  // provider까지 맞아야 한다 — 카카오로 시작한 state를 구글 콜백에 재사용하는 교차 사용을 막는다.
  if (providerDenied || !code || stateParam !== oauthState.state || oauthState.provider !== provider) {
    return redirectToLogin(url.origin, next, view, provider, "denied");
  }

  const redirectUri = config.getRedirectUri();
  if (!redirectUri) {
    console.error(
      `[api/auth/${provider}/callback] ${provider.toUpperCase()}_REDIRECT_URI 환경변수가 설정되지 않았습니다.`,
    );
    return redirectToLogin(url.origin, next, view, provider, "config");
  }

  try {
    const data = await cmsApiFetch<OAuthLoginResponse>(config.cmsPath, {
      method: "POST",
      body: JSON.stringify({ code, redirectUri, referralCode }),
    });

    await setSessionCookies({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at,
    });

    const target = new URL(next, url.origin);
    if (data.isNewUser) target.searchParams.set("newUser", "1");
    return NextResponse.redirect(target);
  } catch (error) {
    if (error instanceof CmsApiError) {
      console.error(`[api/auth/${provider}/callback]`, error.status, error.message);
    } else {
      console.error(`[api/auth/${provider}/callback]`, error);
    }
    return redirectToLogin(url.origin, next, view, provider, "failed");
  }
}
