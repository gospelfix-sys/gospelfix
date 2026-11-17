import { type NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import type { SellerTransferAccount } from "@/types/payout.types";

export const dynamic = "force-dynamic";

// 계좌번호 평문을 다루는 handler라 응답 body·번호를 로그에 남기지 않는다(오류는 메시지만 기록).
export async function GET(_request: NextRequest, { params }: { params: { orderId: string } }) {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { data } = await cmsApiFetch<{ data: SellerTransferAccount }>(
      `/api/v1/orders/${encodeURIComponent(params.orderId)}/payout-account`,
      { accessToken },
    );
    // 계좌번호 평문이므로 어떤 캐시에도 남지 않게 한다
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error(
      "[api/orders/payout-account GET]",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json({ error: "입금 계좌를 불러오지 못했습니다." }, { status: 500 });
  }
}
