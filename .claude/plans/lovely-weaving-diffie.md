# 추천인 배너 — 설정 카드 → 리스트형 CRUD 메뉴로 재설계

## Context

방금 전 작업에서 `gospelfix.cms.api`의 `/settings` 페이지에 "추천인 배너 설정" 카드(문구 1개
+ 할인율 1개를 편집하는 싱글턴 설정)를 추가했다. 그런데 사용자가 요구사항을 명확히 하면서
방향이 바뀌었다: 배너 문구를 **공지사항처럼 여러 개 등록**해두고, 프론트에서는 활성화된
것들이 **순차적으로 롤링(회전) 표시**되어야 한다. 또한 각 메시지마다 **개별 할인율**을 가지며,
그중 우선순위가 가장 높은(=목록 맨 앞) 항목의 할인율이 실제 추천 쿠폰 발급에 적용된다.

이건 단일 설정 레코드가 아니라 진짜 **리스트형 CRUD 리소스**이므로, `/settings`의 커스텀
토글 카드 방식이 아니라 이 저장소가 이미 갖춘 "관리자 메뉴 하나 = 리스트+생성+수정+삭제"
패턴(products/blog/portfolio와 동일한 구조)을 그대로 따르는 것이 맞다. 방금 만든 싱글턴
관련 코드(설정 테이블 041 마이그레이션, 커스텀 GET 라우트, 설정 카드/섹션)는 아직 프로덕션에
반영되지 않았으므로(041 마이그레이션 미실행, 커밋만 된 상태) 안전하게 새 설계로 교체한다.

## 핵심 설계 결정 (사용자 확인 완료)

1. **노출 방식**: 활성화된 배너들이 같은 위치(플로팅 배너)에서 순차적으로 롤링 표시.
2. **할인율 구조**: 각 배너 항목마다 개별 `discount_rate`를 가짐.
3. **실제 쿠폰 발급에 쓰이는 할인율**: 롤링 순서(=`sort_order`, 관리자 화면의 드래그 정렬과
   동일)상 **맨 앞에 있는 활성 배너**의 `discount_rate`를 `applyReferral()`이 사용한다 —
   "지금 가장 먼저 보여지는 배너"와 "실제 지급되는 혜택"을 일치시키는 결정 규칙.

## 기존에 발견한 핵심 재사용 자산 (cms.api)

이 저장소는 이미 리스트형 관리자 CRUD를 표준화해뒀다 — 새로 설계할 필요 없이 그대로 복제:

- **공개 리스트 API는 커스텀 route.ts가 필요 없다.** `src/app/api/v1/[resource]/route.ts`
  (제네릭)가 `content_api_configs` 테이블의 row 하나(`resource_slug`, `table_name`,
  `filter_column`/`filter_value`/`filter_is_bool`, `order_column`/`order_direction`,
  `select_columns`)만으로 `GET /api/v1/{slug}?page=&limit=`를 자동 제공한다
  (`src/libs/supabase/queries/content-api-configs.ts`의 `queryConfigList`). `products`/`blog`가
  이 패턴이다(`supabase/migrations/002_content_api_configs_and_reviews.sql`의 insert 예시 확인).
  → `referral_banner_config` 싱글턴용으로 만들었던 전용 `GET /api/v1/settings/referral-banner`
  route.ts는 이제 불필요 — 삭제하고 `content_api_configs`에 row 추가로 대체.
- **관리자 목록 화면 3종 세트**: `src/app/(admin)/products/page.tsx`(목록) +
  `ProductsTable.tsx`(드래그 정렬/삭제확인/복제, `useAdminRowActions` 훅 +
  `RowActionMenu`/`ConfirmDialog`/`AlertDialog` 재사용) + `actions.ts`(`create*/update*/delete*
  /duplicate*/update*SortOrder` — **`requireAdminPage()` 호출 없음**, 미들웨어 `ADMIN_PATHS`
  가드에 의존하는 게 이 도메인 actions.ts의 컨벤션. `settings/actions.ts`만 예외적으로
  자체 재검증함).
- **`useAdminRowActions<T extends {id:string}>`** (`src/hooks/useAdminRowActions.ts`)이 드래그
  정렬·삭제확인·복제·메뉴 상태를 전부 캡슐화 — 우리 배너 테이블도 그대로 사용.
- **쿼리 함수 패턴**: `products.admin.ts`의 `getAllProducts/getProductByIdAdmin/createProduct/
  updateProduct/deleteProduct/duplicateProduct/updateProductsSortOrder` 시그니처를 그대로 축소
  복제(우리는 이미지/리치에디터 등 복잡한 필드가 없어 `products.admin.ts`보다 훨씬 단순).
- **사이드바 메뉴**: `src/components/admin/Sidebar/index.tsx`의 `NAV_ITEMS` 배열에 항목 추가.
- **미들웨어 보호**: `src/middleware.ts`의 `ADMIN_PATHS` 배열에 새 경로 추가 필요(빠뜨리면
  비로그인 사용자도 관리자 목록 페이지 자체는 접근 가능해짐 — role 체크는 별도지만 1차
  방어선 누락).
- **OpenAPI**: 리스트형 리소스이므로 `product.schema.ts`의 `ProductListResponseSchema` +
  `registerPath({path:'/api/v1/{slug}', query:{page,limit}})` 패턴을 그대로 따르고,
  `dynamic-spec.ts`의 `TYPED_SLUGS`에 등록(무조건 호출이 아니라 `content_api_configs.is_enabled`
  꺼지면 자동으로 Swagger에서도 사라지는 정석 방식 — 이전 싱글턴 설계 때 감수했던 "known gap"이
  이번엔 해당하지 않음).
- **공용 `Switch` 컴포넌트**: 방금 세션에서 `src/components/ui/switch.tsx`로 추출해뒀다
  (`{checked, onCheckedChange, disabled, ariaLabel, label, className}`) — 배너 폼의 노출 토글에
  그대로 재사용.

## 롤백/교체 대상 (이전 싱글턴 설계)

**cms.api 삭제**:
- `src/app/api/v1/settings/referral-banner/route.ts`
- `src/components/admin/ReferralBannerConfigCard/index.tsx`
- `src/app/(admin)/settings/ReferralBannerSettingsSection.tsx`

**cms.api 수정(되돌림)**:
- `src/app/(admin)/settings/actions.ts` — `updateReferralBannerConfigAction` 제거
- `src/app/(admin)/settings/page.tsx` — `<ReferralBannerSettingsSection />` 제거
- `src/libs/openapi/dynamic-spec.ts` — 무조건 호출하던 `registerReferralBannerPaths(reg)` 제거,
  대신 `TYPED_SLUGS`에 등록
- `src/libs/openapi/schemas/referral-banner.schema.ts` — 싱글턴 응답 스키마를 리스트 응답
  스키마로 전면 재작성
- `src/libs/supabase/queries/referrals.ts` — `getReferralBannerConfig()` 대신 새 리스트 쿼리의
  "첫 활성 항목 조회" 함수를 사용

**cms.api 마이그레이션**: `041_add_referral_banner_config.sql`은 그대로 git 이력에 남겨두되(아직
미실행이라도 이미 커밋된 파일을 되돌려 다시 쓰는 것보다, 신규 마이그레이션으로 정리하는 편이
"실행 이력 기록"이라는 이 저장소 마이그레이션 파일의 취지에 맞음), 신규
`042_replace_referral_banner_config_with_list.sql`에서 `drop table if exists
public.referral_banner_config cascade;`로 시작해 041 실행 여부와 무관하게 안전하게 정리한다.

**gospelfix 쪽은 삭제 없이 "고쳐 쓰기"**: `src/app/api/referral-banner/route.ts` →
`src/app/api/referral-banners/route.ts`(복수형으로 개명, 리스트 반환하도록 재작성),
`src/lib/api/referralBanner.ts` → `referralBanners.ts`, `types/referralBanner.types.ts`는
필드만 확장. `ReferralCodeCard.tsx`는 message prop 하나 받던 것에서 배너 배열을 받아 내부
롤링하도록 재작성.

---

## 1. `gospelfix.cms.api` 구현

### 1-1. 마이그레이션 — `supabase/migrations/042_replace_referral_banner_config_with_list.sql`

- `drop table if exists public.referral_banner_config cascade;` (041 실행 여부 무관하게 안전)
- `create table public.referral_banners`: `id uuid PK`, `message text not null`,
  `discount_rate integer not null default 50 check (between 1 and 100)`,
  `is_enabled boolean not null default true`, `sort_order integer not null default 0`,
  `created_at`/`updated_at timestamptz` + `set_updated_at` 트리거 + admin-only RLS(006/041과
  동일 정책 SQL).
- 시드 데이터로 기존 하드코딩 문구를 1행 insert(`sort_order=1`).
- `content_api_configs`에 신규 row insert: `resource_slug='referral-banners'`,
  `label='추천인 배너'`, `table_name='referral_banners'`, `is_enabled=true`,
  `filter_column='is_enabled'`, `filter_value='true'`, `filter_is_bool=true`,
  `identifier_column='id'`, `identifier_type='uuid'`, `order_column='sort_order'`,
  `order_direction='asc'`,
  `select_columns='id,message,discount_rate,sort_order,created_at,updated_at'`
  (`002_content_api_configs_and_reviews.sql`의 insert 문법 그대로 재사용).

### 1-2. 어드민 쿼리 — `src/libs/supabase/queries/referral-banners.admin.ts` (신규)

`products.admin.ts` 패턴 축소 복제:
- `getAllReferralBanners()` — `sort_order asc, created_at desc` 2차 정렬(products와 동일 이유:
  동순위 행 순서 안정화)
- `getReferralBannerByIdAdmin(id)`
- `createReferralBanner(input)` / `updateReferralBanner(id, input)` / `deleteReferralBanner(id)`
- `duplicateReferralBanner(id)` (`useAdminRowActions`가 필수로 요구하는 액션이라 함께 구현 —
  가장 큰 sort_order+1로 복제)
- `updateReferralBannersSortOrder(updates: {id, sort_order}[])`
- `getPrimaryActiveReferralBanner()` — `is_enabled=true` 중 `sort_order asc` 1건(`limit(1)`) —
  `referrals.ts`가 실제 쿠폰 할인율 조회에 사용. row 없으면 null.

### 1-3. `referrals.ts` 수정

`getReferralBannerConfig`/`DEFAULT_REFERRAL_DISCOUNT_RATE` import를
`getPrimaryActiveReferralBanner`(from `referral-banners.admin.ts`)로 교체. 로직은 이전과 동일—
`Promise.all([profiles.update, getPrimaryActiveReferralBanner()])` 병렬 조회 유지, row 없으면
`50`으로 폴백(상수는 이 파일에 인라인 유지).

### 1-4. 관리자 화면 — `src/app/(admin)/referral-banners/`

- `page.tsx` — `getAllReferralBanners()` 조회 + `EmptyState` + "새 배너" 링크(products/page.tsx
  그대로 복제)
- `ReferralBannersTable.tsx` — `useAdminRowActions` + `RowActionMenu` +
  `ConfirmDialog`/`AlertDialog`, 컬럼: 문구(truncate) / 할인율 / 노출상태 배지 / 등록일 /
  액션메뉴. 드래그 정렬 = 롤링 순서 그 자체이므로 특히 중요한 UX.
- `actions.ts` — `createReferralBannerAction/updateReferralBannerAction/
  deleteReferralBannerAction/duplicateReferralBannerAction/updateReferralBannersSortOrderAction`
  (products/actions.ts와 동일하게 `requireAdminPage()` 없이 얇게 위임 — 미들웨어가 1차 방어)
- `ReferralBannerForm.tsx` (신규, new/edit 공용) — message(textarea) + discount_rate(number
  1~100) + is_enabled(`Switch` 컴포넌트 재사용). `save` 버튼도 이번엔 `components/ui/button.tsx`
  사용(이전 싱글턴 카드에서 raw button으로 남겨뒀던 Minor를 여기선 처음부터 정리).
- `new/page.tsx`, `[id]/edit/page.tsx` — `getReferralBannerByIdAdmin` 조회 후 `ReferralBannerForm`
  렌더(products의 `new/page.tsx` + edit 페이지 구조 그대로).

### 1-5. 사이드바/미들웨어

- `Sidebar/index.tsx`의 `NAV_ITEMS`에 `{ label: '추천인 배너', href: '/referral-banners' }` 추가
  (products/portfolio 사이 적절한 위치).
- `middleware.ts`의 `ADMIN_PATHS`에 `'/referral-banners'` 추가.

### 1-6. OpenAPI — `src/libs/openapi/schemas/referral-banner.schema.ts` 재작성

`product.schema.ts`의 리스트 패턴을 그대로 축소 복제: `ReferralBannerSchema`(id, message,
discount_rate, sort_order, created_at, updated_at) + `ReferralBannerListResponseSchema`(data/
total/page/limit) + `registerReferralBannerPaths(reg)`가 `GET /api/v1/referral-banners`
(page/limit 쿼리) 하나만 등록. `dynamic-spec.ts`의 `TYPED_SLUGS`에
`'referral-banners': registerReferralBannerPaths` 추가, 기존에 무조건 호출하던 줄 제거.

### 1-7. `/settings` 원복

- `settings/actions.ts`에서 `updateReferralBannerConfigAction` 및 관련 import 제거
- `settings/page.tsx`에서 `<ReferralBannerSettingsSection />`과 해당 import 제거
- `ReferralBannerConfigCard/`, `ReferralBannerSettingsSection.tsx` 파일 삭제
- `src/app/api/v1/settings/referral-banner/route.ts` 삭제(디렉토리째)

---

## 2. `gospelfix` 구현

### 2-1. 타입 — `src/types/referralBanner.types.ts` 수정

```ts
export interface ReferralBanner {
  id: string;
  message: string;
  discount_rate: number;
}
```

### 2-2. Route Handler — `src/app/api/referral-banners/route.ts` (신규, 기존 단수형 파일 삭제)

cms.api의 제네릭 리스트 엔드포인트를 호출: `cmsApiFetch<{data: CmsBanner[]}>
('/api/v1/referral-banners?limit=50')`. 실패 시(엔드포인트 미배포 포함) 무조건 catch해서
**빈 배열**(`NextResponse.json([])`)을 반환 — 싱글턴 때의 "null이면 렌더 안 함" 원칙을 리스트
버전으로 그대로 계승(빈 배열 = 표시할 배너 없음, 하드코딩 폴백 없음).

### 2-3. 헬퍼 — `src/lib/api/referralBanners.ts` (기존 파일 rename+재작성)

`getReferralBanners(): Promise<ReferralBanner[]>` — 실패 시 catch해서 빈 배열 반환(throw 안 함,
`getMe()`/`getReferralBanner()`와 동일한 안전 폴백 컨벤션).

### 2-4. `ReferralCodeCard.tsx` — 롤링 표시로 재작성

- props: `message: string` → `banners: ReferralBanner[]` (최소 1개 보장은 호출부의
  `banners.length > 0 &&` 조건이 담당).
- 현재 인덱스 `useState(0)` + `useEffect`: `banners.length > 1`일 때만
  `setInterval(() => setIndex(i => (i + 1) % banners.length), 5000)` 등록(언마운트 시 clear).
  배너가 1개뿐이면 인터벌 자체를 만들지 않음(불필요한 타이머 방지).
- `<AlertTitle>`을 `framer-motion`의 `AnimatePresence mode="wait"` + `motion.span`으로 감싸
  `key={banners[index].id}`, `initial={{opacity:0, y:8}} animate={{opacity:1,y:0}}
  exit={{opacity:0,y:-8}}` 크로스페이드(이미 이 저장소가 `RouteModal.tsx`에서 쓰는
  `AnimatePresence` + `FADE_TRANSITION` 스타일 그대로 재사용, `duration:0.4` 정도의 짧은
  전환 — 바깥 진입 애니메이션의 `duration:1.1`과는 별개 관심사).
- 기존 진입 애니메이션(`motion.div`, `pageLoaded`), `useCookieConsent` 위치 오프셋, 닫기 7일
  TTL 로직은 전부 그대로 유지 — 이번 변경은 오직 "문구를 어떻게 가져오고 어떻게 보여주는가"만
  건드린다.

### 2-5. 호출부 2곳

- `(mypage)/layout.tsx`: `getReferralBanner()` → `getReferralBanners()`,
  `{profile?.referral_code && banners.length > 0 && (<ReferralCodeCard referralCode={...}
  banners={banners} />)}`
- `(public)/mall/page.tsx`: 동일 패턴.

---

## 검증 방법

1. cms.api: `042` 마이그레이션을 Supabase 대시보드에서 실행(041 실행 여부 무관 안전) →
   `yarn dev` → `/referral-banners`에서 배너 2~3개 생성, 드래그로 순서 변경, 하나 비활성화 →
   목록/정렬/삭제/복제 전부 동작 확인.
2. `curl -H "X-API-Key: $INTERNAL_API_KEY" "http://localhost:3001/api/v1/referral-banners?limit=50"`
   로 활성 배너만 sort_order 순으로 오는지 확인, `/settings`의 "REST API 설정"(제네릭
   `content_api_configs` 토글)에서 이 리소스를 끄면 404로 바뀌는지 확인.
3. 실제 회원가입+추천코드 플로우로 `applyReferral()` 트리거 → 발급 쿠폰의 discount_rate가
   현재 목록 맨 앞(활성) 배너의 값과 일치하는지 확인. 맨 앞 배너를 비활성화했을 때 그 다음
   활성 배너의 값으로 넘어가는지 확인(핵심 요구사항).
4. `yarn lint && yarn build`(cms.api).
5. gospelfix: `yarn dev` → `/mall`, 마이페이지에서 배너가 5초 간격으로 문구가 바뀌는지,
   배너가 1개뿐일 때는 전환 없이 고정되는지, 0개(전부 비활성)일 때 배너 자체가 안 뜨는지 확인.
6. `yarn lint && yarn build`(gospelfix).
7. 두 저장소 모두 code-reviewer APPROVED 확인 후 각각 커밋/push.

### Critical Files
- gospelfix.cms.api: `supabase/migrations/042_replace_referral_banner_config_with_list.sql`,
  `src/libs/supabase/queries/referral-banners.admin.ts`,
  `src/app/(admin)/referral-banners/{page.tsx,ReferralBannersTable.tsx,actions.ts,
  ReferralBannerForm.tsx,new/page.tsx,[id]/edit/page.tsx}`, `src/libs/supabase/queries/referrals.ts`
- gospelfix: `src/components/mypage/ReferralCodeCard.tsx`, `src/app/api/referral-banners/route.ts`,
  `src/lib/api/referralBanners.ts`
