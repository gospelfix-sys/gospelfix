import { SITE_DESCRIPTION, SITE_URL } from "@/lib/siteMetadata";
import { serverFetchOr } from "@/lib/serverFetch";
import type { NewsListItem } from "@/types/news.types";

// serverFetch가 headers()를 쓰므로 정적 생성이 불가능하다
export const dynamic = "force-dynamic";

// 제목·카테고리에 들어간 특수문자가 XML 구조를 깨지 않도록 이스케이프한다
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// cms.api 장애로 피드 전체가 500이 되지 않도록 실패 시 빈 배열로 대체한다
export async function GET() {
  const news = await serverFetchOr<NewsListItem[]>("/api/news", [], "rss");

  const items = news
    .filter((item) => item.is_published)
    .map((item) => {
      const link = `${SITE_URL}/blog/${encodeURIComponent(item.slug)}`;
      return [
        "    <item>",
        `      <title>${escapeXml(item.title)}</title>`,
        `      <link>${link}</link>`,
        `      <guid isPermaLink="true">${link}</guid>`,
        `      <category>${escapeXml(item.category)}</category>`,
        `      <pubDate>${new Date(item.created_at).toUTCString()}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    "  <channel>",
    "    <title>GOSPELFIX</title>",
    `    <link>${SITE_URL}</link>`,
    `    <description>${escapeXml(SITE_DESCRIPTION)}</description>`,
    "    <language>ko-KR</language>",
    items,
    "  </channel>",
    "</rss>",
  ].join("\n");

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
