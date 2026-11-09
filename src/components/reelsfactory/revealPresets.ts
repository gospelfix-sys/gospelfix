import type { Transition, Variants } from "motion/react";

// /reelsfactory 섹션 진입 모션 값. 섹션마다 속도·거리가 달라지지 않도록 여기서만 고친다.
// stagger 간격은 홈 히어로(HeroReveal)의 0.07/0.05에 맞춘다.

const REVEAL_TRANSITION = { duration: 0.35, ease: "easeOut" } satisfies Transition;

export const REVEAL_STAGGER = 0.07;
export const REVEAL_DELAY = 0.05;

// 본문 묶음은 20%만 보여도 시작한다. 긴 목록이 화면보다 커도 트리거가 걸리게 낮게 잡았다.
export const REVEAL_VIEWPORT = { once: true, amount: 0.2 } as const;

export const REVEAL_CONTAINER_VARIANTS: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: REVEAL_STAGGER, delayChildren: REVEAL_DELAY } },
};

export const REVEAL_ITEM_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  shown: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
};
