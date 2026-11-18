import { serverFetchOr } from "@/lib/serverFetch";
import type { ProductSellerInfo } from "@/types/product.types";

/**
 * 상세페이지 상단에 노출할 등록일·판매자 정보를 조회한다.
 * 부가 정보라 실패해도 페이지 전체를 깨뜨리지 않도록 throw 대신 null을 반환한다.
 */
export async function getProductSeller(productId: string): Promise<ProductSellerInfo | null> {
  const res = await serverFetchOr<{ data: ProductSellerInfo | null }>(
    `/api/product-sellers/${encodeURIComponent(productId)}`,
    { data: null },
    "getProductSeller",
  );
  return res.data;
}
