"use client";

import { useEffect } from "react";
import { useAnimate, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { SKELETON_BLOCK_ATTR } from "@/components/ui/skeleton";

interface SkeletonPulseProps {
  children: React.ReactNode;
}

// 시작값 1이 서버 마크업(정적 블록)과 같아 교체 순간 튀지 않는다.
const PULSE_KEYFRAMES = { opacity: [1, 0.5, 1] };
const PULSE_TRANSITION = {
  duration: 1.6,
  ease: "easeInOut",
  repeat: Infinity,
} satisfies Transition;

/**
 * 하위의 모든 Skeleton 블록을 하나의 애니메이션으로 맥동시킨다. 블록마다 따로 돌리면 마운트
 * 시점이 어긋날 때 박자가 흩어지므로 한 번에 묶는다. opacity만 움직여(합성 레이어) 블록이
 * 많아도 레이아웃 비용이 없다. 감싸는 div는 display: contents라 레이아웃에 끼어들지 않는다.
 */
export function SkeletonPulse({ children }: SkeletonPulseProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  // MotionConfig reducedMotion은 무한 반복 opacity를 멈추지 않으므로 직접 끈다(정적 표시).
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const controls = animate(`[${SKELETON_BLOCK_ATTR}]`, PULSE_KEYFRAMES, PULSE_TRANSITION);
    return () => controls.stop();
  }, [animate, shouldReduceMotion]);

  return (
    <div ref={scope} className="contents">
      {children}
    </div>
  );
}
