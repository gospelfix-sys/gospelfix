---
name: inline-text-rolling-pitfalls
description: 제목 줄 안 인라인 요소에 클리핑 롤링(단어 교체)을 넣을 때 겪은 함정 — overflow-hidden baseline 이동, reduced motion variants hydration 불일치
metadata:
  type: project
---

2026-10-30 /layer 히어로 알약 단어 롤링(HeroRollingWord) 작업에서 확인.

1. h1 안 inline 요소에 `overflow-hidden`을 걸면 inline-block/inline-grid의 baseline이 아래 margin edge로 바뀌어 줄 높이가 달라진다. `overflow-clip`(Tailwind 3.4 지원)은 둥근 테두리 안 클리핑은 그대로 하면서 baseline을 바꾸지 않는다 — 변경 전후 h1 높이 동일함을 측정으로 확인.
   **How to apply:** 텍스트 줄 안 클리핑은 `overflow-clip`을 먼저 쓴다.

2. `useReducedMotion`으로 variants 세트를 바꾸면 서버(항상 false)와 클라이언트(reduce)의 첫 인라인 스타일이 달라 hydration 경고가 난다(`initial={false}`일 때 center 값이 style로 박힘). 두 세트가 같은 속성 키를 갖게(페이드 세트에도 `y: "0%"`) 맞추면 해결.
   **How to apply:** reduced motion 분기 variants는 속성 키 집합을 동일하게 유지한다. 검증은 `emulate_media reducedMotion: reduce`로 새로고침 후 콘솔 확인.

3. 단어 길이가 다른 롤링은 같은 grid 칸에 모든 후보를 `invisible`로 쌓아 최대 너비를 고정하는 방식이 layout 애니메이션보다 안정적(매 전환 리플로우 0).

관련: [[motion-value-sequencing-pitfalls]]
