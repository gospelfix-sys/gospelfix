import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { setKakaoOAuthStateCookie } from "@/lib/cmsApi/session";
import { sanitizeInternalPath } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = sanitizeInternalPath(url.searchParams.get("next"));
  const view = url.searchParams.get("view") === "signup" ? "signup" : "login";
  const referralCode = url.searchParams.get("referralCode") ?? undefined;

  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    console.error(
      "[api/auth/kakao] KAKAO_CLIENT_ID / KAKAO_REDIRECT_URI 환경변수가 설정되지 않았습니다.",
    );
    return NextResponse.redirect(new URL("/login?kakaoError=config", url.origin));
  }

  const state = randomUUID();
  await setKakaoOAuthStateCookie({ state, next, view, referralCode });

  const authorizeUrl = new URL("https://kauth.kakao.com/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("state", state);
  authorizeUrl.searchParams.set("scope", "account_email");

  return NextResponse.redirect(authorizeUrl);
}
