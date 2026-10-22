import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export async function POST(request: NextRequest) {
  try {
    const { productId, amount, agreedToWithdrawalNotice, couponCode } = await request.json();

    if (!productId || typeof amount !== "number" || amount < 0) {
      return NextResponse.json({ error: "필수 파라미터 누락" }, { status: 400 });
    }

    if (agreedToWithdrawalNotice !== true) {
      return NextResponse.json({ error: "청약철회 제한 안내 동의가 필요합니다." }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 가격 재검증 + 쿠폰 검증/할인 계산 + 주문 생성은 cms.api가 처리한다
    const data = await cmsApiFetch<{ orderId: string }>("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify({ productId, amount, agreedToWithdrawalNotice, couponCode }),
      accessToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[orders/create] unexpected error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
