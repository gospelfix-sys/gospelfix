"use client";

import type { ReactNode } from "react";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import AccountTransferCard from "@/components/orders/AccountTransferCard";
import { useOrderPayoutAccount } from "@/hooks/useOrderPayoutAccount";

interface PaymentInstructionModalProps {
  // 판매자 입금 계좌를 조회할 주문 ID(묶음 결제는 판매자가 같으므로 유료 첫 주문). 입금이 필요 없으면 null
  payoutOrderId: string | null;
  done: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  onGoToMypage: () => void;
  children: ReactNode;
}

export default function PaymentInstructionModal({
  payoutOrderId,
  done,
  loading,
  onConfirm,
  onClose,
  onGoToMypage,
  children,
}: PaymentInstructionModalProps) {
  const {
    account,
    loading: accountLoading,
    error: accountError,
  } = useOrderPayoutAccount(payoutOrderId);

  return (
    // 완료 화면·요청 처리 중에는 바깥 클릭·Esc로 닫히지 않게 해 마이페이지 안내 버튼만 남긴다
    <Dialog open onOpenChange={(next) => !next && !done && !loading && onClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-6 sm:max-w-sm">
        {!done ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full text-gray-400 hover:text-gray-600"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </Button>

            <DialogTitle className="mb-1 text-center text-lg font-bold text-gray-900">
              입금 안내
            </DialogTitle>
            <DialogDescription className="mb-4 text-center text-[13px] text-gray-500">
              판매자 계좌로 직접 입금한 뒤 &lsquo;입금했어요&rsquo;를 눌러주세요
            </DialogDescription>

            {payoutOrderId === null ? null : account ? (
              <AccountTransferCard account={account} />
            ) : (
              <div
                role={accountError ? "alert" : "status"}
                className="mb-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-[13px] text-gray-500"
              >
                {accountLoading ? "입금 계좌를 불러오는 중이에요..." : accountError}
              </div>
            )}

            {children}

            <div className="flex flex-col gap-2">
              <Button
                onClick={onConfirm}
                disabled={loading || (payoutOrderId !== null && !account)}
                className="h-12 w-full bg-gf-black text-base text-gf-orange hover:bg-gf-black/90"
                size="lg"
              >
                {loading ? "처리 중..." : "입금했어요"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-12 w-full border-gf-orange bg-white text-base text-gf-orange hover:bg-gf-orange-bg hover:text-gf-orange"
              >
                취소
              </Button>
            </div>
          </>
        ) : (
          /* 완료 화면 */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                입금 알림이 접수되었습니다!
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm text-gray-500">
                입금이 확인되면 마이페이지에서 진행 상황을 확인할 수 있어요.
              </DialogDescription>
            </div>
            <Button onClick={onGoToMypage} className="w-full" size="lg">
              마이페이지 바로가기
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
