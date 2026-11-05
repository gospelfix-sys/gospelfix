import { serverFetchOr } from "@/lib/serverFetch";
import type { ReferralBanner } from "@/types/referralBanner.types";

/**
 * 활성 추천인 배너 목록을 노출 순서대로 조회한다.
 * 조회에 실패하면 빈 배열을 반환한다(throw하지 않음).
 */
export async function getReferralBanners(): Promise<ReferralBanner[]> {
  return serverFetchOr<ReferralBanner[]>("/api/referral-banners", [], "getReferralBanners");
}
