---
name: reelsfactory-motion
description: /reelsfactory 포트폴리오 모션 결정 — whileInView 첫 도입, style= 없이 포인터 추적(useAnimate), 글자 reveal 접근성, 검증 시 스크롤 복원 착시
metadata:
  type: project
---

2026-11-09 /reelsfactory 모션 작업에서 정한 것과 함정.

1. 저장소 첫 `whileInView` 도입. 값은 `reelsfactory/revealPresets.ts`(stagger 0.07/delay 0.05, y16, 0.35s, amount 0.2)에 모으고 `Reveal.tsx`(RevealGroup/RevealItem/RevealLetters)로 서버 섹션 파일에서 쓴다. 화면보다 긴 목록(경력 타임라인)은 목록 전체가 아니라 항목마다 그룹으로 트리거.

2. 포인터 y 추적은 `style={{ y: motionValue }}` 대신 `useAnimate`로 바깥 div에 명령형 스프링을 걸고, 나타남(opacity·scale)은 안쪽 motion.div로 분리했다 — 사용자가 인라인 style= 금지를 명시해서. 두 transform을 한 요소에 섞지 않는 것이 핵심. useAnimate는 MotionConfig reducedMotion을 안 따르므로 `useReducedMotion`으로 duration 0 분기.

3. 글자 reveal: h2 안에 원문 `sr-only` + 글자 span 묶음 `aria-hidden`. 단어 단위 `inline-block whitespace-nowrap`으로 묶어야 글자 사이에서 줄바꿈되지 않는다.

4. 검증 함정: reload 시 브라우저가 스크롤 위치를 복원해 히어로가 화면 밖이면 whileInView가 안 걸려 opacity 0으로 "멈춘 것처럼" 보인다. 측정 전 `scrollTo(0,0)` 확인.

관련: [[section-toggle-motion]], [[quote-floating-cta-motion]]
