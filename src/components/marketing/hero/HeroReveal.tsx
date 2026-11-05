"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { PRESS_SCALE, PRESS_TRANSITION } from "@/components/ui/motionPresets";

// 배지 → 헤드라인 → 설명 → CTA 순서로 짧게 이어 등장한다(항목 간 0.07초, 전체 약 0.55초).
const containerVariants: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

// (public)/loading.tsx와 page.tsx가 같은 히어로를 각각 렌더해 로딩→본문 교체(정렬·카테고리 변경 포함)
// 때마다 새로 마운트된다. 등장 연출은 첫 진입 한 번만 보여주고, 이후 마운트는 처음부터 보인 상태로 둔다.
let hasRevealed = false;

const MOTION_TAGS = {
  span: motion.span,
  h1: motion.h1,
  p: motion.p,
} as const;

interface HeroRevealProps {
  className?: string;
  children: React.ReactNode;
}

// 히어로 섹션 자체(stagger 컨테이너). HomeHero는 서버 컴포넌트로 두고 이 경계만 클라이언트로 내린다.
export function HeroReveal({ className, children }: HeroRevealProps) {
  // 첫 렌더 시점의 값을 고정해 StrictMode 재마운트 등으로 initial이 바뀌지 않게 한다
  const [shouldReveal] = useState(() => !hasRevealed);

  useEffect(() => {
    hasRevealed = true;
  }, []);

  return (
    <motion.section
      variants={containerVariants}
      initial={shouldReveal ? "hidden" : false}
      animate="shown"
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface HeroRevealItemProps {
  as: keyof typeof MOTION_TAGS;
  className?: string;
  children: React.ReactNode;
}

// 래퍼 div를 끼우면 flex 정렬·max-width가 달라지므로 원래 태그 자체를 motion 요소로 렌더한다
export function HeroRevealItem({ as, className, children }: HeroRevealItemProps) {
  const Tag = MOTION_TAGS[as];
  return (
    <Tag variants={itemVariants} className={className}>
      {children}
    </Tag>
  );
}

const ctaVariants: Variants = {
  ...itemVariants,
  hover: { y: -2, transition: PRESS_TRANSITION },
  tap: { scale: PRESS_SCALE, transition: PRESS_TRANSITION },
};
// 호버 시 화살표가 진행 방향으로 살짝 밀려 "아래로 이동"을 암시한다
const ctaArrowVariants: Variants = {
  hover: { x: 3, transition: PRESS_TRANSITION },
};

const MotionLink = motion.create(Link);

interface HeroCtaProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

export function HeroCta({ href, className, children, icon }: HeroCtaProps) {
  return (
    <MotionLink
      href={href}
      variants={ctaVariants}
      whileHover="hover"
      whileTap="tap"
      className={className}
    >
      {children}
      <motion.span variants={ctaArrowVariants} className="flex">
        {icon}
      </motion.span>
    </MotionLink>
  );
}
