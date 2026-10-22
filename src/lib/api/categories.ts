import { serverFetch } from "@/lib/serverFetch";
import { FALLBACK_PRODUCT_CATEGORIES, type ProductCategory } from "@/types/product.types";

/**
 * 상품 대분류 목록을 cms.api에서 조회한다(관리자가 대시보드에서 CRUD 가능).
 * 조회에 실패하면 정적 기본값으로 폴백한다(빈 배열이 아님 — 업로드 화면 필수 선택지).
 */
export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    return await serverFetch<ProductCategory[]>("/api/categories");
  } catch (error) {
    console.error("[getProductCategories] /api/categories 호출 실패", error);
    return FALLBACK_PRODUCT_CATEGORIES.filter((c) => c.value !== "all");
  }
}
