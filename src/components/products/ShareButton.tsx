"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  productName: string;
}

export function ShareButton({ productName }: ShareButtonProps) {
  async function handleShare() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: productName, url: shareUrl });
      } catch {
        // 사용자가 공유 시트를 취소한 경우 별도 처리 없음
      }
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    toast("링크가 복사되었습니다.");
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-9 w-9 shrink-0 rounded-full text-gf-gray1 hover:bg-gf-orange-bg hover:text-gf-orange"
      onClick={handleShare}
      aria-label="공유하기"
    >
      <Share2 className="size-4" />
    </Button>
  );
}
