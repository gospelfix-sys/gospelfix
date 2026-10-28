"use client";

import { useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationPlaybackControls,
} from "motion/react";
import { cn } from "@/lib/utils";

// 타자기 리듬: 쓰기는 또박또박, 지우기는 그보다 빠르게(사용자가 다음 문구를 기다리지 않게).
const TYPE_SECONDS_PER_CHAR = 0.08;
const DELETE_SECONDS_PER_CHAR = 0.045;
// 완성된 문구를 읽을 시간. 첫 문구는 SSR로 이미 보이므로 같은 값으로 유지 후 지우기 시작한다.
const HOLD_SECONDS = 1.8;
// 다 지운 뒤 다음 문구를 치기 전 짧은 숨
const EMPTY_PAUSE_SECONDS = 0.25;

type TypingPhase = "holding" | "moving";

interface HeroTypingTitleProps {
  label: string;
  script: string;
  phrases: readonly string[];
  className?: string;
}

// 시각 전용 영문 타이틀. 의미 전달은 호출부 h1의 sr-only 문장이 맡으므로 전체를 aria-hidden으로 둔다.
export function HeroTypingTitle({ label, script, phrases, className }: HeroTypingTitleProps) {
  const shouldReduceMotion = useReducedMotion();
  const firstPhrase = phrases[0] ?? "";

  // 서버 렌더와 첫 하이드레이션은 첫 문구 전체가 보인 상태여야 LCP·CLS가 흔들리지 않는다
  const phraseIndex = useMotionValue(0);
  const visibleCount = useMotionValue(firstPhrase.length);
  const visibleText = useTransform(() =>
    (phrases[phraseIndex.get()] ?? "").slice(0, Math.round(visibleCount.get())),
  );
  // 커서는 문구가 멈춰 있을 때만 깜빡이고, 쓰거나 지우는 동안은 켜 둔다(실제 타자기·에디터 관례)
  const [phase, setPhase] = useState<TypingPhase>("holding");

  useEffect(() => {
    if (shouldReduceMotion || phrases.length < 2) {
      phraseIndex.set(0);
      visibleCount.set(firstPhrase.length);
      return;
    }

    let cancelled = false;
    let controls: AnimationPlaybackControls | null = null;

    // 매 프레임 setState 없이 motion value만 움직이고, React 상태는 구간 경계에서만 바꾼다
    const run = async () => {
      let index = 0;
      let isMoving = false;
      // onUpdate는 delay 동안에도 시작값으로 호출되므로, 값이 실제로 바뀐 첫 프레임에만 상태를 바꾼다
      const markMovingFrom = (from: number) => (latest: number) => {
        if (isMoving || latest === from) return;
        isMoving = true;
        setPhase("moving");
      };
      const markHolding = () => {
        isMoving = false;
        setPhase("holding");
      };
      while (!cancelled) {
        const current = phrases[index] ?? "";
        markHolding();
        controls = animate(visibleCount, 0, {
          delay: HOLD_SECONDS,
          duration: current.length * DELETE_SECONDS_PER_CHAR,
          ease: "linear",
          onUpdate: markMovingFrom(visibleCount.get()),
        });
        await controls;
        if (cancelled) return;

        index = (index + 1) % phrases.length;
        phraseIndex.set(index);
        const next = phrases[index] ?? "";
        markHolding();
        controls = animate(visibleCount, next.length, {
          delay: EMPTY_PAUSE_SECONDS,
          duration: next.length * TYPE_SECONDS_PER_CHAR,
          ease: "linear",
          onUpdate: markMovingFrom(0),
        });
        await controls;
      }
    };
    void run();

    return () => {
      cancelled = true;
      controls?.stop();
      // 재실행(StrictMode·설정 변경) 시 중간 상태가 남지 않게 첫 문구 전체로 되돌린다
      phraseIndex.set(0);
      visibleCount.set(firstPhrase.length);
    };
  }, [shouldReduceMotion, phrases, firstPhrase, phraseIndex, visibleCount]);

  const isBlinking = phase === "holding" && !shouldReduceMotion;

  return (
    <span aria-hidden="true" className={cn("flex flex-col items-center", className)}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gf-gray2 sm:text-xs">
        {label}
      </span>

      {/* 이탤릭 글자가 아래 대문자 줄 위로 살짝 걸치도록 음수 margin으로 겹치고, 앞에 그린다 */}
      <span className="relative z-10 -mb-2 mt-2 whitespace-nowrap font-playfair text-4xl font-bold italic leading-none text-gf-orange sm:-mb-3 sm:text-5xl lg:-mb-4 lg:text-7xl">
        {script}
      </span>

      {/* 줄 높이를 고정하고 줄바꿈을 막아 문구 길이가 바뀌어도 아래 레이아웃이 밀리지 않게 한다 */}
      <span className="flex h-[1.1em] items-center whitespace-nowrap text-[34px] font-black uppercase leading-none tracking-[-0.03em] text-gf-black sm:text-6xl lg:text-8xl">
        <motion.span>{visibleText}</motion.span>
        <motion.span
          className="ml-[0.08em] block h-[0.8em] w-[0.08em] bg-gf-orange"
          animate={isBlinking ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }}
          transition={
            isBlinking
              ? { duration: 1, times: [0, 0.5, 0.5, 1], ease: "linear", repeat: Infinity }
              : { duration: 0 }
          }
        />
      </span>
    </span>
  );
}
