import { serverFetch } from "@/lib/serverFetch";
import { ReferralBanner } from "@/types/referralBanner.types";

/**
 * 활성 추천인 배너 목록을 노출 순서대로 조회한다.
 * 조회에 실패하면 빈 배열을 반환한다(throw하지 않음).
 */
export async function getReferralBanners(): Promise<ReferralBanner[]> {
  try {
    return await serverFetch<ReferralBanner[]>("/api/referral-banners");
  } catch (error) {
    console.error("[getReferralBanners] /api/referral-banners 호출 실패", error);
    return [];
  }
}
