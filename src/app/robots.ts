import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteMetadata";

// 검색·AI 크롤러 모두 공개 페이지는 허용하고, 로그인 영역과 BFF API(/api/auth/me 제외)만 막는다
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // AuthProvider가 모든 페이지에서 호출하는 /api/auth/me가 막힌 리소스로 보고되지 않게 연다
        // (쿠키 없는 크롤러는 401만 받는다)
        allow: ["/", "/api/auth/me"],
        disallow: ["/api/", "/mypage", "/upload", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
