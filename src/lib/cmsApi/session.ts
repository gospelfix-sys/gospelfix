import { cookies } from "next/headers";
import type { OAuthProvider } from "@/types/auth.types";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  EXPIRES_AT_COOKIE,
  OAUTH_STATE_COOKIE,
  baseCookieOptions,
  oauthStateCookieOptions,
} from "./cookies";

export interface CmsSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
}

export interface OAuthState {
  provider: OAuthProvider;
  state: string;
  next: string;
  view: "login" | "signup";
  referralCode?: string;
}

/** Server Component / Route Handler에서 현재 로그인 사용자의 access_token을 읽는다. */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

/** cms.api의 로그인/회원가입/갱신 응답으로 받은 세션을 main의 httpOnly 쿠키에 저장한다. */
export async function setSessionCookies(session: CmsSession): Promise<void> {
  const cookieStore = await cookies();
  const expiresDate = new Date(session.expiresAt * 1000);

  cookieStore.set(ACCESS_TOKEN_COOKIE, session.accessToken, {
    ...baseCookieOptions,
    expires: expiresDate,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, session.refreshToken, {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 30, // refresh_token은 30일간 보관
  });
  cookieStore.set(EXPIRES_AT_COOKIE, String(session.expiresAt), {
    ...baseCookieOptions,
    expires: expiresDate,
  });
}

export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete(EXPIRES_AT_COOKIE);
}

/** 소셜 인가 요청 직전에 CSRF state와 콜백 후 필요한 정보(provider/next/view/referralCode)를 저장한다. */
export async function setOAuthStateCookie(value: OAuthState): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, JSON.stringify(value), oauthStateCookieOptions);
}

/** 콜백에서 state 쿠키를 한 번 읽고 즉시 삭제한다(재사용 방지). */
export async function consumeOAuthStateCookie(): Promise<OAuthState | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(OAUTH_STATE_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OAuthState;
  } catch {
    return null;
  }
}
