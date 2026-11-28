import { buildTransferUrl, createQrMatrix } from "@gospelfix/qr";
import type { SellerTransferAccount } from "@/types/payout.types";

// 계좌정보는 QR 링크의 fragment(#)에만 담긴다. 서버로 전송되지 않으므로 브라우저에서만 만든다.
// 패키지가 받는 쪽에서 거절할 링크(형식 오류, 용량 초과)는 null을 돌려준다.
export function buildTransferQr(
  origin: string,
  account: SellerTransferAccount,
): boolean[][] | null {
  const url = buildTransferUrl(origin, {
    bankName: account.bankName,
    accountNumber: account.accountNumber,
    accountHolder: account.accountHolder,
  });
  return url ? createQrMatrix(url) : null;
}
