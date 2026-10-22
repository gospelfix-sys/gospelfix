"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance, { isAxiosError } from "@/lib/axios/instance";
import { formatPrice } from "@/lib/utils";
import PaymentInstructionModal from "@/components/orders/PaymentInstructionModal";

interface BatchPaymentModalProps {
  orderIds: string[];
  itemCount: number;
  amount: number;
  onConfirmed: () => void;
  onClose: () => void;
}

export function BatchPaymentModal({
  orderIds,
  itemCount,
  amount,
  onConfirmed,
  onClose,
}: BatchPaymentModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await axiosInstance.post("/orders/notify-payment-batch", { orderIds });
      setDone(true);
      onConfirmed();
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as { error?: string } | undefined;
        toast.error(data?.error ?? "처리 중 오류가 발생했습니다.");
        return;
      }
      toast.error("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoToMypage() {
    onClose();
    router.push("/mypage");
  }

  return (
    <PaymentInstructionModal
      done={done}
      loading={loading}
      onConfirm={handleConfirm}
      onClose={onClose}
      onGoToMypage={handleGoToMypage}
    >
      {/* 입금 금액 + 상품 개수 안내 */}
      <div className="mb-5 rounded-xl bg-gf-orange-bg p-4">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-gf-orange">입금 금액</span>
          <span className="text-base font-bold text-gf-orange">{formatPrice(amount)}</span>
        </div>
        <p className="mt-2 text-[11px] text-gf-orange2">총 {itemCount}개 상품</p>
      </div>
    </PaymentInstructionModal>
  );
}
