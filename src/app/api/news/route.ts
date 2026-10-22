import { NextResponse } from "next/server";
import { cmsApiFetch } from "@/lib/cmsApi/client";
import { NewsListItem } from "@/types/news.types";

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
// 원본 구현의 .limit(100)을 그대로 상한으로 유지한다.
const MAX_NEWS = 100;

/**
 * cms.api의 블로그(news) 리소스 slug는 "blog"이다(뉴스 페이지 URL은 /blog이지만
 * DB 리소스 슬러그는 blog로 등록되어 있음).
 */
export async function GET() {
  const news: NewsListItem[] = [];
  let page = 1;

  try {
    while (news.length < MAX_NEWS) {
      const res = await cmsApiFetch<CmsListResponse<NewsListItem>>(
        `/api/v1/blog?page=${page}&limit=${PAGE_SIZE}`,
      );
      news.push(...res.data);

      if (news.length >= res.total || res.data.length < PAGE_SIZE) break;
      page += 1;
    }
  } catch (error) {
    console.error("[api/news] cms.api 호출 실패", error);
    return NextResponse.json([]);
  }

  return NextResponse.json(news.slice(0, MAX_NEWS));
}
