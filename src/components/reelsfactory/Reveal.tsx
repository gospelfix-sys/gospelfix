"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

import {
  REVEAL_CONTAINER_VARIANTS,
  REVEAL_DELAY,
  REVEAL_ITEM_VARIANTS,
  REVEAL_STAGGER,
  REVEAL_VIEWPORT,
} from "@/components/reelsfactory/revealPresets";

// 래퍼 div를 끼우면 flex/grid 배치가 달라지므로 원래 태그 자체를 motion 요소로 렌더한다
const MOTION_TAGS = {
  div: motion.div,
  p: motion.p,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  h1: motion.h1,
  header: motion.header,
} as const;

type RevealTag = keyof typeof MOTION_TAGS;

interface RevealGroupProps {
  as?: RevealTag;
  className?: string;
  /** 첫 자식이 움직이기 전 대기. 같은 화면에서 앞선 묶음 뒤에 이어지게 할 때만 늘린다 */
  delay?: number;
  children: ReactNode;
}

// 화면에 들어오면 한 번만, 자식 RevealItem을 순서대로 띄우는 stagger 컨테이너.
// 섹션 파일은 서버 컴포넌트로 두고 움직이는 경계만 이 클라이언트 컴포넌트로 내린다.
export function RevealGroup({ as = "div", className, delay, children }: RevealGroupProps) {
  const Tag = MOTION_TAGS[as];
  const variants: Variants =
    delay === undefined
      ? REVEAL_CONTAINER_VARIANTS
      : {
          ...REVEAL_CONTAINER_VARIANTS,
          shown: { transition: { staggerChildren: REVEAL_STAGGER, delayChildren: delay } },
        };

  return (
    <Tag
      variants={variants}
      initial="hidden"
      whileInView="shown"
      viewport={REVEAL_VIEWPORT}
      className={className}
    >
      {children}
    </Tag>
  );
}

interface RevealItemProps {
  as?: RevealTag;
  id?: string;
  className?: string;
  children: ReactNode;
}

// RevealGroup의 hidden/shown 라벨을 물려받아 아래에서 살짝 떠오른다(16px, 0.35초 감속)
export function RevealItem({ as = "div", id, className, children }: RevealItemProps) {
  const Tag = MOTION_TAGS[as];
  return (
    <Tag id={id} variants={REVEAL_ITEM_VARIANTS} className={className}>
      {children}
    </Tag>
  );
}

// 제목 글자 하나의 이동 거리는 글자 크기에 비례해야 clamp()로 크기가 바뀌어도 같은 인상이 난다
const LETTER_VARIANTS: Variants = {
  hidden: { opacity: 0, y: "0.3em" },
  shown: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// 긴 제목도 전체 stagger가 0.4초를 넘지 않게 글자 간격을 줄인다(짧은 제목은 0.04초)
const LETTER_STAGGER_MAX = 0.04;
const LETTER_STAGGER_TOTAL = 0.4;
// 큰 제목은 한 줄이 짧아 절반 이상 보였을 때 시작해야 시작 순간을 놓치지 않는다
const LETTER_VIEWPORT = { once: true, amount: 0.6 } as const;

interface RevealLettersProps {
  text: string;
}

// 섹션 제목 글자 단위 reveal. 글자를 쪼갠 span은 스크린리더가 한 글자씩 읽으므로 통째로 숨기고,
// 원문은 SectionTitle이 sr-only로 따로 둔다.
export function RevealLetters({ text }: RevealLettersProps) {
  const words = text.split(" ");
  const letterCount = text.replace(/ /g, "").length;
  const stagger = Math.min(LETTER_STAGGER_MAX, LETTER_STAGGER_TOTAL / Math.max(letterCount, 1));

  return (
    <motion.span
      aria-hidden="true"
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: stagger, delayChildren: REVEAL_DELAY } },
      }}
      initial="hidden"
      whileInView="shown"
      viewport={LETTER_VIEWPORT}
      className="block"
    >
      {words.map((word, wordIndex) => (
        // 단어 안에서 줄바꿈되지 않도록 단어를 nowrap으로 묶고, 공백은 일반 텍스트로 남겨 줄바꿈 지점을 유지한다
        <span key={`${word}-${wordIndex}`}>
          {wordIndex > 0 && " "}
          <span className="inline-block whitespace-nowrap">
            {Array.from(word).map((letter, letterIndex) => (
              <motion.span
                key={`${letter}-${letterIndex}`}
                variants={LETTER_VARIANTS}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
          </span>
        </span>
      ))}
    </motion.span>
  );
}
