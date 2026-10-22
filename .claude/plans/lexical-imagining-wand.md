# 회원가입 혜택 플로우 (무료 템플릿 + 20% 쿠폰) 구현 계획

## Context

`membership-flow.md`(사용자 제공 명세)는 "회원가입 → FREE 템플릿 즉시 다운로드 → 20% 할인
쿠폰 지급 → 유료 템플릿 구매 유도" 플로우를 요구하지만, 문서 자체는 **현재 아키텍처와 맞지
않는 전제**로 작성되어 있었다(Supabase 테이블에 프론트가 직접 SQL을 실행, Toss Payments
결제). 조사 결과 실제 저장소는 다음과 같이 동작한다:

- `gospelfix`(이 저장소, 프론트)는 Supabase에 직접 접근하지 않고 `gospelfix.cms.api`(별도
  저장소, 백엔드)의 REST API만 서버사이드에서 호출하는 BFF 구조다.
- Toss Payments는 완전히 제거되었고, 유료 상품은 **계좌이체 + 관리자 수동 승인**(또는
  카카오페이 자동승인 콜백) 방식으로 결제를 확인한다.
- **쿠폰 시스템은 코드베이스에 전혀 존재하지 않는다.** 기존 "할인"은 상품에 박힌 기간제
  할인(`discount_starts_at/ends_at`)이며 사용자별 발급 쿠폰과 무관하다.
- **"무료 템플릿 즉시 다운로드"는 이미 대부분 구현되어 있다.** `price === 0`인 상품은
  `BuyButton`이 주문 생성 + 결제 완료 처리를 한 번에 끝내고(cms.api가 관리자 승인 없이
  즉시 `paid` 처리), 마이페이지 보관함에서 다운로드할 수 있다.

사용자와 협의한 스코프:
1. **쿠폰 백엔드(테이블/API)는 `gospelfix.cms.api`에 신규 구현**하고, 이 저장소는 그 API를
   호출하는 프록시 + UI만 추가한다. 두 저장소 모두 이번 계획에 포함한다.
2. 무료 템플릿 다운로드는 **완료 즉시 다운로드 버튼을 노출**하는 방향으로 개선한다(현재는
   완료 모달에서 마이페이지로 이동하는 링크만 제공).
3. 쿠폰 자동 발급은 **이메일 인증이 필요 없는 즉시 가입 케이스만** 지원한다(이메일 인증
   콜백 라우트 `api/auth/callback/`은 현재 빈 디렉터리이며, 그 구현은 이번 스코프에서
   제외).

카트/배치 구매(`orders/create-batch`) 흐름에는 쿠폰 적용을 넣지 않는다 — 상세페이지의
단일 구매(`BuyButton` 직접 결제) 흐름에만 적용해 스코프를 관리 가능한 범위로 유지한다.

---

## Part 1 — `gospelfix.cms.api` (백엔드) 변경

> 이 저장소는 별도 CLAUDE.md/컨벤션을 갖는다. SQL(마이그레이션/RLS)은 그 저장소 자체 규칙상
> `supabase-db-architect` 서브에이전트가 파일만 작성하고 사용자가 대시보드에서 직접
> 실행한다 — 아래는 그 마이그레이션에 담겨야 할 **스키마 요구사항**이며, 실제 SQL 파일
> 작성은 `gospelfix.cms.api` 세션에서 그 컨벤션을 따라 진행한다. 신규 REST 엔드포인트는
> 그 저장소의 `rest-api-endpoint-checklist.md`(설정 토글 + Swagger 등록)도 함께 따른다.

### 1.1 스키마: `coupons` 테이블 + `orders` 컬럼 추가

새 마이그레이션(`supabase/migrations/032_add_coupons.sql`)에 담을 내용:

- `public.coupons`: `id uuid pk default gen_random_uuid()`, `user_id uuid references
  profiles(id) on delete cascade`, `code text unique not null`(`GF-XXXX-XXXX` 형식),
  `discount_rate int not null default 20`, `is_used boolean not null default false`,
  `expired_at timestamptz not null`(발급 시각 + 30일), `used_at timestamptz`,
  `created_at timestamptz not null default now()`. RLS enable + `authenticated`가
  `auth.uid() = user_id`인 행만 select 가능한 정책(쓰기는 항상 `admin.ts`
  service_role로만 수행 — 이 저장소의 기존 컨벤션과 동일, `orders`/`products` 테이블과
  같은 패턴).
- `public.orders`에 `coupon_id uuid references coupons(id)`, `discount_amount integer
  not null default 0` 컬럼 추가(nullable, 하위 호환 — `029_add_products_discount_fields.sql`과
  동일한 스타일).

### 1.2 쿼리 계층: `src/libs/supabase/queries/coupons.ts` (신규)

기존 `orders.ts`/`products.ts`와 동일한 스타일(순수 함수, `createAdminClient()` 사용,
에러는 throw)로 작성:

- `generateCouponCode()`: `GF-` + 랜덤 4자리 + `-` + 랜덤 4자리(대문자+숫자), unique
  제약 위반 시 재시도.
- `issueSignupCoupon(userId: string): Promise<void>`: 코드 생성 후 `discount_rate: 20`,
  `expired_at: now + 30일`로 insert.
- `getUserCoupons(userId: string): Promise<Coupon[]>`: 마이페이지 노출용 목록 조회.
- `validateCouponForOrder(userId: string, code: string): Promise<Coupon | null>`:
  `user_id`, `code` 일치 + `is_used = false` + `expired_at > now()` 조건으로 조회.
- `markCouponUsed(couponId: string): Promise<void>`: `is_used: true, used_at: now()`
  업데이트.

### 1.3 회원가입 시 자동 발급: `src/app/api/v1/auth/signup/route.ts` 수정

`data.session`이 즉시 발급되는 분기(이메일 확인 불필요 케이스)에서, 응답을 만들기 직전에
`issueSignupCoupon(data.user.id)`를 별도 `try/catch`로 감싸 호출한다 — 쿠폰 발급 실패가
회원가입 자체를 막지 않도록 한다(`console.error`만 남기고 응답은 정상 진행).
`confirmation_required` 분기(이메일 인증 필요)는 건드리지 않는다(스코프 제외 결정).

### 1.4 쿠폰 조회 API: `src/app/api/v1/coupons/me/route.ts` (신규)

`orders/me/route.ts`와 동일한 패턴: `validateApiKey` → `requireBearerUser` →
`getUserCoupons(user.id)` → 배열 반환.

### 1.5 주문 생성에 쿠폰 적용: `src/app/api/v1/orders/route.ts` POST 수정

`getEffectivePrice(product)`로 기본가를 구한 뒤, body에 `couponCode`가 있고
`basePrice > 0`이면 `validateCouponForOrder(user.id, couponCode)`로 검증 →
`discountAmount = Math.floor(basePrice * coupon.discount_rate / 100)` 계산 →
`basePrice - discountAmount`가 클라이언트가 보낸 `amount`와 일치하는지 검증(기존
"결제 금액이 올바르지 않습니다" 검증 로직 확장). 쿠폰이 없거나 유효하지 않으면 400 반환.
`createPendingOrder()`(`orders.ts`) 호출 시 `couponId`, `discountAmount`를 함께 저장하도록
해당 함수의 input 타입과 insert payload를 확장한다.

### 1.6 결제 완료 시 쿠폰 사용 처리

주문이 실제로 `paid`로 전환되는 지점은 3곳이다(모두 `.update({status:'paid', paid_at:
...}).eq(...).select('id')` 패턴):

- `markOrderPaidFree()` (`orders.ts`, 무료 상품 — `notify-payment` 라우트에서 호출)
- `markOrderPaid()` (`orders.ts`, 카카오페이 자동승인 — `confirm-payment` 라우트에서 호출)
- `confirmOrderPaymentAdmin()` (`orders.admin.ts`, 관리자 수동 계좌이체 승인 —
  `(admin)/orders/actions.ts`에서 호출)

세 함수 모두 `.select('id')`를 `.select('id, coupon_id')`로 넓히고, 업데이트가 성공해
반환된 행에 `coupon_id`가 있으면 그 자리에서 `markCouponUsed(coupon_id)`를 호출하도록
수정한다. 이렇게 하면 호출부(3개 라우트/액션)는 전혀 건드리지 않고, "실제로 paid가 되는
순간" 정의를 쿼리 계층 3개 함수에만 캡슐화할 수 있다.

### 1.7 체크리스트 준수

`coupons/me` 신규 엔드포인트 추가 시 그 저장소의 `rest-api-endpoint-checklist.md`에 따라
Swagger(`src/libs/openapi/schemas/coupon.schema.ts` + `registerPath`)에 등록한다. 설정
토글(`/settings` On/Off)이 이 도메인에도 필요한지는 `auth_api_configs`처럼 "끌 수 있어야
하는 기능"인지 판단해 결정한다(기존 `orders` POST/notify-payment류는 토글 없이 항상
활성화된 전례가 있음 — 쿠폰도 핵심 회원 혜택이라 토글 불필요 쪽에 가깝다).

---

## Part 2 — `gospelfix` (프론트) 변경

### 2.1 타입: `src/types/coupon.types.ts` (신규)

```ts
export interface Coupon {
  id: string;
  code: string;
  discount_rate: number;
  is_used: boolean;
  expired_at: string;
  created_at: string;
}
```

### 2.2 프록시 라우트: `src/app/api/coupons/route.ts` (신규)

`src/app/api/orders/route.ts`(GET) 패턴 그대로: `getAccessToken()` 없으면 빈 배열,
있으면 `cmsApiFetch<Coupon[]>("/api/v1/coupons/me", { accessToken })` 결과 반환.

### 2.3 주문 생성에 쿠폰 코드 전달: `src/app/api/orders/create/route.ts` 수정

body에서 `couponCode`(optional)도 함께 파싱해 cms.api `/api/v1/orders` 호출 시 그대로
전달한다. 검증 로직은 여전히 cms.api가 전담(이 파일은 그대로 프록시만).

### 2.4 구매 옵션 패널에 쿠폰 적용 UI: `src/components/products/PurchaseOptionsPanel.tsx` 수정

- 상세 페이지(`src/app/(public)/detail/[slug]/page.tsx`)에서 로그인 상태일 때
  `serverFetch<Coupon[]>("/api/coupons")`로 보유 쿠폰을 조회해 `PurchaseOptionsPanel`에
  `availableCoupon: Coupon | null`(만료/미사용 조건을 만족하는 첫 번째 쿠폰)로 전달한다.
- `isFree`가 아니고 `isInquiryOnly`가 아닐 때만, `availableCoupon`이 있으면 체크박스
  "20% 할인 쿠폰 적용"을 노출하고, 체크 시 `finalPrice`에서 `discount_rate`만큼 차감한
  금액을 표시한다(기존 `priceState.discount` 취소선 표시와 같은 자리에 나란히 UI 배치).
  적용 여부(`couponCode` 문자열 또는 `undefined`)를 `BuyButton`에 prop으로 넘긴다.

### 2.5 `BuyButton.tsx` 수정

- `couponCode?: string` prop 추가 → `/orders/create` POST body에 있을 때만 포함.
- 무료 상품 완료 모달 개선: `price === 0 && freeOrderCompleted`일 때 현재의 "마이페이지에서
  확인하기" 링크 대신(또는 그 위에) 기존 `DownloadButton` 컴포넌트를 재사용해
  `<DownloadButton productId={productId} hasFile={true} />`로 즉시 다운로드 버튼을
  노출한다("마이페이지에서 확인하기"는 보조 링크로 유지).

### 2.6 마이페이지에 보유 쿠폰 표시: `src/app/(mypage)/mypage/orders/page.tsx` 수정

이 페이지는 이미 제목이 "구매 / 혜택"이라 쿠폰을 얹기에 자연스러운 위치다(별도 라우트/
사이드바 항목 신설 불필요). `serverFetch<Coupon[]>("/api/coupons")`로 조회해 기존 주문
목록 위에 "보유 쿠폰" 섹션(코드, 할인율, 만료일, 사용 여부 배지)을 카드로 추가한다.

---

## 파일 변경 요약

**gospelfix.cms.api**
- `supabase/migrations/032_add_coupons.sql` (신규, 그 저장소 컨벤션에 따라 작성)
- `src/libs/supabase/queries/coupons.ts` (신규)
- `src/libs/supabase/queries/orders.ts` (수정 — `createPendingOrder`, `markOrderPaidFree`, `markOrderPaid`)
- `src/libs/supabase/queries/orders.admin.ts` (수정 — `confirmOrderPaymentAdmin`)
- `src/app/api/v1/auth/signup/route.ts` (수정)
- `src/app/api/v1/coupons/me/route.ts` (신규)
- `src/app/api/v1/orders/route.ts` (수정 — POST)
- `src/libs/openapi/schemas/coupon.schema.ts` (신규, Swagger 등록)

**gospelfix**
- `src/types/coupon.types.ts` (신규)
- `src/app/api/coupons/route.ts` (신규)
- `src/app/api/orders/create/route.ts` (수정)
- `src/app/(public)/detail/[slug]/page.tsx` (수정 — 쿠폰 조회 후 prop 전달)
- `src/components/products/PurchaseOptionsPanel.tsx` (수정)
- `src/components/products/BuyButton.tsx` (수정)
- `src/app/(mypage)/mypage/orders/page.tsx` (수정)

---

## 검증 방법

1. **cms.api**: `yarn build`로 타입 체크, 마이그레이션 SQL을 Supabase 대시보드에서 직접
   실행(수동), `/api-docs`(Swagger)에서 `coupons/me` 노출 확인.
2. **gospelfix**: `yarn build`로 타입 체크.
3. **End-to-end 수동 테스트**(로컬에서 두 서버 함께 실행):
   - 신규 계정으로 즉시 가입(휴대폰 인증만, 이메일 인증 불필요 설정) → Supabase
     대시보드에서 `coupons` 테이블에 `GF-XXXX-XXXX` 코드 행이 `discount_rate=20`,
     `expired_at`이 가입일+30일로 생성됐는지 확인.
   - `price=0`인 상품 상세페이지에서 "무료로 받기" 클릭 → 완료 모달에 다운로드 버튼이
     바로 뜨는지, 클릭 시 실제로 파일이 다운로드되는지 확인.
   - 유료 상품 상세페이지에서 "20% 할인 쿠폰 적용" 체크 → 표시 금액이 20% 할인된 값으로
     바뀌는지, 주문 생성 후 계좌이체 안내 금액도 할인된 금액인지 확인.
   - 관리자 페이지(`(admin)/orders`)에서 해당 주문 입금확인 승인 → `coupons.is_used`가
     `true`로 바뀌는지 확인.
   - 같은 쿠폰으로 두 번째 주문 생성 시도 → 400(유효하지 않은 쿠폰)으로 거부되는지 확인.
