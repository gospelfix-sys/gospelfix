import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { ReferralBanner } from "@/types/referralBanner.types";

export const dynamic = "force-dynamic";

interface CmsListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// cms.api 호출 실패(엔드포인트 미배포, 리소스 토글 OFF로 인한 404 포함)해도
// 마이페이지/몰 페이지 렌더링을 막지 않도록 항상 200 + 빈 배열로 응답한다.
export async function GET() {
  try {
    const { data } = await cmsApiFetch<CmsListResponse<ReferralBanner>>(
      "/api/v1/referral-banners?limit=50",
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/referral-banners] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }
}
