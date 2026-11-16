import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteMetadata";

// 검색·AI 크롤러 모두 공개 페이지는 허용하고, 로그인 영역과 BFF API만 막는다
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/mypage", "/upload", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
