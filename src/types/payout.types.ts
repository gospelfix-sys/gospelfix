// 판매자 정산 계좌. 서버는 전체 번호를 돌려주지 않고 끝 4자리만 준다.
export interface PayoutAccount {
  bankName: string;
  accountHolder: string;
  accountLast4: string;
  updatedAt: string;
}

export interface PayoutAccountInput {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
}
