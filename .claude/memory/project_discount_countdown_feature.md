---
name: project_discount_countdown_feature
description: 상품 할인가/카운트다운 기능 — discount_price 필드 폐기, price/supply_price 재활용 모델로 최종 확정. cms.api 주문 서버 재검증 포함 양쪽 저장소 APPROVED·커밋·push 완료
metadata:
  type: project
---

상품에 할인 기간(`discount_starts_at`/`discount_ends_at`)을 설정하면 상세페이지에 남은 시간
카운트다운을 보여주는 기능. cms.api(스키마 029/030, 관리자 CRUD, 주문 서버 재검증)와
gospelfix(이 저장소, 렌더링) 양쪽에 걸친 cross-repo 작업.

## ⚠️ 최종 설계(중요 — 아래 1~2차 리뷰 시점의 discount_price 필드는 이후 완전히 폐기됨)

1~2차 리뷰까지는 별도 `discount_price` 컬럼을 신설하는 방식이었으나, 사용자가 실제 admin 폼을
보고 "이미 있는 price(판매 가격)가 사실상 할인가고, supply_price(공급원가)가 정가 역할을 해야
한다"고 지적해 **3차로 전면 재설계**했다(cms.api/gospelfix 커밋: cms.api `88c777b`(재설계)+
`a15d829`(주문 서버 재검증), gospelfix `7f30a91`).

- **`price`(판매 가격)** = 할인 기간 중 실제 판매가(할인가). 기간 미설정 시 항상 이 값 적용(기존
  동작과 동일, 회귀 없음).
- **`supply_price`(공급원가)** = 평소 상시 취소선 참고가. 할인 기간이 끝나면 이 값이 실제
  판매가(정가)로 자동 전환.
- `discount_price` 컬럼/필드/타입/쿼리는 코드베이스 전역에서 완전히 제거됨(마이그레이션
  029/030도 이 최종 스키마로 다시 작성됨 — `discount_starts_at`/`discount_ends_at` 2개
  컬럼만 신설).
- gospelfix `src/lib/discount.ts`: `getActiveDiscount()`/`ActiveDiscount` →
  `getProductPriceState()`/`ProductPriceState`로 전면 교체(5분기 로직: 무료/기간미설정/
  supply_price 없음 또는 0 이하/활성중/기간종료). `supply_price <= 0` 가드 포함(0-division·
  0원 전환 방지).
- **cms.api 쪽 Critical(별도 발견, 매우 중요)**: 주문 생성 API(`orders/route.ts`,
  `orders/batch/route.ts`)가 `product.price !== amount`로만 결제 금액을 재검증하고 있어서,
  할인 기간이 자연 종료되면 프론트가 보내는 정상 결제 금액(supply_price)이 전부 400으로
  거부되는 회귀가 있었음. `src/libs/pricing/productPriceState.ts`에 gospelfix와 동일한 로직을
  `getEffectivePrice()`로 미러링해 해결. **두 저장소가 가격 계산 로직을 각자 유지하므로, 향후
  한쪽만 고치면 다시 어긋날 수 있다는 구조적 위험이 있음 — 가격 계산 로직을 건드릴 땐 항상 두
  저장소를 동시에 확인할 것.**
- cms.api 관리자 폼의 할인 시작/종료 시각 입력은 네이티브 `datetime-local`에서 shadcn
  Calendar+Popover 조합 `DateTimePicker`(`src/components/ui/date-time-picker.tsx`, 신규)로
  교체(사용자 요청). `npx shadcn add`가 `yarn.lock`을 통째로 삭제하는 부작용이 있었음 —
  아래 "사고 기록" 참고.

## 사고 기록: `npx shadcn add` 실행 중 yarn.lock 삭제

cms.api에 `yarn dlx`가 없어(yarn 1.x는 `dlx` 미지원) `npx shadcn@latest add calendar popover`로
대체 실행했는데, 이 과정에서 `yarn.lock`(6944줄)이 통째로 삭제됐다(`git status`에 `D yarn.lock`).
직접 확인 없이 다른 디렉터리에서 실행한 `git status` 결과를 착각해 한동안 "정상"이라고
잘못 보고했다가, code-reviewer가 `Glob`으로 파일 부재 자체를 직접 확인해서 잡아냄. 복구:
`git checkout HEAD -- yarn.lock` → `yarn install`로 신규 의존성만 정식 반영.

**How to apply**: 앞으로 `npx <shadcn 등 codegen CLI>`를 yarn 프로젝트에서 실행할 때는 실행
직후 반드시 `git status --short -- yarn.lock`으로 삭제(`D`) 여부를 확인할 것. 또한 `cd` 이후의
Bash 명령에서 작업 디렉터리가 유지되는지 스스로도 매번 `pwd`나 절대경로 기반 명령으로
교차 검증할 것 — 이번에 cwd 착각으로 다른 저장소의 `git status` 결과를 자기 저장소 결과인
것처럼 오인했다.

---

## 과거 리뷰 이력 (discount_price 필드 시절, 현재는 스키마 자체가 바뀌어 참고용)

## 1차 리뷰 (session a5765012b7260062a) — BLOCKED

- **Critical**: `ProductOptionsSection.tsx`와 `ProductCard.tsx`가 할인가를 전혀 반영하지 않아
  같은 페이지/사이트 안에서 가격이 서로 다르게 보임(상세 패널은 할인가, 옵션 섹션/카드는 정가).
- **Major**: `isDiscountActive`를 클라이언트 컴포넌트(`PurchaseOptionsPanel`)의 렌더 본문에서
  `Date.now()`로 직접 계산 → 서버 렌더 시각과 hydration 시각이 달라 mismatch 위험.
- **Minor**: `DiscountCountdown`의 `setInterval`이 만료 후에도 안 멈춤, `endsAt` 파싱 실패 시
  NaN 방어 없음, non-null assertion 남용.

## 2차 재검토 — 해소 확인, APPROVED

- `src/lib/discount.ts`(신규): `getActiveDiscount(product): ActiveDiscount | null` 순수 함수.
  `growth/page.tsx`의 기존 `checkIsNew()` 패턴과 동일하게 **서버 컴포넌트에서 1회 계산**해
  `{price, percent, endsAt}`를 클라이언트 컴포넌트에 prop으로만 전달.
- `detail/[slug]/page.tsx`에서 `discount = getActiveDiscount(product)`를
  `PurchaseOptionsPanel`·`ProductOptionsSection` 양쪽에 동일하게 전달 → Critical 해소(가격
  불일치 원천 차단).
- `growth/page.tsx`에서도 `products.map()` 루프 안에서 동일 패턴으로 계산해 `ProductCard`에 전달
  → 목록 페이지도 상세 페이지와 가격 일관성 확보.
- `PurchaseOptionsPanel`은 내부 `isDiscountActive`/`Date.now()` 계산을 전부 제거하고
  `discount` prop만 사용 → Major(hydration mismatch) 해소. `Date.now()` 호출은
  `DiscountCountdown`의 `useEffect` 내부(마운트 후, 클라이언트 전용)에만 남아있고 렌더 본문에는
  없음 — 초기 상태가 `null`이라 서버/클라이언트 첫 렌더 결과가 동일해 구조적으로 mismatch 불가.
- `ProductOptionsSection`의 옵션 가격 fallback은
  `option.price ?? discount?.price ?? product.price` — `PurchaseOptionsPanel`의
  `basePrice = discount ? discount.price : product.price`, `finalPrice = selectedOption.price ?? basePrice`와
  **우선순위가 정확히 일치**(둘 다 `??`로 0원 옵션가를 보존, 개별 가격이 없을 때만 할인가로
  fallback).
- `DiscountCountdown`: `ms <= 0`일 때 `clearInterval` 추가, `remainingMs === null ||
  Number.isNaN(remainingMs) || remainingMs <= 0`으로 NaN 가드 추가, non-null assertion 없음 →
  Minor 3건 모두 해소.

## How to apply (최신 — getProductPriceState 기준)

- 이 기능과 관련된 추가 요청(예: 다른 페이지에 할인가 노출 확대)이 있으면, 반드시
  `getProductPriceState()`를 그 페이지의 서버 컴포넌트에서 호출해 `priceState` prop으로
  내려주는 동일 패턴을 따를 것 — 클라이언트 컴포넌트에서 `Date.now()`를 직접 쓰면 이전에
  지적받은 hydration mismatch가 재발한다.
- `ProductCard`는 이제 `priceState`가 **필수 prop**(기본값 없음)이라, 새로 쓰는 곳(위시리스트,
  검색 결과 등)이 생기면 해당 서버 컴포넌트에서 `getProductPriceState()`를 호출해 반드시
  넘겨야 한다(빠뜨리면 타입 에러로 즉시 드러남 — 과거 optional prop이라 조용히 정가만 보이던
  문제를 구조적으로 차단).
- 가격 계산 로직을 고칠 때는 **gospelfix `src/lib/discount.ts`의 `getProductPriceState()`와
  cms.api `src/libs/pricing/productPriceState.ts`의 `getEffectivePrice()`를 항상 함께 고칠
  것** — 위 "최종 설계" 절 참고, 둘 중 하나만 고치면 화면에 보이는 가격과 실제 결제 금액이
  어긋나는 Critical 버그가 재발한다.
