import { serverFetchOr } from "@/lib/serverFetch";
import { FALLBACK_SUB_CATEGORIES, type ProductCategory } from "@/types/product.types";

/**
 * 상품 소분류 목록을 cms.api에서 조회한다(관리자가 대시보드에서 CRUD 가능).
 * 조회에 실패하면 정적 기본값으로 폴백한다.
 */
export async function getProductSubCategories(): Promise<ProductCategory[]> {
  return serverFetchOr<ProductCategory[]>(
    "/api/sub-categories",
    FALLBACK_SUB_CATEGORIES,
    "getProductSubCategories",
  );
}
