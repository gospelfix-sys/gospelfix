import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { getAccessToken } from "@/lib/cmsApi/session";
import { MyReview } from "@/types/review.types";

export const dynamic = "force-dynamic";

// /api/orders와 동일한 관례: cms.api 호출이 실패해도 페이지가 죽지 않도록 항상 200 + []로 폴백한다.
export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json([]);
  }

  try {
    const { data } = await cmsApiFetch<{ data: MyReview[] }>("/api/v1/reviews/me", {
      accessToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/reviews/me]", error);
    return NextResponse.json([]);
  }
}
