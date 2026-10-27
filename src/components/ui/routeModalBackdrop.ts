/**
 * RouteModal과 그 로딩 오버레이(RouteModalLoading)가 공유하는 backdrop 정의와 opacity 이어받기.
 *
 * 인터셉트 모달은 "로딩 오버레이 backdrop → 실제 RouteModal backdrop" 순으로 교체된다.
 * 두 backdrop의 클래스·전환이 다르면 교체 순간 톤이 튀고, RouteModal이 항상 opacity 0에서
 * 시작하면 로딩 backdrop이 사라진 자리에서 다시 fade-in하며 깜빡인다. 그래서 같은 값을 쓰고,
 * RouteModal은 로딩 backdrop의 현재 opacity에서 이어서 fade한다.
 */

export const ROUTE_MODAL_FADE_TRANSITION = { duration: 0.3, ease: "easeOut" as const };
export const ROUTE_MODAL_BACKDROP_CLASS = "fixed inset-0 z-50 bg-black/10 backdrop-blur-[20px]";

// 로딩 오버레이가 언마운트된 뒤 RouteModal이 늦게 렌더되는 경우에만 쓰는 스냅샷 유효시간.
// 로딩 없이 열리는 모달이 오래된 값을 이어받지 않게 짧게 둔다.
const SNAPSHOT_TTL_MS = 300;

let liveSource: (() => number) | null = null;
let snapshot: { opacity: number; at: number } | null = null;

/**
 * 로딩 오버레이가 마운트되어 있는 동안 현재 backdrop opacity를 읽는 함수를 등록한다.
 * RouteModal의 첫 렌더는 로딩 오버레이 언마운트(커밋)보다 먼저 일어나므로, 언마운트 시점에
 * 값을 넘기는 방식으로는 늦다 — 렌더 시점에 바로 읽을 수 있게 살아 있는 소스를 등록한다.
 * 반환 함수(해제)는 마지막 값을 짧게 스냅샷으로 남긴다.
 */
export function registerRouteModalBackdropSource(read: () => number): () => void {
  liveSource = read;
  snapshot = null;
  return () => {
    if (liveSource !== read) return;
    liveSource = null;
    snapshot = { opacity: read(), at: Date.now() };
  };
}

/** RouteModal backdrop의 시작 opacity. 이어받을 로딩 backdrop이 없으면 0. 렌더 중 읽기 전용(쓰기 없음). */
export function readRouteModalBackdropOpacity(): number {
  if (liveSource) return liveSource();
  if (snapshot && Date.now() - snapshot.at <= SNAPSHOT_TTL_MS) return snapshot.opacity;
  return 0;
}

/** RouteModal이 값을 소비한 뒤 호출해 다음 모달이 재사용하지 않게 한다. */
export function clearRouteModalBackdropSnapshot() {
  snapshot = null;
}
