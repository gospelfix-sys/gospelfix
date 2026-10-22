import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

// 도메인 지식이 없는 원자 컴포넌트 — 크기/색상은 호출부가 className으로 넘긴다
// (Tab.tsx와 동일한 패턴). 선택 가능한 pill 버튼(옵션 선택, 상태 토글, 빠른 검색 칩 등)에 재사용.
export function Chip({ active = false, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn("rounded-full border transition-colors", className)}
      {...props}
    >
      {children}
    </button>
  );
}
