"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

// 한 단어를 읽을 시간. 전환(약 0.4초)을 포함해도 충분히 읽히는 간격
const ROTATE_INTERVAL_MS = 1500;

// 슬롯처럼 아래에서 올라와 위로 빠진다. 알약이 잘라내므로 이동 거리는 단어 높이만큼 둔다.
// 들어오는 단어는 감속하며 자리 잡고, 나가는 단어는 그보다 빨리 비켜 준다.
const rollVariants: Variants = {
  enter: { y: "100%", opacity: 0 },
  center: { y: "0%", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { y: "-100%", opacity: 0, transition: { duration: 0.28, ease: "easeIn" } },
};

// 움직임 감소 설정에서는 위치 이동 없이 교차 페이드만 남긴다. 서버는 이 설정을 모르고 rollVariants로
// 렌더하므로, y를 0으로 함께 지정해 첫 렌더 인라인 스타일(transform)이 같아 hydration이 어긋나지 않게 한다
const fadeVariants: Variants = {
  enter: { y: "0%", opacity: 0 },
  center: { y: "0%", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { y: "0%", opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

interface HeroRollingWordProps {
  words: readonly string[];
  className?: string;
}

export function HeroRollingWord({ words, className }: HeroRollingWordProps) {
  const shouldReduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % words.length);
        schedule();
      }, ROTATE_INTERVAL_MS);
    };
    // 숨은 탭에서는 rAF가 멈춰 전환이 쌓였다가 복귀 시 한꺼번에 튀므로, 숨김 동안은 타이머를 멈추고
    // 다시 보이면 간격을 처음부터 센다
    const handleVisibility = () => {
      clearTimeout(timer);
      if (document.visibilityState === "visible") schedule();
    };

    if (document.visibilityState === "visible") schedule();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [words.length]);

  const variants = shouldReduceMotion ? fadeVariants : rollVariants;
  const currentWord = words[index] ?? "";

  return (
    // overflow-clip: 테두리 안쪽(둥근 모서리 포함)에서 단어를 잘라 낸다. overflow-hidden과 달리
    // inline 요소의 baseline을 바꾸지 않아 h1 줄 높이가 그대로 유지된다
    <span
      className={cn(
        "inline-grid overflow-clip whitespace-nowrap rounded-full border-4 border-gf-orange px-10 py-4 text-5xl text-gf-orange sm:text-7xl",
        className,
      )}
    >
      {/* 스크린리더는 바뀌는 단어 대신 후보 전체를 한 번에 읽는다(제목이 주기적으로 달라지지 않게) */}
      <span className="sr-only">{words.join(", ")}</span>
      {/* 가장 긴 단어가 같은 칸을 차지해 알약 너비를 고정한다 — 단어가 바뀌어도 h1이 흔들리지 않는다 */}
      {words.map((word) => (
        <span key={word} aria-hidden className="invisible col-start-1 row-start-1">
          {word}
        </span>
      ))}
      {/* 첫 렌더는 애니메이션 없이 SSR 그대로 보여 깜빡임·LCP 지연이 없다 */}
      <AnimatePresence initial={false}>
        <motion.span
          key={currentWord}
          aria-hidden
          className="col-start-1 row-start-1 text-center"
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
