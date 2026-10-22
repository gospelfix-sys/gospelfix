import { Product } from "@/types/product.types";

export interface ProductPriceState {
  // 실제 판매가(=체크아웃 금액). 할인 기간 중엔 price, 기간이 끝나면 supply_price로 전환됨
  effectivePrice: number;
  // 취소선으로 보여줄 "이전" 가격 — 할인 기간이 활성 중일 때만 존재
  strikethroughPrice: number | null;
  // 할인 기간이 활성 중일 때만 존재(할인율 + 카운트다운 종료 시각)
  discount: { percent: number; endsAt: string } | null;
}

const DEFAULT_PRICE_STATE: ProductPriceState = {
  effectivePrice: 0,
  strikethroughPrice: null,
  discount: null,
};

// 서버 컴포넌트(page.tsx)에서 요청 시점 기준으로 1회 계산해 클라이언트 컴포넌트에 prop으로
// 내려준다 — Date.now()를 클라이언트 컴포넌트 렌더 본문에서 직접 호출하면 서버 렌더 시각과
// hydration 시각이 달라 mismatch가 날 수 있어, (public)/page.tsx의 checkIsNew()와 동일한 패턴을 따름.
//
// price(판매 가격)=할인가, supply_price(공급원가)=정가로 재활용한다. 할인 기간을 설정하지
// 않으면(discount_starts_at/ends_at 둘 다 NULL) 지금까지처럼 price가 항상 적용되고
// supply_price는 상시 취소선 참고가로만 쓰인다(기존 동작과 동일, 회귀 없음).
export function getProductPriceState(product: Product): ProductPriceState {
  if (product.price === 0) return DEFAULT_PRICE_STATE;

  const hasWindow = product.discount_starts_at != null || product.discount_ends_at != null;
  if (!hasWindow) {
    return {
      effectivePrice: product.price,
      strikethroughPrice: product.supply_price ?? null,
      discount: null,
    };
  }

  // 기간을 설정했는데 정가로 쓸 supply_price가 없거나 0 이하면 복귀 대상이 없어 기간 로직을
  // 적용할 수 없음 — 안전하게 기존 동작(price 상시 적용)으로 폴백. 0을 허용하면 기간 종료 후
  // effectivePrice가 0으로 전환되거나 할인율 계산에서 0으로 나누는 문제가 생긴다.
  if (product.supply_price == null || product.supply_price <= 0) {
    return { effectivePrice: product.price, strikethroughPrice: null, discount: null };
  }

  const now = Date.now();
  const started =
    product.discount_starts_at == null || now >= new Date(product.discount_starts_at).getTime();
  const notEnded =
    product.discount_ends_at == null || now < new Date(product.discount_ends_at).getTime();
  const isActive = started && notEnded;

  if (isActive) {
    const percent = Math.round((1 - product.price / product.supply_price) * 100);
    return {
      effectivePrice: product.price,
      strikethroughPrice: product.supply_price,
      discount: product.discount_ends_at ? { percent, endsAt: product.discount_ends_at } : null,
    };
  }

  // 기간이 지났거나 아직 시작 전 — 정가(공급원가)가 실제 판매가로 전환됨, 취소선 없음
  return { effectivePrice: product.supply_price, strikethroughPrice: null, discount: null };
}
