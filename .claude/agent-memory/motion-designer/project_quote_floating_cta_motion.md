---
name: quote-floating-cta-motion
description: /layer·/about 플로팅 AI 견적 CTA와 챗봇 타이핑 점의 모션 결정 — reduced motion 처리 방식, group-hover 대체, 검증 함정
metadata:
  type: project
---

2026-11-04 QuoteFloatingButton / QuoteChatModal TypingBubble을 motion으로 옮기며 정한 것.

1. /layer·/about은 LayerShell이 아니라 ReducedMotionConfig 범위 밖이다. 기존 파일 전체를 감싸면 JSX 전체가 재들여쓰기되어 diff 노이즈가 커지므로, 컴포넌트 안에서 `useReducedMotion`으로 initial y/whileHover/whileTap을 끈다(페이드만 남김).
   **How to apply:** 범위 밖 기존 컴포넌트에 reduced motion을 붙일 때는 훅 분기를 먼저 고려한다.

2. Tailwind `group-hover:-translate-y-*`는 부모 `motion.button`의 `initial="rest" whileHover="hover"` 라벨 전파 + 자식 `variants`로 대체했다. 중간에 객체형 initial/animate를 가진 motion.div가 끼어도 라벨 전파는 끊기지 않는다(브라우저에서 확인).

3. 검증 함정: Playwright `locator.hover()` 직후 측정에서는 hover 리프트가 0으로 나왔지만, `page.mouse.move(x, y, { steps })`로 실제 포인터를 옮기면 정상 동작했다. hover 검증은 mouse.move + rAF 샘플링으로 한다.

4. 인물 등장(지연 1초, 0.9초)은 0.5초 상한의 예외로, 사용자가 명시한 연출이다.

관련: [[home-layer-motion]]
