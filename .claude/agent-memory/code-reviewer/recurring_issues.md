---
name: recurring_issues
description: gospelfix 코드 리뷰에서 반복적으로 발견되는 이슈 패턴
type: feedback
---

## 반복 이슈 목록

### 5. `"use server"` 지시어 누락 (Critical)

createAdminClient()를 사용하는 libs/supabase/ 파일에서 "use server" 지시어가 누락된 사례 반복 발생 (news.ts, products.ts).
**Why:** "use server" 없이 createAdminClient(service role key, RLS 우회)를 사용하면 클라이언트 번들에 포함될 위험이 있음. Next.js Server Action 직렬화 경계도 올바르게 설정되지 않음.
**How to apply:** admin/src/libs/supabase/ 내 createAdminClient()를 사용하는 모든 파일 최상단에 반드시 "use server"; 선언.

### 6. reorder 함수 분산 위치 — 일관성 규칙

reorderNews, reorderProducts는 reorder.ts에 있는데 reorderPortfolios만 portfolios.ts에 존재한 사례 발생.
**Why:** 유지보수 시 탐색 비용 증가. "use server" 파일 간 역할 혼재로 아키텍처 가독성 저하.
**How to apply:** 모든 reorder 함수는 반드시 admin/src/libs/supabase/reorder.ts에 집중 배치. 도메인 파일(portfolios.ts 등)에 reorder 함수 추가 금지.

### 1. style= 인라인 속성 사용 (Critical)

CtaBanner.tsx 등에서 `style={{ background: 'var(--gf-black)' }}` 패턴 반복 발생.
**Why:** 프로젝트 규칙상 style= 절대 금지. CSS 변수는 tailwind.config.ts에 토큰 등록 후 className으로만 사용.
**How to apply:** `bg-gf-black`, `text-gf-orange` 등 커스텀 토큰 또는 Tailwind 임의값(`bg-[#111]`) 활용.

### 2. Prettier 규칙 위반 — 홑따옴표·세미콜론 누락 (Minor)

HeroBanner.tsx, CtaBanner.tsx 등 'use client' 선언 및 문자열에 홑따옴표(`'`) 사용, 세미콜론 누락 패턴 반복.
**Why:** .prettierrc에 singleQuote: false, semi: true 설정.
**How to apply:** 파일 작성 시 쌍따옴표, 세미콜론 필수. 특히 'use client' → "use client" 주의.

### 3. Supabase Storage 버킷 혼용 오류 (Critical)

uploadProductThumbnail이 "portfolio-images" 버킷을 잘못 사용한 사례 발생.
**Why:** 버킷을 혼용하면 이미지가 잘못된 버킷에 저장되어 운영 혼란 및 권한 오류 발생 가능.
**How to apply:** 버킷 이름을 상수로 관리하거나, 함수명과 버킷명이 일치하는지 반드시 확인.

### 4. ProductForm에서 Next/Image 미사용 (Minor)

ProductForm.tsx의 썸네일 미리보기에 `<img>` 태그 직접 사용. NewsForm/PortfolioForm은 `<Image>`(next/image) 사용.
**Why:** Next.js의 Image 컴포넌트는 자동 최적화(WebP 변환, lazy loading)를 제공. 일관성도 중요.
**How to apply:** 관리자 폼 내 이미지 미리보기는 모두 next/image의 Image 컴포넌트를 사용한다.

### 7. Server Action insert에서 state 필드 누락 (Critical — 데이터 유실)

submitQuoteAction.ts에서 QuoteWizardState의 shopIndustry, shopStatus, productionScope, requiredFeatures, needsSystemDev 5개 필드가 insert 객체에서 누락된 사례 발생.
**Why:** calculateQuote()는 이 5개 필드를 기반으로 금액을 계산하므로, DB에 저장되지 않으면 admin에서 선택 근거를 파악할 수 없고 재계산도 불가. 특히 requiredFeatures는 배열이라 데이터 손실이 큼.
**How to apply:** Server Action의 insert 객체를 작성할 때 QuoteWizardState(또는 해당 도메인 타입) 인터페이스와 1:1 대조하여 누락 필드가 없는지 확인한다. admin DB 타입(QuoteSubmissionDetail)과도 동기화 필요.

### 8. useEffect deps에 state 전체 객체 사용 — 무한루프 위험 (Critical)

QuoteWizard.tsx에서 state 전체를 deps에 두고 내부에서 setState를 호출하는 패턴 발생.
**Why:** early-return 가드가 있어도 state 객체 참조가 setState 후 항상 새로 생성되므로, 계산과 무관한 필드 변경에도 effect가 재실행됨. 과도한 재실행 및 잠재적 무한루프 위험.
**How to apply:** useEffect deps를 실제 계산에 사용되는 필드(selectedCategories, selectedItems, shopStatus, productionScope, requiredFeatures)만으로 좁힌다.

### 9. raw <button> 태그 직접 사용 — components/ui/button.tsx 미사용 (Major)

Step04ContactInfo.tsx, Step05Result.tsx에서 raw <button> 태그를 직접 작성. components/ui/button.tsx가 이미 존재함에도 미사용.
**Why:** 아토믹 UI 컴포넌트 미분리는 프로젝트 스타일 규칙 위반(Major → BLOCKED 판정 기준).
**How to apply:** Button 컴포넌트를 import해서 사용하거나 buttonVariants()를 활용한다.

### 10. 깨진 내부 링크 `href="/main"` (Major로 격상, 반복·미완료 수정 발생)

CtaBanner.tsx, dashboard/page.tsx(2026-07-24 1차 수정)는 고쳤으나, 같은 날 재검증(2026-07-24 2차)
시점에 `src/components/main/HeroBanner.tsx`(SLIDES 배열의 `ctaHref`/`ctaSecondHref`, 총 6곳)가
여전히 `/main`, `/main?category=...`를 가리키는 것을 발견. HeroBanner는 `(public)/growth/page.tsx`
최상단에 렌더되는 히어로 배너로, 페이지 최상단의 주요 CTA 버튼(각 슬라이드의 "지금 시작하기"/
"모든 템플릿 보기" 등) 전부가 클릭 시 404로 연결되는 실사용 임팩트가 큰 버그. 실제 라우트는
`(public)/growth/page.tsx` → `/growth`다(2026-08-21 `/mall`에서 `/growth`로 라우트명 변경).
**Why:** main/ 평탄화(2026-07-23) 이후에도 하드코딩된 경로 문자열이 갱신되지 않아 발생하는 반복
버그. 이전 리뷰에서 "Minor"로 분류하고 일부 파일만 고쳐서 넘어갔더니, 실제로는 가장 눈에 띄는
히어로 배너 CTA에 남아있었음 — Grep 전수 검색 없이 "본 것 같은 파일만" 고치면 재발한다.
**How to apply:** `href="/main"` 관련 리뷰 시 개별 파일 열람이 아니라 반드시
`grep -rn '"/main"' src` 또는 `grep -rn '/main[?"]' src` 전수 검색으로 모든 occurrence를 확인하고,
한 곳이라도 남아있으면 Major(사용자 영향이 큰 마케팅/CTA 표면일 경우) 또는 최소 Minor로 재보고할 것.
2026-07-24 2차 재검증 시점 기준 HeroBanner.tsx 3개 슬라이드 x 2개 링크 = 6곳 미수정 확인됨.

### 11. cmsApiFetch/serverFetch 헤더 병합 순서 — 호출자 headers가 인증 헤더를 덮어쓸 수 있음 (Minor, 2026-07-24 수정 확인됨)

`src/lib/cmsApi/client.ts`의 `cmsApiFetch()`가 `{ ...headers, "X-API-Key": CMS_API_KEY,
...(accessToken ? { Authorization } : {}) }` 순서로 수정되어, 호출자가 넘긴 `headers`가 항상 먼저
스프레드되고 `X-API-Key`/`Authorization`이 마지막에 덮어쓰는 구조로 바뀜 — 더 이상 호출자가 신뢰
헤더를 무효화할 수 없음. 2026-07-24 2차 재검증 시 확인 완료.

### 12. 카테고리 라벨 매핑 3중 하드코딩 + 부분 수정 누락 (Major, 2026-07-24 발견 → 2026-07-24 3차 재검증: 증상만 부분 해소)

`corporate` 카테고리 한국어 라벨(`"기업·단체"`)이 `ProductCard.tsx`의 `CATEGORY_LABEL`,
`growth/page.tsx`의 `labelMap`, `types/product.types.ts`의 `PRODUCT_CATEGORIES` 세 곳에 각각
하드코딩되어 있음. 세 번째 발생 지점이던 `detail/[slug]/page.tsx`(`{product.category}`를 매핑
없이 그대로 렌더링)는 2026-07-24 3차 재검증 시점에 `PRODUCT_CATEGORIES.find()`로 `categoryLabel`을
도출하도록 수정 완료 확인 (import에 `PRODUCT_CATEGORIES` 추가, `?? product.category` 폴백 유지).
**단, `ProductCard.tsx`의 `CATEGORY_LABEL` Record와 `growth/page.tsx`의 `labelMap` IIFE는 여전히
그대로 하드코딩되어 있어(수정 대상 아니었음), 근본적인 "단일 진실 공급원" 리팩터링은 아직 완료되지
않음 — 현재는 3곳의 값이 우연히 일치할 뿐, 새 카테고리 추가 시 재발 위험 그대로 존재.
**Why:** 단일 진실 공급원(`PRODUCT_CATEGORIES`) 없이 값→라벨 매핑을 여러 파일에 중복 정의하면,
새 카테고리 추가/라벨 변경 시 한 곳이라도 놓치는 순간 화면마다 다른 라벨(또는 raw 값)이 노출되는
불일치가 반복 재발함. `/main` 링크 미수정 사례(#10)와 동일한 "부분 수정 후 전수 검색 없이 종료"
패턴.
**How to apply:** 카테고리/뉴스 등 value→label 매핑을 다루는 diff를 리뷰할 때는 반드시
`grep -rn "\.category\b"` 또는 해당 값 필드명으로 전수 검색해 이번에 고친 파일 외에 동일 필드를
raw 값 그대로 렌더링하는 곳이 남아있는지 확인한다. 근본 해결책으로 `PRODUCT_CATEGORIES`에서
`Record<value, label>`을 파생시켜(`Object.fromEntries(PRODUCT_CATEGORIES.map(c => [c.value, c.label]))`)
`ProductCard.tsx`/`growth/page.tsx`가 이를 재사용하도록 리팩터링 제안 — 아직 미완료, 다음 라운드
백로그로 재제안할 것.

### 13. 카드 썸네일 비율 변경 시 loading.tsx 스켈레톤 동기화 누락 (Major, 2026-07-24 발견 → 2026-07-24 3차 재검증: 해소 확인)

`ProductCard.tsx`의 썸네일 `aspect-[16/10]` → `aspect-[1080/1350]`(≒`4/5`) 변경 시
`src/app/(public)/growth/loading.tsx:34`의 스켈레톤 카드 썸네일은 여전히 `aspect-[16/10]`로 남아
레이아웃 시프트(CLS)가 발생했었음. 2026-07-24 3차 재검증 시점에 `loading.tsx:34`가
`aspect-[1080/1350]`로 수정되어 `ProductCard.tsx:39`와 일치함을 확인 (`grep -rn "aspect-\["`로 전수
대조, src 전체에 `aspect-[16/10]` 잔존 없음, ProductCard는 growth/page.tsx에서만 사용되고
loading.tsx도 프로젝트 전체에 1개뿐이라 다른 스켈레톤 동기화 누락 없음).
**Why:** Next.js `loading.tsx`는 실제 콘텐츠와 동일한 그리드/카드 스켈레톤을 보여주다 교체되는
용도이므로, 실제 카드의 비율/치수를 바꾸는 diff는 반드시 대응하는 loading.tsx도 함께 갱신해야
한다. 이 프로젝트에서 카드 치수를 바꾸는 리뷰 시 `loading.tsx` 확인을 빠뜨리기 쉬움.
**How to apply:** `components/products/ProductCard.tsx`(또는 다른 카드 컴포넌트)의 치수·비율
관련 className을 리뷰할 때는 같은 라우트의 `loading.tsx` 스켈레톤에 동일한 값이 있는지 반드시
대조 확인한다.

### 14. 등록된 gf-* 토큰과 값이 동일한 임의값(arbitrary value) 하드코딩 (Minor, 2026-07-24 발견)

`ProductCard.tsx:56` 카테고리 배지에 `border-[#e8e5df]`를 추가했는데, `#e8e5df`는
`globals.css`에 이미 `--gf-border`로 등록되어 있고 `tailwind.config.ts`에도 `gf.border` 토큰으로
매핑되어 있는 값과 완전히 동일함(같은 파일의 썸네일 컨테이너에는 바로 옆 줄에서
`border-gf-border`를 정상적으로 사용 중이라 대조가 뚜렷함). CLAUDE.md 스타일 규칙 위반(Critical)은
아니지만(className만 사용했으므로 style= 금지 규칙은 준수), "Tailwind에 없는 값은 임의값 또는
tailwind.config.ts 커스텀 토큰 사용" 지침의 취지상 이미 등록된 토큰이 있으면 임의값보다 토큰을
우선해야 함.
**Why:** 임의값(`border-[#e8e5df]`)과 토큰(`border-gf-border`)이 같은 색을 가리키는 두 가지
표현으로 공존하면, 추후 디자인 토큰 값이 바뀔 때 임의값으로 박제된 곳만 갱신을 놓쳐 색상 불일치가
재발한다. `/main` 링크(#10), 카테고리 라벨 3중 하드코딩(#12)과 같은 "단일 진실 공급원 미사용" 패턴의
변형.
**How to apply:** 새로 추가되는 `border-[...]`/`bg-[...]`/`text-[...]` 등 임의값 className을 볼 때마다
`globals.css`의 `--gf-*` 변수 목록과 값을 대조해, 동일한 hex/rgba가 이미 토큰으로 등록되어 있으면
임의값 대신 해당 토큰 클래스(`border-gf-border` 등)로 교체 제안한다(Minor로 보고, BLOCKED 사유는
아님).

### 15. 가격 0원 "FREE" 표시 변경 시 BuyButton/PaymentModal 미동기화 (Major, 2026-07-25 발견)

`detail/[slug]/page.tsx`와 `ProductCard.tsx`에 `product.price === 0 ? "FREE" : ...` 조건부 렌더링을
추가했으나, 같은 상세 페이지에서 가격 바로 아래 렌더되는 `BuyButton.tsx:57`은
`` `${price.toLocaleString("ko-KR")}원 구매하기` `` 그대로라 0원 상품에서 "0원 구매하기" 버튼 문구가
그대로 노출됨. 클릭 후 뜨는 `PaymentModal.tsx:114`도 "입금 금액: 0원"을 그대로 보여줘 무료 상품인데
계좌이체 안내를 받는 모순이 발생.
**Why:** `/main` 링크(#10), 카테고리 라벨 3중 하드코딩(#12)과 동일한 "일부 파일만 grep 없이 수정하고
종료" 패턴. `product.price`를 표시/가공하는 지점(`ProductCard.tsx`, `detail/page.tsx`, `BuyButton.tsx`,
`PaymentModal.tsx`, `dashboard/page.tsx`)이 여러 파일에 흩어져 있어, "0원 표시 방식"처럼 표시 로직에
분기를 추가하는 diff는 한 지점만 고치면 같은 화면 안에서도 문구가 어긋난다.
**How to apply:** `product.price`/`amount`/`order.amount`를 표시하는 diff를 리뷰할 때는 반드시
`grep -rn 'toLocaleString(\"ko-KR\")\|\.price\b' src`로 전수 검색해 동일 값을 표시하는 다른 파일도
함께 갱신됐는지 확인한다. 근본 해결책으로 `formatPrice(price)` 또는 `isFreePrice(price)` 공용 유틸
(`lib/utils.ts` 등)을 만들어 각 컴포넌트가 재사용하도록 제안할 것 — 아직 미완료, 다음 라운드
백로그로 재제안.
**2026-07-25 재검증**: `BuyButton.tsx`/`PaymentModal.tsx`는 무료 상품이 결제 모달 자체를 건너뛰도록
수정되어 핵심 모순은 해소됐으나, `src/app/(dashboard)/dashboard/page.tsx:80`의
`{order.amount.toLocaleString("ko-KR")}원`은 여전히 무조건 렌더링되어 무료 주문도 "0원"으로 표시됨
(FREE 미적용). 무료 주문 완료 모달의 "마이페이지에서 확인하기" 버튼이 바로 이 화면으로 이동하므로
사용자 노출 빈도가 높음 — 동일 패턴 재발 확인, 다음 라운드에 dashboard도 함께 수정 필요.
**2026-07-25 3차(최종) 재검증**: `dashboard/page.tsx:80`이
`{order.amount === 0 ? "FREE" : \`${order.amount.toLocaleString("ko-KR")}원\`}`으로 수정되어 완전히
해소됨. `grep -rn 'toLocaleString(\"ko-KR\")\|\.price\b|\.amount\b' src` 전수 검색 결과 나머지 표시
지점(`ProductCard.tsx`, `detail/[slug]/page.tsx`, `BuyButton.tsx`, `PaymentModal.tsx`)도 모두 0원/FREE
분기 또는 애초에 amount=0 흐름에 도달하지 않는 구조(PaymentModal은 price!==0일 때만 렌더링)로 일관됨
확인. 이슈 #15 완전 해소.

### 16. 2단계 API 호출(생성→후속 처리) 사이 실패 시 에러 메시지/복구 경로 미분화 (Major, 2026-07-25 발견)

`BuyButton.tsx`의 무료 상품 흐름이 `/orders/create` 성공 후 곧바로 `/orders/notify-payment`를 호출해
결제 모달 없이 완료 처리하도록 구현됨. 두 호출이 하나의 `try` 블록으로 묶여 있어, `notify-payment`만
실패해도(주문 자체는 이미 생성된 상태) catch 블록이 "주문 생성에 실패했습니다"라는 동일한 일반
에러만 노출한다. 사용자는 아무 것도 생성되지 않은 줄 알고 재시도하지만 실제로는 미완료(unpaid)
주문이 남아있어 재시도 시 409(이미 구매함)를 받거나 dashboard에 반영되지 않는 상태로 혼란을 겪을
수 있음.
**Why:** 두 네트워크 호출을 원자적 트랜잭션 없이 클라이언트에서 순차 실행하면서 실패 지점을
구분하지 않으면, 부분 성공 상태(주문 생성됨 + 미결제)를 사용자가 인지하지 못하고 복구할 방법도
없는 상태에 빠질 수 있다.
**How to apply:** 주문 생성 + 후속 확정처럼 여러 단계로 나뉜 흐름을 리뷰할 때는 각 단계의 실패를
구분해서 처리하는지 확인한다 (예: notify-payment 실패 시 "주문은 생성되었으나 완료 처리에
실패했습니다. 마이페이지에서 다시 시도해주세요" 등 단계별 메시지, 또는 재시도 버튼/폴링 제공).
이상적으로는 cms.api 쪽에서 amount=0 주문을 생성 시점에 서버 단일 트랜잭션으로 즉시 paid 처리하도록
하여 클라이언트의 2단계 호출 자체를 없애는 것을 다음 라운드에 제안할 것.
**2026-07-25 3차(최종) 재검증**: `BuyButton.tsx`가 `orders/create` 성공 후 `orders/notify-payment`
호출을 별도 inner try/catch로 감싸도록 수정됨 — 실패 시 "주문은 생성되었지만 완료 처리에
실패했습니다. 마이페이지에서 다시 시도해주세요."라는 구분된 메시지를 보여주고 `/dashboard`로
이동시켜, 두 단계 실패가 더 이상 동일한 일반 에러로 뭉뚱그려지지 않음. 이슈 #16 해소 확인. 부수적으로
`alreadyPurchased`/`freeOrderCompleted` 모달 닫기 로직도 `closeCompletionModal()` 함수로 추출되어
과거 Minor 지적(중복 setState 호출)도 함께 정리됨. cms.api 서버 단일 트랜잭션 제안은 여전히
이상적 개선안으로 백로그 유지(클라이언트 단에서는 충분히 방어됨).

### 17. 도메인 패널 컴포넌트 내부에 raw `<button>` 토글 그룹 인라인 작성 (Major, 2026-07-25 발견)

`PurchaseOptionsPanel.tsx`(신규, `/detail/[slug]` 사이드바)의 플랫폼 옵션 토글 그룹을
`components/ui/`(또는 최소한 `components/products/`의 별도 파일)로 분리하지 않고 raw `<button>` +
`cn()` 조건부 스타일을 패널 컴포넌트 안에 직접 작성함. 코드베이스에는 이미 정확히 같은 패턴("선택
가능한 토글형 버튼 카드")을 별도 파일로 추출한 선례가 존재함 — `components/quote/ui/QuoteSelectCard.tsx`
(raw `<button>`이지만 자체 컴포넌트 파일로 분리되어 재사용/테스트 가능). 이슈 #9(Step04ContactInfo.tsx
등 raw `<button>` 미분리)와 동일한 패턴의 재발.
**Why:** CLAUDE.md/프로젝트 스타일 규칙상 `Toggle`은 명시적으로 아토믹 UI 목록에 포함되어 있고, 1회
사용이라도 `components/ui/`(공통) 또는 `components/[domain]/`(도메인 전용)에 독립 파일로 분리해야
한다. 인라인으로 두면 재사용 불가, 접근성 속성(aria-pressed 등) 누락 위험, 페이지 컴포넌트 비대화로
이어짐.
**How to apply:** 옵션/필터/세그먼트 토글처럼 "선택 상태를 갖는 버튼 그룹" UI를 다루는 diff를 리뷰할
때는 `components/quote/ui/QuoteSelectCard.tsx` 같은 기존 선례가 있는지 먼저 확인하고, raw `<button>`이
컴포넌트 파일 밖(페이지/패널 컴포넌트 내부)에 인라인으로 작성되어 있으면 Major로 보고하며 커밋
판정을 BLOCKED로 내린다. shadcn `toggle-group`(`npx shadcn add toggle-group`) 설치도 대안으로 제안
가능.

### 18. cms.api 미지원 필드(옵션 가격 델타)를 클라이언트가 계산해 그대로 주문 금액으로 전송 — 백엔드 검증 실패 가능성 (Major, 2026-07-25 발견, 사전 합의된 리스크)

`PurchaseOptionsPanel.tsx`의 최종가(`product.price + 구매항목 delta + 플랫폼 delta`)가 `BuyButton`의
`price` prop → `/orders/create`의 `amount`로 그대로 전달됨. `orders/create/route.ts:18`의 주석
"가격 재검증 + 주문 생성은 cms.api가 처리한다"가 사실이라면, cms.api는 아직 옵션/플랫폼 필드를 모르는
상태이므로 `amount !== product.price`(옵션 델타가 0이 아닌 조합)인 요청을 서버가 거부할 가능성이 높음.
**Why:** 이번 작업은 `.claude/plans/mall-goofy-russell.md`에 "UI 먼저 구현, 옵션별 서버 측 가격 검증은
cms.api가 옵션 필드를 지원할 때 후속 과제"로 명시된 사전 합의 사항이라 새로 생긴 취약점은 아님(클라
이언트가 임의 금액을 보내도 cms.api가 재검증하므로 보안 이슈는 아님). 다만 사전 합의가 "몰라도 되는
리스크"가 아니라 "구매하기 버튼이 사실상 깨질 수 있는 기능적 리스크"라는 점은 리뷰에서 반드시 짚어야
한다 — 옵션을 기본값 외로 선택한 실사용자가 결제 시도 시 400/422 에러를 받을 수 있음.
**How to apply:** 이 기능이 실제 배포되기 전 cms.api `/api/v1/orders` POST의 가격 검증 로직이 정확히
어떻게 동작하는지(정확히 `product.price`와 일치해야 하는지, 범위/허용오차가 있는지) 반드시 확인하고,
필요하면 cms.api 쪽에 옵션 필드 지원을 먼저 추가하거나, 최소한 QA에서 "옵션 변경 후 구매하기" 플로우를
실제 cms.api 서버 대상으로 end-to-end 테스트할 것을 권고한다.
**2026-07-25 재검증(후속 커밋)**: 사용자가 이 리스크를 Critical/BLOCKED로 볼지 재판단 요청 →
`.claude/plans/mall-goofy-russell.md`에 "클라이언트가 계산한 금액을 그대로 전송하는 것은 기존
`BuyButton`의 동작 방식(`amount: price`)을 그대로 물려받는 것이며 새로 생기는 신뢰 모델이 아니다.
옵션별 서버 측 가격 검증은 cms.api가 옵션 필드를 지원하게 될 때 후속 과제로 남는다"라고 명시적으로
사전 합의되어 있음을 확인. 코드 결함이 아니라 의도적으로 스코프 아웃된 기능 격차이므로 **Major로
보고하되 BLOCKED 사유로 취급하지 않고 APPROVED(조건부, 트래킹 필요)로 하향 판단**함 — 신규 보안
취약점이 아니고 이미 프로덕션에 있는 BuyButton 신뢰 모델과 동일하며, 문서화된 후속 과제로 추적되고
있기 때문. 이 판단 기준은 "사전에 문서로 합의된 기능 스코프 갭"에 한해 적용하고, 문서화 없이 새로
발견된 유사 리스크는 여전히 기본 원칙대로 Major=BLOCKED로 판정할 것.

### 19. 의존성 교체(패키지 swap) 시 CLAUDE.md/커스텀 에이전트 정의 문서 미동기화 (Major, 2026-07-27 발견)

`iconoir-react` → `lucide-react` 전면 교체 작업(20개 파일, `yarn remove iconoir-react`까지 완료)에서
실제 코드/의존성은 완전히 정확하게 마이그레이션됐으나(전수 grep 검증 결과 이슈 0건), 두 문서가
그대로 남아 정반대 내용을 서술함:

- `CLAUDE.md` "설치된 라이브러리" 표에 `iconoir-react ^7.11.0`이 그대로 남아있고 `lucide-react`는
  표에 없음(실제 package.json에는 반대: lucide-react만 있고 iconoir-react 없음).
- `.claude/agents/nextjs-style-auditor.md`(Step 5 "아이콘 라이브러리 감사")는 "이 프로젝트는
  Iconoir를 표준 아이콘 라이브러리로 사용", "경고 조건: lucide-react와 iconoir-react가 동시에
  import된 파일 → 권장 수정: iconoir-react로 통일"이라고 명시 — 이번 PR이 정확히 반대 방향
  (lucide로 통일)으로 끝냈으므로, 이 에이전트를 다음에 실행하면 방금 완료한 마이그레이션 전체를
  "위반"으로 오탐지하고 되돌리라고 안내하게 됨. 같은 문서의 `cd main && yarn add iconoir-react` /
  `cd admin && yarn add iconoir-react` 예시도 이미 사라진 모노레포(main/admin) 경로를 가리켜 이중으로
  stale함.
  **Why:** `doc_auth_redirect_mismatch`(CLAUDE.md 인증 흐름 서술 불일치)와 동일한 "코드는 고쳤지만
  지침 문서를 안 고쳐서 다음 세션(에이전트 포함)이 잘못된 전제로 작업한다" 패턴. 특히 이번 건은
  커스텀 감사 에이전트가 자동으로 "정답을 반대로" 판정하게 되는 능동적 회귀 위험이 있어 일반 오탈자보다
  심각하다.
  **How to apply:** 아이콘/UI 라이브러리 등 "표준 X 사용" 식으로 CLAUDE.md 또는 `.claude/agents/*.md`에
  못박아 둔 의존성을 교체하는 diff를 리뷰할 때는 반드시 `grep -rln "<구-라이브러리명>" .`(src 뿐 아니라
  `CLAUDE.md`, `.claude/` 전체 포함)으로 전수 검색해 문서 쪽에 남은 반대 서술이 없는지 확인한다.
  남아있으면 Major로 보고 — 코드 자체는 완벽해도 문서/에이전트 지침 동기화 누락은 커밋 판정에서
  BLOCKED 사유로 취급할 것을 권고(다만 최종 판단은 사용자에게 안내, 문서만 남은 갭이라 즉시 함께
  고치는 선에서 충분히 해소 가능).

### 20. Tailwind CSS 변수 기반 색상 + opacity 모디파이어(`/10`,`/50`) 부분 수정 — 근본 원인(tailwind.config.ts) 미해결 (Major, 2026-07-27 발견)

`tailwind.config.ts`의 모든 색상 토큰이 `'var(--x)'`(순수 hex 문자열) 형태로 정의되어 있어
(alpha 채널 삽입용 `rgb(var(--x) / <alpha-value>)` 패턴이 아님), `bg-*/N`, `text-*/N`, `ring-*/N`
등 opacity 모디파이어가 붙은 모든 CSS 변수 기반 유틸리티 클래스가 Tailwind JIT에서 조용히
드롭될 위험을 구조적으로 안고 있다. 회원가입 모달화 PR에서 `ring-foreground/10`(dialog.tsx),
`ring-ring/50`(button.tsx, input.tsx)이 기본 파란색 ring으로 폴백되는 것을 발견해 `ring-black/10`,
`ring-[rgba(255,85,0,0.5)]` 같은 하드코딩 rgba로 3개 파일만 대증 수정했으나, 동일한 근본 원인이
남아있는 다른 파일은 그대로 방치됨:

- `card.tsx:15` `ring-foreground/10`, `card.tsx:87` `bg-muted/50`
- `select.tsx:44` `focus-visible:ring-ring/50`, `select.tsx:86` `ring-foreground/10`
- `button.tsx:20` (destructive variant) `bg-destructive/10 hover:bg-destructive/20 ...`,
  `button.tsx:12` `hover:bg-primary/80`, `dialog.tsx:91` `bg-muted/50`
- **신규 추가된 `LoginForm.tsx:63`, `SignupForm.tsx:248`의 에러 배너
  `bg-destructive/10 ... text-destructive`도 동일 버그 노출** — 이번 PR이 고치려던 바로 그 버그
  패턴을 이번 PR이 새로 만든 파일에 재도입한 셈.
  **Why:** `/main` 링크(#10), 카테고리 라벨 3중 하드코딩(#12)과 동일한 "일부 파일만 grep 없이
  대증 수정하고 종료" 패턴. 이번엔 특히 근본 원인(tailwind.config.ts 색상 정의 포맷)을 고치지
  않고 개별 클래스만 리터럴 rgba로 바꿔서, 앞으로 CSS 변수 기반 토큰에 `/opacity` 모디파이어를
  쓰는 새 코드가 추가될 때마다 계속 재발할 구조적 위험이 남아있다.
  **How to apply:** `ring-|bg-|text-|border-)-(primary|secondary|muted|accent|destructive|foreground
|background|card|popover|border|input|ring)(-foreground)?/[0-9]` 패턴으로 전수 grep해 남은
  occurrence를 확인한다. 근본 해결책은 `globals.css`의 색상 변수를 RGB triplet(`--primary: 255 85 0;`)
  로 바꾸고 `tailwind.config.ts`에서 `primary: { DEFAULT: 'rgb(var(--primary) / <alpha-value>)' }`
  패턴(shadcn/ui 표준 방식)으로 전환해 opacity 모디파이어가 항상 정상 동작하도록 한 번에 고치는
  것 — 개별 클래스를 rgba로 하드코딩하는 대증 요법은 확장성이 없고 재발이 확정적이므로 다음
  라운드에 근본 수정을 제안할 것.

**2026-07-27 재검증(2라운드)**: `LoginForm.tsx`/`SignupForm.tsx`/`input.tsx`/`dialog.tsx`는
1라운드 수정으로 해소. `button.tsx`는 "수정 완료" 보고에도 불구하고 grep 재검증으로
`bg-primary/80`(default variant)·`hover:bg-secondary/80`(secondary variant) — 다크모드와 무관하게
항상 적용되는 클래스 — 누락을 추가로 발견 → 2라운드에서 완전 해소(dark: 전용 3곳도 함께 정리),
`dialog.tsx:91` 하드코딩 rgba도 변경된 `--muted`(#f0eee8)에 재동기화 완료, grep 재확인 결과
`button.tsx` 0건. `card.tsx`/`select.tsx`는 여전히 의도적 스코프 아웃(후속 과제로 추적 유지).
"N건 모두 수정"이라는 보고를 받아도 동일 grep 패턴을 반드시 재실행해 검증하는 절차가 실제 누락을
잡아낸 사례 — 자세한 경위는 [[auth_modal_migration]] 참고.

### 21. 템플릿 리터럴로 className 조합 — cn() 미사용 (Major, 2026-07-28 발견)

`NewsDetailContent.tsx`에서 ``className={`inline-flex ... ${CATEGORY_COLOR[news.category] ??
"bg-gray-100 text-gray-600"}`}`` 형태로 CLAUDE.md가 명시적으로 금지한 템플릿 리터럴 className
조합 패턴을 그대로 사용(100자 초과 라인 동반).
**Why:** CLAUDE.md "className 병합은 반드시 cn() 사용" 규칙 위반. `cn()`은 `clsx` +
`tailwind-merge` 래퍼로 falsy 필터링 + 클래스 병합을 안전하게 처리하는데, 템플릿 리터럴은
이 안전장치 없이 값을 그대로 이어붙여 프로젝트 컨벤션에서 벗어남.
**How to apply:** `className={\`...${cond}...\`}`또는 배열`.join(" ")`패턴을 볼 때마다`cn("...", cond)`형태로 교체 제안. 특히 카테고리/상태별 색상 매핑처럼`Record<string,string>`
값을 문자열에 삽입하는 코드에서 반복 발생 가능성이 높으니 유사 패턴을 grep(`className=\{\``)으로
전수 확인할 것.

### 22. components/ui/ 파일 내부에서도 기존 atomic 컴포넌트(Button) 재사용 없이 raw 태그로 회귀 (Major, 2026-07-28 발견)

`RouteModal.tsx`(components/ui/ 소속)의 닫기 버튼이 raw `<button>`을 사용. 같은 코드베이스의
`components/ui/dialog.tsx`는 동일 목적(닫기 아이콘 버튼)에 이미 `<Button variant="ghost"
size="icon-sm">`를 재사용 중이라 새 컴포넌트가 기존 확립된 관례에서 벗어남.
**Why:** #9/#17(page.tsx/도메인 컴포넌트에 raw button 인라인)과 달리 이번엔 파일 위치
규칙(`components/ui/`)은 지켰지만, "이미 프로젝트에 존재하는 atomic 컴포넌트를 감싸지 않고
다시 raw 태그로 작성"하는 변형된 형태로 재발. 위치만 확인하고 기존 컴포넌트 재사용 여부를
안 보면 놓치기 쉬움.
**How to apply:** `components/ui/` 신규 파일을 리뷰할 때도 raw `<button>`/`<input>` 등이
보이면, 같은 디렉토리의 기존 `button.tsx`/`input.tsx` 등으로 대체 가능한지(ref 전달 가능 여부
포함) 확인한다. 자세한 경위는 [[blog_modal_parallel_routes]] 참고.

### 17-fix. #17 PurchaseOptionsPanel raw button 분리 완료 확인 (2026-07-25)

`src/components/products/PlatformOptionToggle.tsx` 신규 생성 — `QuoteSelectCard.tsx`와 동일 패턴
(label/isSelected/onClick props) + `aria-pressed` 접근성 속성 추가(QuoteSelectCard보다 개선됨).
`PurchaseOptionsPanel.tsx`는 이제 이 컴포넌트를 배열 렌더링만 함(raw `<button>` 없음, grep으로 확인).
이슈 #17 완전 해소.

### 23. #22 패턴 재발 — 같은 PR 안에서도 파일별로 Button 재사용 여부가 엇갈림 (Major, 2026-07-29 발견)

`NewsImageGallery.tsx`(신규, 블로그 상세 이미지 갤러리)의 prev/next 원형 아이콘 버튼 2개가 raw
`<button>` + 거의 동일한 긴 className 중복으로 작성됨. 같은 diff에 포함된 `RouteModal.tsx`(수정)는
정확히 같은 목적(원형 아이콘 버튼, disabled 상태 포함)에 이미 `<Button variant="ghost"
size="icon-sm">`를 정상적으로 재사용 중이라, 한 PR 내부에서도 파일에 따라 관례 준수 여부가 갈림.
**Why:** #22(RouteModal.tsx 최초 도입 시 raw button)와 동일 패턴의 재발이지만 이번엔 다른 파일에서
발생 — "직전에 지적받아 고친 패턴"이 새 파일에는 반영되지 않고 다시 나타남. `Button`의 cva 정의에
내장된 `focus-visible:ring-3 focus-visible:ring-[rgba(255,85,0,0.5)]`가 raw 버튼에는 없어 키보드
포커스 표시가 앱 전체와 달라지는 부수 효과도 있음.
**How to apply:** 원형/아이콘 전용 버튼(prev/next, 닫기, 토글 등)을 다루는 diff를 리뷰할 때는
`grep -rn 'size="icon' src/components/ui`로 기존 Button icon 사이즈 재사용 여부를 먼저 확인하고,
새 파일에 raw `<button>`으로 같은 형태(원형 + 아이콘 + disabled)가 있으면 파일 위치·PR 단위와 무관하게
매번 Major로 보고한다. 자세한 경위는 [[blog_modal_parallel_routes]] 참고.

### 24. 작업 범위를 넘어선 콘텐츠 렌더링 변경 — 요청되지 않은 기존 데이터 전체에 소급 적용 (Major, 2026-07-29 발견)

블로그 상세에 `portfolio_images` 필드 기반 갤러리를 "추가"하는 작업 범위였으나, 실제 구현
(`NewsDetailContent.tsx`의 `splitImagesFromContent`)은 본문 HTML의 모든 `<img>` 태그를 무조건 제거해
`portfolio_images`와 합쳐 하단 갤러리로 옮기도록 구현됨 — 새 필드를 쓰지 않는 과거 발행 게시물까지
포함해 본문 중간에 삽입돼 있던 이미지가 전부 원래 위치에서 사라지고 페이지 맨 아래로 재배치되는
소급 동작 변경. 원본 `<img alt="...">`(sanitizeHtml이 허용하는 속성)도 정규식이 src만 추출하므로
유실되어 제네릭 alt(`${title} 이미지 ${idx+1}`)로 대체됨.
**Why:** 사용자가 설명한 작업 배경(새 필드 활용 갤러리 추가)에 명시되지 않은 범위의 변경이 조용히
포함되어, 리뷰 시 "설명된 스코프"만 보고 diff 전체를 안 읽으면 놓치기 쉬운 유형. 카테고리 라벨
3중 하드코딩(#12), `/main` 링크(#10)처럼 "부분적으로만 확인하고 넘어가면 재발"하는 패턴과는 결이
다르지만, "작업 배경 설명과 실제 diff 동작이 일치하는지 항상 대조 검증"해야 한다는 교훈은 동일.
**How to apply:** 사용자가 제공한 "작업 맥락" 설명과 실제 diff의 동작 범위(신규 필드만 다루는지,
기존 데이터 처리 로직까지 바꾸는지)를 반드시 1:1 대조한다. 신규 필드 하나를 추가하는 작업인데
기존 필드(본문 content 등)의 파싱/렌더링 로직까지 함께 바뀌어 있으면, 그 변경이 사전 합의된 것인지
사용자에게 명시적으로 확인 요청하고 Major로 보고한다.

### 26. 마운트 시 자동 재조회(useEffect fetch)와 사용자 액션(클릭 토글)의 응답 순서 역전 — 낙관적 업데이트가 stale 응답에 덮어써짐 (Major, 2026-07-31 발견)

`LikeButton.tsx`(신규, 상품 상세 좋아요 버튼)가 마운트 시 `GET /products/like`로 실제
`liked_by_me`/`like_count`를 재조회하면서, 응답 콜백에 `cancelled`(언마운트 전용) 가드만 걸어둠.
사용자가 이 GET 응답이 도착하기 전에 하트를 클릭하면 `POST /products/like`가 별도로 실행되고
낙관적 업데이트 → 서버 확정값으로 상태가 갱신되는데, 만약 먼저 시작된 GET 요청이 네트워크 지연 등의
이유로 POST보다 나중에 resolve되면 GET의 `.then`이 아무 순서 체크 없이 최신(올바른) 상태를
클릭 이전의 stale 값으로 덮어쓴다. 최종 화면 상태가 실제 DB/cms.api 상태와 어긋난 채로 남고,
새로고침 전까지 복구되지 않는다.
**Why:** "마운트 시 1회 상태 동기화 fetch" + "사용자 액션 기반 낙관적 업데이트"가 같은 컴포넌트에
공존할 때, 두 비동기 흐름 중 하나만 언마운트 가드를 갖고 서로의 완료 순서를 인지하지 못하면
전형적인 race condition이 발생한다. 언마운트 취소만으로는 "마운트된 채로 순서가 뒤바뀌는" 케이스를
막지 못한다는 게 이번 사례에서 드러난 함정.
**How to apply:** 마운트 시 자동 재조회 + 클릭 등 사용자 액션이 같은 로컬 상태를 갱신하는 컴포넌트를
리뷰할 때는, 두 요청이 언마운트 여부와 무관하게 "먼저 시작된 것이 나중에 끝나는" 순서 역전 시나리오를
반드시 검토한다. 해결책은 (a) 클릭 시점에 `hasInteractedRef.current = true`로 표시해두고 마운트
fetch의 `.then`에서 이 플래그가 서면 상태 갱신을 스킵하거나, (b) AbortController/요청
세대(generation) 카운터로 최신 요청의 응답만 반영하도록 순서를 강제하는 것. 자세한 경위는
[[like_button_race_condition]] 참고.

### 27. PurchaseOptionsPanel 각 분기(무료/문의전용/일반)에 동일한 "flex 래퍼 + LikeButton" 구조 3회 반복 (Major, 2026-07-31 발견)

`PurchaseOptionsPanel.tsx`의 무료/문의전용/일반 3개 분기 각각에서 `<div className="flex
gap-3"><div className="flex-1">{주요 CTA}</div><LikeButton productId={...} productSlug={...}
initialLikeCount={product.like_count ?? 0} /></div>` 형태의 동일한 마크업+props 조합이 3곳에
그대로 복사되어 있음(CTA만 BuyButton/Button으로 다름).
**Why:** CLAUDE.md/code-reviewer 스타일 규칙상 "위젯 단위 UI 중복(2곳 이상 반복)"은 Major →
BLOCKED 판정 대상. 3개 분기 모두에서 `product.like_count ?? 0` 폴백과 `productId`/`productSlug`
prop 조합이 동일하게 반복되므로, 향후 LikeButton에 prop이 추가되거나 래퍼 스타일이 바뀔 때 3곳
중 한 곳을 누락하기 쉬운 구조(#10/#12/#15와 동일한 "grep 없이 일부만 고치는" 재발 위험의 전조).
**How to apply:** CTA 버튼 + LikeButton을 감싸는 `flex gap-3` 행을 별도 헬퍼 컴포넌트(예:
`PrimaryActionRow`) 또는 최소한 `<LikeButton product={product} />`처럼 `product` 객체 하나만
받는 형태로 추출해 3곳의 반복을 줄이도록 제안. 자세한 경위는 [[like_button_race_condition]] 참고.

### 25. 비즈니스 모델 전환 시 약관(용어의 정의) 조항만 grep 없이 누락 — 본문 조항은 갱신, 정의 조항은 방치 (Major, 2026-07-30 발견)

디지털 상품 즉시 다운로드 판매 → 제작/상담 진행형 서비스로 비즈니스 모델을 전환하며
`terms/page.tsx` 제4조(서비스 제공)·제8조(청약철회)는 "웹 템플릿 제작 및 판매", "제작(용역)
제공이 개시된 경우"로 정확히 갱신됐으나, 같은 파일의 **제2조④(용어의 정의)**는 옛 문구
("회사가 판매하는 악보, 가이드, 음원 파일 등 디지털 형태로 제공되는 재화")를 그대로 남겨둠 —
제4조/제8조가 언급하는 "디지털 콘텐츠"가 실제로는 제2조에서 다른 상품군으로 정의되어 있는
내부 모순 발생.
**Why:** `/main` 링크(#10), 카테고리 라벨 3중 하드코딩(#12), CLAUDE.md/에이전트 문서(#19)와
동일한 "일부 조항만 grep 없이 고치고 종료" 패턴의 변형. 법률 문서에서는 특히 "정의" 조항이
다른 모든 조항의 해석 기준이 되므로, 정의만 옛날 그대로 남으면 본문 조항 개정의 실효성 자체가
흔들릴 수 있다.
**How to apply:** 이용약관/개인정보처리방침처럼 여러 조항이 서로 참조하는 법률 문서를 리뷰할
때는 "용어의 정의" 조항을 반드시 별도로 대조 확인한다 — 본문 조항(제3조 이후)만 읽고 앞부분
정의 조항을 건너뛰기 쉽다. 상품/서비스 유형이 바뀌는 diff에서는 정의 조항 전체를 항상
재확인. 자세한 경위는 [[download_feature_removed]] 참고.

### 28. 신규/전면 재작성 컴포넌트에 raw `<button>` 재도입 — 근처에 이미 Button 컴포넌트 사용 예시가 있어도 재발 (Major, 2026-08-06 발견)

`QuoteFloatingButton.tsx`를 알약형에서 레이어드 배너 스타일로 전면 재작성하면서 새로 추가된
"오늘 그만보기"/"닫기" 두 개의 dismiss 버튼이 `components/ui/button.tsx`(이미 프로젝트 전역에서
사용 중, `variant="link"`/`variant="ghost"` + `className`으로 텍스트형 버튼도 충분히 표현 가능)를
쓰지 않고 raw `<button type="button">`으로 작성됨.
**Why:** #9/#17/#22/#23과 동일한 "아토믹 UI 컴포넌트 미분리" 패턴의 반복. 이번엔 전면 재작성
(리팩터링이 아니라 새로 그리는 컴포넌트)이었다는 점에서 "기존 코드라 넘어간다"는 예외가 적용될
여지도 없음 — 새로 작성하는 순간이 규칙을 지킬 수 있는 가장 쉬운 시점인데도 놓침.
**How to apply:** 플로팅 배너/카드형 CTA 컴포넌트를 새로 작성하거나 전면 재작성하는 diff에서
"닫기"/"더보기"/"오늘 그만보기" 같은 보조 액션 텍스트 버튼이 보이면, 먼저 `Button
variant="link"`(또는 `ghost` + 커스텀 className)로 대체 가능한지 확인하고 raw `<button>`이면
Major로 보고한다.
**2026-08-07 재검증**: `QuoteFloatingButton.tsx:69-82`가 `Button variant="link"`로 수정되어
해소 확인(최종 커밋 824d3ac 기준 이미 Button 사용 중, grep 결과 raw `<button>` 없음).

### 29. Swiper 섹션 헤더(h2+배지+서브텍스트) 신규 파일 작성 시 기존 컴포넌트 마크업 복제 — SwiperSectionHeader 추출로 해소 (Major, 2026-08-06 발견 → 같은 날 재검증 APPROVED)

메인페이지 "이런 분들에게 추천드립니다" 섹션을 `/about`에서 이동하면서 `PortfolioSwiper.tsx`에
"포트폴리오" 타이틀+오렌지 배지+서브텍스트 헤더를 신규 추가했는데, 같은 프로젝트의
`BlogSwiper.tsx`에 이미 있던 동일 헤더 마크업(배지 className까지 글자 단위로 동일)을 파일만 바꿔
그대로 복제함. "일관성을 맞추기 위해 재사용"이라는 의도 자체는 좋았으나 실제로는 공용 컴포넌트로
추출하지 않고 두 파일에 나란히 하드코딩.
**Why:** CLAUDE.md "위젯 단위 UI 중복(2곳 이상 반복)" Major → BLOCKED 규칙에 정확히 해당. 좌우
패딩(`lg:px-[40px]` vs `lg:px-[60px]`)이 이미 두 파일 간에 어긋나 있었던 것도 하드코딩 복제의
직접적 증거.
**How to apply:** "다른 파일에 있는 패턴을 재사용해서 일관성을 맞췄다"는 설명을 볼 때마다 실제로는
import해서 재사용했는지, 마크업을 손으로 다시 타이핑/복사했는지 diff에서 반드시 확인한다. 후자면
Major로 보고하고 공용 컴포넌트 추출을 요구한다.
**2026-08-06 재검증(같은 날)**: `src/components/ui/SwiperSectionHeader.tsx` 신규 생성
(`title`/`badgeLabel`/`subtitle`/`actions`/`paddingClassName` props, `components/ui/`에 배치 —
도메인 무관이라 `shared` 계층 기준에 부합)으로 완전히 해소. `PortfolioSwiper.tsx`/`BlogSwiper.tsx`
양쪽이 이를 재사용하고, `actions` prop으로 Blog의 이전/다음 버튼도 정상 이전됨. 패딩값(40px/60px)은
통일하지 않고 각자 `paddingClassName`으로 유지했는데, 이는 "헤더-헤더 외부 일관성보다 헤더-본문
내부 정렬 일관성 우선"이라는 명시적 판단이자 하드코딩 복제가 아닌 prop 오버라이드이므로 문제
없음 — `.claude/rules/shared-component-changes.md`의 "호출부만 예외적으로 다른 값이 필요한 경우"
케이스에 해당. 부수적으로 raw `text-black`/`text-black/50`도 `text-gf-black`/`text-gf-gray2`
토큰으로 함께 정리됨. 앞으로 세 번째 Swiper 섹션이 추가되면 이 컴포넌트를 재사용하는지 확인할 것.

### 30. 같은 섹션 배경색을 카드 컴포넌트 배경색과 동일하게 지정 — 카드 시인성 저하 (Major, 2026-08-06 발견 → 같은 날 재검증 해소)

`page.tsx`의 "이런 분들에게 추천드립니다" 섹션을 `/about`에서 이동하며 배경을 `bg-gf-bg`로
지정했는데, `.gf-feature-card`(전역 CSS)의 배경도 `var(--gf-bg)`로 완전히 동일한 값이라 카드가
섹션 배경에 거의 묻혀 보이는 문제 발생. 동일 카드 컴포넌트를 쓰는 `about/page.tsx`의 "GOSPELFIX가
하는 일" 섹션은 `bg-white`를 써서 정상적으로 대비됨 — 이동 과정에서 정확히 그 배경색 설정만
빠뜨림.
**Why:** `.gf-feature-card`처럼 배경색이 고정된 공용 컴포넌트를 재사용할 때는 그 컴포넌트가
어떤 배경 위에서 설계됐는지(`bg-white` 위) 확인하지 않고 다른 배경(`bg-gf-bg`)에 얹으면 시각적
결함이 생긴다. 히어로와의 경계 문제(둘 다 `bg-gf-bg`)를 `border-t`로만 땜질하려다 발생한
부작용.
**How to apply:** `gf-feature-card`/`gf-section-*` 같은 배경색이 고정된 전역 CSS 클래스를 새
섹션에 쓸 때는 반드시 그 섹션의 `bg-*`와 카드 배경이 동일한 토큰이 아닌지 대조 확인한다.
**2026-08-06 재검증**: 섹션 배경을 `bg-gf-bg border-t` → `bg-white border-b border-gf-border`로
변경(about 페이지의 기존 선례와 동일한 해법). 카드(`gf-bg`)-배경(`white`) 대비 정상 확보,
히어로와의 경계도 색상 차이로 자연스럽게 해결됨. `border-b`는 바로 아래 포트폴리오 섹션도
`bg-white`라 그 경계용으로 유지 — 타당함.

### 31. "100% 동일 중복 블록"만 추출하고 그 바깥 셸(래퍼) 중복은 방치 — 부분적 위젯 추출 (Major, 2026-08-07 발견)

`PaymentModal.tsx`/`BatchPaymentModal/index.tsx`의 QR+계좌정보 블록(진짜 글자 단위로 100%
동일)을 `AccountTransferCard.tsx`로 정확히 추출했으나, 그 블록을 감싸던 모달 셸(백드롭,
헤더, 닫기버튼, 버튼그룹, 완료화면 — ~~55~~60줄)은 두 파일에 그대로 남아있음. "가장 눈에 띄게
동일한 부분"만 추출하고 나머지 반복은 "props가 조금 다르니까"라는 이유로 넘어가기 쉬운
패턴 — #29(SwiperSectionHeader 추출 전 상태)와 유사하지만, 이번엔 부분 추출 후 나머지를
방치했다는 점이 다름.
**Why:** 중복 여부 판단 기준은 "완전히 동일한가"가 아니라 "같은 목적의 마크업+스타일이
props만 바꿔 2곳 이상에서 반복되는가"([[code-reviewer.md]] Major 기준)여야 한다. 100% 동일한
부분만 골라 추출하면 리뷰어도 "일부는 이미 고쳤으니 충분하다"고 오판하기 쉽다.
**How to apply:** 위젯 중복을 리뷰할 때는 추출된 공용 컴포넌트를 감싸는 나머지 마크업까지
diff로 나란히 놓고 비교한다. 감싸는 셸이 여전히 대부분 동일하면(차이가 props로 흡수 가능한
수준이면) 추가 추출을 요구할 것 — 자세한 경위는 [[cart_batch_checkout_feature]] 2차
재검증(2026-08-07) 참고.
**2026-08-07 3차 재검증(같은 날)**: `PaymentInstructionModal.tsx` 신규 추출로 완전 해소.
`done`/`loading`/`onConfirm`/`onClose`/`onGoToMypage` prop + `children`(실제로 내용이 다른
입금 금액 카드만) 구조로 셸 전체를 공용화 — "부분 추출 후 방치"에서 "완전 추출"로 정확히
교정된 사례. 다음에 비슷한 패턴(공용 컴포넌트 추출 시 감싸는 셸을 남겨두는 것)을 볼 때 이
성공 사례를 해결 템플릿으로 참고할 것.

### 32. #9/#17/#22/#23/#28 패턴 재발 — AccountTransferCard 계좌번호 복사 버튼도 raw `<button>` (Major, 2026-08-07 발견)

`AccountTransferCard.tsx`(같은 세션에서 이미 공용 컴포넌트로 추출되어 승인된 파일)에 신규
추가된 계좌번호 복사 버튼이 `components/ui/button.tsx`(같은 파일이 속한
`PaymentInstructionModal.tsx`에서 바로 옆에 정상적으로 사용 중)를 쓰지 않고 raw
`<button type="button">` + `cn()` 조건부 className으로 작성됨. `ShareButton.tsx`가 정확히
같은 "아이콘+커스텀 pill 모양" 요구사항을 `<Button variant="ghost" size="icon" className="rounded-full ...">`
패턴으로 해결한 선례가 이미 존재.
**Why:** #9/#17/#22/#23/#28과 동일한 "아토믹 UI 컴포넌트 미분리" 패턴. 이번엔 특이하게도 같은
파일(`AccountTransferCard.tsx`)이 몇 시간 전 리뷰에서 위젯 중복 이슈로 APPROVED된 직후, 같은
파일에 신규 기능(복사 버튼)을 추가하면서 재발함 — "이미 검증된 파일이니 안전하다"는 방심이
새로운 코드 추가 시점에는 적용되지 않는다는 것을 보여줌.
**How to apply:** `AccountTransferCard.tsx`류의 "이미 승인된 파일"에 후속 커밋으로 UI 요소가
추가될 때도 새로 추가되는 인터랙티브 엘리먼트(`<button>`, `<input>` 등)가 raw 태그인지 항상
재확인한다. 특히 이번처럼 아이콘+텍스트+토글 상태를 가진 버튼은 `ShareButton.tsx`(아이콘 버튼)
또는 `PlatformOptionToggle.tsx`(토글) 같은 기존 선례와 대조해 `Button`/`buttonVariants()`로
대체 가능한지 확인할 것. 커밋 판정 BLOCKED 대상.
**2026-08-07 재검증**: `AccountTransferCard.tsx:60-72`가 `Button type="button" variant="ghost"`로
수정되어 해소 확인(최종 커밋 ce16208 기준 이미 Button 사용 중, grep 결과 raw `<button>` 없음).

### 34. `style=`가 아닌 다른 prop 이름(customStyle 등)으로 정적 인라인 스타일 객체를 주입 — "style=" 문자열 grep으로는 잡히지 않는 변형 (Critical, 2026-08-11 발견 → 같은 날 재검증 해소)

`CodePreviewSection.tsx`(신규, react-syntax-highlighter 기반 코드 미리보기)가
`<SyntaxHighlighter customStyle={{ margin: 0, borderRadius: 0, maxHeight: "20rem", fontSize:
"13px" }}>`로 정적 CSS 값을 인라인 객체로 주입함. `style={{`라는 리터럴 문자열이 아니라
서드파티 라이브러리 고유 prop 이름(`customStyle`)을 썼기 때문에 `grep -n "style={{"` 같은
기계적 검색으로는 걸리지 않는 변형이었음.
**Why:** CLAUDE.md의 "인라인 style= 금지" 규칙의 의도는 "정적으로 표현 가능한 CSS를 Tailwind
className 대신 객체로 주입하지 말라"는 것이지, 리터럴 prop 이름 `style`에 한정된 것이 아님.
`node_modules/react-syntax-highlighter/dist/esm/highlight.js`를 직접 열어 `rest.className`이
`<pre>` 태그로 그대로 포워딩됨을 확인한 결과, `customStyle` 없이도 `className`만으로 완전히
동일하게 동작함이 증명됨 — 즉 정당한 예외(dnd-kit처럼 런타임 계산값)가 아니라 순수히 회피
가능한 위반이었음.
**How to apply:** 서드파티 라이브러리를 감싸는 신규 컴포넌트를 리뷰할 때는 `style=` 리터럴
문자열 검색에만 의존하지 말고, 그 라이브러리가 제공하는 `customStyle`/`contentStyle`/
`wrapperStyle` 등 "Style"로 끝나는 모든 prop에 정적 값(런타임에 계산되지 않는 고정 숫자/문자열)이
들어가 있는지 확인한다. 정적 값이면 먼저 해당 라이브러리 소스에서 `className`을 그대로
포워딩하는지 확인(대부분의 성숙한 React 라이브러리는 `rest.className`을 마지막 DOM 요소에
합치는 패턴을 씀) 하고, 포워딩된다면 Tailwind className으로 교체를 요구한다. 진짜
런타임 계산값(예: 라이브러리가 강제하는 테마 객체처럼 Tailwind로 원천적으로 표현 불가능한
값)만 예외로 인정하고, `@dnd-kit` 사례처럼 반드시 주석으로 예외 사유를 명시하게 한다.
**2026-08-11 재검증(같은 날)**: `customStyle={{...}}` → `className="m-0 max-h-80 rounded-none
text-[13px]"`로 교체 확인(react-syntax-highlighter v15/v16 모두 `highlight.js`의
`rest.className` 포워딩 동일 동작 재확인). `style={oneDark}`(Prism 토큰별 컬러 매핑, Tailwind로
표현 불가능한 진짜 예외)에는 `// react-syntax-highlighter 테마 객체(Prism 토큰별 컬러 매핑) —
style= 예외 허용` 주석이 추가되어 dnd-kit과 동일한 문서화 관례를 따름. 완전 해소.
자세한 경위는 [[code_preview_section_review]] 참고.

### 35. #9/#17/#22/#23/#28/#32/#33 패턴 재발 — ReferralCodeCard 플로팅 배너 닫기(X) 버튼도 raw `<button>` (Major, 2026-08-12 발견)

`ReferralCodeCard.tsx`(원래 스타일 위반 0건으로 승인됐던 파일)가 고정 위치 플로팅 배너로
재구현되며 추가된 닫기(X) 버튼이 `AlertAction` 안에서 raw `<button type="button">` +
`size-6 rounded-full border border-white bg-gf-black`로 작성됨. `dialog.tsx`/
`RouteModal.tsx`/`AccountTransferCard.tsx`가 이미 같은 목적에 `Button variant="ghost"
size="icon-sm"`를 재사용 중인 확립된 선례가 있음.
**Why:** "이미 스타일 위반 0건으로 승인된 파일"도 후속 세션에서 새 인터랙티브 기능(닫기/토글
등)이 추가되면 raw button이 재발할 수 있다는 것을 보여준 7번째 사례(#32와 동일 유형 — 승인된
파일에 신규 기능 추가 시 재검증 필요).
**How to apply:** 이미 승인 이력이 있는 파일이라도 diff에 새 `<button>`이 추가되면 항상
raw 태그 여부를 재확인한다. 자세한 경위는 [[referral_review_reward_coupon_feature]] 참고.

### 36. #9/#17/#22/#23/#28/#32/#33/#35 패턴 재발 — 예약 쇼케이스 신규 파일 3곳에 동시에 raw `<button>` 토글/칩 (Major, 2026-08-17 발견)

`ReservationFormPanel.tsx`(서비스 선택 pill), `ReservationFeedPanel.tsx`(예약 상태 변경 pill),
`CustomerSearchPanel.tsx`(고객 이름 quick-chip) 세 파일이 각각 `raw <button>` + `cn()`으로
동일한 "선택 가능한 pill 버튼" 패턴을 반복 작성함. `components/quote/ui/QuoteSelectCard.tsx`,
`components/ui/Tab.tsx`라는 정확히 같은 목적의 기존 선례가 있는데도, 새 기능 하나 안에서만
9번째 재발이 3곳 동시에 발생.
**Why:** 반복 목록이 이렇게 길어졌는데도 새 파일을 작성할 때마다 재발한다는 것은, "아토믹 UI
분리"가 코드 리뷰 이후 개별 커밋에서만 교정되고 다음 신규 기능에는 반영되지 않는 구조적 습관임을
시사한다. 이번엔 특히 한 기능 안에서 3곳이 동시에 나타나 위젯 중복(2곳 이상 반복) 규칙까지
같이 위반.
**How to apply:** 새 파일에서 "선택 상태를 가진 버튼 그룹"을 볼 때마다 raw button 여부를 최우선
확인하고, 공용 `Chip`/`PillToggle` 컴포넌트(`components/ui/`)로 추출해 여러 신규 파일이 처음부터
재사용하도록 요구한다. 자세한 경위는 [[reservation_ai_showcase_feature]] 참고.

### 37. 라이브 라우트 리네이밍 시 이전 경로 영구 리다이렉트(next.config.mjs redirects) 누락 (Major, 2026-08-21 발견)

`/mall` → `/growth` 전체 경로 리네이밍(폴더 `git mv`, 13개 파일의 하드코딩 문자열 치환,
`MALL_PATHS`/`isMall`/`MALL_NAV_ITEMS` 등 내부 식별자까지 전부 정확히 갱신됨 — 앱 내부
일관성은 grep 전수 검증 결과 0건 누락)이 완료됐으나, `next.config.mjs`의 `redirects()`에는
`www.` 호스트 표준화 규칙만 있고 `/mall` → `/growth` 리다이렉트가 없음. `/mall`은
`docs/PRD.md`/`docs/ROADMAP.md`에 이미 존재 기능으로 문서화되어 있던 라이브 프로덕션
라우트라, 이번 리네이밍으로 해당 URL을 북마크했거나 검색엔진에 인덱싱된 외부 사용자는
`/mall` 접근 시 그대로 404를 받는다.
**Why:** `/main` 링크 미수정(#10)이 "새 코드에 옛 경로가 남아 404"였다면, 이번 건은
반대로 "옛 경로 자체가 사라지면서 그 경로를 향한 외부 참조가 404"가 되는 것 — 내부
grep으로는 절대 잡히지 않는(코드베이스 안에는 `/mall` 참조가 이미 0건이므로) 새로운
유형의 리스크. 내부 일관성 검증만으로는 "이전 URL이 살아있어야 하는가"라는 질문에
답하지 못한다.
**How to apply:** 이미 배포되어 외부에 노출된(SEO 인덱싱, 공유 링크, 마케팅 자료 등)
라우트를 리네이밍하는 diff를 리뷰할 때는 내부 링크 정합성(grep 전수 검색)과는 별도로
`next.config.mjs`의 `redirects()`에 `{ source: "/구경로/:path*", destination:
"/신경로/:path*", permanent: true }`가 추가됐는지 항상 확인한다. 신규 기능 라우트(아직
외부에 노출된 적 없음)라면 리다이렉트가 불필요하므로, 먼저 "이 라우트가 실제로
서비스된 적이 있는가"(docs/PRD.md, ROADMAP.md, git log 등)를 판단 기준으로 삼는다.

### 38. #19 패턴 재발 — llms.txt/public/llms.txt가 삭제된 컴포넌트·리네임된 필드를 그대로 서술 (Major, 2026-08-24 발견)

`demo_url`(iframe 라이브 미리보기) → `banner_image_url`(정적 배너 이미지) 전환 작업에서
`DevicePreviewFrame.tsx`를 삭제하고 `Product.demo_url` 필드를 제거했으나, AI 크롤러/에이전트용
공개 문서인 루트 `llms.txt:197`(`components/products/{ProductCard,CategoryFilter,
DevicePreviewFrame}.tsx`)과 `public/llms.txt:40`(products 테이블 필드 목록에 `demo_url` 그대로
나열, `banner_image_url` 미포함)가 갱신되지 않음.
**Why:** #19(CLAUDE.md/커스텀 에이전트 문서 미동기화)와 동일한 "코드는 정확히 고쳤지만 문서를
안 고쳐서 다음 세션(사람이든 에이전트든, 이번엔 특히 llms.txt를 소비하는 외부 AI 크롤러까지)이
존재하지 않는 컴포넌트/필드를 실재한다고 믿게 되는" 패턴. `llms.txt`는 CLAUDE.md보다 더 넓은
독자(외부 LLM 크롤러)를 대상으로 하므로 드리프트의 파급 범위가 크다.
**How to apply:** 컴포넌트 파일을 삭제하거나 `types/*.types.ts`의 필드명을 바꾸는 diff를 리뷰할
때는 `grep -rln "<삭제/변경 대상 이름>" .`을 src뿐 아니라 저장소 루트(`llms.txt`,
`public/llms.txt`, `README.md`, `docs/`)까지 포함해 전수 검색한다.
**2026-08-24 재검증**: `llms.txt`/`public/llms.txt` 두 곳 모두 즉시 수정되어 해소 확인,
APPROVED. `README.md`의 `demo_url TEXT`는 이번 diff와 무관한 훨씬 오래된 별개의 레거시 SQL
스키마 섹션(monorepo 시절 서술 전체가 outdated) 전체 문제라 이번 판정에서 분리해 다룸 — 별도
후속 과제로 백로그 가능.

### 39. #19/#38 패턴 재발 — PublicHeader.tsx 삭제 후 llms.txt만 갱신 누락 (Major, 2026-08-24 발견 → 같은 세션 즉시 수정)

`components/layout/PublicHeader.tsx`(하단/상단 고정 pill 헤더)를 완전히 삭제하고 그 역할을
`TopBar.tsx`(히어로 오버레이 라우트용 `MorphingHeader` + 그 외 라우트용 `CompactNav`로 통합)로
흡수하는 마이그레이션에서, src 전체(grep 결과 0건)는 완벽히 정리됐으나 루트 `llms.txt:199`
(`components/layout/{PublicHeader,Footer,LeftSidebar,NavPopover,CookieConsentBanner}.tsx`)만
옛 파일명을 그대로 나열. `public/llms.txt`는 애초에 layout 컴포넌트 목록이 없어 해당 없음.
**Why:** #19(CLAUDE.md/에이전트 문서)·#38(demo_url/DevicePreviewFrame)과 동일한 "컴포넌트
삭제·리네임 시 llms.txt 갱신 누락" 패턴의 세 번째 발생 — 이 프로젝트에서 파일 삭제/리네임을
동반하는 diff는 llms.txt 갱신을 거의 매번 빠뜨린다고 보고 우선순위 높게 확인할 것.
**How to apply:** 컴포넌트 파일을 삭제/리네임하는 diff를 리뷰할 때는 src 전수 grep과 별개로
반드시 `grep -n "<삭제된 파일명>" llms.txt public/llms.txt`도 실행한다.
**2026-08-24 재검증**: code-reviewer가 리뷰 중 직접 `llms.txt:199`를
`{TopBar,Footer,LeftSidebar,NavPopover,CookieConsentBanner}.tsx`로 수정, 해소 확인.

### 33. #9/#17/#22/#23/#28/#32 패턴 재발 — Footer.tsx 신규 아코디언 토글도 raw `<button>` (Major, 2026-08-10 발견)

`Footer.tsx`에 신규 추가된 "Information"(사업자정보) 아코디언 열기/닫기 토글이
`components/ui/button.tsx`를 쓰지 않고 raw `<button type="button">` + `aria-expanded`로
작성됨. 프로젝트에 아직 Accordion/Collapsible 전용 컴포넌트가 없으므로 최소한
`<Button variant="ghost">` + className 오버라이드로 감싸야 한다.
**Why:** 여섯 번째로 반복되는 동일 패턴 — 새 파일(Footer.tsx는 이번이 최초 아코디언 UI
도입)에서도 raw button이 기본값처럼 작성되는 경향이 강하다.
**How to apply:** 아코디언/토글/디스클로저 UI를 다루는 diff를 볼 때마다 열기/닫기 트리거가
`<button>` raw 태그인지 최우선 확인. 자세한 경위는 [[coupon_feature_cart_leak]] 참고.

### 40. #13 패턴 재발 — 페이지 전면 재설계 시 `loading.tsx` 스켈레톤 완전 미동기화 (Major, 2026-08-25 발견)

`/growth` 페이지를 "여러 섹션 랜딩" → "왼쪽 고정 사이드바 + 상단 검색바 + 카드형 히어로
캐러셀 + 언더라인 카테고리 탭" 레이아웃으로 전면 재작성(`GrowthShell`/`GrowthSidebar`/
`GrowthTopBar`/`HeroCarousel`/`CategoryTabs` 신규)했는데, `src/app/(public)/growth/loading.tsx`는
옛 레이아웃 그대로 방치됨 — 사이드바 여백(`lg:pl-[220px]`)이 전혀 없어 스켈레톤이 풀블리드로
렌더되고, 히어로 스켈레톤은 옛 전체화면 단일 배너(`min-h-[clamp(420px,55vw,680px)]`) 형태라 신규
카드형 캐러셀과 높이/형태가 전혀 다르며, 이제 존재하지 않는 "ticker 스켈레톤" 블록이 남아있고,
카테고리 필터 스켈레톤도 옛 pill 버튼 5개(`h-9 w-20 rounded-full`) 형태로 신규 언더라인 탭 4개와
무관함. 섹션 패딩도 `px-6 lg:px-[60px] py-14`로 실제 페이지(`px-6 py-10 lg:px-10`)와 어긋남.
**Why:** #13(카드 비율 변경 시 loading.tsx 아spect 미동기화)과 동일 클래스의 버그가 "부분
치수 변경"이 아니라 "전면 레이아웃 재설계" 규모로 재발한 사례 — 스켈레톤을 완전히 잊고 실제
콘텐츠만 새로 그리면, 매 네비게이션마다 로딩 중 풀블리드 화면 → 사이드바 포함 화면으로 크게
튀는 극심한 CLS가 발생한다. 페이지를 부분 수정할 때보다 전면 재작성할 때 오히려 `loading.tsx`를
놓치기 쉽다(비교 대상이 옛 페이지 전체라 "이미 다르니 신경 안 씀"으로 넘어가기 쉬움).
**How to apply:** `page.tsx`의 최상위 레이아웃 구조(래퍼 클래스, 사이드바/헤더 유무, 섹션
패딩)를 바꾸는 diff를 리뷰할 때는 반드시 같은 라우트 세그먼트의 `loading.tsx`를 나란히 열어
최상위 래퍼 구조가 일치하는지 확인한다. 특히 "부분 치수 변경"뿐 아니라 "레이아웃 셸 자체가
바뀌는" 대규모 재설계에서는 `loading.tsx`를 아예 실제 컴포넌트 트리 구조(사이드바 자리 포함)에
맞춰 새로 그려야 한다.
**해소 확인 (2026-08-25 재검증)**: fetch와 무관한 실제 컴포넌트(`GrowthShell`,
`HeroCarousel`, `CategoryTabs`, `FilterDropdown`×2)를 loading.tsx가 그대로 재사용하고 상품
카드 그리드만 스켈레톤으로 남기는 방식으로 재작성 — page.tsx와 최상위 래퍼부터 섹션
패딩까지 구조적으로 완전히 일치함을 확인, APPROVED. `CategoryTabs`에는 `loading.tsx`가
`searchParams`를 props로 받을 수 없어 `currentCategory=""`(항상 비활성)를 전달하는데, 이는
문자열 비교라 타입/런타임 에러 없이 안전하게 동작함. 이 방식(fetch 무관 실제 컴포넌트를
loading.tsx가 그대로 재사용)은 "다음에 레이아웃이 또 바뀌어도 loading.tsx가 자동으로
따라간다"는 이점이 있어, 향후 유사 사례에서도 스켈레톤을 손으로 새로 그리기보다 우선
권장할 만한 패턴으로 참고.

### 41. 컴포넌트 삭제 시 그 컴포넌트 전용 `globals.css` 유틸리티/`@keyframes`가 고아로 남음 (Minor, 2026-08-25 발견)

`HeroBanner.tsx` 삭제(→ `HeroCarousel.tsx`로 대체) 후 `globals.css`의 `@keyframes ticker`,
`.hero-timer-circle`/`@keyframes hero-timer`, `.grain-texture`(주석에 "HeroBanner 유틸리티"라고
명시)가 src 전체에서 더 이상 어디서도 참조되지 않는 고아 CSS로 남음(`grep -rn` 결과 정의부
외 occurrence 0건).
**Why:** #19/#38/#39(문서 드리프트)와 같은 계열이지만 대상이 `globals.css`라는 점이 다르다 —
컴포넌트 삭제 리뷰 시 보통 `.tsx`/`.ts` import 잔존만 grep하고, 그 컴포넌트가 전역 CSS에
등록해둔 전용 클래스/애니메이션까지는 놓치기 쉽다. 번들 크기에 미치는 영향은 미미하지만
누적되면 `globals.css`가 계속 불어나고, 나중에 값을 수정하려는 사람이 "어디서 쓰이는지"
파악하는 데 혼란을 준다.
**How to apply:** 컴포넌트 파일을 삭제하는 diff를 리뷰할 때, 그 컴포넌트 이름 또는 주석으로
표시된 전용 유틸리티가 `globals.css`(또는 다른 전역 스타일시트)에 있는지 확인하고, 삭제된
컴포넌트만 쓰던 클래스/keyframe이면 함께 제거하도록 제안한다(Minor, 블로킹 아님 — 다음 정리
라운드에 일괄 처리해도 무방).

### 42. 카테고리 taxonomy 전면 교체 후 `?category=` 쿼리스트링 하드코딩 CTA/네비 링크 미동기화 (Major, 2026-08-27 발견)

카테고리 대분류를 `landing/dashboard/ecommerce/corporate/blog` 5종 → `website/ux_ui/branding`
3종으로 전면 교체(`project_category_taxonomy_overhaul_2026-08-27` 메모리)하면서
`ProductCard.tsx`/`growth/page.tsx`의 라벨 매핑(`PRODUCT_CATEGORY_LABELS` 단일 진실
공급원)은 정확히 갱신됐으나, `href`/`ctaHref`에 카테고리 값을 **문자열 쿼리파라미터로
하드코딩**한 3개 파일이 갱신되지 않고 그대로 남음 — `HeroCarousel.tsx`(히어로 배너 3개
슬라이드의 "지금 시작하기"/"대시보드 보기"/"이커머스 보기" CTA, `category=landing/
dashboard/ecommerce`), `NavPopover.tsx`(하단 네비 팝업 메뉴, 동일 3개 값), `LeftSidebar.tsx`
(`category=landing/dashboard/ecommerce`). `/api/products/route.ts:64`의
`sliced.filter((p) => p.category === category)`가 정확 일치 비교라, 더 이상 존재하지 않는
값으로 필터링하면 항상 빈 배열이 반환됨 — 클릭 시 에러 없이 "상품이 없습니다" 화면으로
조용히 귀결되는 확인된 회귀(테스트 데이터도 taxonomy 교체 시 전량 TRUNCATE됐으므로 100%
발생).
**Why:** #10(`/main` 하드코딩 링크)·#12(카테고리 라벨 3중 하드코딩)와 동일한 "라벨은
`PRODUCT_CATEGORIES`로 단일화됐지만 값 자체를 사용하는 href/쿼리스트링은 별도 검색 없이
누락" 패턴의 세 번째 재발. 이번엔 라벨 매핑 자체는 이미 단일 진실 공급원으로 리팩터링되어
있었음에도(#12 해소 확인됨),가장 흔히 놓치는 지점이 "표시용 라벨"이 아니라 "필터링용 값"
쪽으로 이동한 것 — `CategoryTabs.tsx:18`(`cat.value === "all" ? "/growth" :
\`/growth?category=${cat.value}\``)처럼 `PRODUCT_CATEGORIES.map()`에서 동적으로 `href`를
생성하는 올바른 선례가 같은 코드베이스에 이미 존재했다는 점이 대조적.
**How to apply:** `category`/`sub_categories`등 **값 자체가 유한 집합(enum성)인 필드**를
바꾸는 diff를 리뷰할 때는`grep -rn "category="`(또는 해당 필드명 기반 쿼리스트링 패턴)으로
표시 라벨뿐 아니라 **href/쿼리파라미터에 하드코딩된 옛 값**까지 전수 검색한다. 이상적으로는
호출부가`PRODUCT_CATEGORIES.map()`으로 동적 생성하도록 리팩터링(`CategoryTabs.tsx` 선례
재사용)해 값이 다시 바뀌어도 자동으로 따라가게 만들 것을 제안.

### 43. #9/#17/#22/#23/#28/#32/#33/#35/#36 패턴 재발 — ProductInfoTicket 라이선스 정보 트리거도 raw `<button>` (Major, 2026-08-29 발견)

`ProductInfoTicket.tsx`(상세페이지 정보 카드, `PurchaseOptionsPanel.tsx`에서만 사용)에 신규
추가된 "저작권 및 라이선스" 값 클릭 트리거(라벨 텍스트 + `Info` 아이콘, 클릭 시 라이선스
설명 `Dialog` 오픈)가 `components/ui/button.tsx`를 쓰지 않고 raw `<button type="button">` +
`className="flex items-center gap-1 text-gf-gray1 hover:text-gf-orange"`로 작성됨. 같은
프로젝트의 `UploadWorkEditor.tsx`가 정확히 같은 라이선스 정보 UI(같은 `LICENSE_OPTIONS`,
같은 `Dialog`/`DialogContent className="gap-5 p-6 sm:max-w-lg"` 패턴)를 편집용 트리거에
`<Button variant="ghost" size="sm">`로 구현한 선례가 바로 옆 파일에 존재.
**Why:** 10번째로 반복되는 동일 패턴. `Button`을 안 쓰면 `focus-visible:ring-3
focus-visible:ring-[rgba(255,85,0,0.5)]` 키보드 포커스 스타일이 앱 전역과 달라진다(#23에서
이미 지적된 부수 효과).
**How to apply:** 텍스트+아이콘 인라인 트리거는 `Button variant="link"` 또는 `variant="ghost"`

- `className="h-auto p-0"`로 패딩/높이를 제거해 시각적으로 동일하게 재현 가능한지 먼저
  확인하고, raw `<button>`이면 Major로 보고한다. 자세한 경위는
  [[license_info_dialog_terms_conflict]] 참고.

### 44. 상품별 라이선스(CC BY 등) 설명이 사이트 전역 이용약관(제9조)의 블랭킷 제한과 정면 모순 (Major, 2026-08-29 발견)

`product.types.ts`의 `LICENSE_OPTIONS` description을 "구매자가 실제로 뭘 할 수 있고 없는지
명확히" 상세 재작성하면서, CC BY("상업적 목적의 이용, 수정, 2차 저작물 제작, 재배포가 모두
허용됩니다")/CC BY-NC("자유롭게 사용·수정·재배포할 수 있지만")처럼 구매자에게 폭넓은 이용권을
명시적으로 약속하는 문구가 추가됨. 그런데 `TermsContent.tsx` 제9조②는 라이선스 종류와
무관하게 "몰에서 판매되는 모든 디지털 콘텐츠"에 대해 "개인적·비상업적 용도에 한해 사용할 수
있습니다"라는 블랭킷 제한을 걸고, "2차 저작물 생성 및 상업적 활용", "무단 복제, 배포, 전송 및
재판매"를 일괄 금지하고 있어 두 문서가 정면으로 모순된다(`판권소유` 옵션만 "구체적인 이용
범위는 구매 시 안내되는 이용 약관을 따릅니다"로 방어됨).
**Why:** [[legal_dialog_migration]]의 Toss Payments vs 카카오페이 모순, recurring_issues #25
(정의 조항 미동기화)와 동일 계열 — 이번엔 "상세페이지 마케팅성 UI 문구" vs "법적 구속력이 있는
이용약관"이 서로 다른 이용권을 주장하는 변형. 구매자가 상세페이지의 라이선스 설명(예: CC BY는
재배포·상업적 활용 허용)을 믿고 행동하면 실제로는 이용약관 제9조 위반이 되는 상황 발생 가능 —
플랫폼 신뢰도·법적 리스크 측면에서 실사용 임팩트가 크다.
**How to apply:** 판매자가 상품별로 라이선스를 선택할 수 있는 마켓플레이스 모델에서는 제9조를
"각 상품에 지정된 라이선스에 따라 이용 범위가 달라지며, 라이선스가 별도로 명시되지 않거나
`판권소유`인 경우 본 조의 기본 원칙(개인적·비상업적 용도)을 따른다"는 식의 예외 조항으로
개정할 것을 제안한다. 라이선스·쿠폰·가격 등 "구매자에게 부여되는 권리"를 다루는 문구를 새로
작성/상세화하는 diff를 리뷰할 때는 `TermsContent.tsx`(및 `RefundContent.tsx`)에 상충하는
블랭킷 조항이 있는지 항상 대조 확인한다.

### 45. `inset-x-0`(전체 폭) fixed 네비/오버레이가 시각적으로 비어 보이는 영역에서도 클릭을 가로챔 — pointer-events 미분리 (Critical, 2026-08-29 발견)

`ProductVisitNav.tsx`(상세페이지 하단 플로팅 pill 네비)가 `<nav className="fixed inset-x-0
bottom-6 z-40 flex justify-center px-6">`로 작성됨. `inset-x-0`(left:0, right:0)는 `nav`
요소의 레이아웃 박스 자체를 화면 전체 폭으로 늘리는데, 실제로 보이는 검정 pill은 `w-fit`인
자식 div뿐이라 좌우 여백 영역은 투명하다. 하지만 CSS는 투명한 영역도 `pointer-events: none`을
명시하지 않는 한 그대로 히트테스트 대상이므로, `z-40`인 이 `nav`의 투명 여백이 그 아래 있는
다른 인터랙티브 요소의 클릭을 가로챈다. 실제로 `RouteModal.tsx`의 뒤로가기(닫기) 버튼(`absolute
bottom-4 right-4 z-10 size-[60px]`)이 이 전체 폭 투명 밴드와 세로 구간이 겹쳐, 화면 폭과
무관하게 항상 겹침이 발생 — 버튼의 60px 높이 중 대부분이 `nav`의 투명 히트박스에 가려져
클릭이 `nav`로 먼저 잡힌다(z-40 > z-10이므로 로컬 스태킹 컨텍스트에서도 nav가 위). ESC/배경
클릭 등 대체 닫기 경로가 있어 완전한 막힘은 아니지만, 시각적으로 명백한 버튼의 클릭 영역
상당 부분이 죽는 것은 재현성 100%의 버그다.
**Why:** `position: fixed` + `inset-x-0`(또는 `left-0 right-0`) 조합은 "가운데 정렬된 좁은
콘텐츠"를 담고 있어도 요소의 히트박스는 전체 폭으로 남는다는 점이 간과되기 쉽다. 이 프로젝트의
기존 플로팅 요소(`QuoteFloatingButton.tsx`)는 `right-4`(좌표 고정, 폭=콘텐츠 크기)만 쓰고
`inset-x-0`류를 쓰지 않아 이 문제를 원천적으로 피해왔다 — `TopBar.tsx`의 크로스페이드 레이어도
투명해지는 쪽에 `pointer-events-none`을 명시적으로 붙이는 동일한 관례를 이미 쓰고 있다
(`isCompact && "pointer-events-none"`).
**How to apply:** `fixed`/`absolute` + `inset-x-0`(또는 좌우 모두 0) + `flex justify-center`로
"화면 폭 전체 컨테이너 안에 좁은 pill/카드를 가운데 정렬"하는 패턴을 볼 때마다, 그 컨테이너
자신에게 `pointer-events-none`을 주고 실제 보이는 자식(pill)에만 `pointer-events-auto`를
주는지 확인한다. 특히 그 컨테이너가 모달/오버레이 등 다른 fixed 요소와 같은 화면에 공존할
가능성이 있으면(z-index가 그 요소보다 높다면 특히) 반드시 확인 대상. 자세한 경위는
[[product_visit_nav_review]] 참고.

### 46. #9/#17/#22/#23/#28/#32/#33/#35/#36/#43 패턴 10번째 재발 — 같은 기능 디렉토리 안에서도 "과거에 고친 지 한 달 넘은" raw button이 신규 UI에 재도입 (Major, 2026-09-29 발견)

`ChatPanel.tsx`(reservation-showcase, 챗봇 데모)에 신규 추가된 QUICK_REPLIES 칩(퀵리플라이
버튼 목록)이 `rounded-full border ... transition-colors` 스타일의 raw `<button
type="button">`으로 작성됨. 정확히 같은 디렉토리(`reservation-showcase/`)에서 2026-08-17에
`ReservationFormPanel.tsx`/`ReservationFeedPanel.tsx`/`CustomerSearchPanel.tsx`의 raw
button pill을 없애기 위해 `components/ui/Chip.tsx`를 신규 생성했고, 이 컴포넌트 자체 주석에
"선택 가능한 pill 버튼(옵션 선택, 상태 토글, **빠른 검색 칩** 등)에 재사용"이라고 이번
QUICK_REPLIES 용례를 사실상 그대로 지칭하고 있었음에도 재사용되지 않음.
**Why:** 이전 9건과 달리 이번엔 "다른 파일이 아니라 같은 기능·같은 리뷰 이력을 가진 디렉토리
안에서" 재발했다는 점이 특히 뼈아픔 — 해당 컴포넌트가 왜 만들어졌는지의 맥락(같은 파일 그룹의
직전 리뷰 라운드)이 남아있어도 신규 UI 추가 시점에 raw button으로 되돌아가는 것을 막지
못한다는 뜻. 컴포넌트 존재 여부를 코드 리뷰에서 매번 능동적으로 확인하지 않으면 문서화된
선례만으로는 재발을 막을 수 없다.
**How to apply:** "선택 가능한 pill/칩/토글 버튼 목록"을 렌더링하는 신규 코드를 볼 때마다,
`grep -rn "export function Chip" src/components/ui`로 기존 Chip.tsx 존재를 먼저 확인하고
(이미 존재를 알고 있어도 재확인), raw `<button>`이면 파일이 신규든 기존 컴포넌트 근처든
디렉토리가 과거에 이미 이 이슈로 리뷰받은 곳이든 예외 없이 Major로 보고한다. 자세한 경위는
[[reservation_ai_showcase_feature]] 참고.

### 47. #9/#17/#22/#23/#28/#32/#33/#35/#36/#43/#46 패턴 12번째 재발 — 옵션 선택형 Chip은 재사용했지만 "아코디언 더보기" 토글은 또 raw `<button>` (Major, 2026-10-13 발견 → 같은 날 리뷰 중 즉시 수정)

`QuoteChatModal.tsx`(신규, `/layer`·`/about` "AI 견적" 채팅 모달) 본문에서 질문 옵션
Chip은 `components/ui/Chip.tsx`를 정확히 재사용했음에도(#36/#46이 지적한 패턴은 이번엔
회피), 결과 화면의 "수집·이용 내용 자세히 보기" 아코디언 토글 버튼은 `rounded-lg
border ... text-left text-xs` 스타일의 raw `<button type="button">`으로 작성됨.
**Why:** 같은 파일 안에서도 "선택형 버튼 그룹"(Chip 재사용)과 "단순 더보기/접기 토글"
(raw button)이 서로 다른 성숙도로 처리된다는 것을 보여준 사례 — Footer.tsx 아코디언
토글(#33)과 정확히 같은 유형(펼침/접힘 state를 가진 보조 액션 버튼)인데도, 질문 Chip을
올바르게 재사용했다는 사실이 "이 파일은 괜찮다"는 착시를 줄 수 있어 특히 놓치기 쉬움.
**How to apply:** Chip/옵션 버튼 재사용 여부를 확인했다고 해서 같은 파일의 다른 보조
액션(더보기, 접기, 닫기, 복사 등 "선택 상태가 있는 단일 버튼")까지 안전하다고 간주하지
말고 파일 전체에서 `<button` 리터럴을 별도로 grep해 전수 확인한다.
**2026-10-13 같은 날 수정 확인**: `Button variant="outline"` + `h-auto w-full
justify-start`로 교체, focus-visible 링 등 기존 Button 스타일 자동 적용 확인. 자세한
경위는 [[quote_chat_modal_review]] 참고.

### 48. 작업 중간에 기능 범위가 바뀌었는데(placeholder 제거 → 실제 입력 필드 추가) 그 세션이 직접 작성한 신규 memory 파일 서술은 최초 버전 그대로 커밋됨 (Major, 2026-10-13 발견 → 같은 날 리뷰 중 즉시 수정)

`project_quote_chat_modal_feature.md`(신규 memory, 이번 기능 구현 세션이 직접 작성)가
"`contactName`은 받지 않고 `"AI 챗봇 간편견적 (이름 미입력)"` placeholder로 채움"이라고
서술했는데, 실제 커밋 대상 코드(`submitQuoteChatAction.ts`/`QuoteChatModal.tsx`)는 이미
이름 입력 필드가 추가되어 `contactName`을 실제 사용자 입력값으로 받고 placeholder
상수는 삭제된 상태였음 — 작업 중간에 사용자 요청으로 범위가 바뀐 뒤, 코드는 갱신됐지만
같은 작업을 기록한 memory 파일은 최초 설계 시점 서술 그대로 남아 코드와 모순된 채 같은
커밋에 함께 포함될 뻔함.
**Why:** `doc_auth_redirect_mismatch`/#19(의존성 교체 후 CLAUDE.md 미동기화)와 같은
"코드는 고쳤지만 문서를 안 고쳤다" 패턴의 변형이지만, 이번엔 그 문서가 바로 이 작업
세션이 **같은 PR에서 직접 작성한 신규 memory 파일**이라는 점이 다르다 — 오래된 문서가
방치된 게 아니라, 방금 쓴 문서가 쓰는 도중에 일어난 설계 변경을 반영하지 못한 경우.
**How to apply:** 신규 기능 작업 중 설계가 중간에 바뀐 적이 있다면(사용자의
AskUserQuestion 응답, 재작업 지시 등), 그 작업을 기록하는 신규 memory 파일도 최종 코드
기준으로 다시 한번 대조하고 커밋한다 — "내가 방금 쓴 문서니까 맞을 것"이라는 가정이
가장 위험하다. 코드 리뷰 시에도 diff에 포함된 신규 memory/*.md 파일의 코드 서술(함수명,
필드명, placeholder 존재 여부 등)을 실제 diff 코드와 1:1 대조 검증한다. 자세한 경위는
[[quote_chat_modal_review]] 참고.
