// 사이트 테마(라이트/다크/시스템) 설정. 선택값은 JS에서 읽고 써야 해서 httpOnly가 아닌 일반 쿠키로 둔다.
// 이 파일은 서버·클라이언트 양쪽에서 import하므로 next/headers 등 런타임 종속 모듈은 import하지 않는다.

// 저장하는 선택값. system은 OS 설정(prefers-color-scheme)을 따른다.
export type SiteThemeChoice = "light" | "dark" | "system";
// 실제로 화면에 적용되는 값. html[data-gf-theme]에는 이 값만 들어간다.
export type SiteTheme = "light" | "dark";

export const THEME_COOKIE = "gf_theme";
export const DEFAULT_THEME_CHOICE: SiteThemeChoice = "light";
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function parseThemeChoice(value: string | null | undefined): SiteThemeChoice {
  return value === "dark" || value === "system" ? value : DEFAULT_THEME_CHOICE;
}

export function resolveTheme(choice: SiteThemeChoice): SiteTheme {
  if (choice === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return choice;
}

// <head>에서 첫 페인트 전에 동기 실행해 html[data-gf-theme]를 채운다. 서버가 쿠키를 읽으면 모든
// 페이지가 동적 렌더로 바뀌므로, 서버는 건드리지 않고 클라이언트 스크립트로 깜빡임 없이 맞춘다.
// resolveTheme과 같은 규칙이라 둘을 함께 고쳐야 한다.
export const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]*)/);var c=m&&m[1];var d=c==="dark"||(c==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.gfTheme=d?"dark":"light";}catch(e){}})();`;

export function readThemeChoice(): SiteThemeChoice {
  const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE}=([^;]*)`));
  return parseThemeChoice(match?.[1]);
}

export function applyTheme(choice: SiteThemeChoice): void {
  document.documentElement.dataset.gfTheme = resolveTheme(choice);
  document.cookie = `${THEME_COOKIE}=${choice}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
}
