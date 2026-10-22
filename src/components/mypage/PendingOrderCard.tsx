"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, formatPrice } from "@/lib/utils";
import axiosInstance, { isAxiosError } from "@/lib/axios/instance";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentModal from "@/components/products/PaymentModal";
import { PendingOrder } from "@/types/order.types";

const STATUS_LABEL: Record<PendingOrder["status"], string> = {
  pending: "입금 대기중",
  pending_confirm: "입금 확인중",
};

export function PendingOrderCard({ order }: { order: PendingOrder }) {
  const router = useRouter();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [completingFree, setCompletingFree] = useState(false);

  // 무료 상품(0원)은 계좌이체/QR 안내가 존재하지 않으므로 PaymentModal을 열지 않고
  // notify-payment를 직접 호출해 즉시 완료 처리한다 (BuyButton.tsx의 무료 주문 분기와 동일한 이유).
  async function handleCompleteFree() {
    if (completingFree) return;
    setCompletingFree(true);
    try {
      await axiosInstance.post("/orders/notify-payment", { orderId: order.order_id });
      toast.success("무료 상품을 받았습니다. 마이페이지 구매 / 혜택에서 확인하세요.");
      router.refresh();
    } catch (error) {
      const message =
        isAxiosError(error) && error.response
          ? ((error.response.data as { error?: string } | undefined)?.error ??
            "처리 중 오류가 발생했습니다.")
          : "네트워크 오류가 발생했습니다. 다시 시도해주세요.";
      toast.error(message);
    } finally {
      setCompletingFree(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{order.product?.name ?? "상품명 없음"}</CardTitle>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                "bg-gf-orange-bg text-gf-orange",
              )}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <CardDescription>
            {order.amount === 0 ? "FREE" : formatPrice(order.amount)} ·{" "}
            {new Date(order.created_at).toLocaleDateString("ko-KR")}
          </CardDescription>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            주문번호 {order.order_id.slice(0, 8)}
          </p>
          {order.product &&
            (order.amount === 0 ? (
              <Button
                size="sm"
                className="mt-2 w-full"
                disabled={completingFree}
                onClick={handleCompleteFree}
              >
                {completingFree ? "처리 중..." : "무료 상품 받기 완료 처리"}
              </Button>
            ) : (
              <Button size="sm" className="mt-2 w-full" onClick={() => setShowPaymentModal(true)}>
                입금 계좌·QR 다시 보기
              </Button>
            ))}
        </CardHeader>
      </Card>

      {showPaymentModal && order.product && order.amount > 0 && (
        <PaymentModal
          orderId={order.order_id}
          productName={order.product.name}
          amount={order.amount}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </>
  );
}
