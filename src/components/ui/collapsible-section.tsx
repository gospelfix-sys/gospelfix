"use client";

import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  /** 헤더에 표시할 제목 */
  title: ReactNode;
  /** 내부에 입력된 값이 있는지 여부 — true면 사용자가 직접 조작하기 전까지 펼쳐 둔다 */
  hasValue?: boolean;
  children: ReactNode;
}

// 선택 항목을 숨겨 화면을 짧게 만드는 접이식 영역
export function CollapsibleSection({
  title,
  hasValue = false,
  children,
}: CollapsibleSectionProps) {
  const panelId = useId();
  // null이면 사용자가 아직 조작하지 않은 상태 → 값 유무를 따른다 (비동기 로드된 값도 반영)
  const [userOpen, setUserOpen] = useState<boolean | null>(null);
  const isOpen = userOpen ?? hasValue;

  return (
    <div className="rounded-xl border border-gf-border bg-gf-white">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setUserOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-sm font-bold text-gf-black outline-none focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]"
      >
        <span className="min-w-0 truncate">{title}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-gf-gray2", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div id={panelId} className="space-y-4 border-t border-gf-border px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
