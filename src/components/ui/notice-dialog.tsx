"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface NoticeDialogProps {
  open: boolean;
  onClose: () => void;
  message: string;
  title?: string;
  confirmLabel?: string;
}

// 브라우저 alert() 대신 쓰는 확인 팝업. 사용자가 "확인"을 눌러야 닫히는 단순 안내용이다.
export function NoticeDialog({
  open,
  onClose,
  message,
  title = "안내",
  confirmLabel = "확인",
}: NoticeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-6 text-center sm:max-w-sm">
        <div
          aria-hidden
          className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gf-orange-bg text-gf-orange"
        >
          <Info className="size-7" />
        </div>
        <DialogTitle className="text-lg font-bold leading-snug text-foreground">
          {title}
        </DialogTitle>
        <DialogDescription className="mt-2 text-balance">{message}</DialogDescription>
        <Button
          type="button"
          size="lg"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-xl bg-black text-base font-bold text-gf-orange hover:bg-black/90"
        >
          {confirmLabel}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
