// 일반과세자 상품의 결제 총액 = 공급가액 + 부가세. 가산 여부는 cms.api가 판단해 내려주고
// (판매자 응답의 vatApplicable), 이 파일은 같은 반올림 규칙으로 표시용 금액만 계산한다.
// cms.api의 src/libs/pricing/vat.ts와 반드시 같은 규칙을 유지한다 — 어긋나면 결제 요청이 400이 된다.
// 테스트 벡터: 65,000 → 부가세 6,500 → 71,500 / 12,345 → 1,234 → 13,579 / 0 → 0

export const VAT_RATE_PERCENT = 10;

export interface VatBreakdown {
  supply: number;
  vat: number;
  total: number;
}

/** 쿠폰 할인 후 공급가액에서 부가세(원 단위 내림)와 총액을 계산한다. 무료·미가산이면 부가세 0. */
export function calcVat(supply: number, vatApplicable: boolean): VatBreakdown {
  if (!vatApplicable || supply <= 0) return { supply, vat: 0, total: supply };
  const vat = Math.floor((supply * VAT_RATE_PERCENT) / 100);
  return { supply, vat, total: supply + vat };
}
