---
name: project_product_crud_migration_to_mypage
description: (양쪽 저장소 구현 완료, 마이그레이션 055 수동 실행만 남음) 상품 CRUD를 cms.api 관리자 전용에서 gospelfix 마이페이지 회원 셀프서비스로 이전 — Phase 3 판매자 마켓플레이스의 실제 시작
metadata:
  type: project
---

✅ **양쪽 저장소 구현 모두 2026-08-26에 완료됐다.** cms.api 쪽(마이그레이션 055,
`/api/v1/my-products/*` REST 엔드포인트, 관리자 승인/반려 UI, 기존 admin CRUD
삭제)까지 같은 세션에서 이어서 끝냈다 — cms.api 저장소가 원래 요구하는
`supabase-db-architect`/`nextjs-style-auditor` 서브에이전트 위임 없이, 사용자가
"이 세션에서 직접 cms.api 디렉토리를 수정"하도록 명시적으로 승인해 메인 세션이
직접 작업했다(코드 자체는 cms.api 기존 컨벤션을 그대로 따름). seller 역할 부여
방식도 이후 cms.api `/users` 페이지에 "판매자로 전환" 버튼으로 구현 완료(관리자
수동 지정, 신청제 아님).

⚠️ 055 실행 직후 cms.api 쪽에서 버그 발견: `moda_products.status`가 001부터 있던
무관한 레거시 컬럼과 이름이 충돌해 검수 상태 CHECK 제약이 전혀 적용되지 않았다.
`056_fix_products_status_column_collision.sql`로 수정(검수 상태를 `review_status`
컬럼으로 분리) — **gospelfix 쪽 API 계약(JSON 필드명 `status`)은 전혀 바뀌지
않으니 이 저장소는 아무것도 고칠 필요 없다**, cms.api 내부 컬럼명만 바뀐 것.
자세한 경위는 cms.api 저장소 메모리 참고.

✅ **판매자 전환 "신청 신호" 기능 추가 (2026-08-26)**: "일반 회원이 판매자로
전환하고 싶다는 의사를 어떻게 만드나"라는 질문에 대한 답으로, 관리자 수동
지정 정책은 그대로 두고 신청 "신호"만 받는 최소 기능을 추가했다(1차 스코프는
신호만 — 포트폴리오/소개 등 부가 입력 폼 없음, 사용자가 명시적으로 이렇게
시작하자고 결정). `/mypage/settings`의 "판매자 전환" 카드에서 버튼을 누르면
`POST /api/auth/seller-request` → cms.api `POST /api/v1/auth/seller-request`를
호출해 `profiles.seller_requested_at`을 채운다. `AuthMeResponse.profile`에
`seller_requested_at: string | null` 필드 추가됨. 여전히 자동 승인 없음 —
cms.api `/users`에서 관리자가 직접 "판매자로 전환" 버튼을 눌러야 role이
바뀐다.

**유일하게 남은 작업은 cms.api의 056/057 마이그레이션을 Supabase 대시보드
SQL Editor에서 수동 실행하는 것** — 056 없이는 승인/반려·판매자 상품 등록이,
057 없이는 "판매자 신청" 버튼이 각각 DB 에러로 실패한다.

## 기획 변경 내용 (2026-08-24, 사용자 지시)

기존에 `gospelfix.cms.api` 관리자 화면(`src/components/admin/ProductForm/*`,
`src/app/(admin)/products/**`)에서만 가능했던 **상품 CRUD를 gospelfix
`/mypage`로 완전히 이전**한다.

- 입력 필드는 cms.api `ProductForm`에 있던 것과 동일하게 그대로 옮긴다(새로
  설계하지 않음) — 썸네일/대표이미지, 이름, slug, 설명, 상세 콘텐츠(RichEditor,
  `content_html`), 카테고리, 가격/공급가, 구매옵션(`purchase_options`),
  제작솔루션, 상품코드, 디자인구분 등. 정확한 필드 목록은 착수 시점에
  `gospelfix.cms.api/src/components/admin/ProductForm/index.tsx`를 다시 읽어서
  확정할 것(이번 세션 중에도 필드가 몇 번 바뀌었으므로 — [[project_detail_page_banner_image_migration]]
  참고).
- **회원이 직접** 마이페이지에서 상품을 작성/수정/삭제할 수 있어야 한다("각
  회원들이 작성할 수 있도록"). cms.api 관리자 전용이던 기능이 사라지고
  일반 사용자 셀프서비스로 바뀌는 것이 핵심.
- cms.api 쪽의 기존 상품 관리자 CRUD 기능(관리자 admin 화면 쪽)은 **삭제**한다.
- 사용자 대면 스토어 화면("모다", `/growth`·`/detail/[slug]` 등 공개 카탈로그
  페이지)은 **크게 변경 없음** — 상품을 누가 등록했는지와 무관하게 노출 방식은
  유지되는 것으로 보임(정확한 스코프는 착수 시 재확인).

## Why — Phase 3 판매자 마켓플레이스의 실제 시작

[[project_business_model_vertical_ai_pivot]]에 이미 이 방향이 설계 메모로
존재했다: "판매자(외부 AI 빌더) 입점은 Phase 3(3~6개월 후)" 계획 중 "마이페이지:
상품 CRUD, 판매현황(다운로드수·매출), 정산내역(월별), 프로필설정"이 바로 이
작업이다. 지금까지는 미구현 설계 메모였는데, 이번이 실제 착수 지시다.

**단, 정산·수수료·판매현황 대시보드까지 이번에 전부 포함인지는 아직 명시되지
않았다** — 사용자는 "상품 CRUD"만 명시했다. 착수 시 스코프(CRUD만인지, 승인
플로우/정산까지 포함인지)를 먼저 확인할 것.

## 착수 전에 반드시 확인해야 할 것 (구현 시작 전 사용자에게 물어볼 목록)

1. ✅ **권한 범위 — 확정 (2026-08-26)**: `profiles.role`에 별도 **seller 역할을
   신설**한다. 전체 일반 회원 자동 허용이 아니고, "신청제(일반 회원 → 판매자
   신청 → 관리자 승인)"도 아니다 — role 컬럼에 seller 값을 추가하는 구조
   자체는 확정됐지만, seller 역할을 **누구에게 어떻게 부여할지**(관리자가
   수동으로 지정하는 것인지, 자동 부여 조건이 있는지)는 아직 별도 확인 필요.
   착수 시 `profiles.role` CHECK 제약을 `user`/`admin`/`seller` 3값으로
   확장하는 마이그레이션이 필요함(cms.api 쪽, `supabase-db-architect` 위임).
2. ✅ **검수/승인 플로우 — 확정 (2026-08-26)**: 기존 설계 메모와 동일하게
   **관리자 수동 승인 후 공개**. seller가 상품을 작성하면 "검수 대기" 상태로
   머물고, cms.api 관리자가 승인해야 `/growth`·`/detail/[slug]` 등 공개
   카탈로그에 노출된다. 즉 상품에 승인 상태 컬럼(예: `status`:
   draft/pending/approved/rejected 같은 enum)이 신설돼야 함 — 착수 시
   `supabase-db-architect`에게 위임할 스키마 설계 항목.
3. ✅ **cms.api 삭제 범위 — 확정 (2026-08-26)**: **admin UI + 관련 REST
   엔드포인트까지 전체 삭제**한다(DB 컬럼은 별개 — 승인 상태 확인 등 관리자가
   여전히 필요로 하는 기능이 있으므로 삭제 범위는 "상품 등록/수정/삭제를 위한
   admin 전용 CRUD 화면과 API"에 한정, 관리자의 승인/반려 기능은 항목 2번
   결정에 따라 별도로 새로 필요함). cms.api는 SQL/스키마 작업에
   `supabase-db-architect`, `src/app/(admin)/**`·`src/components/admin/**` UI
   작업에 `nextjs-style-auditor` 위임이 절대 규칙이므로, 두 서브에이전트를
   호출할 수 있는 cms.api 세션에서 진행해야 함(이번 세션엔
   supabase-db-architect 없음 — [[project_banner_image_url_handoff]]와 동일한
   제약).
4. ✅ **인증/보안 경계 — 확정 (2026-08-26)**:
   - BFF 패턴 유지는 애초에 양쪽 저장소 CLAUDE.md의 절대 규칙이라 재확인
     불필요 — cms.api에 `/api/v1/my-products` 같은 신규 엔드포인트를 만들고
     gospelfix가 `serverFetch()`로 프록시하는 구조 그대로 적용.
   - **이미지 업로드는 cms.api REST 서버 경유 업로드**로 확정. seller가
     브라우저에서 Supabase Storage에 anon key로 직접 업로드하지 않는다 —
     gospelfix → cms.api `/api/v1/*` 엔드포인트로 파일을 전송하면 서버가
     검증 후 Storage에 저장한다. anon key를 브라우저에 노출할 필요가 없어지고
     기존 admin 전용 RLS 정책을 seller까지 확장하지 않아도 됨(서버가 대신
     권한 검증).
5. ✅ **기존 상품 데이터 마이그레이션 — 확정 (2026-08-26)**: 기존에 cms.api
   관리자가 등록해둔 상품은 **GospelFix 공식 소유(무소유/시스템)**로 남긴다 —
   특정 seller 개인에게 귀속시키지 않는다. `seller_id` 컬럼을 신설하되 기존
   행은 전부 `NULL`(또는 "GospelFix 공식" 전용 값)로 채우는 방식. 신규 등록
   상품만 실제 seller의 `seller_id`를 갖는다.

**How to apply:** "마이페이지 상품 등록/CRUD" 관련 작업 요청이 들어오면 이
메모리를 먼저 로드할 것 — 5개 확인 목록은 전부 확정됐으므로 다시 질문할 필요
없이 위 결정 사항대로 구현을 시작하면 된다. 단 seller 역할 부여 방식(관리자
수동 지정 vs 다른 기준)은 아직 열려 있으니, 실제 "seller 신청/지정" 플로우를
구현하기 직전에 이 하나만 확인할 것.

## 구현 완료 (2026-08-26) — 양쪽 저장소 API 계약

gospelfix와 cms.api 양쪽 모두 아래 계약대로 구현·빌드 검증까지 완료했다. 마이그레이션
055를 Supabase 대시보드에서 수동 실행해야 실제로 end-to-end 동작한다(그 전까지는
DB에 컬럼/역할이 없어 500).

**구현된 gospelfix 파일:**
- `src/types/product.types.ts` — `SellerProductInput`, `SellerProduct`,
  `SellerProductStatus`("draft"/"pending"/"approved"/"rejected")
- `src/lib/api/myProducts.ts` — `CmsMyProduct`(cms.api 응답 camelCase 타입),
  `toSellerProduct()`(응답 매핑), `toCmsProductInput()`(요청 매핑)
- `src/app/api/my-products/route.ts` — GET(목록)/POST(생성)
- `src/app/api/my-products/[id]/route.ts` — GET(단건)/PATCH(수정)/DELETE(삭제)
- `src/app/api/my-products/images/route.ts`, `files/route.ts` — 이미지/zip
  업로드 프록시(auth/avatar/route.ts와 동일하게 원본 fetch로 multipart 프록시)
- `src/components/growth/UploadWorkEditor.tsx`(`/growth/upload`) — cms.api
  ProductForm과 동일한 필드셋(카테고리/가격·할인/구매항목/코드미리보기/제작솔루션
  등)으로 확장, seller/admin이 아니면 "판매자 전용" 안내, 비로그인이면 로그인
  모달. `?id=` 쿼리로 수정 모드 지원. content_html은 이미지+텍스트 블록을
  순서대로 이어붙여 직렬화(역방향 변환은 텍스트 블록 1개로 단순화)
- `src/app/(mypage)/mypage/products/page.tsx` — 내 상품 목록(seller/admin만
  접근, 상태 배지, 수정/삭제)
- `src/components/mypage/MypageSidebar.tsx` — seller/admin에게만 "내 상품" 표시

**cms.api가 구현한 엔드포인트 (2026-08-26 완료):**

| 메서드 | 경로 | 용도 |
|---|---|---|
| GET | `/api/v1/my-products/me` | 본인(access_token) 소유 상품 목록 |
| POST | `/api/v1/my-products` | 상품 생성 |
| GET | `/api/v1/my-products/:id` | 단건 조회(본인 소유만) |
| PATCH | `/api/v1/my-products/:id` | 수정(본인 소유만) |
| DELETE | `/api/v1/my-products/:id` | 삭제(본인 소유만) |
| POST | `/api/v1/my-products/images` | 이미지 업로드(multipart, `file` 필드) → `{ url }` |
| POST | `/api/v1/my-products/files` | zip 업로드(multipart, `file` 필드) → `{ path }` |

목록/단건 조회 응답은 `{ data: CmsMyProduct }` 또는 `{ data: CmsMyProduct[] }`
형태(기존 cms/cart, /api/v1/orders/me와 동일한 `{ data }` 래핑 컨벤션).
DELETE는 `{ success: boolean }`.

**`CmsMyProduct` 필드(camelCase, `src/lib/api/myProducts.ts` 참고):** id, slug,
name, description, contentHtml, discountStartsAt, discountEndsAt, category,
images, thumbnailUrl, demoUrl, price, supplyPrice,
purchaseOptions[{id,label,price,description,workPeriodDays,isInquiryOnly,detail}],
productionSolution, productCode, designType, hasAiStarterKit, filePath,
codePreview[{id,label,code}], status, sellerId, isActive, likeCount, createdAt,
updatedAt.

**POST/PATCH 요청 바디(camelCase, `toCmsProductInput()` 참고):** 위 필드와
동일한 camelCase 키 + `status`("draft"|"pending", seller가 초안저장/게시 중
선택). `sellerId`/`id`/`createdAt` 등 서버 생성 필드는 요청에 없음 — access_token
으로 소유자를 서버가 직접 판별해야 한다.

**주의:** 이 계약은 gospelfix가 먼저 정의한 것이라, cms.api 구현 중 불가피하게
바뀌어야 하면(예: 필드명 조정) gospelfix 쪽 `lib/api/myProducts.ts`도 함께
고쳐야 한다 — 한쪽만 바꾸면 조용히 깨진다.
