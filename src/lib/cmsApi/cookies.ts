// gf_* 쿠키 이름과 옵션. middleware.ts(Edge runtime)와 session.ts(Node runtime) 양쪽에서
// import해서 쓰므로, next/headers 등 런타임 종속 모듈은 여기서 절대 import하지 않는다.

export const ACCESS_TOKEN_COOKIE = "gf_at";
export const REFRESH_TOKEN_COOKIE = "gf_rt";
export const EXPIRES_AT_COOKIE = "gf_exp";
export const OAUTH_STATE_COOKIE = "gf_oauth";

const isProd = process.env.NODE_ENV === "production";

export const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

// 소셜 로그인 인가 요청 ~ 콜백 왕복 도중에만 필요한 CSRF state 쿠키(카카오·구글 공용).
// 5분이면 충분한 단발성 쿠키다.
export const oauthStateCookieOptions = {
  ...baseCookieOptions,
  maxAge: 300,
};
