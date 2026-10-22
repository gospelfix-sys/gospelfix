import { NextRequest, NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { toCmsProductInput, toSellerProduct, type CmsMyProduct } from "@/lib/api/myProducts";
import type { SellerProductInput } from "@/types/product.types";

export const dynamic = "force-dynamic";

// 수정 화면 진입 시 기존 값을 불러오는 용도라 목록 GET과 달리 비로그인 시 401로 명확히
// 막는다(빈 배열로 조용히 죽으면 "빈 폼으로 새 상품 등록"처럼 보여 오해를 유발함).
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data } = await cmsApiFetch<{ data: CmsMyProduct }>(
      `/api/v1/my-products/${encodeURIComponent(id)}`,
      { accessToken },
    );
    return NextResponse.json(toSellerProduct(data));
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/my-products/[id] GET] unexpected error:", error);
    return NextResponse.json({ error: "상품 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const input: SellerProductInput = await request.json();

    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const { data } = await cmsApiFetch<{ data: CmsMyProduct }>(
      `/api/v1/my-products/${encodeURIComponent(id)}`,
      { method: "PATCH", body: JSON.stringify(toCmsProductInput(input)), accessToken },
    );
    return NextResponse.json(toSellerProduct(data));
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: error.status },
      );
    }
    console.error("[api/my-products/[id] PATCH] unexpected error:", error);
    return NextResponse.json({ error: "상품 수정에 실패했습니다." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
    }

    const data = await cmsApiFetch<{ success: boolean }>(
      `/api/v1/my-products/${encodeURIComponent(id)}`,
      { method: "DELETE", accessToken },
    );
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/my-products/[id] DELETE] unexpected error:", error);
    return NextResponse.json({ error: "상품 삭제에 실패했습니다." }, { status: 500 });
  }
}
