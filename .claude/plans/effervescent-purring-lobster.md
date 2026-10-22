# 카테고리 선택 UI 개편 — 팝업 방식 + 업종 소분류 신규 도입

## Context

`/growth/upload`(`UploadWorkEditor.tsx`)의 "카테고리" 필드는 현재 4개(랜딩페이지/
대시보드/이커머스/기업·단체) 중 하나를 고르는 평범한 `<Select>` 드롭다운이다.
사용자가 참고 이미지(마켓플레이스형 카테고리 팝업 — 좌측 대분류 탭, 우측 소분류
다중선택 최대 3개, 취소/선택 버튼)를 보여주며 이 화면을 완전히 새 팝업 UI로
바꿔달라고 요청했다.

조사 결과 이 프로젝트의 카테고리는 DB·타입·폼·API 전 구간에서 **단일 문자열**로
설계돼 있다(`Product.category: string`). 대화를 통해 범위를 확정했다:

- **대분류**: 기존 4개를 그대로 재사용(값 변경 없음, 표현 방식만 팝업으로 교체).
- **소분류**: 완전히 새로운 개념 — GospelFix는 "업종별 AI 홈페이지"를 파는
  서비스([[project_business_model_vertical_ai_pivot]] 메모리)인데 지금까지 상품에
  "어떤 업종에 맞는지" 태그가 없었다. 이 공백을 메우는 최대 3개 다중선택 필드다.
  대분류(페이지 유형)와 직교하므로 어떤 대분류를 골라도 동일한 소분류 목록을 보여준다.
- 백엔드 `category` 컬럼은 그대로 두고, `sub_categories`라는 **새 컬럼**을
  `gospelfix.cms.api`(별도 저장소, Supabase 직접 접근)에 추가한다. 사용자가 SQL은
  직접 Supabase 대시보드에서 실행하겠다고 했으므로 마이그레이션 파일만 작성한다.

이 세션은 `gospelfix` 저장소의 에이전트 레지스트리만 가지고 있어 cms.api 전용
서브에이전트(`supabase-db-architect`, `nextjs-style-auditor`)를 호출할 수 없다.
cms.api 쪽 변경은 그 저장소의 기존 마이그레이션(037, 038 등)이 보여주는 관례를
직접 확인·모방해 메인 세션이 Read/Write/Edit 툴로 파일을 작성한다. **SQL은 작성만
하고 실행하지 않는다.**

## 소분류 taxonomy (확정)

[[project_business_model_vertical_ai_pivot]]의 우선순위 타겟 업종을 그대로 코드값으로
확정한다:

| value | label |
|---|---|
| `beauty_health` | 뷰티·헬스·필라테스 |
| `moving_cleaning` | 이사·청소 |
| `cafe_food` | 카페·요식업 |
| `clinic_dental` | 병원·한의원·치과 |
| `academy_education` | 학원·교육 |
| `etc` | 기타 |

선택사항(0개 허용, 최대 3개) — 대분류만 필수로 남긴다. 값 검증을 DB CHECK가 아니라
앱 레벨 `sanitizeSubCategories()`에 두므로, taxonomy가 향후 바뀌어도 SQL 마이그레이션
없이 코드만 수정하면 된다.

## cms.api 스키마 설계 근거

**jsonb 배열 채택** (`text[]` 대신): 이 저장소는 배열 필드에 이미
`jsonb + CHECK(jsonb_typeof = 'array')` 컨벤션을 두 번(`purchase_options`,
`code_preview`, 마이그레이션 038) 확립했다. `text[]` 실사용 예는 없다 — 기존
컨벤션을 따른다. "최대 3개"는 `jsonb_array_length <= 3` CHECK로 방어하고, "허용된
6개 값인지"는 taxonomy 변경 유연성을 위해 DB가 아니라 `sanitizeSubCategories()`
(products.admin.ts, `sanitizePurchaseOptions`/`sanitizeCodePreview` 옆)에서 검증한다.

## cms.api 마이그레이션 SQL (작성만 — 실행은 사용자가 대시보드에서)

최신 마이그레이션이 `058_enable_my_products_api_config.sql`임을 확인했으므로 `059`,
`060`으로 이어 붙인다. `037_add_code_preview_to_products_select_columns.sql`을 실제로
읽어 `content_api_configs` 화이트리스트 갱신 패턴(멱등 `regexp_replace`, ROLLBACK 주석
포함)을 그대로 재사용할 것 — 이 파일이 완성 템플릿이다.

### `gospelfix.cms.api/supabase/migrations/059_add_moda_products_sub_categories.sql`

```sql
alter table public.moda_products
  add column if not exists sub_categories jsonb not null default '[]'::jsonb;

comment on column public.moda_products.sub_categories is
  '상품이 대상으로 하는 업종 태그 배열(최대 3개). category(페이지 유형)와 직교하는
   필드. 허용값 화이트리스트는 DB가 아니라 products.admin.ts의
   sanitizeSubCategories()에서 관리한다.';

alter table public.moda_products
  add constraint moda_products_sub_categories_is_array
    check (jsonb_typeof(sub_categories) = 'array');

alter table public.moda_products
  add constraint moda_products_sub_categories_max_three
    check (jsonb_array_length(sub_categories) <= 3);

-- ROLLBACK (DOWN)
-- alter table public.moda_products
--   drop constraint if exists moda_products_sub_categories_max_three,
--   drop constraint if exists moda_products_sub_categories_is_array,
--   drop column if exists sub_categories;
```

### `gospelfix.cms.api/supabase/migrations/060_add_sub_categories_to_products_select_columns.sql`

037번 파일의 멱등 `regexp_replace` 패턴을 그대로 따라, `resource_slug in
('products', 'my-products')` 양쪽에 `sub_categories`를 `select_columns`에 추가하고
ROLLBACK 주석을 포함한다. (037 참고 — `gospelfix`가 실제 호출하는
`/api/v1/my-products*`는 이 화이트리스트를 안 거치고 `products.my.ts`의
`MY_SELECT_COLUMNS`를 직접 쓰므로, 이 마이그레이션은 공개 카탈로그
`GET /api/v1/products` 노출용이다.)

## cms.api 코드 변경

| 파일 | 변경 |
|---|---|
| `src/types/product.ts` | `Product.sub_categories: string[]`, `MyProductInput.subCategories: string[]` 추가 |
| `src/libs/supabase/queries/products.admin.ts` | `ADMIN_SELECT_COLUMNS`에 `sub_categories` 추가. `sanitizeCodePreview` 옆에 `sanitizeSubCategories()` 신규(화이트리스트 상수 + `.slice(0,3)`) |
| `src/libs/supabase/queries/products.my.ts` | `MY_SELECT_COLUMNS`에 `sub_categories` 추가. `toPayload()`에 `sub_categories: sanitizeSubCategories(input.subCategories)`. `toApiProduct()`에 `subCategories: product.sub_categories` |
| `src/libs/openapi/schemas/my-products.schema.ts` | `MyProductSchema`/`MyProductInputSchema`에 `subCategories: z.array(z.string()).max(3)` 등록 |
| `src/libs/openapi/schemas/product.schema.ts` | `ProductSchema`에 `sub_categories: z.array(z.string())` 등록(공개 스키마는 snake_case) |
| `src/app/(admin)/products/[id]/page.tsx`, `ProductsTable.tsx` | 소분류를 읽기 전용 배지로 노출(검수 편의) — 이번 작업에 포함. `[id]/page.tsx`는 기존 `<Field label="카테고리" value={product.category} />` 바로 아래에 `<Field label="소분류" value={product.sub_categories?.length ? product.sub_categories.map(v => SUB_CATEGORY_LABELS[v] ?? v).join(', ') : '-'} />` 형태로 추가. `ProductsTable.tsx`는 기존 카테고리 칩 옆에 소분류 배지를 작게 나열(레이블 매핑용 `SUB_CATEGORY_LABELS`를 cms.api 쪽에도 동일하게 정의해야 함 — gospelfix `product.types.ts`와 값은 동일하되 별도 파일). 신규 UI 로직 추가가 아니라 기존 읽기 전용 필드 패턴을 그대로 확장하는 수준이라 큰 변경은 아니다. |

## gospelfix 코드 변경

- **`src/types/product.types.ts`**: `SUB_CATEGORY_LABELS`(Record), `SUB_CATEGORIES`(배열,
  `PRODUCT_CATEGORIES`와 같은 `{value,label}` shape), `MAX_SUB_CATEGORIES = 3` 상수
  추가. `Product`/`SellerProductInput`에 `sub_categories: string[]` 추가.
- **`src/lib/api/myProducts.ts`**: `CmsMyProduct.subCategories: string[]` 추가,
  `toSellerProduct()`/`toCmsProductInput()`에 양방향 매핑 추가.
- **`src/components/growth/UploadWorkEditor.tsx`** (핵심):
  - state: `subCategories`, `categoryDialogOpen`, `draftCategory`, `draftSubCategories`
    — 이미 구현된 라이선스 설정 Dialog(`licenseDialogOpen`/`draftLicense`, provisional
    선택 → "선택" 버튼 확정 패턴)를 그대로 재사용.
  - 수정 모드 로딩(`useEffect`)에 `setSubCategories(product.sub_categories ?? [])` 추가.
  - `handleSubmit` payload에 `sub_categories: subCategories` 추가.
  - 기존 `<Select>` 카테고리 필드를 라이선스 섹션과 동일한 "표시 행 + 편집 버튼"으로
    교체 — 표시 텍스트는 대분류 라벨 + 소분류 라벨들을 `·`로 join.
  - 새 `<Dialog>` 추가: `DialogContent`를 `grid grid-cols-[128px_1fr]`로 좌/우 분할.
    좌측은 `SELLABLE_CATEGORIES`를 세로 리스트 버튼(단일 선택, 선택 시
    `bg-gf-bg text-gf-orange`)으로, 우측은 `SUB_CATEGORIES`를 체크형 카드 리스트
    (다중 선택, 선택 시 `border-2 border-gf-orange` + 오렌지 체크 원 — 라이선스
    Dialog의 옵션 카드와 동일 스타일)로 렌더링. 4번째 클릭 시 `toast.error`로 안내하고
    선택은 막되 클릭 자체는 받아 처리(완전 `disabled` 대신 조건부 무시 — 이유는 클릭
    이벤트가 살아있어야 안내 토스트를 띄울 수 있기 때문).
  - `DialogFooter`는 지금 라이선스 팝업에서 이미 만든 `취소`(회색 필)/`선택`(오렌지 필,
    `rounded-full h-11`) 스타일을 그대로 재사용.
  - 이 Dialog는 이번 세션에서 이미 Tailwind v3 정상 동작을 확인한 `Dialog`/`Button`
    컴포넌트만 쓰므로, `select.tsx`/`popover.tsx`/`calendar.tsx`에서 반복됐던 Tailwind
    v4 전용 문법(`w-(--var)`, `outline-hidden`) 버그가 재발할 위험이 없다 — 새 shadcn
    컴포넌트를 CLI로 추가할 필요 없음.

## 검증

**gospelfix**: `yarn lint`, `npx tsc --noEmit -p tsconfig.json`. `/growth/upload`에서
카테고리 "선택" → 팝업에서 대분류 1개 + 소분류 최대 3개 선택 → "선택" → 표시 행에
라벨 조합이 뜨는지 확인. 4번째 소분류 클릭 시 토스트만 뜨고 선택 안 되는지 확인.
게시/초안저장 후 수정 화면 재진입해 값이 그대로 복원되는지(왕복) 확인.

**cms.api**: `yarn lint`, `npx tsc --noEmit`. 사용자가 059→060 SQL을 대시보드에서
순서대로 실행한 뒤, `GET /api/v1/products` 공개 카탈로그 응답에 `sub_categories`가
실제로 포함되는지 확인(060 누락 시 조용히 빠지는 게 이 저장소의 반복된 함정 —
037/038 사례와 동일). `/api-docs`(Swagger)에서 `MyProduct`/`Product` 스키마에 필드가
노출되는지 확인.

## 확정된 결정

1. 소분류 taxonomy 6개 값/라벨 — 위 표 그대로 확정.
2. 소분류는 선택사항(0개 허용, 최대 3개). 대분류만 필수로 남긴다.
3. cms.api 관리자 상세/목록 페이지의 소분류 읽기 전용 표시 — 이번 작업에 포함.
