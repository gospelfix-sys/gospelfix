import { NextResponse } from "next/server";
import { cmsApiFetch, CmsApiError } from "@/lib/cmsApi/client";
import { unwrapDetail } from "@/lib/cmsApi/unwrapDetail";
import { NewsItem } from "@/types/news.types";

export const dynamic = "force-dynamic";

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
