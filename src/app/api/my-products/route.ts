import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { toCmsProductInput, toSellerProduct, type CmsMyProduct } from "@/lib/api/myProducts";
import type { SellerProductInput } from "@/types/product.types";

export const dynamic = "force-dynamic";

// 로그인한 seller/admin 본인이 등록한 상품만 조회한다 — 다른 판매자의 상품은 노출하지 않는다.
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json([]);

  try {
    const { data } = await cmsApiFetch<{ data: CmsMyProduct[] }>("/api/v1/my-products/me", {
      accessToken,
    });
    return NextResponse.json(data.map(toSellerProduct));
  } catch (error) {
    console.error("[api/my-products GET] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input: SellerProductInput = await request.json();

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data } = await cmsApiFetch<{ data: CmsMyProduct }>("/api/v1/my-products", {
      method: "POST",
      body: JSON.stringify(toCmsProductInput(input)),
      accessToken,
    });

    return NextResponse.json(toSellerProduct(data));
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: error.status },
      );
    }
    console.error("[api/my-products POST] unexpected error:", error);
    return NextResponse.json({ error: "상품 등록에 실패했습니다." }, { status: 500 });
  }
}
