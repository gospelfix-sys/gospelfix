import { serverFetch } from "@/lib/serverFetch";
import { decodeRouteParam } from "@/lib/utils";
import type { Product } from "@/types/product.types";

/**
 * 상품 상세를 slug로 조회한다. 라우트 params(percent-encoded 원본)를 그대로 받아
 * 디코딩·인코딩을 이곳에서 한 쌍으로 처리하므로 호출부는 인코딩을 신경 쓰지 않는다.
 * 상품이 없으면 null, 호출 자체가 실패하면 ServerFetchError를 던진다.
 */
export async function getProductBySlug(rawSlug: string): Promise<Product | null> {
  const slug = decodeRouteParam(rawSlug);
  const { data } = await serverFetch<{ data: Product | null }>(
    `/api/products/${encodeURIComponent(slug)}`,
  );
  return data;
}
