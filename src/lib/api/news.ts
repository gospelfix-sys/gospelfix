import { serverFetch } from "@/lib/serverFetch";
import { decodeRouteParam } from "@/lib/utils";
import type { NewsItem, NewsListItem } from "@/types/news.types";

/**
 * 블로그 상세를 slug로 조회한다. 라우트 params(percent-encoded 원본)를 그대로 받아
 * 디코딩·인코딩을 이곳에서 한 쌍으로 처리하므로 호출부는 인코딩을 신경 쓰지 않는다.
 * 게시물이 없으면 null, 호출 자체가 실패하면 ServerFetchError를 던진다.
 */
export async function getNewsBySlug(rawSlug: string): Promise<NewsItem | null> {
  const slug = decodeRouteParam(rawSlug);
  const { data } = await serverFetch<{ data: NewsItem | null }>(
    `/api/news/${encodeURIComponent(slug)}`,
  );
  return data;
}

export interface AdjacentNews {
  prev: NewsListItem | null;
  next: NewsListItem | null;
}

/**
 * 목록(최신순)에서 현재 글의 앞뒤 글을 찾는다. prev는 목록에서 바로 위(더 최신), next는 바로 아래(더 오래된) 글.
 * 보조 UI라 목록 조회가 실패해도 상세 렌더를 막지 않도록 빈 결과로 대체한다.
 */
export async function getAdjacentNews(rawSlug: string): Promise<AdjacentNews> {
  const slug = decodeRouteParam(rawSlug);
  try {
    const list = await serverFetch<NewsListItem[]>("/api/news");
    const index = list.findIndex((item) => item.slug === slug);
    if (index === -1) return { prev: null, next: null };
    return { prev: list[index - 1] ?? null, next: list[index + 1] ?? null };
  } catch (error) {
    console.error("[api/news] 인접 글 조회 실패", error);
    return { prev: null, next: null };
  }
}
