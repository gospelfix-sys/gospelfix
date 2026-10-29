"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { PANEL_ENTER_TRANSITION, PANEL_EXIT_TRANSITION } from "@/components/ui/motionPresets";
import type { AuthModalView } from "@/store/atoms/uiAtom";

type View = Exclude<AuthModalView, null>;

interface AuthViewTransitionProps {
  view: View;
  children: React.ReactNode;
}

// 소셜 → 이메일 로그인 → 회원가입 순서로 "앞으로" 간다고 보고, 앞으로 가면 왼쪽으로 밀리고
// 되돌아가면 반대로 밀린다.
const VIEW_ORDER: Record<View, number> = { social: 0, login: 1, signup: 2 };

// 짧은 수평 이동만 준다. 퇴장은 등장보다 빠르게 끝나 반응이 굼뜨지 않게 한다.
const SLIDE_DISTANCE = 16;

function createViewVariants(reduceMotion: boolean): Variants {
  const distance = reduceMotion ? 0 : SLIDE_DISTANCE;
  return {
    enter: (direction: number) => ({ opacity: 0, x: distance * direction }),
    center: { opacity: 1, x: 0, transition: PANEL_ENTER_TRANSITION },
    exit: (direction: number) => ({
      opacity: 0,
      x: -distance * direction,
      transition: PANEL_EXIT_TRANSITION,
    }),
  };
}

// 뷰마다 높이가 달라 모달이 툭 늘어나거나 줄지 않도록, 내용 높이를 측정해 감싼 높이를 따라가게 한다.
export default function AuthViewTransition({ view, children }: AuthViewTransitionProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const [prevView, setPrevView] = useState(view);
  const [direction, setDirection] = useState(1);

  // 렌더 중에 방향을 정해야 새 뷰의 등장과 이전 뷰의 퇴장이 같은 방향 값을 쓴다
  if (view !== prevView) {
    setDirection(VIEW_ORDER[view] > VIEW_ORDER[prevView] ? 1 : -1);
    setPrevView(view);
  }

  useEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      const size = entry.borderBoxSize?.[0]?.blockSize ?? node.getBoundingClientRect().height;
      setHeight(size);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const variants = createViewVariants(reduceMotion);

  return (
    // -m-1 p-1: overflow-hidden이 입력창 포커스 링(ring-3)을 자르지 않도록 여유를 두고 상쇄한다
    <motion.div
      className="-m-1 overflow-hidden"
      initial={false}
      animate={{ height }}
      transition={reduceMotion ? { duration: 0 } : PANEL_ENTER_TRANSITION}
    >
      <div ref={contentRef} className="relative p-1">
        {/* popLayout: 퇴장하는 뷰를 흐름에서 빼서 새 뷰 높이가 바로 측정되게 하고, 두 뷰가 겹쳐 크로스페이드된다.
            initial={false}: 모달이 처음 열릴 때는 Dialog 자체 등장 모션만 보이게 한다. */}
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={view}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
