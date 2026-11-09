"use client";

import type { FocusEvent, PointerEvent } from "react";
import Image from "next/image";
import { motion, useAnimate, useReducedMotion } from "motion/react";

import type { WorkProject } from "@/types/reelsfactory.types";
import { FOCUS_RING, TONE_CLASSES } from "@/components/reelsfactory/SectionShell";
import { REVEAL_ITEM_VARIANTS } from "@/components/reelsfactory/revealPresets";
import {
  POPOVER_ENTER_TRANSITION,
  POPOVER_EXIT_TRANSITION,
  PRESS_SCALE,
  PRESS_TRANSITION,
} from "@/components/ui/motionPresets";
import { cn } from "@/lib/utils";

/** 항목이 활성화된 경로. 프리뷰는 마우스로 가리킬 때만 띄운다 */
export type WorkActiveSource = "pointer" | "focus";

interface WorkListItemProps {
  work: WorkProject;
  onSelect: (work: WorkProject) => void;
  /** 이 항목이 활성일 때 그 경로, 아니면 null */
  activeSource: WorkActiveSource | null;
  /** 다른 항목이 활성이라 흐리게 보일지 여부 */
  dimmed: boolean;
  onActiveChange: (source: WorkActiveSource | null) => void;
}

const tone = TONE_CLASSES.cream;

// 흐림은 가리킨 항목으로 시선을 모으는 보조 신호라 짧게 바뀐다. 키보드 포커스 링이 있어 정보 손실은 없다
const DIM_OPACITY = 0.3;
const DIM_TRANSITION = { duration: 0.2, ease: "easeOut" } as const;

// 프리뷰가 포인터를 그대로 붙어 다니면 떨려 보여서, 살짝 늦게 따라오는 스프링으로 부드럽게 한다
const FOLLOW_SPRING = { type: "spring", stiffness: 260, damping: 30, mass: 0.6 } as const;

export default function WorkListItem({
  work,
  onSelect,
  activeSource,
  dimmed,
  onActiveChange,
}: WorkListItemProps) {
  const [previewScope, animatePreview] = useAnimate<HTMLDivElement>();
  const shouldReduceMotion = useReducedMotion();
  const showPreview = activeSource === "pointer";

  // 프리뷰 세로 중앙을 포인터 높이에 맞춘다. 첫 진입은 그 자리에서 바로 나타나고(위치 이동 없이 페이드만),
  // 이후 이동만 스프링으로 따라간다.
  const movePreview = (event: PointerEvent<HTMLLIElement>, immediate: boolean) => {
    const preview = previewScope.current;
    if (!preview) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const y = event.clientY - rect.top - preview.offsetHeight / 2;
    animatePreview(
      preview,
      { y },
      immediate || shouldReduceMotion ? { duration: 0 } : FOLLOW_SPRING,
    );
  };

  // 터치·펜은 호버 개념이 없어 탭 직후 흐림·프리뷰가 남지 않도록 마우스만 받는다
  const handlePointerEnter = (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType !== "mouse") return;
    movePreview(event, true);
    onActiveChange("pointer");
  };

  const handlePointerMove = (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType !== "mouse" || !showPreview) return;
    movePreview(event, false);
  };

  // 클릭으로 생긴 포커스(다이얼로그를 닫고 돌아올 때 포함)에는 흐리지 않고, 키보드 포커스에만 반응한다
  const handleFocus = (event: FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(":focus-visible")) onActiveChange("focus");
  };

  const handleBlur = () => {
    if (activeSource === "focus") onActiveChange(null);
  };

  return (
    <motion.li
      variants={REVEAL_ITEM_VARIANTS}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      className="relative"
    >
      <motion.button
        type="button"
        onClick={() => onSelect(work)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-haspopup="dialog"
        initial={false}
        animate={{ opacity: dimmed ? DIM_OPACITY : 1 }}
        transition={DIM_TRANSITION}
        whileTap={{ scale: PRESS_SCALE, transition: PRESS_TRANSITION }}
        // 좌측 정렬 텍스트라 가운데 기준으로 줄면 글자가 오른쪽으로 밀려 보인다
        className={cn("block w-full origin-left py-3 text-left", FOCUS_RING)}
      >
        <span
          lang="en"
          className="block break-words font-rf-display text-[clamp(2.25rem,6.5vw,5rem)] uppercase leading-[1.05]"
        >
          {work.nameEn}
        </span>
        <span className={cn("mt-1 block text-sm", tone.muted)}>
          – {work.category}
          <span className="sr-only"> ({work.nameKo}, 상세 보기)</span>
        </span>
      </motion.button>

      {/* 호버 썸네일 프리뷰(lg 이상). 썸네일이 세로로 긴 캡처라 3:4로 높여 윗부분만 잘리지 않게 한다. 바깥 div는 포인터 y 추적, 안쪽은 나타남·사라짐을 맡아
          두 transform이 서로의 애니메이션을 덮어쓰지 않게 나눴다 */}
      <div
        ref={previewScope}
        data-slot="work-preview"
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden aspect-[3/4] w-56 lg:block"
      >
        <motion.div
          initial={false}
          animate={
            showPreview
              ? { opacity: 1, scale: 1, transition: POPOVER_ENTER_TRANSITION }
              : { opacity: 0, scale: 0.95, transition: POPOVER_EXIT_TRANSITION }
          }
          className="relative size-full overflow-hidden"
        >
          <Image src={work.thumbnail} alt="" fill sizes="224px" className="object-cover" />
        </motion.div>
      </div>
    </motion.li>
  );
}
