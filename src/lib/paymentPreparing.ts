import { isAxiosError } from "@/lib/axios/instance";

// cms.api가 계좌이체 결제를 아직 열지 않았을 때(플래그 꺼짐) 주문 생성 409로 내려주는 문구.
// 409는 "이미 구매한 상품"·"쿠폰 중복" 등 다른 사유로도 나오므로 상태 코드가 아니라 메시지로 구분한다.
// cms.api의 DIRECT_TRANSFER_PREPARING_MESSAGE와 같아야 한다.
export const PAYMENT_PREPARING_MESSAGE =
  "계좌이체 결제를 준비 중입니다. 잠시 후 다시 이용해주세요.";

export function isPaymentPreparingError(error: unknown): boolean {
  if (!isAxiosError(error) || error.response?.status !== 409) return false;
  const data = error.response.data as { error?: string } | undefined;
  return data?.error === PAYMENT_PREPARING_MESSAGE;
}
