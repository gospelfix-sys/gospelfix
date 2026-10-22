import axiosInstance from "@/lib/axios/instance";
import { Coupon, CouponSource } from "@/types/coupon.types";

const COUPON_SOURCE_LABEL: Record<CouponSource, string> = {
  signup: "회원가입 혜택",
  referral: "추천인 혜택",
  review: "리뷰 작성 혜택",
};

/** 쿠폰 발급 사유를 한글 라벨로 변환한다. 출처 미상(source=null)이면 null. */
export function getCouponSourceLabel(source: Coupon["source"]): string | null {
  return source ? COUPON_SOURCE_LABEL[source] : null;
}

type CouponStatusFields = Pick<Coupon, "is_used" | "is_locked" | "expired_at">;

function isCouponExpired(coupon: Pick<Coupon, "expired_at">): boolean {
  return new Date(coupon.expired_at) <= new Date();
}

/**
 * 결제까지 완료됐으면 "사용완료", 그 다음으로 기간이 지났으면 "기간만료"(만료는 시도 여부와
 * 무관하게 가장 눈에 띄는 사유이므로 잠금보다 우선 표시), 시도(취소 포함)만 있으면 "사용불가",
 * 그 외엔 "사용가능".
 */
export function getCouponStatusLabel(coupon: CouponStatusFields): string {
  if (coupon.is_used) return "사용완료";
  if (isCouponExpired(coupon)) return "기간만료";
  if (coupon.is_locked) return "사용불가";
  return "사용가능";
}

/** 지금 새 주문에 적용할 수 있는 쿠폰인지 — 마이페이지 배지 색상 등에 재사용한다. */
export function isCouponUsable(coupon: CouponStatusFields): boolean {
  return !coupon.is_used && !coupon.is_locked && !isCouponExpired(coupon);
}

/**
 * 유효(미사용+미시도+미만료)한 쿠폰 중 할인율이 가장 높은 것을 고른다. 없으면 null.
 * is_locked=true인 쿠폰은 계정당 1회용 정책상 이미 한 번 주문에 연결된 적이 있어(취소된
 * 주문 포함) 다시 적용할 수 없으므로, 상품 상세페이지 등 신규 구매 시점의 "적용 가능한
 * 쿠폰" 후보에서 제외한다.
 */
export function getBestAvailableCoupon(coupons: Coupon[]): Coupon | null {
  const valid = coupons.filter(isCouponUsable);
  if (valid.length === 0) return null;

  return valid.reduce((best, coupon) =>
    coupon.discount_rate > best.discount_rate ? coupon : best,
  );
}

/**
 * 가입 축하 쿠폰을 조회한다. 이메일 회원가입과 카카오 신규가입 양쪽에서 재사용 —
 * 조회 실패는 가입 완료 자체를 막지 않으므로 에러를 삼키고 null을 반환한다.
 */
export async function fetchSignupCoupon(): Promise<Coupon | null> {
  try {
    const { data: coupons } = await axiosInstance.get<Coupon[]>("/coupons");
    return coupons.find((coupon) => coupon.source === "signup" && isCouponUsable(coupon)) ?? null;
  } catch {
    return null;
  }
}
