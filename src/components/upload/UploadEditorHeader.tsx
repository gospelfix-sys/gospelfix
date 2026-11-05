"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

interface UploadEditorHeaderProps {
  submitting: "draft" | "pending" | null;
  onOpenMenu: () => void;
  onSubmit: (status: "draft" | "pending") => void;
}

export function UploadEditorHeader({ submitting, onOpenMenu, onSubmit }: UploadEditorHeaderProps) {
  const submitLabel = { draft: "저장 중...", pending: "제출 중..." } as const;

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-gf-border bg-gf-white px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Button
          onClick={onOpenMenu}
          aria-label="메뉴 열기"
          variant="ghost"
          size="icon-lg"
          className="rounded-full text-gf-gray2 lg:hidden"
        >
          <Menu width={18} height={18} />
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          닫기
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled={!!submitting} onClick={() => onSubmit("draft")}>
          {submitting === "draft" ? submitLabel.draft : "초안저장"}
        </Button>
        <Button variant="default" disabled={!!submitting} onClick={() => onSubmit("pending")}>
          {submitting === "pending" ? submitLabel.pending : "게시"}
        </Button>
      </div>
    </header>
  );
}
