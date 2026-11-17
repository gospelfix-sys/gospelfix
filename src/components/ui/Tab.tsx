import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  // underline: 밑줄 탭(기본) / segment: 테두리 있는 알약형 탭(균등 분할 그리드용)
  variant?: "underline" | "segment";
}

const VARIANT_CLASS = {
  underline: "shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
  segment:
    "flex h-9 items-center justify-center gap-1.5 rounded-lg border text-sm font-medium outline-none focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]",
} as const;

// 도메인 지식이 없는 원자 컴포넌트 — 활성/비활성 색상은 호출부가 className으로 넘긴다
// (예: 밝은 배경용/어두운 배경용 탭이 서로 다른 팔레트를 쓸 수 있으므로).
export function Tab({ active, variant = "underline", className, children, ...props }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(VARIANT_CLASS[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
