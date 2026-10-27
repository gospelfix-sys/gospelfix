---
name: route-modal-loading-pitfalls
description: @modal/loading의 클라이언트 컴포넌트가 청크 로드로 suspend되면 (public)/loading 스켈레톤이 1프레임 노출됨, RouteModal backdrop opacity 이어받기 구조
metadata:
  type: project
---

인터셉트 모달 로딩 오버레이(2026-10-27 도입) 작업에서 확인한 함정.

1. `@modal/loading.tsx`가 클라이언트 컴포넌트를 렌더하면, 목록 화면에 그 청크가 아직 없을 때 청크 로드 동안 suspend되어 더 바깥 경계인 `(public)/loading.tsx`(사이드바+그리드 스켈레톤)가 `{modal}` 자리에 약 1프레임(~60ms) 보였다. `return null`(서버 컴포넌트)일 때는 발생하지 않았다. `@modal/default.tsx`에서 같은 모듈의 null 컴포넌트(`RouteModalLoadingPreload`)를 렌더해 청크를 미리 받게 해서 해결했다.
   **Why:** dev(프리페치 없음)에서 rAF 샘플링으로 `.animate-pulse` 개수 증가를 잡아 확인했다. 클래스만 봐서는 알 수 없다.
   **How to apply:** loading.tsx/Suspense fallback에 새 클라이언트 모듈을 넣을 때마다 바깥 fallback이 순간 노출되는지 측정한다.

2. RouteModal backdrop은 로딩 오버레이 backdrop의 현재 opacity에서 이어 fade한다(`components/ui/routeModalBackdrop.ts`). RouteModal의 첫 렌더는 로딩 오버레이 언마운트(커밋)보다 **먼저** 일어나므로 언마운트 cleanup에서 값을 넘기면 늦다 → 마운트 동안 "살아 있는 읽기 함수"를 등록하는 방식. RouteModal의 mounted 플래그도 useEffect면 교체 순간 빈 프레임이 생겨 layout effect로 바꿨다.
   **How to apply:** 이 backdrop 클래스/전환값을 바꿀 때는 `routeModalBackdrop.ts`만 고친다. 측정상 교체 순간 backdrop은 단일 레이어로 1.00(또는 0.98)에서 끊김 없이 이어졌다.

관련: [[motion-tokens]]
