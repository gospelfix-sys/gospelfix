import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteMetadata";
import { serverFetchOr } from "@/lib/serverFetch";
import type { NewsListItem } from "@/types/news.types";
import type { Product } from "@/types/product.types";

// serverFetch가 headers()를 쓰므로 정적 생성이 불가능하다
export const dynamic = "force-dynamic";

const STATIC_PATHS = ["/", "/resources", "/blog", "/introduce", "/guide"];

// cms.api 장애로 sitemap 전체가 500이 되지 않도록 실패 시 빈 배열로 대체한다
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, news] = await Promise.all([
    serverFetchOr<Product[]>("/api/products?category=all", [], "sitemap"),
    serverFetchOr<NewsListItem[]>("/api/news", [], "sitemap"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
  }));

  const productEntries: MetadataRoute.Sitemap = products
    .filter((product) => product.is_active)
    .map((product) => ({
      url: `${SITE_URL}/detail/${encodeURIComponent(product.slug)}`,
      lastModified: product.updated_at,
    }));

  const newsEntries: MetadataRoute.Sitemap = news
    .filter((item) => item.is_published)
    .map((item) => ({
      url: `${SITE_URL}/blog/${encodeURIComponent(item.slug)}`,
      lastModified: item.created_at,
    }));

  return [...staticEntries, ...productEntries, ...newsEntries];
}
