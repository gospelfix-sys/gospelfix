import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { Coupon, CouponSource } from "@/types/coupon.types";

export const dynamic = "force-dynamic";

// cms.api `/api/v1/coupons/me` 응답 형태 (camelCase)
interface CmsMeCoupon {
  id: string;
  code: string;
  discountRate: number;
  isUsed: boolean;
  isLocked: boolean;
  expiredAt: string;
  createdAt: string;
  source: CouponSource | null;
}

// 현재 로그인된 세션(access_token) 기준으로만 조회한다 — 다른 사용자의 쿠폰은 조회할 수 없다.
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json([]);

  try {
    const { data } = await cmsApiFetch<{ data: CmsMeCoupon[] }>("/api/v1/coupons/me", {
      accessToken,
    });

    // cms.api 응답(camelCase)을 기존 Coupon 인터페이스(snake_case)로 매핑
    const coupons: Coupon[] = data.map((coupon) => ({
      id: coupon.id,
      code: coupon.code,
      discount_rate: coupon.discountRate,
      is_used: coupon.isUsed,
      is_locked: coupon.isLocked,
      expired_at: coupon.expiredAt,
      created_at: coupon.createdAt,
      source: coupon.source,
    }));

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("[api/coupons] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }
}
