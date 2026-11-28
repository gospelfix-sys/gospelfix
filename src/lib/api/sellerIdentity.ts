import { serverFetchOr } from "@/lib/serverFetch";
import type { SellerIdentity, SellerType } from "@/types/seller.types";

/**
 * 로그인한 사용자가 제출한 판매자 유형(개인/사업자)을 조회한다.
 * 연락처 같은 개인정보는 props로 내려가지 않게 유형만 돌려준다.
 * 미제출이거나 호출이 실패하면 null을 반환한다(throw하지 않음).
 */
export async function getMySellerType(): Promise<SellerType | null> {
  const res = await serverFetchOr<{ data: SellerIdentity | null } | null>(
    "/api/my-seller-identity",
    null,
    "getMySellerType",
  );
  return res?.data?.sellerType ?? null;
}
