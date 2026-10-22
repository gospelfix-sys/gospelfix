import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

// 도메인 지식이 없는 원자 컴포넌트 — 활성/비활성 색상은 호출부가 className으로 넘긴다
// (예: 밝은 배경용/어두운 배경용 탭이 서로 다른 팔레트를 쓸 수 있으므로).
export function Tab({ active, className, children, ...props }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "shrink-0 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
