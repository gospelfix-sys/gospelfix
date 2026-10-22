export type CouponSource = "signup" | "referral" | "review";

export interface Coupon {
  id: string;
  code: string;
  discount_rate: number;
  is_used: boolean;
  // 할인 쿠폰 계정당 1회용 정책: 이 쿠폰으로 주문을 시도한 적이 한 번이라도 있으면
  // (취소된 주문 포함) true.
  is_locked: boolean;
  expired_at: string;
  created_at: string;
  source: CouponSource | null;
}
