import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { CartItem } from "@/types/cart.types";

export const dynamic = "force-dynamic";

// cms.api `/api/v1/cart/me` 응답 형태 (camelCase, product 중첩)
interface CmsCartItem {
  id: string;
  optionId: string;
  optionLabel: string;
  price: number;
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnailUrl: string | null;
  } | null;
}

// 현재 로그인된 세션(access_token) 기준으로만 조회한다 — 다른 사용자의 장바구니는 조회할 수 없다.
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json([]);

  try {
    const { data } = await cmsApiFetch<{ data: CmsCartItem[] }>("/api/v1/cart/me", {
      accessToken,
    });

    // cms.api 응답(product 중첩)을 프론트에서 쓰기 편한 flat CartItem으로 매핑
    const items: CartItem[] = data
      .filter((item): item is CmsCartItem & { product: NonNullable<CmsCartItem["product"]> } =>
        Boolean(item.product),
      )
      .map((item) => ({
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        productSlug: item.product.slug,
        thumbnailUrl: item.product.thumbnailUrl,
        optionId: item.optionId,
        optionLabel: item.optionLabel,
        price: item.price,
        createdAt: item.createdAt,
      }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("[api/cart] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }
}
