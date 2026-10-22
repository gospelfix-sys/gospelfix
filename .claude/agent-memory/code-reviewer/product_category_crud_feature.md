---
name: product_category_crud_feature
description: gospelfix.cms.api(자매 저장소) 상품 대분류/소분류를 코드 상수→DB 테이블(moda_product_categories/moda_product_sub_categories) CRUD로 전환한 리뷰. 1차 BLOCKED
type: project
---

저장소: `/Users/mac/Documents/work/GospelFix/gospelfix.cms.api`(자매 폴리레포, 별도 CLAUDE.md).
브랜치 `product-category-crud`, 2026-08-27 리뷰. Bash 도구 없는 세션([[no_bash_tool_constraint]]) —
Read/Glob/Grep 정적 검증만 수행.

## 변경 요약

기존 코드 상수(gospelfix `product.types.ts`의 `PRODUCT_CATEGORY_LABELS`/`SUB_CATEGORY_LABELS`,
cms.api `products.admin.ts`의 `VALID_SUB_CATEGORIES` 배열)로만 존재하던 상품 대분류(3종)/
소분류(15종)를 관리자 CRUD 가능한 DB 테이블로 이전. 마이그레이션 062(테이블+시드)/063
(content_api_configs 등록)는 002/041~045 기존 컨벤션을 정확히 따름 — RLS 정책(admin+
service_role), 트리거, 롤백 스크립트 모두 정상.

## 검증 완료 사항 (문제 없음)

- `sanitizeSubCategories`/`sanitizeCategory` 동기→비동기 전환 후 모든 호출부(`products.my.ts`의
  `toPayload`, 그리고 `createMyProduct`/`updateMyProduct`의 `await toPayload(...)`)에 await 누락
  없음 — grep으로 전체 재확인.
- 하드코딩 `VALID_SUB_CATEGORIES` 완전 제거, 잔존 참조 0건(grep 확인).
- `middleware.ts`의 `ADMIN_PATHS`와 `config.matcher` 양쪽 모두에 `/product-categories`,
  `/product-sub-categories` 정확히 추가됨 — [[referral_banner_config_feature]]에서 지적됐던
  matcher 누락 패턴이 이번엔 재발하지 않음.
- `(admin)/product-categories/**`, `(admin)/product-sub-categories/**`는 `(admin)/layout.tsx`의
  `requireAdminPage()`로 라우트 그룹 자동 보호됨(정상 위치).
- `dynamic-spec.ts`의 `TYPED_SLUGS` 등록이 `content_api_configs.is_enabled` 토글 루프 안에서만
  실행되는 단일 경로 — [[referral_banner_config_feature]]에서 지적된 "무조건 호출 이중 등록"
  버그 없음(정상 패턴).
- gospelfix(main) 쪽 `app/api/categories/route.ts`, `app/api/sub-categories/route.ts`가
  `/api/v1/product-categories`, `/api/v1/product-sub-categories`를 정확한 슬러그로 호출하고
  실패 시 정적 fallback으로 폴백 — end-to-end 연결 정상 확인.
- Supabase 쿼리는 전부 `src/libs/supabase/queries/`에만 위치, 컴포넌트/페이지 인라인 쿼리 없음.

## Major — `value` 필드의 "수정 불가" 불변식이 클라이언트 UI에서만 강제됨 (미해결)

`ProductCategoryForm`/`ProductSubCategoryForm`은 수정 화면에서 `value` input에
`readOnly={isEdit}`만 걸어두고, `VALUE_REGEX = /^[a-z][a-z0-9_]*$/` 정규식 검증도 클라이언트
컴포넌트의 `handleSave()` 안에서만 수행한다. 그러나 `product-categories.admin.ts`/
`product-sub-categories.admin.ts`의 `updateProductCategory`/`updateProductSubCategory`는
`input`(value 포함)을 그대로 `.update(input)`에 넘길 뿐, 서버 측에서 정규식 재검증도, `value`
불변 강제도 전혀 하지 않는다. DB에도 CHECK 제약이 없다(마이그레이션 062 확인).

**Why:** 코드 주석 자체가 "이미 등록된 상품이 이 값을 참조할 수 있어 수정 화면에서는 변경할 수
없습니다"라고 명시하는데도, `updateProductCategoryAction(id, input)`을 브라우저 devtools나
향후 다른 호출부에서 다른 value로 직접 호출하면 이 불변식이 그대로 깨진다 — 이미 상품이 참조 중인
카테고리의 value가 조용히 바뀌면서 기존 상품의 `category`/`sub_categories` 값이 orphan이 된다
(어떤 카테고리에도 매핑되지 않는 문자열로 남음). 사용자가 리뷰 요청에서 명시적으로 확인해달라고
한 항목(#4 "value 필드 정규식 검증이 서버에서도 재검증되는지")과 정확히 일치하는 결함.

**How to apply:** `updateProductCategory`/`updateProductSubCategory`에 ①`VALUE_REGEX` 서버측
재검증 ②`input`에서 `value` 필드를 제거하고 `label`/`is_active`만 update하도록 수정 권장(가장
간단하고 확실한 방법 — 애초에 수정 API가 value를 받지 않으면 클라이언트 우회가 원천 차단됨).

## Minor — `getProductCategoryLabelMap()`이 정의만 되고 실제로 쓰이지 않음

`product-categories.admin.ts:190`에 `getProductCategoryLabelMap()`을 만들고 자체 doc 주석에
"ProductsTable.tsx/products/[id]/page.tsx가 카테고리 라벨을 표시하는 데 사용한다"고 적어뒀지만,
grep 결과 정의부 외에는 아무도 import하지 않는다. 실제로 `ProductsTable.tsx`(상품 카드의
카테고리 표시)와 `products/[id]/page.tsx`(`Field label="카테고리" value={product.category}`)
둘 다 `product.category` raw value(예: "website")를 그대로 렌더링 — 라벨("웹사이트")로 변환되지
않는다. 소분류 쪽(`getProductSubCategoryLabelMap`)은 정상적으로 두 파일에 연결되어 있어 대칭이
깨진 상태. 기능은 동작하지만(카테고리 값이 그대로 보일 뿐) UX 저하 + 죽은 코드 + 부정확한 주석.

**How to apply:** `products/page.tsx`/`products/[id]/page.tsx`에서 `getProductCategoryLabelMap()`도
함께 fetch해서 `ProductsTable`/`Field`에 넘기고 `categoryLabels[product.category] ?? product.category`로
표시하도록 수정 권장.

## Minor — `deleteProductCategory`/`deleteProductSubCategory`의 TOCTOU

사용중 체크(`select ... eq(category, value) limit(1)`) 후 별도 `.delete()` 호출 — 두 호출 사이에
동시 요청으로 새 상품이 그 카테고리를 참조하게 되면 orphan 발생 가능. FK가 없어 DB 레벨 방지도
불가(주석에도 명시된 기존 트레이드오프). 관리자 전용 저빈도 액션이라 실사용 리스크는 낮음 —
referral_banners 등 기존 admin CRUD 삭제 로직과 동일한 수준의 트레이드오프이므로 이 PR만의
결함은 아님. Critical/Major로 보지 않음.

## Minor — Server Action에 `requireAdminPage()` 개별 호출 없음 (기존 패턴과 동일, 새 이슈 아님)

`product-categories/actions.ts`, `product-sub-categories/actions.ts`의 모든 액션이
`requireAdminPage()`를 호출하지 않고 미들웨어의 `isAuthenticated`(role 무관)에만 의존한다.
그러나 `referral-banners/actions.ts`, `products/actions.ts`의 `deleteProductAction`/
`duplicateProductAction`/`updateProductsSortOrderAction` 등 기존 파일들도 동일하게
`requireAdminPage()`를 생략한다(승인/반려처럼 특별히 위험한 액션에만 개별 호출) — 이 저장소
전역의 기존 컨벤션이지 이 PR이 새로 만든 회귀가 아니다. 다음에 이 계열 액션을 리뷰할 때는
"기존 관행"이라는 점을 감안하되, 만약 seller 등 비관리자 role이 이 앱에 로그인 가능한 흐름이
생긴다면 즉시 재검토가 필요하다.

## 최종 판정 (2026-08-27 세션)

**BLOCKED** — Major 1건(value 서버측 재검증/불변식 미보장)으로 커밋 보류 권장. Minor 2건은
후속 처리 권장이나 머지 차단 사유는 아님.
