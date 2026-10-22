"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AccountTransferCard from "@/components/orders/AccountTransferCard";

interface PaymentInstructionModalProps {
  done: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  onGoToMypage: () => void;
  children: ReactNode;
}

export default function PaymentInstructionModal({
  done,
  loading,
  onConfirm,
  onClose,
  onGoToMypage,
  children,
}: PaymentInstructionModalProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
      onClick={done ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
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

            <h2 className="mb-1 text-center text-lg font-bold text-gray-900">입금 안내</h2>
            <p className="mb-4 text-center text-[13px] text-gray-500">
              QR 스캔 또는 계좌이체 후 입금 완료 버튼을 눌러주세요
            </p>

            <AccountTransferCard />

            {children}

            <div className="flex flex-col gap-2">
              <Button
                onClick={onConfirm}
                disabled={loading}
                className="w-full bg-gf-black text-gf-orange hover:bg-gf-black/90"
                size="lg"
              >
                {loading ? "처리 중..." : "입금했어요"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full border-gf-orange bg-white text-gf-orange hover:bg-gf-orange-bg hover:text-gf-orange"
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
              <h2 className="text-xl font-bold text-gray-900">입금 알림이 접수되었습니다!</h2>
              <p className="mt-1 text-sm text-gray-500">
                관리자 확인 후 담당자가 연락드려 제작을 진행합니다.
              </p>
            </div>
            <Button onClick={onGoToMypage} className="w-full" size="lg">
              마이페이지 바로가기
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
