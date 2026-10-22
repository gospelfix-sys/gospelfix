"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TermsContent from "@/components/legal/TermsContent";
import PrivacyContent from "@/components/legal/PrivacyContent";
import RefundContent from "@/components/legal/RefundContent";
import { cn } from "@/lib/utils";

const TITLES = {
  terms: "이용약관",
  privacy: "개인정보처리방침",
  refund: "환불정책",
} as const;

const CONTENTS = {
  terms: TermsContent,
  privacy: PrivacyContent,
  refund: RefundContent,
} as const;

interface LegalDialogTriggerProps {
  type: keyof typeof TITLES;
  /** 다이얼로그를 연 뒤 스크롤해서 보여줄 조항 id (예: "article-8") */
  anchor?: string;
  className?: string;
  children: React.ReactNode;
}

export default function LegalDialogTrigger({
  type,
  anchor,
  className,
  children,
}: LegalDialogTriggerProps) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const Content = CONTENTS[type];

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // 제목(titleRef)으로만 포커스를 고정(DialogContent의 initialFocus)해뒀으므로,
      // 본문 안 링크로 포커스가 튀며 스크롤을 끌고 가는 일이 없다 — 프레임 한 번으로 충분하다.
      requestAnimationFrame(() => {
        const container = contentRef.current;
        if (!container) return;
        if (anchor) {
          container.querySelector(`#${anchor}`)?.scrollIntoView({ block: "start" });
        } else {
          container.scrollTop = 0;
        }
      });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className={cn("border-0 bg-transparent p-0", className)}
      >
        {children}
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          initialFocus={() => titleRef.current}
          className="grid-rows-[auto_minmax(0,1fr)] max-h-[80vh] pr-0 sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle ref={titleRef} tabIndex={-1} className="text-xl font-bold outline-none">
              {TITLES[type]}
            </DialogTitle>
          </DialogHeader>
          <div ref={contentRef} className="overflow-y-auto">
            <Content />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
