import { serverFetch } from "@/lib/serverFetch";
import type { PortfolioListItem } from "@/types/portfolio.types";

/**
 * 공개 포트폴리오 목록을 조회한다. 보조 데이터(썸네일·이미지 보강)라 cms.api가 실패해도
 * 호출한 페이지가 에러 화면이 되지 않도록 빈 배열로 대체한다.
 */
export async function getPortfolios(): Promise<PortfolioListItem[]> {
  try {
    return await serverFetch<PortfolioListItem[]>("/api/portfolios");
  } catch (error) {
    console.error("[api/portfolios] 포트폴리오 조회 실패", error);
    return [];
  }
}
