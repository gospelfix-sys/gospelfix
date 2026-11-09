import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { SectionTone } from "@/components/reelsfactory/sections";

interface ToneClasses {
  /** 섹션 배경 + 기본 글자색 */
  base: string;
  /** 배경 없이 글자색만 필요할 때 (투명 레일) */
  text: string;
  /** 보조 텍스트 (배경 대비 AA 확보 값) */
  muted: string;
  /** 장식용 얇은 라인 (배경색 클래스) */
  line: string;
  /** 구분선 (border-color 클래스) */
  rule: string;
  /** 툴/태그 칩 */
  chip: string;
}

// ink 섹션 위에서는 cream, cream 섹션 위에서는 ink 글자를 쓴다.
export const TONE_CLASSES: Record<SectionTone, ToneClasses> = {
  ink: {
    base: "bg-rf-ink text-rf-cream",
    text: "text-rf-cream",
    muted: "text-rf-cream/70",
    line: "bg-rf-cream/40",
    rule: "border-rf-cream/20",
    chip: "border border-rf-cream/30 text-rf-cream/80",
  },
  cream: {
    base: "bg-rf-cream text-rf-ink",
    text: "text-rf-ink",
    muted: "text-rf-ink/70",
    line: "bg-rf-ink/40",
    rule: "border-rf-ink/20",
    chip: "border border-rf-ink/30 text-rf-ink/80",
  },
};

// 배경색이 바뀌는 페이지라 고정 색 대신 현재 글자색(currentColor)으로 링을 그린다.
export const FOCUS_RING =
  "rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current";

interface SectionShellProps {
  id: string;
  tone: SectionTone;
  children: ReactNode;
  className?: string;
}

export default function SectionShell({ id, tone, children, className }: SectionShellProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      // 모바일은 고정 상단 바(h-10) 아래로, md 이상은 좌측 레일 폭만큼 비운다.
      className={cn(
        "flex min-h-dvh flex-col justify-center px-6 pb-16 pt-24 md:py-24 md:pl-24 md:pr-12",
        TONE_CLASSES[tone].base,
        className,
      )}
    >
      {children}
    </section>
  );
}
