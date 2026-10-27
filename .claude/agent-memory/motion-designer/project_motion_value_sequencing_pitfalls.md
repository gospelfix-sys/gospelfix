---
name: motion-value-sequencing-pitfalls
description: animate(motionValue) 체이닝 루프(타이핑 등)에서 겪은 함정 — onUpdate가 delay 중에도 호출됨, MotionValue 자식 SSR 출력
metadata:
  type: project
---

2026-10-27 홈 히어로 타이핑 타이틀(HeroTypingTitle) 작업에서 확인한 motion 14.6 동작.

1. `animate(mv, to, { delay, onUpdate })`의 `onUpdate`는 delay 구간에도 시작값으로 호출된다. "실제로 움직이기 시작했다"를 onUpdate로 판단하면 delay 시작 즉시 참이 된다(커서 깜빡임이 한 번도 안 켜진 버그).
   **How to apply:** 시작값과 다른 값이 들어온 첫 호출에서만 상태를 바꾼다(`latest !== from`). 측정은 rAF 샘플링으로 확인할 것.

2. `<motion.span>{motionValue}</motion.span>`는 SSR HTML에 현재 값 텍스트를 그대로 출력한다 → 첫 문구 전체를 초기값으로 두면 LCP·CLS 안전. 매 프레임 setState 없이 `useTransform(() => ...)`로 여러 motion value를 조합해 텍스트를 만든다.

3. 루프는 `await controls` 체이닝 + cleanup에서 `cancelled` 플래그와 `controls.stop()`. MotionConfig reducedMotion은 이런 루프를 멈추지 않으므로 `useReducedMotion`으로 직접 끈다([[home-layer-motion]]).
