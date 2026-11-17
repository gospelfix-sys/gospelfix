import { serverFetchOr } from "@/lib/serverFetch";
import type { PayoutAccount } from "@/types/payout.types";

/**
 * 로그인한 판매자의 정산 계좌(번호는 끝 4자리만)를 조회한다.
 * 미등록이거나 호출이 실패하면 null을 반환한다(throw하지 않음).
 */
export async function getPayoutAccount(): Promise<PayoutAccount | null> {
  return serverFetchOr<PayoutAccount | null>("/api/my-payout-account", null, "getPayoutAccount");
}
