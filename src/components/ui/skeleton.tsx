import { cn } from "@/lib/utils";

interface SkeletonProps {
  /** 크기·모양·색 덮어쓰기. 기본 색은 라이트/다크(gf-dark) 양쪽에서 대비가 맞는 bg-gf-border. */
  className?: string;
}

/** 맥동 대상 표시. SkeletonPulse가 이 속성으로 블록을 찾는다(아래 JSX의 data-skeleton과 같은 이름). */
export const SKELETON_BLOCK_ATTR = "data-skeleton";

/**
 * 로딩 자리표시 블록. 클라이언트 청크 없이 서버 마크업만으로 그려지게 일부러 정적 div로 둔다 —
 * loading.tsx에 클라이언트 컴포넌트를 직접 넣으면 그 청크를 받는 동안 suspend되어 더 바깥
 * (public)/loading.tsx(홈 스켈레톤)가 잠깐 드러난다. 맥동은 감싸는 SkeletonPulse가 한꺼번에 입힌다.
 */
export function Skeleton({ className }: SkeletonProps) {
  return <div aria-hidden data-skeleton="" className={cn("rounded bg-gf-border", className)} />;
}
