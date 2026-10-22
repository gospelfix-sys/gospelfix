import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { PurchasedOrder } from "@/types/order.types";

export const dynamic = "force-dynamic";

// cms.api `/api/v1/orders/me` 응답 형태 (camelCase)
interface CmsMeOrder {
  orderId: string;
  paidAt: string | null;
  amount: number;
  product: {
    id: string;
    name: string;
    thumbnailUrl: string | null;
    filePath: string | null;
  } | null;
}

// 현재 로그인된 세션(access_token) 기준으로만 조회한다 — 다른 사용자의 주문은 조회할 수 없다.
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json([]);

  try {
    const { data } = await cmsApiFetch<{ data: CmsMeOrder[] }>("/api/v1/orders/me", {
      accessToken,
    });

    // cms.api 응답(camelCase)을 기존 PurchasedOrder 인터페이스(snake_case)로 매핑
    const orders: PurchasedOrder[] = data.map((order) => ({
      order_id: order.orderId,
      paid_at: order.paidAt,
      amount: order.amount,
      product: order.product
        ? {
            id: order.product.id,
            name: order.product.name,
            thumbnail_url: order.product.thumbnailUrl,
            file_path: order.product.filePath,
          }
        : null,
    }));

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[api/orders] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }
}
