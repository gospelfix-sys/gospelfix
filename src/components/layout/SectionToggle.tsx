// 모다(마켓플레이스) 섹션에 속하는 경로. LayerShell(LayerNavBar) 페이지와 업로드 에디터가 해당한다.
// TopBar가 이 경로들에서 자신을 숨기는 기준이기도 해서 한 곳에서 같이 쓴다.
export const MODA_SHELL_PATHS = ["/upload", "/resources", "/introduce", "/blog"];

// "/"는 startsWith로 비교하면 전부 매칭되므로 정확 일치로만 판정한다.
export function isModaSection(pathname: string): boolean {
  return pathname === "/" || MODA_SHELL_PATHS.some((p) => pathname.startsWith(p));
}

// 이 경로들은 비로그인 상태의 로그인·회원가입 버튼을 숨긴다(TopBar·NavPopover 공용).
export const HIDE_AUTH_BUTTONS_PATHS = ["/layer", "/about"];

// 이 경로들은 햄버거 메뉴에 소개 항목만 노출한다(이용가이드·블로그 숨김).
export const INTRO_ONLY_MENU_PATHS = ["/layer", "/about"];
