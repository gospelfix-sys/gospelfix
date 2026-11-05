"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import PaymentInstructionModal from "@/components/orders/PaymentInstructionModal";
import PaymentAmountBox from "@/components/orders/PaymentAmountBox";

interface Props {
  orderId: string;
  productName: string;
  amount: number;
  onClose: () => void;
}

export default function PaymentModal({ orderId, productName, amount, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const shortId = orderId.slice(0, 8);

  async function handleConfirm() {
    setLoading(true);
    try {
      await axiosInstance.post("/orders/notify-payment", { orderId });
      setDone(true);
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
      <PaymentAmountBox amount={amount} orderNumber={shortId} note={productName} />
    </PaymentInstructionModal>
  );
}
