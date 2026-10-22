import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { PendingOrder } from "@/types/order.types";

export const dynamic = "force-dynamic";

// cms.api `/api/v1/orders/me/pending` 응답 형태 (camelCase)
interface CmsMePendingOrder {
  orderId: string;
  status: "pending" | "pending_confirm";
  amount: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
  } | null;
}

// 현재 로그인된 세션(access_token) 기준으로만 조회한다 — 다른 사용자의 주문은 조회할 수 없다.
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json([]);

  try {
    const { data } = await cmsApiFetch<{ data: CmsMePendingOrder[] }>(
      "/api/v1/orders/me/pending",
      { accessToken },
    );

    const orders: PendingOrder[] = data.map((order) => ({
      order_id: order.orderId,
      status: order.status,
      amount: order.amount,
      created_at: order.createdAt,
      product: order.product
        ? {
            id: order.product.id,
            name: order.product.name,
            thumbnail_url: order.product.thumbnailUrl,
          }
        : null,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[api/orders/pending] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }
}
