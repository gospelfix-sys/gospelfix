# 상품 카테고리(대분류/소분류) 관리자 CRUD + gospelfix 동적 노출

## Context

GospelFix 마켓플레이스는 두 개의 폴리레포로 구성된다 — `gospelfix`(사용자 앱, 포트
3000)와 `gospelfix.cms.api`(관리자 백엔드, Supabase 직접 접근, `/api/v1/*` REST API
제공). 2026-08-27에 상품 카테고리 체계를 대분류 3종(website/ux_ui/branding)·소분류
15종으로 전면 개편했는데(`.claude/memory/project_category_taxonomy_overhaul_2026-08-27.md`),
이 값들이 **코드 상수로만 하드코딩**되어 있어 관리자가 카테고리를 추가/수정/삭제하려면
매번 두 저장소를 코드로 고치고 재배포해야 한다. 이번 작업은 그 하드코딩을 cms.api
관리자 대시보드에서 CRUD 가능한 DB 테이블로 옮기고, gospelfix가 이를 API로 동적
조회하도록 만드는 것이다.

**확정된 요구사항**:
1. gospelfix도 API로 동적 조회 — cms.api에서 카테고리를 바꾸면 재배포 없이 반영
2. 소분류는 대분류와 독립(직교) 관계 유지 — FK/계층 구조 도입 안 함
3. 동적 반영 범위는 **업로드 화면(UploadWorkEditor) + CategoryTabs(/growth 필터 탭)까지만**
   — NavPopover/LeftSidebar(상단 네비게이션)는 정적 fallback 값 그대로 유지(NavPopover는
   부모 체인이 전부 Client라 prop 전달이 복잡하고, LeftSidebar는 어디서도 렌더링되지
   않는 죽은 코드로 확인됨)
4. 대분류(category) 값 검증 공백(지금까지 전무)을 이번에 메운다 — 유효하지 않은 값은
   400 에러로 명시적 거부

## 작업 순서

**cms.api를 완전히 끝낸 뒤 gospelfix로 넘어간다** — gospelfix 프록시 라우트가 cms.api
API에 의존하므로 순서를 바꾸면 중간 검증이 불가능하다.

---

## 1. cms.api — DB 마이그레이션 (`supabase-db-architect` 서브에이전트 위임)

최신 마이그레이션은 `061_reset_moda_products_for_new_category_taxonomy.sql`. 다음 2개
파일을 작성(SQL은 작성만 하고 실행하지 않음 — 사용자가 대시보드에서 직접 실행):

### `062_add_moda_product_categories_and_sub_categories.sql`
- `moda_product_categories`, `moda_product_sub_categories` 테이블 신설 (라인업 접두사
  `moda_` 필수 — `table-prefix-lineup.md` 규칙)
  - 컬럼: `id uuid pk default gen_random_uuid()`, `value text not null unique`,
    `label text not null`, `sort_order integer not null default 0`,
    `is_active boolean not null default true`, `created_at`/`updated_at timestamptz`
  - `updated_at` 트리거, RLS(관리자만 전체 접근 + service_role 전체 접근) — 기존
    `content_api_configs`/`referral_banners` 패턴과 동일하게 구성
- 시드 INSERT: 대분류 3건(website/ux_ui/branding), 소분류 15건(현재
  `gospelfix/src/types/product.types.ts`의 `SUB_CATEGORY_LABELS` 순서 그대로,
  `sort_order` 1~15) — `on conflict (value) do nothing`
- 하단에 `-- ROLLBACK (DOWN)` 주석 섹션 포함(테이블 drop)

### `063_register_product_categories_content_api_configs.sql`
- `content_api_configs`에 공개 API 노출용 행 2개 INSERT:
  - `resource_slug='product-categories'`, `table_name='moda_product_categories'`,
    `filter_column='is_active'`/`filter_value='true'`/`filter_is_bool=true`,
    `identifier_column='value'`/`identifier_type='text'`,
    `order_column='sort_order'`/`order_direction='asc'`,
    `select_columns='value,label,sort_order'`, `is_enabled=true`
  - `resource_slug='product-sub-categories'` — 동일 구조, `table_name='moda_product_sub_categories'`
- `id` 컬럼은 `select_columns`에서 제외(gospelfix에 불필요한 내부 식별자 노출 방지)
- 이 두 행만 추가하면 기존 `/api/v1/[resource]/route.ts` 제네릭 라우트가 그대로
  `/api/v1/product-categories`, `/api/v1/product-sub-categories`를 서빙한다(신규 라우트
  코드 불필요). `/settings` 화면도 `content_api_configs`를 자동으로 읽으므로 On/Off
  토글 UI 코드 불필요.

---

## 2. cms.api — 관리자 CRUD (`nextjs-style-auditor` 서브에이전트 위임)

`referral-banners`(`src/libs/supabase/queries/referral-banners.admin.ts`,
`src/app/(admin)/referral-banners/**`)를 템플릿으로 그대로 복제 — 대분류/소분류를
완전히 분리된 2개 리소스로 구현(공용 팩토리로 추상화하지 않음 — 이 코드베이스에
리소스 간 공유 팩토리 선례가 없고, 2개뿐이라 추상화 이득보다 간접비용이 큼).

### 쿼리 레이어 (신규 파일 2개)
- `src/libs/supabase/queries/product-categories.admin.ts`
- `src/libs/supabase/queries/product-sub-categories.admin.ts`

각각 `getAll*`/`get*ByIdAdmin`/`create*`/`update*`/`delete*`/`duplicate*`/
`update*SortOrder` 함수 세트(`referral-banners.admin.ts`와 동일 패턴, `assertValidUUID`로
뮤테이션 진입점 검증) + 아래 2개 헬퍼 추가(3번 섹션에서 사용):
- `getActive*Values(): Promise<string[]>` — `is_active=true`인 value 목록(검증용)
- `get*LabelMap(): Promise<Record<string,string>>` — 활성/비활성 무관 전체 라벨 맵(표시용)

**삭제 시 사용중 체크**: FK가 없어 DB 레벨 방어가 불가능하므로 애플리케이션에서 막는다.
`deleteProductCategory`는 `moda_products.category = value`인 행이 있으면 에러를 던지고
(`"이미 상품에서 사용 중인 카테고리는 삭제할 수 없습니다. 먼저 비활성화해주세요."`),
소분류는 `.contains('sub_categories', [value])`로 동일하게 체크. 사용 중이어도
`is_active=false` 토글(비활성화)은 항상 허용 — 신규 상품 등록 시 선택지에서만 빠지고
기존 상품 라벨 표시는 유지된다.

### Server Actions / 페이지 / 컴포넌트 (referral-banners 구조 그대로 미러링)
```
src/app/(admin)/product-categories/actions.ts
src/app/(admin)/product-categories/page.tsx              (Server)
src/app/(admin)/product-categories/ProductCategoriesTable.tsx  (Client, useAdminRowActions)
src/app/(admin)/product-categories/new/page.tsx + NewProductCategoryForm.tsx
src/app/(admin)/product-categories/[id]/edit/page.tsx + EditProductCategoryForm.tsx
src/components/admin/ProductCategoryForm/index.tsx        (initialValues/onSubmit/submitLabel 공용)
```
`src/app/(admin)/product-sub-categories/**` 동일 구조 반복.

폼 필드: `value`(영문 snake_case, 정규식 검증, **수정 화면에서는 readonly** — 값을
바꾸면 기존 `moda_products.category`와 불일치하는 orphan 발생), `label`(한글 표시명),
`is_active`(Switch). `sort_order`는 목록 화면의 dnd-kit 드래그로만 변경(폼에 노출 안 함).

### 라우팅/네비게이션
- `src/components/admin/Sidebar/index.tsx`의 `NAV_ITEMS`에 "상품 대분류"(`/product-categories`),
  "상품 소분류"(`/product-sub-categories`) 2줄 추가
- `src/middleware.ts`의 `ADMIN_PATHS` 배열 **및** `config.matcher` 양쪽 모두에 두 경로 추가
  (빠뜨리면 비인증 접근이 리다이렉트되지 않음)
- `(admin)/layout.tsx`의 `requireAdminPage()`가 그룹 전체를 감싸므로 개별 페이지 재검증 불필요

### OpenAPI 등록 (메인 세션 직접 작성 — UI/SQL 어느 위임 규칙에도 안 걸림)
- `src/libs/openapi/schemas/product-categories.schema.ts`,
  `product-sub-categories.schema.ts` — `referral-banner.schema.ts` 패턴 복제,
  `registerPath()`로 `GET /api/v1/product-categories`(및 sub-categories) 등록
- `src/libs/openapi/dynamic-spec.ts`의 `TYPED_SLUGS`에 두 슬러그 등록

---

## 3. cms.api — 기존 하드코딩 3곳 교체

### `src/libs/supabase/queries/products.admin.ts`
- `VALID_SUB_CATEGORIES` 배열 삭제, `sanitizeSubCategories`를 **비동기**로 전환 —
  `getActiveProductSubCategoryValues()`로 DB 조회 후 화이트리스트 필터
- **신설** `sanitizeCategory(value): Promise<string | null>` —
  `getActiveProductCategoryValues()` 기준 검증. 유효하지 않으면 `null` 반환(호출부에서
  에러로 변환)

### `src/libs/supabase/queries/products.my.ts`
- `toPayload`가 동기 함수라 비동기 검증을 쓰려면 `async`로 전환 필요
- `input.category`가 있는데 `sanitizeCategory` 결과가 `null`이면
  `throw new MyProductError(400, '유효하지 않은 카테고리입니다.', 'category')`
- `createMyProduct`/`updateMyProduct`(이미 `async`)에서 `await toPayload(...)`로 호출부만 수정
- 이 400 에러는 `field: 'category'`를 담고 있어, gospelfix `UploadWorkEditor.tsx`의 기존
  `fieldErrors` 배선(`data?.field` → `setFieldErrors`)이 **코드 변경 없이** 그대로
  카테고리 필드 옆에 에러를 표시한다(기존 배선 확인 완료)

### `src/app/(admin)/products/ProductsTable.tsx` / `src/app/(admin)/products/[id]/page.tsx`
- 두 파일의 로컬 `SUB_CATEGORY_LABELS` 하드코딩 복사본 제거
- `[id]/page.tsx`(Server): `getProductSubCategoryLabelMap()`을 상품 조회와
  `Promise.all`로 병렬 호출, `subCategoryLabels[value] ?? value`로 교체
- `ProductsTable.tsx`(Client): 부모 `products/page.tsx`(Server, 실행 단계에서 실제
  구조 재확인)에서 `getProductSubCategoryLabelMap()`을 호출해 `subCategoryLabels` prop으로
  전달, 로컬 상수 참조를 prop 참조로 교체

---

## 4. gospelfix — 동적 소비 (메인 세션 직접 작성)

### 공통 인프라
- `src/types/product.types.ts`: 기존 `PRODUCT_CATEGORIES`/`SUB_CATEGORIES` 배열을
  `FALLBACK_PRODUCT_CATEGORIES`/`FALLBACK_SUB_CATEGORIES`로 이름 변경(값은 그대로,
  "cms.api 호출 실패 시에만 쓰는 최후 수단"이라는 주석 추가). `PRODUCT_CATEGORY_LABELS`/
  `SUB_CATEGORY_LABELS`/`getCategoryLabel`/`getSubCategoryLabel`/`MAX_SUB_CATEGORIES`는
  그대로 유지(fallback 전용 헬퍼로 문서화). `PRODUCT_FORMAT_LABELS`(상세페이지 "제공형태"
  칩)는 이번 스코프 밖이라 손대지 않음 — 정적 라벨 그대로 유지되며, 관리자가 대분류
  라벨을 바꿔도 이 칩 텍스트는 재배포 전까지 따라가지 않는다는 제약이 남는다(별도
  후속 작업 필요 시 메모리에 기록)
- `src/app/api/categories/route.ts`, `src/app/api/sub-categories/route.ts` — 
  `api/referral-banners/route.ts` 패턴 재사용하되 **fallback 전략만 다르게**: 실패 시
  빈 배열이 아니라 `FALLBACK_PRODUCT_CATEGORIES`/`FALLBACK_SUB_CATEGORIES` 반환(카테고리는
  빈 배열이면 업로드 화면 선택지가 통째로 사라지므로)
- `src/lib/api/categories.ts`, `src/lib/api/subCategories.ts` — `serverFetch()`로 위
  프록시 라우트를 호출하는 `getProductCategories()`/`getProductSubCategories()` 헬퍼,
  실패 시 동일하게 fallback 상수 반환

### UploadWorkEditor.tsx (필수 범위)
- `src/app/(public)/growth/upload/page.tsx`를 async Server Component로 전환,
  `Promise.all([getProductCategories(), getProductSubCategories()])` 후
  `<UploadWorkEditor categories={...} subCategories={...} />`로 props 전달
- `UploadWorkEditor.tsx`: `categories`/`subCategories` props 추가, 모듈 스코프의
  `PRODUCT_CATEGORIES`/`SUB_CATEGORIES` import 및 그 파생값(`SELLABLE_CATEGORIES` 등)
  제거하고 props 기반으로 교체. 요약 텍스트의 라벨 조회도 `useMemo`로 props에서 만든
  맵을 사용하도록 교체(정적 fallback 라벨이 아니라 실제 로드된 값 표시)

### CategoryTabs.tsx (필수 범위)
- `src/app/(public)/growth/page.tsx`(이미 async Server)에서
  `getProductCategories()`를 상품 목록 조회와 함께 병렬로 가져와 `categories` prop 전달
- `CategoryTabs.tsx`: `categories` prop을 받아 `[{value:"all",label:"전체"}, ...categories]`로
  구성. `growth/loading.tsx`(Suspense 스켈레톤, 데이터 페치 없음)는 `categories` prop을
  생략하고 호출하므로, prop을 옵셔널로 두고 미전달 시 `FALLBACK_PRODUCT_CATEGORIES` 사용

### NavPopover.tsx / LeftSidebar.tsx — 손대지 않음
확정된 요구사항대로 정적 fallback 값 그대로 유지. LeftSidebar는 어디서도 렌더링되지
않는 죽은 코드로 확인됨(`grep -rln LeftSidebar src` 결과 자기 자신 외 0건) — 이번
작업에서 정리하지 않음.

---

## 5. 서브에이전트 위임 규칙 (cms.api 작업 시 적용)

cms.api `CLAUDE.md` 절대 규칙:

| 작업 | 위임 대상 |
|---|---|
| 062/063 마이그레이션 SQL | **`supabase-db-architect` 필수** |
| `(admin)/product-categories/**`, `(admin)/product-sub-categories/**`, `components/admin/ProductCategoryForm/**`, `components/admin/ProductSubCategoryForm/**`, `Sidebar`, `ProductsTable.tsx`/`[id]/page.tsx` 표시 수정 | **`nextjs-style-auditor` 필수** |
| 쿼리 레이어(`products.admin.ts`/`products.my.ts`/`product-categories.admin.ts`/`product-sub-categories.admin.ts`), OpenAPI 스키마, `middleware.ts` | 메인 세션 직접 작성 가능 |
| gospelfix 전체 | 메인 세션 직접 작성(cms.api식 위임 규칙 없음) |
| 커밋/푸시(cms.api 쪽) | `code-reviewer` APPROVED 후 `git-commit-pusher` |

---

## 검증 방법

1. **cms.api DB**: 마이그레이션 실행 후 대시보드에서 `moda_product_categories`(3행),
   `moda_product_sub_categories`(15행), `content_api_configs`(신규 2행, `is_enabled=true`) 확인
2. **cms.api 관리자 UI**: `/product-categories`, `/product-sub-categories`에서 목록
   조회/생성/수정/드래그 정렬/삭제(사용중 항목 삭제 시 에러 메시지 확인)/비활성화 토글 동작 확인
3. **cms.api 공개 API**: `curl {CMS_API_BASE_URL}/api/v1/product-categories` /
   `product-sub-categories`가 `is_active=true`인 행만 `sort_order asc`로 반환하는지 확인,
   `/api-docs`에 두 엔드포인트 노출 확인
4. **cms.api 회귀**: 판매자 마이페이지 상품 등록/수정(`/mypage/products` →
   gospelfix `/api/my-products` → cms.api `/api/v1/my-products`)이 정상 동작하는지,
   유효하지 않은 category로 등록 시 400 + 필드 에러가 뜨는지 확인
5. **gospelfix**: `/growth/upload`에서 카테고리 선택 다이얼로그가 cms.api 데이터를
   표시하는지, cms.api 관리자에서 카테고리 라벨을 바꾼 뒤 **재배포 없이** 업로드
   화면에 반영되는지 확인. `/growth` 페이지 필터 탭도 동일하게 확인. cms.api를
   일시적으로 중단시켜 프록시 라우트가 fallback 값으로 정상 폴백하는지 확인(선택)
