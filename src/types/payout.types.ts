// 판매자 정산 계좌. 서버는 전체 번호를 돌려주지 않고 끝 4자리만 준다.
export interface PayoutAccount {
  bankName: string;
  accountHolder: string;
  accountLast4: string;
  // 구매자에게 계좌를 보여주는 것에 동의했는지. false면 구매자에게 노출되지 않아 다시 동의해야 한다
  consented: boolean;
  updatedAt: string;
}

export interface PayoutAccountInput {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  thirdPartyConsent: boolean;
}

// 입금 안내 모달에서 구매자에게 보여주는 판매자 입금 계좌(전체 번호 포함, 본인 pending 주문에서만 조회).
export interface SellerTransferAccount {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}
