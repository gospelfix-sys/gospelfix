import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ cartItemId: string }> },
) {
  const { cartItemId } = await params;

  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const data = await cmsApiFetch<{ success: boolean }>(
      `/api/v1/cart/${encodeURIComponent(cartItemId)}`,
      {
        method: "DELETE",
        accessToken,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[cart/[cartItemId]] unexpected error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
