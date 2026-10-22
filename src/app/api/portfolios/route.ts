import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { PortfolioListItem } from "@/types/portfolio.types";

export const dynamic = "force-dynamic";

/**
 * cms.api 리스트 엔드포인트 공통 응답 형식.
 * GET /api/v1/{resource}?page=&limit= → { data, total, page, limit }
 */
interface CmsListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_SIZE = 50;
// 원래 무제한 조회였으나, cms.api가 페이지당 최대 50건만 반환하므로
// 실용적인 상한선을 두고 그 안에서 페이지네이션으로 전량을 모은다.
const MAX_PORTFOLIOS = 500;

/** cms.api의 portfolio 리소스 slug는 "portfolio"(단수)이다. */
export async function GET() {
  const portfolios: PortfolioListItem[] = [];
  let page = 1;

  try {
    while (portfolios.length < MAX_PORTFOLIOS) {
      const res = await cmsApiFetch<CmsListResponse<PortfolioListItem>>(
        `/api/v1/portfolio?page=${page}&limit=${PAGE_SIZE}`,
      );
      portfolios.push(...res.data);

      if (portfolios.length >= res.total || res.data.length < PAGE_SIZE) break;
      page += 1;
    }
  } catch (error) {
    console.error("[api/portfolios] cms.api 호출 실패", error);
    return NextResponse.json({ error: "포트폴리오 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json(portfolios.slice(0, MAX_PORTFOLIOS));
}
