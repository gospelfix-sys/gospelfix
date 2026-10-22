import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { NewsItem } from "@/types/news.types";

export const dynamic = "force-dynamic";

/**
 * cms.api 단건 조회 응답이 { data: T } 형태로 래핑되어 오는 경우와
 * 래핑 없이 T 객체 자체로 오는 경우를 모두 안전하게 처리한다.
 */
function unwrapDetail<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in (body as Record<string, unknown>)) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const body = await cmsApiFetch<unknown>(`/api/v1/blog/${encodeURIComponent(slug)}`);
    return NextResponse.json({ data: unwrapDetail<NewsItem>(body) });
  } catch (error) {
    if (error instanceof CmsApiError && error.status === 404) {
      return NextResponse.json({ data: null });
    }
    console.error("[api/news/[slug]] cms.api 호출 실패", error);
    return NextResponse.json({ error: "게시물 조회에 실패했습니다." }, { status: 500 });
  }
}
