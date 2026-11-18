"use client";

import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface PaymentPreparingDialogProps {
  open: boolean;
  onClose: () => void;
}

// 계좌이체 결제가 아직 열리지 않았을 때 브라우저 alert() 대신 보여주는 안내 팝업.
// 오류가 아니라 "곧 열린다"는 상태이므로 경고색이 아닌 브랜드 톤의 시계 아이콘으로 안심시킨다.
export default function PaymentPreparingDialog({ open, onClose }: PaymentPreparingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-6 text-center sm:max-w-sm">
        <div
          aria-hidden
          className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gf-orange-bg text-gf-orange"
        >
          <Clock className="size-7" />
        </div>
        <DialogTitle className="text-lg font-bold leading-snug text-foreground">
          계좌이체 결제를 준비 중입니다
        </DialogTitle>
        <DialogDescription className="mt-2 text-balance">
          잠시 후 다시 이용해주세요.
        </DialogDescription>
        <Button
          type="button"
          size="lg"
          onClick={onClose}
          className="mt-6 h-12 w-full rounded-xl bg-black text-base font-bold text-gf-orange hover:bg-black/90"
        >
          확인
        </Button>
      </DialogContent>
    </Dialog>
  );
}
