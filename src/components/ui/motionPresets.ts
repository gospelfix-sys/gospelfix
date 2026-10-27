import type { Transition } from "motion/react";

// 여러 컴포넌트가 공유하는 모션 타이밍. 같은 종류의 UI는 같은 속도·이징을 쓰도록 여기서만 고친다.
// 등장은 감속(easeOut), 퇴장은 등장보다 빠른 가속(easeIn) — 닫힘이 굼뜨게 느껴지지 않게 한다.

// 드로어·패널처럼 화면 일부를 덮는 큰 요소
export const PANEL_ENTER_TRANSITION = { duration: 0.3, ease: "easeOut" } satisfies Transition;
export const PANEL_EXIT_TRANSITION = { duration: 0.2, ease: "easeIn" } satisfies Transition;

// 드롭다운·검색창 전환처럼 작은 요소
export const POPOVER_ENTER_TRANSITION = { duration: 0.2, ease: "easeOut" } satisfies Transition;
export const POPOVER_EXIT_TRANSITION = { duration: 0.15, ease: "easeIn" } satisfies Transition;

// 탭·프레스 즉각 피드백
export const PRESS_TRANSITION = { duration: 0.15, ease: "easeOut" } satisfies Transition;
export const PRESS_SCALE = 0.96;
