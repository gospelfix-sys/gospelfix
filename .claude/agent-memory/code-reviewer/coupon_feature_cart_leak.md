---
name: coupon_feature_cart_leak
description: 회원가입 20% 쿠폰 기능(신규) 리뷰 — PurchaseOptionsPanel의 쿠폰 할인가가 "장바구니 담기"에도 그대로 흘러들어가는 Critical 스코프 이탈 버그
type: project
---

2026-08-10, `.claude/plans/lexical-imagining-wand.md`("회원가입 혜택 플로우: 무료 템플릿 +
20% 쿠폰") 구현 리뷰. 신규 `src/types/coupon.types.ts`, `src/app/api/coupons/route.ts`,
`orders/create/route.ts`(couponCode 패스스루), `PurchaseOptionsPanel.tsx`(쿠폰 체크박스),
`BuyButton.tsx`(couponCode prop), `detail/[slug]/page.tsx`(availableCoupon 조회),
`mypage/orders/page.tsx`(보유 쿠폰 섹션) 수정.

## Critical — 쿠폰 할인가가 "장바구니 담기"로 새어나감 (계획서에 명시적으로 배제된 스코프)

플랜 문서 자체가 "카트/배치 구매(`orders/create-batch`) 흐름에는 쿠폰 적용을 넣지 않는다 —
상세페이지의 단일 구매(`BuyButton` 직접 결제) 흐름에만 적용해 스코프를 관리 가능한 범위로
유지한다"라고 명시했음에도, 실제 구현에서 `PurchaseOptionsPanel.tsx`의 `handleAddToCart()`가
`price: finalPrice`(= `basePrice - couponDiscountAmount`, 쿠폰 체크박스가 켜져 있으면 항상
할인 반영됨)를 그대로 `addToCart()` → `/api/cart/add` → cms.api `/api/v1/cart`로 전달한다.
쿠폰 체크박스(`isCouponApplied`)와 "장바구니 담기" 버튼이 같은 UI 블록에 나란히 있어, 사용자가
체크박스를 켠 채로 "구매하기" 대신 "장바구니 담기"를 누르는 것을 막을 방법이 전혀 없다.

**Why 이게 심각한가:**
1. 장바구니/배치결제 쪽에는 `couponCode` 필드 자체가 어디에도 없다(`AddToCartInput`,
   `cart/add/route.ts`, `create-batch/route.ts` 전부 확인, grep 결과 `couponCode`는
   `BuyButton.tsx`/`PurchaseOptionsPanel.tsx`/`orders/create/route.ts`/
   `detail/[slug]/page.tsx` 4개 파일에만 존재) — 즉 쿠폰이 "사용됨" 처리될 방법이 없다.
2. `[[recurring_issues]]` #18에 이미 기록된 기존 갭("cart/batch 흐름은 cms.api가 price를
   전혀 재검증하지 않는다")과 결합하면, 로그인 사용자가 쿠폰 체크박스를 켠 채로 임의 개수의
   상품을 장바구니에 담아 전부 20% 할인가로 결제할 수 있다 — 쿠폰 1장으로 무제한 할인이
   가능해지는 실질적 금전 손실 버그다. 옵션 가격 델타 미검증(#18)은 "클라이언트가 계산한
   상품 자체 가격"이라 리스크가 제한적이었지만, 이번 건은 "사용자별로 발급된 유한 자원(쿠폰)을
   검증 없이 무한 재사용 가능하게 만드는" 성격이라 별개의 새로운 취약점으로 봐야 한다.

**How to apply:** 다음 재검증 시 `PurchaseOptionsPanel.tsx`의 `handleAddToCart()`가
`finalPrice` 대신 `basePrice`(쿠폰 미반영 가격)를 사용하는지, 또는 쿠폰 체크박스가 활성화된
상태에서는 "장바구니 담기" 버튼을 비활성화/숨김 처리하는지 확인. cms.api 쪽에서 cart/batch
엔드포인트에 쿠폰 검증을 추가하는 것은 플랜상 의도적 스코프 아웃이므로, 프론트 쪽에서 애초에
쿠폰가가 카트로 넘어가지 않도록 막는 것이 올바른 수정 방향.

## Major — Footer.tsx "Information" 아코디언 토글에 raw `<button>` (recurring_issues #9/#17/#22/#23/#28 재발)

`components/layout/Footer.tsx`에 신규 추가된 사업자정보 아코디언 토글이
`components/ui/button.tsx`를 쓰지 않고 raw `<button type="button">`으로 작성됨. 프로젝트에
아직 Accordion/Collapsible 전용 컴포넌트가 없으므로(`components/ui/` glob 확인), 최소한
`<Button variant="ghost">` + className 오버라이드로 감싸야 한다.

## Minor — 해소 완료

`mypage/orders/page.tsx`가 `"@/lib/utils"`에서 `formatPrice`/`cn`을 두 개의 별도 import
문으로 나눠 선언(중복 import). 이번 리뷰에서 한 줄로 병합해 직접 수정 완료
(`import { cn, formatPrice } from "@/lib/utils";`).

## 확인된 양호 사항

- `src/app/api/coupons/route.ts`는 `orders/route.ts` GET과 완전히 동일한 패턴(camelCase→
  snake_case 매핑, 비로그인 시 빈 배열, 에러 삼키고 콘솔만) — 일관성 양호.
- style=, asChild, cn() 누락, 홑따옴표 등 스타일 규칙 위반 0건 (전수 grep 확인).
- `cmsApiFetch`는 전부 `route.ts` 내부에서만 호출되고, Server Component(`detail/[slug]/page.tsx`,
  `mypage/orders/page.tsx`)는 `serverFetch`만 사용 — BFF 아키텍처 규칙 준수.
- `card.tsx`의 `border-gf-border` 추가는 공용 정의 파일 자체를 고친 것이라
  `shared-component-changes.md` 원칙에 부합(개별 호출부 오버라이드 아님).
- `BuyButton`이 `amount: finalPrice`(쿠폰 반영된 최종가)를 그대로 전송하고 cms.api가 재검증하는
  구조는 기존 `#18` 패턴과 동일 — 단일 구매(BuyButton) 경로 자체는 문제없음, 문제는 카트 경로뿐.

## 판정 (2026-08-10, 1차)

BLOCKED — Critical 1건(쿠폰가 카트 유출) + Major 1건(Footer raw button). 다음 재검증 시 두
항목 수정 여부를 최우선 확인할 것. Bash 도구가 세션에 없어([[no_bash_tool_constraint]])
tsc/eslint/build는 실행하지 못했고 코드 read 기반 정적 검증만 수행함 — 사용자에게 로컬
`yarn build`/`yarn lint` 실행 권고.

## 2차 재검증 (2026-08-10, 같은 날) — 두 항목 모두 해소, APPROVED

- **Critical 해소**: `PurchaseOptionsPanel.tsx`의 `handleAddToCart()`가 `price: finalPrice` →
  `price: basePrice`로 수정됨. `finalPrice`(쿠폰 할인 반영)는 화면 표시와 `BuyButton` prop에만
  쓰이고 장바구니에는 쿠폰 미반영가만 전달됨. `grep "finalPrice|basePrice"` 재확인 결과 이 두
  값을 쓰는 곳은 `PurchaseOptionsPanel.tsx`뿐(다른 매치는 무관한 `quote/` 도메인 동명 변수) —
  다른 호출부 누락 없음.
- **Major 해소**: `Footer.tsx`가 raw `<button>` → `<Button variant="ghost">`로 교체됨. `size`
  prop 없이 `h-auto rounded-none p-0 py-5 hover:bg-transparent hover:text-gf-black`로
  오버라이드한 방식이 `button.tsx`의 cva 병합 순서(className이 마지막에 병합)상 의도대로
  적용됨(h-8→h-auto, px-2.5→p-0 py-5, ghost 기본 hover→커스텀 hover 모두 정상 오버라이드).
  grep 재확인 결과 `Footer.tsx`에 raw `<button>` 0건.
- 두 diff 모두 지적한 라인 외 다른 변경 없음(국소적), 사용자가 `yarn lint`/`yarn build` 로컬
  통과 보고.

**최종 판정: APPROVED.**
