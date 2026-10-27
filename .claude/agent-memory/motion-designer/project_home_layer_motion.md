---
name: home-layer-motion
description: 홈(/) LayerShell 모션 결정 — loading.tsx↔page.tsx 교체로 셸 전체가 재마운트되는 함정, MotionConfig 범위, 공용 타이밍 상수 위치
metadata:
  type: project
---

2026-10-27 홈 다크 레이아웃 개편 모션 작업에서 정한 것과 함정.

1. `(public)/loading.tsx`와 `page.tsx`가 각각 `LayerShell`+`HomeHero`+`SortTabs`를 렌더한다. 그래서 첫 진입뿐 아니라 정렬·카테고리(searchParams) 변경 때도 로딩→본문 교체로 셸 전체가 새로 마운트된다. 마운트 등장 모션은 그때마다 다시 재생된다.
   **How to apply:** 홈에 마운트 등장 모션을 넣을 때는 모듈 플래그로 첫 진입 한 번만 재생한다(HeroReveal의 `hasRevealed` 방식). 상태도 재마운트로 사라지므로 SortTabs 인디케이터는 낙관적 pendingSort로 누른 즉시 옮긴다.

2. 움직임 감소: 루트 레이아웃에는 MotionConfig가 없다. 홈은 `LayerShell`을 `components/ui/ReducedMotionConfig`(reducedMotion="user")로 감쌌다. 단 MotionConfig는 무한 반복 모션을 멈추지 않으므로 티커 같은 반복 모션은 `useReducedMotion`으로 직접 끈다. 앱 전체 적용(루트 레이아웃)은 아직 제안 단계.

3. 공용 타이밍 상수는 `components/ui/motionPresets.ts`(PANEL 0.3/0.2, POPOVER 0.2/0.15, PRESS 0.15, PRESS_SCALE 0.96). `dialog.tsx`·`RouteModal`은 아직 자체 값을 쓴다(값은 같음).

4. HeroReveal은 SSR HTML에 opacity 0을 박으므로 하이드레이션 전에는 히어로 h1(LCP 후보)이 보이지 않는다. LCP가 문제가 되면 첫 진입에서도 `initial={false}`로 되돌린다.

관련: [[route-modal-loading-pitfalls]]
