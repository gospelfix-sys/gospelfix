/**
 * RouteModal과 그 로딩 오버레이(RouteModalLoading)가 공유하는 backdrop·패널 정의와 진행값 이어받기.
 *
 * 인터셉트 모달은 "로딩 오버레이(backdrop + 스켈레톤 패널) → 실제 RouteModal" 순으로 교체된다.
 * 두 쪽의 클래스·전환이 다르면 교체 순간 톤이 튀고, RouteModal이 항상 처음 값(opacity 0, y 40)에서
 * 시작하면 로딩 패널이 사라진 자리에서 다시 올라오며 깜빡인다. 그래서 같은 값을 쓰고,
 * RouteModal은 로딩 오버레이의 현재 backdrop opacity·패널 opacity/y에서 이어서 움직인다.
 */

export const ROUTE_MODAL_FADE_TRANSITION = { duration: 0.3, ease: "easeOut" as const };
export const ROUTE_MODAL_BACKDROP_CLASS = "fixed inset-0 z-50 bg-black/10 backdrop-blur-[20px]";
// 패널 겉면과 스크롤 본문. 로딩 패널과 실제 모달이 같은 면 위에서 내용만 바뀌도록 공유한다.
export const ROUTE_MODAL_PANEL_CLASS =
  "fixed inset-0 top-6 z-50 bg-white outline-none overflow-hidden";
export const ROUTE_MODAL_BODY_CLASS = "h-full overflow-y-auto bg-gf-bg px-6 lg:px-[60px] py-14";

export type RouteModalTheme = "light" | "dark";

// 모달은 body로 포털되어 LayerShell의 .gf-dark 스코프 밖에 있으므로, 다크 화면(블로그)에서 열리는
// 모달은 패널에 직접 .gf-dark를 달아 토큰을 뒤집는다. 로딩 패널과 실제 모달이 같은 값을 써야
// 교체 순간 색이 튀지 않는다.
export function routeModalPanelClass(theme: RouteModalTheme): string {
  return theme === "dark" ? `${ROUTE_MODAL_PANEL_CLASS} gf-dark` : ROUTE_MODAL_PANEL_CLASS;
}

// 뒤로가기 버튼은 라이트에서 검정 면이라 다크 패널(#121212)에서는 묻힌다. 다크에서는 흰 면으로 뒤집는다.
export function routeModalCloseButtonClass(theme: RouteModalTheme): string {
  return theme === "dark"
    ? "bg-white text-black hover:bg-white hover:text-black hover:opacity-100"
    : "bg-black text-white hover:bg-black hover:text-white hover:opacity-100 dark:hover:bg-black";
}

// 패널은 아래에서 살짝 올라오며 나타나고, 같은 방향으로 내려가며 사라진다.
export const ROUTE_MODAL_PANEL_HIDDEN = { opacity: 0, y: 40 };
export const ROUTE_MODAL_PANEL_SHOWN = { opacity: 1, y: 0 };

/** 이어받을 진행값. 로딩 오버레이가 없었다면 처음 상태(backdrop 0, 패널 숨김)다. */
export interface RouteModalOverlayState {
  backdropOpacity: number;
  panelOpacity: number;
  panelY: number;
}

const INITIAL_STATE: RouteModalOverlayState = {
  backdropOpacity: 0,
  panelOpacity: ROUTE_MODAL_PANEL_HIDDEN.opacity,
  panelY: ROUTE_MODAL_PANEL_HIDDEN.y,
};

// 로딩 오버레이가 언마운트된 뒤 RouteModal이 늦게 렌더되는 경우에만 쓰는 스냅샷 유효시간.
// 로딩 없이 열리는 모달이 오래된 값을 이어받지 않게 짧게 둔다.
const SNAPSHOT_TTL_MS = 300;

let liveSource: (() => RouteModalOverlayState) | null = null;
let snapshot: { state: RouteModalOverlayState; at: number } | null = null;

/**
 * 로딩 오버레이가 마운트되어 있는 동안 현재 진행값을 읽는 함수를 등록한다.
 * RouteModal의 첫 렌더는 로딩 오버레이 언마운트(커밋)보다 먼저 일어나므로, 언마운트 시점에
 * 값을 넘기는 방식으로는 늦다 — 렌더 시점에 바로 읽을 수 있게 살아 있는 소스를 등록한다.
 * 반환 함수(해제)는 마지막 값을 짧게 스냅샷으로 남긴다.
 */
export function registerRouteModalOverlaySource(read: () => RouteModalOverlayState): () => void {
  liveSource = read;
  snapshot = null;
  return () => {
    if (liveSource !== read) return;
    liveSource = null;
    snapshot = { state: read(), at: Date.now() };
  };
}

/** RouteModal의 시작 진행값. 렌더 중 읽기 전용(쓰기 없음). */
export function readRouteModalOverlayState(): RouteModalOverlayState {
  if (liveSource) return liveSource();
  if (snapshot && Date.now() - snapshot.at <= SNAPSHOT_TTL_MS) return snapshot.state;
  return INITIAL_STATE;
}

/** RouteModal이 값을 소비한 뒤 호출해 다음 모달이 재사용하지 않게 한다. */
export function clearRouteModalOverlaySnapshot() {
  snapshot = null;
}
