---
name: section-toggle-motion
description: SectionToggle(에이전시/모다) 슬라이딩 — 한 인스턴스에서 경로로는 활성 항목이 안 바뀌는 구조, fixed 헤더 안 layoutId 함정, 공용 세그먼트 스프링 프리셋
metadata:
  type: project
---

2026-10-29 SectionToggle 모션 작업에서 정한 것과 함정.

1. 에이전시 경로는 TopBar, 모다 경로는 LayerNavBar(LayerShell, 페이지마다 재마운트)가 토글을 렌더한다. TopBar는 모다 경로에서 null이다. 그래서 어떤 인스턴스도 pathname 변화로 활성 항목이 바뀌지 않는다 — 섹션을 오가면 항상 다른 토글이 새로 마운트된다.
   **How to apply:** 슬라이딩은 SortTabs처럼 누른 즉시 pendingKey로 반영해 페이지가 바뀌기 전 짧은 구간에서만 보인다. 이동이 빠르면(프리페치) 중간에 언마운트로 끊긴다. 마운트 시에는 애니메이션 없이 최종 상태로 나타난다.

2. fixed 헤더(TopBar MorphingHeader는 스크롤에 따라 폭이 바뀜) 안의 layoutId 요소는 스크롤 중 재렌더가 일어나면 이전 측정 위치에서 다시 미끄러져 오는 오작동이 날 수 있다. `layoutDependency={activeKey}`로 활성 변경 때만 측정하게 했다(브라우저 미검증 — dev 서버가 꺼져 있었음).

3. 폭이 다른 항목 사이를 layoutId로 옮기면 scale 보정이 생기므로 borderRadius·boxShadow는 motion `style`로 넘겨 보정받는다(className rounded/shadow 대신).

4. 세그먼트 인디케이터 스프링은 `motionPresets.SEGMENT_INDICATOR_TRANSITION`(400/34)으로 모았다(SortTabs와 공유). TopBar는 LayerShell의 ReducedMotionConfig 밖이라 SectionToggle이 자체적으로 감싼다.

관련: [[home-layer-motion]]
