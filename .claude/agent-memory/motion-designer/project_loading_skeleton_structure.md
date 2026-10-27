---
name: loading-skeleton-structure
description: loading.tsx 스켈레톤 구조 결정 — 클라이언트 청크 suspend로 바깥 홈 스켈레톤이 새는 함정, Preload 트릭이 안 통한 경우, 정적 블록+그룹 맥동 해법
metadata:
  type: project
---

2026-10-27 모든 loading.tsx를 Skeleton UI로 통일(Preloader 방식은 사용자가 철회)하면서 확인한 것.

1. loading.tsx 안에 클라이언트 컴포넌트(motion Skeleton, LayerShell의 네비·MotionConfig 등)가 있으면 dev에서 그 청크를 받는 ~300ms 동안 suspend되어 바깥 `(public)/loading.tsx`(홈 스켈레톤)가 /about·/blog 등에 그대로 비쳤다. `(public)/layout`에서 null 컴포넌트로 미리 로드하는 트릭([[route-modal-loading-pitfalls]]의 RouteModalLoadingPreload 방식)은 여기서는 **효과가 없었다**(엔트리별 청크가 달라 보임).
   **How to apply:** loading.tsx에 들어가는 클라이언트 경계마다 안쪽 Suspense + 같은 모양의 정적 fallback을 둔다. 측정은 rAF로 `#gallery [role="status"]`(홈 스켈레톤) 존재를 폴링, RSC 요청(`_rsc`/`rsc: 1`)을 page.route로 지연시켜 로딩 구간을 만든다.

2. 그래서 `Skeleton`(ui/skeleton.tsx)은 서버 호환 정적 div(`data-skeleton`)이고, 맥동은 `SkeletonRegion`(skeletons/) 안의 Suspense 뒤 `SkeletonPulse`(useAnimate로 모든 블록을 한 애니메이션으로, opacity 1→0.5→1 1.6s)가 입힌다. fallback은 같은 children(정적). LayerShell 쪽은 `LayerShellLoading`(정적 다크 셸 + h-16 네비 자리) fallback — 교체 시 본문 위치 이동 0px 확인.

3. 인터셉트 모달 로딩은 backdrop + 같은 패널(ArticleSkeleton)을 즉시 띄우고, RouteModal이 backdrop·패널 opacity/y를 이어받는다(routeModalBackdrop.ts의 overlay state). 응답이 매우 빠르면(패널 등장 중 교체) 렌더 시점 값이 커밋 시점보다 한 프레임 늦어 0.08 opacity/3px 정도 되돌아가는 미세한 튐이 남아 있다.
