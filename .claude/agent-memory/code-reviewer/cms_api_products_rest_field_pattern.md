---
name: cms_api_products_rest_field_pattern
description: gospelfix.cms.api(별도 저장소)에서 products 테이블에 컬럼 추가 시 REST API 노출까지 확인하는 절차와, products.server.ts가 죽은 코드라는 확인 결과
type: project
---

`gospelfix.cms.api`(포트 3001, `/Users/mac/Documents/work/GospelFix/gospelfix.cms.api`)는
`gospelfix`(main, 이 인덱스가 위치한 저장소)와 완전히 분리된 폴리레포 자매 저장소다. main 앱이
server-to-server로 호출하는 REST API(`/api/v1/*`)를 제공하며, Supabase 스키마는 대시보드에서
SQL을 직접 실행해 관리한다(로컬 CLI 마이그레이션 미사용 — 이 저장소와 동일한 컨벤션).

**products 테이블 필드 추가 시 실제 공개 REST API 노출 경로**:
- `GET /api/v1/products`, `GET /api/v1/products/{id}`는 전용 route.ts가 아니라
  제네릭 `src/app/api/v1/[resource]/route.ts` + `[resource]/[identifier]/route.ts`가 처리한다.
- 실제 select는 `content_api_configs.select_columns`(콤마 구분 문자열 화이트리스트,
  `src/libs/supabase/queries/content-api-configs.ts`의 `queryConfigList`/`queryConfigDetail`)를
  그대로 사용 — DB 컬럼을 추가해도 이 화이트리스트를 갱신하지 않으면 API 응답에 반영되지 않는다.
- 이 프로젝트는 이 함정을 이미 알고 있고(016/018/020/022 마이그레이션에 반복 문서화됨),
  컬럼 추가 시 항상 "① `alter table add column` ② `content_api_configs.select_columns`
  regexp_replace로 멱등하게 이어붙이기" 두 파일 세트로 마이그레이션을 작성하는 게 확립된 패턴이다.
  새 컬럼 추가 PR을 리뷰할 때 이 두 번째 마이그레이션이 빠졌는지 반드시 확인할 것.
- `src/libs/openapi/schemas/product.schema.ts`의 `ProductSchema` + `registerProductPaths`는
  `dynamic-spec.ts`의 `TYPED_SLUGS.products`로 이미 연결되어 있어, 기존 필드 확장(신규 엔드포인트
  아님)은 스키마에 필드만 추가하면 Swagger에도 자동 반영된다 — `/settings` 토글 신규 추가나
  `dynamic-spec.ts` 수정은 필요 없다(신규 리소스일 때만 필요).

**`src/libs/supabase/queries/products.admin.ts`가 관리자 CRUD의 유일한 쓰기 경로** —
`ADMIN_SELECT_COLUMNS`(하드코딩 select 문자열)와 `toPayload()`를 여기서 관리한다.

**`products.server.ts`는 확인 결과 진짜 죽은 코드다** (2026-07-31 확인). `getActiveProducts`/
`getActiveProductById`/`getActiveProductBySlug`/`PublicProduct`를 export하지만 grep으로 전체
저장소를 뒤져도 자기 자신 외에는 아무도 import하지 않는다. 실제 주문 검증에 쓰이는
`getActiveProductById`는 이름은 같지만 완전히 다른 별도 파일 `src/libs/supabase/queries/products.ts`
(컬럼도 `id, price, is_active`만 select하는 최소 버전)에 있다 — 이름이 겹쳐서 혼동하기 쉬우니 주의.
products 테이블에 필드를 추가하는 PR이 `products.server.ts`도 함께 갱신해 두 파일 동기화를
유지하는 것은 (죽은 코드이긴 하지만) 실질적으로 무해하며, 실수로 나중에 이 파일이 다시 쓰이게 될
경우를 대비한 안전판 정도로 보면 된다 — Critical/Major 이슈로 보지 않는다. 다만 장기적으로는
`products.server.ts` 자체를 삭제하는 정리를 제안할 만하다.

**admin 폼 입력값 정제 컨벤션**: `products.admin.ts`의 `toPayload()`는 `production_solution`,
`category`, `demo_url`, `description`처럼 자유 입력 텍스트 필드는 전부 `.trim()` 없이
`input.x || null`만 적용한다(공백 문자열도 truthy라 그대로 저장될 수 있음). `.trim()`은
`sanitizePurchaseOptions`처럼 배열 하위 필드에만 적용되는 별도 패턴. 신규 텍스트 필드
(`product_code`, `design_type` 등)가 이 패턴을 따르는 건 기존 관행과의 일관성 문제이지 이
PR만의 결함이 아니다 — Minor로만 언급.

**드롭다운 전용 값(예: `design_type` "반응형"/"고정형")은 서버 사이드/DB 레벨 검증이 전혀 없다** —
`category`와 완전히 동일한 기존 패턴(마이그레이션 주석에도 "production_solution/category와
동일하게 DB 레벨 CHECK 제약은 걸지 않는다"고 명시). `actions.ts`의 Server Action들은
`ProductFormInput`에 대해 Zod parse 등 서버 검증을 전혀 하지 않고 그대로
`products.admin.ts`의 CRUD 함수에 위임 — 관리자 전용 내부 도구라는 전제하에 이 저장소 전체가
채택한 트레이드오프이며, 신규 드롭다운 필드가 이 패턴을 따르는 것은 결함이 아니라 일관성 유지.

**2026-07-31 `product_code`/`design_type` 추가 PR 리뷰 결과 — 검증 완료 사항**:
- 마이그레이션 021(컬럼 추가)·022(select_columns 동기화) 둘 다 존재, 022는 016/018/020과
  동일하게 멱등(regexp_replace 기반)하게 작성됨 — 좋은 패턴 유지.
- `content_api_configs`에 `resource_slug = 'products'` 외에 `products` 테이블을 가리키는
  다른 슬러그가 없음을 grep으로 재확인 — select_columns 갱신 대상 슬러그 누락 없음.
- `duplicateProduct()`에서 `product_code`는 복사하지 않고(`null`로 리셋, SKU 성격이라 원본과
  같은 코드를 갖는 복사본은 의미가 없다는 주석 있음) `design_type`은 원본 값을 그대로 복사 —
  의도된 비대칭 처리, 버그 아님.
- 자매 저장소 `gospelfix`(main)의 `PurchaseOptionsPanel.tsx` + `types/product.types.ts`가
  이미 `product_code`/`design_type` 필드명을 정확히 일치시켜 소비 중이고(`&&` 조건부 렌더링으로
  null일 때 항목 자체 숨김), `app/api/products/route.ts`는 cms.api 응답을 그대로 패스스루하므로
  필드명 불일치 리스크 없음 — end-to-end 확인 완료.
- 종합 판정: **APPROVED**, Critical/Major 없음.

**2026-07-31 gospelfix(main) 프론트엔드 diff 검증**: `PurchaseOptionsPanel.tsx` +
`product.types.ts`에 `product_code`/`design_type`(둘 다 `string | null`, null이면 행 자체를
렌더링하지 않는 명시적 계약)을 추가하는 프론트엔드 전용 diff를 리뷰. `src/app/api/products/[slug]/
route.ts`는 cms.api 응답을 `unwrapDetail()`로 그대로 통과시키는 구조(필드 화이트리스트 없음)라
프론트는 코드 변경 없이 새 필드를 그대로 받을 준비가 됨. 단, cms.api 쪽 `content_api_configs.
select_columns`에 이 두 컬럼이 아직 추가되지 않았다면 화면에는 항상 null로 와서 두 행이 영원히
숨겨진 채로 "정상 동작"처럼 보일 수 있음 — 이 프론트 PR을 APPROVED로 승인하더라도 cms.api 쪽
select_columns 동기화 여부(위 문단 참고)는 별도로 반드시 확인해야 실제로 두 필드가 노출된다.
프론트 diff 자체는 기존 `supplyPrice != null` 컨벤션과 달리 문자열 필드라 `product.product_code &&`
(truthy 체크)로 작성됐는데, 문자열은 빈 문자열(`""`)일 때만 `!= null`과 결과가 갈리고 admin
정규화가 이미 빈 문자열을 null로 치환하므로 실질 위험은 낮음 — Minor로만 지적, APPROVED 판정.
