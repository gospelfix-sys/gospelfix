import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "주문 ID가 필요합니다." }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const data = await cmsApiFetch<{ success: true }>(
      `/api/v1/orders/${orderId}/notify-payment`,
      {
        method: "POST",
        accessToken,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[orders/notify-payment] unexpected error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
