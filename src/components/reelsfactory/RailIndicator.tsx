"use client";

import { motion } from "motion/react";

import { SEGMENT_INDICATOR_TRANSITION } from "@/components/ui/motionPresets";

interface RailIndicatorProps {
  /** 활성 섹션 id. 바뀔 때만 위치를 다시 재서 미끄러지게 한다 */
  activeId: string;
}

// 레일의 활성 점. 섹션이 바뀌면 이전 점 자리에서 새 점 자리로 미끄러져 "어디서 어디로"를 보여준다.
// 위치는 링크 안 inset+margin 정렬로 잡아 motion의 transform과 겹치지 않게 했다.
export default function RailIndicator({ activeId }: RailIndicatorProps) {
  return (
    <motion.span
      aria-hidden="true"
      layoutId="reelsfactory-rail-indicator"
      layoutDependency={activeId}
      transition={SEGMENT_INDICATOR_TRANSITION}
      className="absolute inset-0 m-auto block size-2 rounded-full bg-current"
    />
  );
}
