"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useRecoilValue } from "recoil";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { isAuthenticatedSelector } from "@/store/selectors/authSelector";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import axiosInstance, { isAxiosError } from "@/lib/axios/instance";
import { useAuth } from "@/hooks/useAuth";
import { DownloadButton } from "@/components/products/DownloadButton";
import PaymentModal from "./PaymentModal";

interface BuyButtonProps {
  productId: string;
  productSlug: string;
  productName: string;
  price: number;
  agreedToWithdrawalNotice: boolean;
  couponCode?: string;
}

export function BuyButton({
  productId,
  productSlug,
  productName,
  price,
  agreedToWithdrawalNotice,
  couponCode,
}: BuyButtonProps) {
  const isAuthenticated = useRecoilValue(isAuthenticatedSelector);
  const { openAuthModal } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [freeOrderCompleted, setFreeOrderCompleted] = useState(false);
  const isRequestingRef = useRef(false);

  function closeCompletionModal() {
    setAlreadyPurchased(false);
    setFreeOrderCompleted(false);
  }

  async function handleClick() {
    if (isRequestingRef.current || !agreedToWithdrawalNotice) return;

    if (!isAuthenticated) {
      openAuthModal("login", `/detail/${productSlug}`);
      return;
    }

    isRequestingRef.current = true;
    setLoading(true);
    try {
      const res = await axiosInstance.post("/orders/create", {
        productId,
        amount: price,
        agreedToWithdrawalNotice,
        couponCode,
      });
      const newOrderId = res.data.orderId as string;

      if (price === 0) {
        try {
          await axiosInstance.post("/orders/notify-payment", { orderId: newOrderId });
          setFreeOrderCompleted(true);
        } catch {
          alert("주문은 생성되었지만 완료 처리에 실패했습니다. 마이페이지에서 다시 시도해주세요.");
          router.push("/mypage");
        }
        return;
      }

      setOrderId(newOrderId);
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const data = error.response.data as { error?: string } | undefined;
        // 409는 "이미 구매한 상품" 외에 "쿠폰 중복 사용" 등 다른 사유로도 발생하므로
        // 상태 코드만으로 판단하지 않고 서버가 내려준 메시지로 구분한다.
        if (error.response.status === 409 && data?.error === "이미 구매한 상품입니다.") {
          setAlreadyPurchased(true);
          return;
        }
        alert(data?.error ?? "주문 생성에 실패했습니다.");
        return;
      }
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      isRequestingRef.current = false;
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={loading || !agreedToWithdrawalNotice}
        size="lg"
        className="h-14 w-full rounded-2xl bg-gf-black text-base font-bold text-gf-orange"
      >
        {loading ? "처리 중..." : price === 0 ? "무료로 받기" : `${formatPrice(price)} 구매하기`}
      </Button>

      {orderId && (
        <PaymentModal
          orderId={orderId}
          productName={productName}
          amount={price}
          onClose={() => setOrderId(null)}
        />
      )}

      {(alreadyPurchased || freeOrderCompleted) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={closeCompletionModal}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
            <h2 className="mb-1 text-lg font-bold text-gray-900">
              {alreadyPurchased ? "이미 구매한 상품입니다" : "무료 상품을 받았습니다"}
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              {freeOrderCompleted
                ? "바로 다운로드하거나 마이페이지 구매 / 혜택에서 다시 받을 수 있습니다."
                : "마이페이지에서 진행 상황을 확인하실 수 있습니다."}
            </p>
            <div className="flex flex-col gap-2">
              {freeOrderCompleted && <DownloadButton productId={productId} hasFile />}
              <Link href="/mypage/orders" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
                마이페이지에서 확인하기
              </Link>
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-gray-500"
                onClick={closeCompletionModal}
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
