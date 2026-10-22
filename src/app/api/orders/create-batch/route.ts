import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export async function POST(request: NextRequest) {
  try {
    const { items, agreedToWithdrawalNotice } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "선택된 상품이 없습니다." }, { status: 400 });
    }

    if (agreedToWithdrawalNotice !== true) {
      return NextResponse.json({ error: "청약철회 제한 안내 동의가 필요합니다." }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 가격 재검증 + 배치 주문 생성은 cms.api가 처리한다
    const data = await cmsApiFetch<{ orderIds: string[] }>("/api/v1/orders/batch", {
      method: "POST",
      body: JSON.stringify({ items, agreedToWithdrawalNotice }),
      accessToken,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[orders/create-batch] unexpected error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
