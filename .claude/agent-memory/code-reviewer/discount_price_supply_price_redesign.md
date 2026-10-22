---
name: discount_price_supply_price_redesign
description: discount_price 컬럼 폐기 → price(할인가)/supply_price(정가) 재활용 재설계 리뷰. gospelfix 코드는 조건부 APPROVED, cms.api 주문 검증 미동기화가 Critical
type: project
---

`project_discount_countdown_feature`(할인가/카운트다운 1차 기능, discount_price 별도 컬럼 모델)가
아직 SQL 마이그레이션 실행 전 상태에서 전면 재설계됨. discount_price 컬럼을 완전히 없애고
기존 `price`/`supply_price` 필드를 재활용하는 구조로 변경(2026-08-08).

## 새 모델

- `price`(판매 가격) = 할인 기간 중 실제 판매가(할인가). 기간 미설정 시 항상 이 값 적용(회귀 없음).
- `supply_price`(공급원가) = 평소 상시 취소선 참고가. 할인 기간(`discount_starts_at`~`discount_ends_at`)이
  끝나면 이 값이 실제 판매가(정가)로 자동 전환.
- `discount_price` 컬럼은 완전히 제거, `discount_starts_at`/`discount_ends_at`만 신규 컬럼.

## gospelfix 쪽 구현 — 검증 완료

- `src/lib/discount.ts`의 `getProductPriceState(product): ProductPriceState`가 5가지 분기를
  순수 함수로 처리(무료/기간미설정/supply_price없음/활성중/기간종료). 서버 컴포넌트
  (`detail/[slug]/page.tsx`, `growth/page.tsx`)에서 1회 호출 후 prop으로 하위 전달 — 기존
  `getActiveDiscount()` 패턴과 동일한 구조 유지, hydration mismatch 없음(Date.now()는
  discount.ts 서버 실행 경로와 `DiscountCountdown`의 useEffect 안에만 존재).
- `PurchaseOptionsPanel`/`ProductOptionsSection`의 가격 fallback 우선순위(`option.price ??
  priceState.effectivePrice`)가 정확히 일치 — 가격 불일치 재발 없음.
- `ProductCard`는 `priceState`를 필수 prop으로 변경했고 호출부는 `growth/page.tsx` 단 하나뿐이라
  누락 없음(grep 재확인 완료). `getActiveDiscount`/`ActiveDiscount`/`discount_price` 잔여
  참조도 src/ 전역에 없음(grep 확인).
- cms.api 쪽 마이그레이션 029/030도 이미 새 모델로 재작성됨(discount_price 관련 구버전 롤백
  포함, `content_api_configs.select_columns`에 discount_starts_at/ends_at 반영, supply_price는
  기존 016에서 이미 포함되어 있었음 — 이 부분은 정상).

## Critical — cms.api 주문 금액 서버 재검증이 새 모델을 모름 (미해결)

`gospelfix.cms.api/src/app/api/v1/orders/route.ts:69`,
`gospelfix.cms.api/src/app/api/v1/orders/batch/route.ts:64`가 여전히
`if (product.price !== amount)`로만 검증하고, `src/libs/supabase/queries/products.ts`의
`getActiveProductById()`는 `select('id, price, is_active')`만 조회해 `supply_price`/
`discount_starts_at`/`discount_ends_at`을 아예 안 가져온다.

**Why:** gospelfix의 `getProductPriceState()`는 할인 기간이 끝나면 `effectivePrice`를
`supply_price`로 전환하고 `BuyButton`/배치결제가 그 값을 그대로 `amount`로 전송한다. cms.api가
여전히 `product.price`와만 비교하므로, **할인 기간이 자연 종료된 상품은 결제 요청이 전부
400("결제 금액이 올바르지 않습니다")으로 거부된다.** 마이그레이션 029/030을 아직 실행하지
않았다면 `hasWindow`가 항상 false라 지금 당장은 무해하지만(기존 동작 그대로 폴백), 마이그레이션
실행 후 admin에서 할인 기간을 설정하고 그 기간이 지나는 순간 해당 상품 결제가 막힌다.

**How to apply:** 이 계열(할인가/가격 로직) 후속 리뷰 시 반드시 cms.api의
`getActiveProductById()`가 `supply_price, discount_starts_at, discount_ends_at`도 select하는지,
그리고 `orders/route.ts`·`orders/batch/route.ts`가 `getProductPriceState()`와 동일한 5분기
로직을 서버 측에도 미러링해서 `amount`를 검증하는지 확인할 것. 이 fix가 배포되기 전까지는
admin에서 `discount_starts_at`/`discount_ends_at`을 실사용하면 안 된다고 안내해야 함.
cms.api 저장소는 로컬에 존재하므로(`/Users/mac/Documents/work/GospelFix/gospelfix.cms.api`)
다음 리뷰 때 직접 파일을 열어 재확인 가능.

## Major — supply_price === 0 미방어 (미해결)

`src/lib/discount.ts:39,51`의 `product.supply_price == null` 체크는 0을 걸러내지 못한다.
할인 활성 중 `supply_price === 0`이면 `percent`가 `-Infinity`가 되고(배지는 `percent > 0` 가드로
안 뜨지만 discount 객체엔 그대로 담김), 기간 종료 후엔 `effectivePrice = 0`이 되어 유료 상품이
결제 위젯상 0원으로 노출/처리될 수 있다. `!product.supply_price || product.supply_price <= 0`
가드로 0/음수도 "정가 없음"과 동일 폴백 처리 권장.

## 최종 판정 (2026-08-08 세션)

조건부 APPROVED — gospelfix 코드 자체는 머지 가능하나, 위 cms.api Critical이 해소되기 전까지는
할인 기간 기능을 실사용하지 말 것.

## 참고

- 1차 기능(discount_price 별도 컬럼 모델)의 리뷰 이력은 `project_discount_countdown_feature.md`
  참고 — 그 모델은 이제 폐기됨.
- 이 리뷰는 Bash 도구 없이 진행([[no_bash_tool_constraint]]) — tsc/eslint/build 미실행, 코드 read
  기반 정적 검증만 수행.
