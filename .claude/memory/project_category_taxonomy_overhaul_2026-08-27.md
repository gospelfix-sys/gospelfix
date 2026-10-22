---
name: project_category_taxonomy_overhaul_2026-08-27
description: 2026-08-27 상품 카테고리 체계를 처음부터 다시 설계 — 업종 소분류(sub_categories) 신규 도입 후 곧바로 대분류까지 전면 교체, 기존 상품/주문 데이터 전체 삭제. 최종 확정 taxonomy 값과 UI 패턴 기록
metadata:
  type: project
---

이 세션 안에서 카테고리 관련 작업이 두 단계로 이어졌다 — **1단계(소분류 신규 도입)**가
끝나자마자 사용자가 **2단계(대분류까지 전면 교체 + 기존 데이터 삭제)**를 바로 요청했다.
다음에 카테고리를 다시 건드릴 때는 최종 상태(2단계 결과)만 보면 되지만, 두 단계 사이의
결정 과정을 이해해야 "왜 이 값인지" 판단할 수 있어 함께 남긴다.

## 1단계 — 업종 소분류(sub_categories) 신규 도입

`/growth/upload`(`UploadWorkEditor.tsx`)의 카테고리 셀렉트를 마켓플레이스형 팝업(대분류
좌측 목록 + 소분류 우측 다중선택 최대 3개)으로 개편하며, 기존에 없던 "업종 태그" 개념을
`sub_categories`(jsonb 배열)로 신설했다. cms.api 마이그레이션
`059_add_moda_products_sub_categories.sql`(컬럼 추가, jsonb array + max 3 CHECK)와
`060_add_sub_categories_to_products_select_columns.sql`(`content_api_configs.select_columns`
화이트리스트 갱신 — 037/038 마이그레이션 때부터 반복된 "빠뜨리면 공개 API 응답에서
조용히 누락되는" 함정을 재확인) 둘 다 사용자가 대시보드에서 실행 완료.

## 2단계 — 대분류까지 전면 교체 + 기존 데이터 전체 삭제 (같은 날, 1단계 직후)

1단계 완료 직후 사용자가 대분류 자체를 바꿔달라고 요청했다: 기존
`landing/dashboard/ecommerce/corporate/blog`(페이지 유형 기준, `PRODUCT_CATEGORIES`) 5종을
`website`(웹사이트)/`ux_ui`(UX/UI)/`branding`(브랜딩) 3종으로 교체. 소분류도 1단계에서 만든
6종(뷰티·헬스·필라테스 등, 업종 세분화 목적)을 15종으로 전면 교체.

**교체 전 조사에서 확인한 사실(다음에 category/sub_categories 건드릴 때 재확인 불필요)**:
- `moda_products.category`는 **DB CHECK/ENUM 제약이 없는 plain text**(`001_initial_schema.sql`).
  값 검증은 순전히 프론트(`PRODUCT_CATEGORIES` 상수)에만 의존 — cms.api 쪽엔
  `sanitizeCategory`/화이트리스트가 아직 없다(sub_categories만 `sanitizeSubCategories()`로
  검증됨, 대칭이 아님 — 이 갭은 해소되지 않은 채로 남아 있다).
- `moda_products.id`를 FK로 참조하는 테이블 4개: `moda_orders.product_id`(**CASCADE
  아님, 기본 RESTRICT** — 삭제 시 반드시 먼저/함께 비워야 함), `moda_reviews`/
  `moda_product_likes`/`moda_cart_items`(전부 `ON DELETE CASCADE`).

**사용자 결정(AskUserQuestion으로 확인)**:
1. 기존 상품 데이터 처리 → **"moda_products 테이블 전체 삭제"** (매핑/보존 아님)
2. 주문 이력(FK 충돌 원인) 처리 → **"moda_orders도 함께 전체 삭제"**
3. 상세페이지 "제공형태" 칩(`PRODUCT_FORMAT_LABELS`) → **대분류명 그대로 사용**
   ("AI기반 웹사이트" 식)

→ `061_reset_moda_products_for_new_category_taxonomy.sql` 작성: `moda_reviews`,
`moda_product_likes`, `moda_cart_items`, `moda_orders`, `moda_products`를 **한 TRUNCATE
문에 전부 명시적으로 나열**(CASCADE 옵션에 암묵적으로 의존하지 않고, 무엇이 함께
비워지는지 눈에 보이게 하기 위함). TRUNCATE는 행 단위 DELETE 트리거(예: 049의
like_count 동기화 트리거)를 발동시키지 않아 오히려 DELETE보다 안전. **ROLLBACK 불가 —
데이터 복구 불가능한 파일**임을 파일 상단에 명시. 사용자가 대시보드에서 059→060→061
순서로 실행 완료, `/api/products` 응답이 `[]`로 비어있음을 curl로 확인.

## 최종 확정 taxonomy (2026-08-27 기준, 다음 작업의 출발점)

**대분류** (`gospelfix/src/types/product.types.ts`의 `PRODUCT_CATEGORY_LABELS`/
`PRODUCT_CATEGORIES`):

| value | label |
|---|---|
| `website` | 웹사이트 |
| `ux_ui` | UX/UI |
| `branding` | 브랜딩 |

**소분류** (`SUB_CATEGORY_LABELS`/`SUB_CATEGORIES`, 최대 3개 선택 `MAX_SUB_CATEGORIES`):

| value | label |
|---|---|
| `etc` | 기타분류 |
| `leisure_sports` | 레저/스포츠 |
| `appliance_electronics` | 가전/전자 |
| `lifestyle` | 생활/라이프 |
| `entertainment_media` | 엔터테인먼트/미디어 |
| `beauty_women` | 뷰티/여성 |
| `corporate_group` | 기업/그룹 |
| `fashion_shopping` | 패션/쇼핑 |
| `travel_stay` | 여행/숙소 |
| `culture_art` | 문화/예술 |
| `education_academy` | 교육/학원 |
| `furniture_interior` | 가구/인테리어 |
| `kids_children` | 유아/아동 |
| `event_promotion` | 이벤트/프로모션 |
| `occasion_campaign` | 행사/캠페인 |

이 두 표의 value는 **gospelfix `product.types.ts`와 cms.api
`products.admin.ts`의 `VALID_SUB_CATEGORIES`(sanitizeSubCategories), 그리고 cms.api
admin 화면 2곳(`(admin)/products/[id]/page.tsx`, `ProductsTable.tsx`)의
`SUB_CATEGORY_LABELS`에 정확히 동일하게 복붙돼 있다** — 값을 또 바꾸면 4곳 전부
동기화해야 한다(대분류는 DB 화이트리스트가 없어 gospelfix `product.types.ts` 한 곳만
바꾸면 되지만, 표시용 라벨이 필요하면 cms.api 쪽에도 없다는 점 자체가 갭).

## 카테고리 선택 팝업 UI 패턴 (`UploadWorkEditor.tsx`)

대분류(좌측 세로 목록, 단일선택) + 소분류(우측 카드 다중선택, 최대 3개) Dialog는
`draftCategory`/`draftSubCategories`라는 **provisional 상태**로 편집하다가 "선택" 버튼을
눌러야만 실제 `productCategory`/`subCategories` state에 반영된다 — 같은 파일에 이미 있던
라이선스 설정 Dialog(`draftLicense` → "선택" 버튼 커밋)와 동일한 패턴을 그대로 재사용한
것. 4번째 소분류 클릭 시 `disabled`로 막지 않고 클릭은 받되 `toast.error`로 안내만
하고 상태 변경은 거부(`toggleDraftSubCategory`) — 완전히 막으면 "왜 안 눌리지"라는
혼란을 주기 때문에 의도적으로 이렇게 설계함.

## 다음 작업 (아직 미착수, TODO)

세션 내 Task #16으로 등록: 관리자가 대시보드에서 아래 두 가지를 CRUD할 수 있게 만드는 것 —
1. 상품 대분류/소분류 자체(현재 코드 상수 하드코딩 → `product_categories`/
   `product_sub_categories` 같은 신규 테이블 + 관리자 CRUD 화면 필요)
2. `/growth` 좌측 사이드바 메뉴(`GrowthSidebar.tsx:117-120`의 "홈"/"무료 리소스"/"인물" —
   뒤 둘은 이미 `disabledReason` 걸린 준비중 placeholder). 상품 category와는 다른 개념(사이트
   내비게이션)이라 별도 테이블(`site_nav_items` 등) 설계 필요.

둘 다 스코프/스키마를 먼저 사용자와 다시 논의한 뒤 착수할 것 — 이번 세션엔 손대지 않음.
