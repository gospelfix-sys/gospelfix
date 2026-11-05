import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";

// 점 세 개가 0.15초 간격으로 차례로 살짝 떠올랐다 내려앉는 물결. 주기 앞쪽 절반만 움직이고
// 나머지는 쉬어 세 점이 한 박자로 읽히게 한다.
const TYPING_DOT_DELAYS = [0, 0.15, 0.3];
const TYPING_DOT_KEYFRAMES = { y: [0, -4, 0, 0] };
// 움직임 감소 설정에서는 위치 이동 대신 밝기만 맥동해 "작성 중" 의미를 유지한다.
const TYPING_DOT_REDUCED_KEYFRAMES = { opacity: [1, 0.4, 1, 1] };
const TYPING_DOT_TRANSITION = {
  duration: 1.2,
  times: [0, 0.25, 0.5, 1],
  ease: "easeInOut",
  repeat: Infinity,
} satisfies Transition;

// AI가 답변을 "작성 중"임을 보여주는 점 세 개 말풍선
export function TypingBubble() {
  // MotionConfig reducedMotion은 무한 반복 모션을 멈추지 않으므로 직접 분기한다.
  const shouldReduceMotion = useReducedMotion();
  return (
    <div className="flex max-w-[90%] items-end gap-2 self-start" role="status" aria-label="작성 중">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gf-border bg-gf-black">
        <Image src="/logo_gbk.webp" alt="" fill sizes="32px" className="object-cover" />
      </div>
      <div className="flex items-center gap-1 rounded-3xl border border-gf-border bg-gf-bg px-4 py-4">
        {TYPING_DOT_DELAYS.map((delay) => (
          <motion.span
            key={delay}
            className="h-2 w-2 rounded-full bg-gf-gray2"
            animate={shouldReduceMotion ? TYPING_DOT_REDUCED_KEYFRAMES : TYPING_DOT_KEYFRAMES}
            transition={{ ...TYPING_DOT_TRANSITION, delay }}
          />
        ))}
      </div>
    </div>
  );
}
