# /mall 상세페이지 구매 패널(사이드바) 개편

## Context

`/detail/[slug]` 상품 상세페이지의 우측 구매 사이드바(`src/app/(public)/detail/[slug]/page.tsx`)는 현재
카테고리 배지 → 제목/설명 → 단일 가격 → 포함항목 리스트 → 구매 버튼(`BuyButton`) 하나로만 구성된
매우 단순한 구조다. 사용자가 참고 이미지로 제시한 "디자인코드 wed1015" 스타일처럼, 공급원가·구매항목
옵션(드롭다운)·플랫폼 옵션(토글)·옵션 반영 최종가·장바구니 담기/구매하기 버튼을 갖춘 형태로 확장한다.

이 저장소는 BFF 구조상 실제 데이터를 `gospelfix.cms.api`(별도 저장소)에서 받아오는데, 공급원가·옵션·
플랫폼 필드는 아직 cms.api 응답에 존재하지 않는다. 사용자와 확인한 결과 이번 작업 범위는:

1. **UI 먼저 구현** — `Product` 타입에 옵션 관련 필드를 옵셔널로 추가해두되(향후 cms.api 연동 시 그대로
   사용), 지금은 필드가 비어있을 때 보여줄 로컬 목업(mock) 옵션 데이터로 화면을 완성한다.
2. **장바구니 담기 버튼은 UI만** — 클릭 시 토스트만 띄우고 실제 다중 상품 담기/결제 로직은 만들지 않는다.
3. **옵션 선택에 따라 가격이 변동**해야 한다 (구매항목 + 플랫폼 각각 가격 델타를 가짐).

기존 구매 흐름(`BuyButton` → `/orders/create` → `PaymentModal`)은 그대로 재사용한다. `BuyButton`은 이미
`price: number`를 prop으로 받아 그 값을 그대로 주문 금액으로 보내므로, 옵션으로 계산된 최종가를 그대로
넘기기만 하면 되고 `BuyButton` 자체는 수정할 필요가 없다.

> 참고: 클라이언트가 계산한 금액을 그대로 `/orders/create`에 보내는 것은 기존 `BuyButton`의 동작
> 방식(`amount: price`)을 그대로 물려받는 것이며, 이번 변경으로 새로 생기는 신뢰 모델은 아니다. 옵션별
> 서버 측 가격 검증은 cms.api가 옵션 필드를 지원하게 될 때 함께 다뤄야 할 후속 과제로 남는다.

## 변경 파일

### 1. `src/types/product.types.ts` — 옵션 타입 추가 (옵셔널)

```ts
export interface ProductOption {
  id: string;
  label: string;
  price_delta: number; // 기본가 대비 추가/차감 금액
}

export interface Product {
  // ...기존 필드 유지
  supply_price?: number | null;
  purchase_options?: ProductOption[] | null;
  platform_options?: ProductOption[] | null;
}
```

cms.api가 아직 이 필드를 내려주지 않으므로 실제 응답에서는 `undefined`로 온다 — 옵셔널로 선언해 타입
에러 없이 안전하게 통과되도록 한다. Route Handler(`src/app/api/products/[slug]/route.ts`)는 응답을
그대로 통과시키는 구조라 수정 불필요.

### 2. `src/components/products/PurchaseOptionsPanel.tsx` (신규, client component)

기존 `page.tsx`의 "가격 블록 + `BuyButton`" 부분을 이 컴포넌트로 대체한다.

- Props: `product: Product`
- 로컬 상수로 `DEFAULT_PURCHASE_OPTIONS`, `DEFAULT_PLATFORM_OPTIONS` mock 배열 정의 (예: 구매항목 —
  "HTML/CSS 소스", "반응형 패키지" 등, 플랫폼 — "워드프레스", "카페24" 등). `product.purchase_options`
  / `product.platform_options`가 없으면 이 mock으로 폴백.
- `useState`로 선택된 구매항목(단일 select, 기본값 첫 번째 옵션), 선택된 플랫폼(단일 toggle, 기본값
  첫 번째 옵션) 상태 관리.
- 최종가 계산: `product.price + selectedPurchaseOption.price_delta + selectedPlatformOption.price_delta`.
  공급원가(`product.supply_price` 폴백 mock)는 취소선으로 최종가 위에 표시 (참고 이미지의 "공급원가
  600,000원" 스타일 재사용 — `text-gf-gray2 line-through`).
- 레이아웃 순서: 공급원가(취소선) → 구매항목 드롭다운(shadcn `Select`) → 플랫폼 토글 그룹(체크 아이콘
  + 가격 델타 표시, 기존 `page.tsx`의 카테고리 배지·`CheckCircle` 아이콘 패턴 재사용) → 최종가(`gf-orange`,
  기존 가격 블록 스타일 그대로 재사용) → 버튼 2개(`장바구니 담기` / 구매하기).
- `장바구니 담기` 버튼: `Button variant="outline" size="lg"`, 클릭 시 `sonner`의 `toast()`로 "장바구니
  기능은 준비 중입니다" 안내만 표시 (실제 담기 로직 없음). 기존 코드베이스는 `PaymentModal.tsx`,
  `Step04ContactInfo.tsx`에서 `import { toast } from "sonner"` 후 `toast.error(...)` 형태로만 사용 중이라
  — 에러가 아닌 안내 메시지이므로 `toast.error` 대신 기본 `toast("장바구니 기능은 준비 중입니다")` 호출로
  구분한다.
- 구매하기 버튼: 기존 `BuyButton` 컴포넌트를 그대로 사용하되 `price` prop에 계산된 최종가를 전달.
- className 조합에는 `cn()` 사용 (프로젝트 규칙), 인라인 `style=` 금지.

### 3. `src/app/(public)/detail/[slug]/page.tsx` — 사이드바 갱신

현재 가격 블록(`FREE`/가격 표시)과 `<BuyButton .../>` 렌더링 부분을 제거하고 그 자리에
`<PurchaseOptionsPanel product={product} />` 하나로 교체한다. 포함항목(`includes`) 카드는 그대로 유지.

### 4. shadcn `select` 컴포넌트 설치

`components/ui/`에 `select.tsx`가 없으므로 `npx shadcn@latest add select`로 추가한다(base-nova 스타일,
`asChild` prop 없는 프로젝트 컨벤션 그대로 적용됨). 플랫폼 토글은 별도 컴포넌트 설치 없이 기존
`Button`/아이콘 조합으로 직접 구현한다(참고 이미지의 체크박스형 토글에 가까움 — 실제 폼 checkbox 시맨틱보다
버튼 그룹이 UI상 더 적합).

## 검증

1. `yarn dev` 실행 후 브라우저로 `/mall`에서 상품 상세페이지 진입.
2. 구매항목 드롭다운 변경 시 최종가가 즉시 갱신되는지 확인.
3. 플랫폼 옵션 토글 시에도 최종가가 갱신되는지 확인.
4. `장바구니 담기` 클릭 시 토스트만 뜨고 페이지 이동/에러가 없는지 확인.
5. `구매하기` 클릭 시 기존과 동일하게 로그인 여부에 따라 `/login?next=...` 리다이렉트 또는
   `PaymentModal`이 옵션 반영된 금액으로 정상 오픈되는지 확인 (무료가 되는 극단적 옵션 조합이 없다면
   결제 모달 정상 노출 여부만 확인, 실제 결제 완료까지는 필요 없음).
6. `yarn build`로 TypeScript 타입 에러 없는지 확인.
7. `yarn lint` 통과 확인.
