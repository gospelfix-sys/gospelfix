# 장바구니 배치 체크아웃(선택결제) 구현 계획

## Context

이전 작업으로 장바구니 담기/조회/삭제(`CartModal`, `useCart`, `/api/v1/cart/*`)는 이미 동작한다.
이번엔 `CartModal`에 참고 이미지(할인쿠폰 사이트 스타일)처럼 **전체선택/개별선택 체크박스 +
선택삭제 + 결제수단 + "N원 결제하기"** 를 추가해서, 장바구니에서 고른 여러 상품을 한 번에
결제(계좌이체 확인)까지 끝내는 것이 목표다. "할인" 섹션은 사용자가 명시적으로 다음으로
미뤘으므로 이번에는 만들지 않는다(placeholder도 넣지 않음).

## 스코프/설계 결정 (중요 — 검토 필요)

- **결제수단은 실제로 존재하는 방식 하나만 보여준다.** 이 프로젝트는 Toss/PG 연동을
  더 이상 쓰지 않고 **계좌이체 확인 방식**(`PaymentModal.tsx` — 계좌정보 안내 + "입금했어요"
  버튼)만 실제로 동작한다. 참고 이미지의 네이버페이/토스페이/카카오페이는 이 프로젝트에
  존재하지 않는 결제수단이므로, 그대로 흉내내면 클릭해도 아무 일도 안 하는 가짜 UI가 된다.
  대신 "계좌이체(무통장입금)" 카드 하나만 이미 선택된 상태로 보여준다.
- **주문 1건 = 상품 1건 구조는 그대로 유지한다.** `orders` 테이블/`createPendingOrder`를
  바꾸지 않고, 선택한 장바구니 항목 개수만큼 `pending` 주문을 여러 건 만든 뒤, 그
  order_id들을 한 번에 `pending_confirm`으로 전환하는 배치 확인 엔드포인트만 새로 추가한다
  (DB 스키마 변경 불필요 — 조사 결과 확인 완료).
- **기존 단일 구매 흐름(`BuyButton`/`PaymentModal`)은 건드리지 않는다.** 무료 상품 즉시완료,
  409 중복구매 처리 등 기존 로직에 영향 없이, 장바구니 배치결제는 별도의
  `BatchPaymentModal`로 분리한다.
- **전체 성공 아니면 전체 실패(all-or-nothing)로 주문을 생성한다.** 선택 항목 중 하나라도
  비활성 상품이거나 이미 구매한 상품이면, 배치 전체를 생성하지 않고 에러로 어떤 상품이
  문제인지 안내한다(부분 주문 생성 후 롤백하는 것보다 단순하고 안전).
- 결제 완료(입금 확인) 성공 시, 그 주문으로 전환된 장바구니 항목들은 장바구니에서 삭제한다.

## 1. cms.api — 쿼리 레이어 확장 (`src/libs/supabase/queries/orders.ts`)

기존 함수는 그대로 두고, 배치 전용 함수만 추가한다(기존 `getOrderByOrderIdAndUser`/
`markOrderPendingConfirm`과 완전히 동일한 패턴, `.eq` → `.in`만 다름):

```ts
export async function getOrdersByOrderIdsAndUser(
  orderIds: string[], userId: string,
): Promise<{ order_id: string; status: string }[]>
// .select('order_id, status').in('order_id', orderIds).eq('user_id', userId)

export async function markOrdersPendingConfirm(
  orderIds: string[], userId: string,
): Promise<string[]>
// .update({status:'pending_confirm'}).in('order_id', orderIds).eq('user_id', userId)
//   .eq('status','pending').select('order_id')
// → 실제로 전환된 order_id 배열 반환 (몇 건이 idempotent하게 스킵됐는지 판별 가능)
```

## 2. cms.api — 배치 주문 생성 라우트 (신규)

`src/app/api/v1/orders/batch/route.ts` — `POST`:
```
1. validateApiKey
2. body: { items: { productId, amount }[], agreedToWithdrawalNotice } 검증
   (items 1개 이상, agreedToWithdrawalNotice === true 필수 — 기존 단일 주문 검증과 동일 톤)
3. requireBearerUser
4. items 전체를 먼저 검증(생성 전):
   - getActiveProductById(productId) 없으면 → 400/404, 어떤 productId인지 error에 포함
   - product.price !== amount → 400 (가격 위변조 방지, 기존 로직 재사용)
   - hasPurchasedProduct(user.id, productId) → true면 409 (이미 구매)
   → 하나라도 실패하면 아무것도 생성하지 않고 즉시 에러 반환
5. 검증 통과 시 items.map(...)을 순회하며 createPendingOrder()를 반복 호출,
   각각 crypto.randomUUID()로 order_id 생성
6. NextResponse.json({ orderIds: string[] })
```
기존 `POST /api/v1/orders`의 검증 로직(`getActiveProductById`, `hasPurchasedProduct`,
`createPendingOrder`)을 그대로 재사용 — 새 쿼리 함수 불필요, 라우트에서 루프만 돈다.

## 3. cms.api — 배치 결제 확인 라우트 (신규)

`src/app/api/v1/orders/notify-payment-batch/route.ts` — `POST`:
```
1. validateApiKey → requireBearerUser
2. body: { orderIds: string[] } (1개 이상)
3. getOrdersByOrderIdsAndUser(orderIds, user.id) → 조회된 개수가 요청보다 적으면
   (본인 소유 아니거나 존재하지 않는 order_id 포함) 404
4. markOrdersPendingConfirm(orderIds, user.id) — pending 상태인 것만 원자적으로 전환됨
   (이미 pending_confirm/paid인 것은 자연히 스킵 → 멱등)
5. NextResponse.json({ success: true })
```
기존 `[orderId]/notify-payment/route.ts`와 동일한 에러 처리 톤(`AdminAuthError` catch 등).

## 4. cms.api — OpenAPI 등록

`order.schema.ts`에 `CreateBatchOrderRequestSchema`(`{ items: [{productId, amount}], agreedToWithdrawalNotice }`),
`CreateBatchOrderResponseSchema`(`{ orderIds: string[] }`), `NotifyPaymentBatchRequestSchema`
(`{ orderIds: string[] }`) 추가하고 `registerOrderPaths(reg)` 안에 두 경로(`POST /api/v1/orders/batch`,
`POST /api/v1/orders/notify-payment-batch`) 등록 추가(이미 `orders` 슬러그가 `TYPED_SLUGS`에
있으므로 별도 등록 불필요).

## 5. gospelfix — BFF 프록시 라우트 (신규)

`orders/create/route.ts` 패턴 그대로:
- `src/app/api/orders/create-batch/route.ts` — POST: body 검증 → `getAccessToken()` 없으면
  401 → `cmsApiFetch('/api/v1/orders/batch', {...})` → `{ orderIds }` 반환.
- `src/app/api/orders/notify-payment-batch/route.ts` — POST: `{ orderIds }` → `getAccessToken()`
  → `cmsApiFetch('/api/v1/orders/notify-payment-batch', {...})`.

## 6. gospelfix — `useCart` 확장

`src/hooks/useCart.ts`에 추가:
- `removeMultiple(cartItemIds: string[])`: 선택 삭제용. `Promise.all`로 각각
  `axiosInstance.delete('/cart/:id')` 호출 후 `fetchCart()`로 최신화(개별 `removeFromCart`의
  optimistic 방식과 달리 일괄 삭제는 재조회가 더 단순하고 안전).

체크아웃(배치 주문 생성 + 결제 확인) 로직은 훅이 아니라 `CartModal` 내부에서 직접
`axiosInstance`로 호출한다 — `BuyButton.tsx`가 훅 없이 컴포넌트 안에서 직접 처리하는 것과
동일한 패턴이라 이 프로젝트 컨벤션에 맞다.

## 7. gospelfix — `BatchPaymentModal` (신규)

`src/components/cart/BatchPaymentModal/index.tsx` — `PaymentModal.tsx`와 동일한 수동 오버레이
+ `loading`/`done` 2단계 패턴을 그대로 재사용하되, props를 배열/합계 기준으로 바꾼다:
```tsx
interface BatchPaymentModalProps {
  orderIds: string[];
  itemCount: number; // PaymentModal의 productName 자리 — "N개 상품"으로 표시
  amount: number; // 선택 항목 합계
  onConfirmed: () => void; // 결제 확인 성공 시 CartModal이 해당 항목들을 장바구니에서 제거하도록 콜백
  onClose: () => void;
}
```
`loading`/`done` state, backdrop 클릭 닫기(`onClick={done ? undefined : onClose}`), QR+계좌정보
카드, `isAxiosError` 에러 토스트까지 `PaymentModal.tsx`(위에서 전체 코드 재확인 완료)와 동일하게
그대로 옮긴다. "입금했어요" 클릭 시 `axiosInstance.post("/orders/notify-payment-batch", { orderIds })` →
성공 시 `onConfirmed()` 호출 후 완료 화면(`done`) 전환. 계좌정보/QR 안내는 `PaymentModal`과 동일한
`ACCOUNT_INFO`/QR 이미지를 재사용(중복 상수는 이번 스코프에서는 두 컴포넌트가 각자 import해도
무방한 수준).

## 8. gospelfix — `CartModal` 확장

`src/components/cart/CartModal/index.tsx`에 추가되는 것:

- **로컬 state**: `selectedIds: Set<string>`(모달 열릴 때/`items` 변경 시 전체 선택으로 초기화),
  `isCheckingOut: boolean`, `batchOrder: { orderIds: string[]; amount: number } | null`
  (있으면 `BatchPaymentModal` 렌더), `agreedToWithdrawalNotice: boolean`.
- **전체선택 행**: 체크박스(`checked = selectedIds.size === items.length && items.length > 0`,
  클릭 시 전체 선택/해제 토글) + `전체선택 {selectedIds.size} / {items.length}` 텍스트 +
  "선택삭제" 버튼(`disabled={selectedIds.size === 0}`, 클릭 시 `useCart().removeMultiple([...selectedIds])`
  후 `selectedIds` 초기화).
- **각 항목 행**: 기존 썸네일/이름/옵션/가격/삭제 버튼 앞에 개별 체크박스 추가
  (`components/ui/checkbox.tsx`의 `Checkbox` 재사용).
- **결제수단 섹션**: "결제수단" 타이틀 + 카드 1개(`계좌이체(무통장입금)`, 항상 선택됨 표시 —
  라디오 아이콘은 체크 상태로 고정 렌더, 클릭 로직 불필요).
- **청약철회 동의**: `PurchaseOptionsPanel.tsx`의 노란 배경 체크박스+문구를 그대로 재사용(동일
  카피, 동일 스타일 — 신규 UI 패턴 만들지 않음).
- **"{selectedTotal}원 결제하기" 버튼**: `disabled={selectedIds.size === 0 || !agreedToWithdrawalNotice}`.
  클릭 시:
  1. 선택된 `items`를 `{ productId, amount: price }[]`로 변환해
     `axiosInstance.post("/orders/create-batch", { items, agreedToWithdrawalNotice })`
  2. 성공 시 `{ orderIds }`와 선택 항목 합계로 `batchOrder` state 세팅 → `BatchPaymentModal` 오픈
  3. 실패 시 `toast.error(error.response?.data?.error ?? "결제 준비에 실패했습니다.")`
     (409/400 등 서버 에러 메시지를 그대로 노출 — 기존 `BuyButton`의 에러 처리 톤과 동일)
- **`BatchPaymentModal`의 `onConfirmed`**: 방금 주문으로 전환된 항목들(`selectedIds`에 있던
  cart item id들)을 `removeMultiple`로 장바구니에서 제거 → `selectedIds` 초기화 →
  `batchOrder`를 null로(모달은 `BatchPaymentModal` 자체의 완료 화면에서 "마이페이지 바로가기"로
  나가므로 `CartModal`을 강제로 닫지는 않는다).

selectedTotal 계산은 전역 `cartTotalPriceSelector`(전체 합계)와 별개로 `CartModal` 내부에서
`items.filter(i => selectedIds.has(i.id)).reduce(...)`로 로컬 계산한다(헤더 배지는 여전히
"장바구니 전체 개수/금액"을 보여줘야 하므로 전역 selector는 그대로 둔다).

## 작업 순서

1. cms.api: `queries/orders.ts`에 `getOrdersByOrderIdsAndUser`/`markOrdersPendingConfirm` 추가
2. cms.api: `app/api/v1/orders/batch/route.ts`, `app/api/v1/orders/notify-payment-batch/route.ts`
3. cms.api: `order.schema.ts` + `dynamic-spec.ts`(이미 `orders` 등록돼 있어 스키마 파일만 수정)
4. gospelfix: `app/api/orders/create-batch/route.ts`, `app/api/orders/notify-payment-batch/route.ts`
5. gospelfix: `hooks/useCart.ts`에 `removeMultiple` 추가
6. gospelfix: `components/cart/BatchPaymentModal/index.tsx` (기존 `PaymentModal.tsx` 참고)
7. gospelfix: `components/cart/CartModal/index.tsx` 확장 (선택/결제수단/동의/결제하기)

## 검증 방법

1. **정적 검증**: 두 저장소 각각 `yarn tsc --noEmit` + `yarn lint` 통과.
2. **cms.api 단독**: 로그인 사용자 Bearer로
   - `POST /api/v1/orders/batch` (실제 상품 2개) → `{ orderIds: [id1, id2] }`
   - 그 중 하나를 이미 구매한 상품으로 바꿔서 재요청 → 409, `orderIds` 생성 안 됨(orders 테이블에
     새 pending row가 안 생겼는지 확인)
   - `POST /api/v1/orders/notify-payment-batch { orderIds: [id1, id2] }` → `{ success: true }`,
     두 주문 모두 `pending_confirm`으로 바뀌었는지 확인, 재요청해도 200(멱등)
3. **gospelfix 브라우저 테스트**: 로그인 후 상품 2개 이상 장바구니 담기 → 헤더 카트 아이콘 →
   - 전체선택 체크/해제, 개별 체크 토글, "선택삭제"로 일부 삭제
   - 청약철회 동의 전에는 "결제하기" 비활성 확인
   - 동의 후 "결제하기" → `BatchPaymentModal` 오픈, 합계 금액이 선택 항목 합인지 확인
   - "입금했어요" 클릭 → 완료 화면 → 장바구니에서 해당 항목들이 사라졌는지 확인
   - 마이페이지에서 방금 만든 주문들이 보이는지 확인(기존 마이페이지 주문 목록 재사용)
