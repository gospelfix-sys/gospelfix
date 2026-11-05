"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import PaymentInstructionModal from "@/components/orders/PaymentInstructionModal";
import PaymentAmountBox from "@/components/orders/PaymentAmountBox";

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
      toast.error(
        getErrorMessage(
          error,
          "처리 중 오류가 발생했습니다.",
          "네트워크 오류가 발생했습니다. 다시 시도해주세요.",
        ),
      );
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
      <PaymentAmountBox amount={amount} note={`총 ${itemCount}개 상품`} />
    </PaymentInstructionModal>
  );
}
