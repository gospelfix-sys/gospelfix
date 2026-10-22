---
name: referral_banner_config_feature
description: gospelfix.cms.api 신규 기능 — 추천인 배너 문구/할인율을 referral_banner_config 싱글턴 테이블로 통합(is_enabled/discount_rate 관심사 분리), 1차 BLOCKED(Major, 토글 위젯 중복)
type: project
---

2026-08-12, `gospelfix.cms.api`(자매 저장소) 리뷰. 배경: `gospelfix`(프론트)의 "추천인 코드
공유" 배너 문구/할인율이 프론트 하드코딩 + `referrals.ts`의 `REFERRAL_COUPON_DISCOUNT_RATE`
상수에 각각 따로 있어 표시-실제 불일치 위험이 있었음 — `referral_banner_config`(싱글턴 1
row)로 통합.

## 신규/수정 파일 (cms.api)
- `supabase/migrations/041_add_referral_banner_config.sql` — `006_add_auth_api_configs.sql`과
  동일한 RLS(admin full access)/트리거(`set_updated_at`, `001`에 이미 정의된 것 재사용) 패턴
- `src/libs/supabase/queries/referral-banner-config.ts` — `getReferralBannerConfig()`(에러
  발생 시 throw 없이 `null` 반환 — 이 설계가 핵심), `updateReferralBannerConfig()`
- `src/app/api/v1/settings/referral-banner/route.ts` — GET, `!is_enabled`면 404(fail-closed,
  `content_api_configs` 컨벤션과 동일)
- `src/libs/openapi/schemas/referral-banner.schema.ts` + `dynamic-spec.ts`에 무조건 등록
  (auth 엔드포인트와 동일한 "토글 꺼도 Swagger엔 노출" known gap 감수, 주석으로 명시)
- `src/components/admin/ReferralBannerConfigCard/index.tsx` +
  `src/app/(admin)/settings/ReferralBannerSettingsSection.tsx` + `actions.ts`의
  `updateReferralBannerConfigAction`(`requireAdminPage()` 시작)
- `referrals.ts`의 `applyReferral()`이 `REFERRAL_COUPON_DISCOUNT_RATE` 상수 대신
  `getReferralBannerConfig()`의 `discount_rate`를 읽도록 변경 (grep 재확인 결과 구 상수 참조
  0건)

## 핵심 설계 검증 결과 (모두 통과)

1. **`is_enabled`(배너 노출)/`discount_rate`(실제 쿠폰) 분리**: `GET` 라우트는 `is_enabled`
   체크하지만 `applyReferral()`은 이를 무시하고 `discount_rate`만 읽음 — 배너를 꺼도 추천
   프로그램 자체는 계속 동작해야 한다는 요구사항이 정확히 구현됨.
2. **`Promise.all([profiles.update(referred_by), getReferralBannerConfig()])` 병렬화 안전**:
   `getReferralBannerConfig()`가 내부적으로 에러를 캐치해 절대 throw하지 않고 `null`만
   반환하는 설계라, `Promise.all`은 오직 `referred_by` 업데이트 실패 시에만 reject됨 — config
   조회 실패가 필수 작업을 막지 않고 `DEFAULT_REFERRAL_DISCOUNT_RATE`로 안전하게 폴백.
3. **REST API 체크리스트(`rest-api-endpoint-checklist.md`) 완전 충족**: `/settings` 토글 +
   OpenAPI 등록 둘 다 빠짐없이 처리.

## Major — 토글 스위치 위젯 UI 2곳 중복 (2026-08-12 발견)

`ReferralBannerConfigCard/index.tsx:82-104`의 ON/OFF 토글 마크업이
`AuthApiConfigCard/index.tsx:56-81`과 거의 완전히 동일(`h-6 w-11` 트랙,
`translate-x-[23px]`/`[3px]` 썸, 동일 색상 클래스)하게 복제됨. `AuthApiConfigCard`가 먼저
raw `<button>` + 인라인 toggle 마크업으로 구현했고, 이 저장소의 체크리스트가 "실제 구현
사례를 그대로 템플릿으로 재사용"을 권장하는 구조라 재발 가능성이 구조적으로 높음
(`components/ui/`에 `Toggle`/`Switch` 원자 컴포넌트가 아직 없음 — Glob 확인:
`button, card, dialog, form, input, popover, calendar, alert-dialog, confirm-dialog,
date-time-picker, dropdown, label, sonner`뿐).

**Why:** gospelfix(main) 리뷰에서 확립된 "위젯 단위 UI 2곳 이상 반복 → Major, 공용 컴포넌트로
추출" 규칙과 동일 클래스. cms.api도 `components/ui/button.tsx`(cva 기반)를 갖춘 동일한
shadcn/ui + Tailwind 스택이라 같은 기준 적용이 타당함.

**How to apply:** 다음에 cms.api에 새 On/Off 토글이 추가될 때(체크리스트가 명시적으로
`AuthApiConfigCard`를 템플릿으로 재사용하라고 권장하므로 매우 높은 확률로 재발) 세 번째
복제가 생기기 전에, `components/ui/Toggle.tsx`(`{ checked, onChange, disabled }` props, cva
기반) 추출을 제안할 것. `save` 버튼(raw `<button>`)도 `Button` 컴포넌트 미사용 상태 — 함께
정리 권장하되 이는 이 저장소의 기존 관행(신규 결함 아님)이라 Minor 수준.

**정확한 위치(코디네이터 요청으로 2026-08-12 재확인)**:
- `ReferralBannerConfigCard/index.tsx:82-104` (토글 button 전체), `:106-113` (raw save button,
  별도 부가 지적)
- `AuthApiConfigCard/index.tsx:56-81` (토글 button 전체)
- 두 파일 모두 `h-6 w-11` 트랙, `translate-x-[23px]`/`[3px]` 썸, `bg-black dark:bg-white`/
  `bg-gray-200 dark:bg-gray-600` 색상까지 토큰 단위로 동일.

**제안한 공용 컴포넌트 구체 스펙**: `src/components/ui/switch.tsx`의 named export `Switch`.
```ts
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;   // 기존 aria-label 패턴 유지, 필수
  label?: string;      // 트랙 좌측 텍스트("배너 노출 ON" 등), 생략 시 트랙만 렌더링
  className?: string;
}
```
`role="switch"` + `aria-checked`로 구현하고 `cn()`으로 className 병합. `AuthApiConfigCard`의
`handleToggle`(클로저로 `!isEnabled` 계산)은 `onCheckedChange(next)`가 다음 상태를 직접
넘겨주므로 제거 가능 — 리팩터링 시 이 부분도 함께 단순화할 것.

## Minor — 해소 대상 아님
- `referral_banner_config` 싱글턴 보장이 앱 레벨 관례("공개 insert API 안 만듦")에만 의존,
  DB 제약 없음. `auth_api_configs`(006)도 동일 패턴이라 이번 PR만의 새 리스크는 아님.

## 판정 (2026-08-12, 1차)

BLOCKED — Major 1건(토글 위젯 중복). Critical 없음. Bash 도구 없어 tsc/eslint/build 직접
미실행([[no_bash_tool_constraint]]), 사용자가 로컬 `yarn lint && yarn build` 통과 보고.

## 2차 재검증 (2026-08-12, 같은 날) — Major 해소, APPROVED

제안한 스펙 그대로 `src/components/ui/switch.tsx`에 `Switch` 컴포넌트
(`{checked, onCheckedChange, disabled, ariaLabel, label, className}`, `role="switch"` +
`aria-checked` — 원래 raw button보다 접근성 개선됨)를 추출하고, `AuthApiConfigCard/index.tsx:56-63`
+ `ReferralBannerConfigCard/index.tsx:83-89` 둘 다 이를 사용하도록 교체 확인.
`AuthApiConfigCard`의 `handleToggle`도 `(next: boolean) => {...}` 형태로 단순화되어
`onCheckedChange`에 직접 연결됨(제안한 리팩터링과 일치). `h-6 w-11`/`translate-x-[23px]` 등
토글 마크업이 더 이상 두 파일에 중복되지 않고 `switch.tsx` 한 곳에만 존재 — 색상/크기 변경
시 한 파일만 고치면 모든 호출부에 반영되는 구조로 전환됨.

**최종 판정: APPROVED.** 잔존 Minor(`ReferralBannerConfigCard/index.tsx:91-98`의 저장 버튼이
여전히 raw `<button>` — 1곳에서만 쓰여 "2곳 이상 반복" Major 기준 미해당, 백로그 유지)는
커밋 판정에 영향 없음. `switch.tsx`는 이 저장소 최초의 공용 Toggle/Switch 원자 컴포넌트로,
향후 새 On/Off 토글이 필요할 때 재사용 우선 검토 대상.

관련: [[referral_review_reward_coupon_feature]](같은 추천인 기능의 이전 라운드 — 쿠폰 발급
TOCTOU 레이스, ReferralCodeCard 플로팅 배너화), [[recurring_issues]](raw button/위젯 중복
패턴 총정리, 지금까지는 gospelfix(main) 전용 기록이었으나 cms.api에서도 동일 클래스 재발
확인됨 — 향후 cms.api 전용 발생 건도 이 문서에 함께 추적할 가치 있음).

## 2026-08-12 — `gospelfix`(프론트) 소비 라운드, APPROVED (1차)

같은 날, 위 cms.api 신규 API를 프론트가 소비하도록 반영한 작업(`.claude/plans/
lovely-weaving-diffie.md`)을 별도로 리뷰. 신규: `types/referralBanner.types.ts`,
`app/api/referral-banner/route.ts`, `lib/api/referralBanner.ts`. 수정:
`components/mypage/ReferralCodeCard.tsx`(message prop 추가 + 닫기를 로컬 state에서
localStorage 7일 TTL 스누즈로 교체), `(mypage)/layout.tsx`/`(public)/growth/page.tsx`
(`Promise.all`에 `getReferralBanner()` 추가, `banner &&` 조건부 렌더링, 하드코딩 폴백
문구 의도적으로 미도입).

**검증 결과 — 이슈 0건, 계획서와 구현 100% 일치**:
- `cmsApiFetch`는 신규 `app/api/referral-banner/route.ts` 안에서만 호출됨(CLAUDE.md 절대
  규칙 준수). `lib/api/referralBanner.ts`는 `serverFetch()`로 자기 자신의 `/api/*`만 호출.
- `route.ts`가 `CmsApiError` 여부와 무관하게 제네릭 `catch`로 모든 실패(404, 엔드포인트
  미배포로 인한 네트워크 에러, `CMS_API_BASE_URL`/`CMS_API_KEY` 미설정 시의 plain Error
  포함)를 흡수해 항상 `NextResponse.json(null)` 응답 — `Promise.all` 안에서 호출돼도 절대
  throw하지 않음(`app/api/coupons/route.ts`와 동일한 기존 컨벤션). `lib/api/referralBanner.ts`
  에도 이중으로 try/catch가 있어 방어가 2중.
- localStorage TTL 로직은 `dismissed` 초기값을 `false`로 시작하고 실제 판정은
  마운트 후 `useEffect`에서만 수행 — SSR/CSR 초기 렌더가 항상 일치해 하이드레이션
  불일치 없음(`useCookieConsent.ts`와 동일한 패턴).
- 호출부 2곳 모두 `banner &&` 가드로 `message`가 없을 때 컴포넌트 자체를 렌더링하지 않음,
  하드코딩 폴백 문구 없음(표시-실제 불일치 재도입 방지라는 이번 작업의 핵심 목적과 일치).
  `ReferralCodeCard` 사용처가 이 두 곳뿐임을 grep으로 확인, 누락된 호출부 없음.
  기존 framer-motion 진입 애니메이션/`useCookieConsent` 위치 오프셋은 diff에 포함되지
  않아 회귀 없음.
- 스타일 규칙(`style=`, `asChild`, 홑따옴표, `cn()` 미사용) 위반 0건. 이전 라운드에서
  발견됐던 닫기(X) 버튼 raw `<button>`(`referral_review_reward_coupon_feature.md`의
  "후속 라운드" Major)도 이미 `Button variant="ghost" size="icon-sm"`로 해소된 상태 유지 확인.

**판정: APPROVED.** `ReferralBanner.discount_rate` 필드가 타입에는 있으나
`ReferralCodeCard`가 실제로는 `message`만 소비(discount_rate 미사용) — 버그는 아니고
향후 확장 여지로 API 형태를 맞춘 것(계획서에 명시), Minor 수준 참고 사항으로만 기록.

## 2026-08-12 — 싱글턴 → 리스트형 CRUD 전면 재설계 (cms.api), 1차 BLOCKED

같은 날 요구사항이 "여러 배너 등록 + 순차 롤링 표시, 배너마다 개별 할인율"로 명확해져
`referral_banner_config` 싱글턴을 완전히 폐기하고 `referral_banners`(리스트) 테이블 +
`products`/`portfolio`와 동일한 admin CRUD triad(테이블/쿼리/페이지/폼/액션/사이드바)로
재설계. `migrations/042_replace_referral_banner_config_with_list.sql`이 041 싱글턴
테이블을 drop하고 새 테이블 생성 + `content_api_configs`에 `referral-banners` row 추가
(제네릭 `/api/v1/[resource]` 라우트가 자동 서빙 — 전용 route.ts 불필요, products/blog와
동일 패턴). `referral-banners.admin.ts`는 explicit column allowlist 준수, `referrals.ts`의
`applyReferral()`은 `getPrimaryActiveReferralBanner()`(항상 null 폴백, throw 없음)로
전환되어 `Promise.all` 안전성 유지. 싱글턴 시절 파일(`ReferralBannerConfigCard`,
`referral-banner-config.ts`, `/api/v1/settings/referral-banner/route.ts` 등) 전부 삭제
확인, grep 결과 잔존 참조 0건.

### Critical — `middleware.ts`의 `config.matcher`에 `/referral-banners/:path*` 누락
`src/middleware.ts:5`의 `ADMIN_PATHS` 배열에는 `/referral-banners`가 추가됐지만,
`config.matcher`(:76-93) 배열에는 다른 모든 admin 리소스(`/users`, `/orders`, `/quotes`,
`/blog`, `/products`, `/portfolio`, `/profile`, `/settings`)와 달리 `/referral-banners/:path*`
항목이 빠짐 — Next.js는 `matcher`에 없는 경로는 미들웨어 함수 자체를 실행하지 않으므로
`ADMIN_PATHS`의 `/referral-banners` 체크는 완전한 죽은 코드가 됨.

페이지 뷰 자체는 `(admin)/layout.tsx`의 `requireAdminPage()`(Server Component, 항상
렌더 트리에서 실행)가 별도로 보호하므로 안전하지만, `referral-banners/actions.ts`의
Server Action들(`createReferralBannerAction`/`updateReferralBannerAction`/
`deleteReferralBannerAction`/`duplicateReferralBannerAction`/
`updateReferralBannersSortOrderAction`)은 **자체적으로 `requireAdminPage()`를 호출하지
않음**(`products/actions.ts`와 동일 컨벤션 — 원래도 미들웨어의 `isAuthenticated` 체크에만
의존하는 구조). matcher 누락과 결합되면 이 5개 Server Action은 **미들웨어조차 실행되지
않아 완전히 무인증 상태로 직접 호출 가능**해짐 — `products`/`blog`/`portfolio` 등 다른
리소스는 matcher에 등록돼 있어 최소한 "미인증이면 차단"은 되는 것과 대비됨(단,
"인증됐지만 admin이 아닌 사용자" 차단은 어차피 안 됨 — 아래 참고).

**Why:** Next.js Server Action은 페이지 URL로의 POST 요청으로 구현되므로, 페이지가
`config.matcher`에 없으면 그 URL로의 Server Action 호출도 미들웨어를 우회한다.
**How to apply:** 새 admin 리소스를 추가할 때 `ADMIN_PATHS`와 `config.matcher`는
반드시 함께(같은 diff에서) 갱신해야 한다 — 하나만 갱신하면 다른 쪽이 조용히 무력화된다.
다음에 신규 admin 리소스를 리뷰할 때 이 두 배열이 1:1 대응하는지 항상 diff로 확인할 것.

### Major — `dynamic-spec.ts`가 `registerReferralBannerPaths`를 이중 등록
`src/libs/openapi/dynamic-spec.ts:48-50`에 `registerReferralBannerPaths(reg)`를
"auth 엔드포인트와 동일한 known gap을 감수한다"는 주석과 함께 무조건 호출하면서도,
**동시에** `TYPED_SLUGS`(:24)에도 `'referral-banners': registerReferralBannerPaths`로
등록되어 있어 `content_api_configs.is_enabled`가 `true`(마이그레이션 기본값)인 한
루프(:53-59)에서 또 한 번 호출됨 — 같은 경로가 두 번 등록되는 이중 등록 버그.

`registerAuthPaths`(주석이 비교 대상으로 든 진짜 known-gap 사례)는 애초에 `TYPED_SLUGS`에
없으므로 이중 등록이 발생하지 않는다 — referral-banners는 `content_api_configs` 기반
테이블 CRUD 리소스라 체크리스트상 TYPED_SLUGS 등록만으로 충분히 toggle-aware가
되는데(`/settings`에서 꺼지면 Swagger에서도 자동으로 사라짐), 무조건 호출 줄을 지우지
않아 그 toggle-awareness가 무력화됨. `@asteasolutions/zod-to-openapi`의 `registerPath()`는
단순히 배열에 push만 하고 중복 검사를 하지 않아(node_modules 확인) 빌드/런타임 크래시는
없지만(같은 route 정의가 두 번 push되어도 최종 생성된 paths 객체에서 동일 키가 덮어써질
뿐), 의도(TYPED_SLUGS로 전환)와 실제 동작이 어긋나는 논리 버그.

**Fix**: `dynamic-spec.ts:48-50`(주석 포함)을 삭제하고 TYPED_SLUGS 등록만 남긴다.

### Minor/참고 — 이번 PR 범위 밖의 시스템적 갭
`referral-banners/actions.ts`뿐 아니라 `products`/`portfolio`/`blog` 등 대부분의
admin CRUD `actions.ts`가 자체적으로 `requireAdminPage()`(role 검증)를 호출하지 않고
미들웨어의 `isAuthenticated`(로그인 여부만) 체크에만 의존 — "로그인은 했지만 admin이
아닌 사용자"가 Server Action을 직접 호출하면 차단되지 않는 구조적 갭이 저장소 전반에
존재함(`settings/actions.ts`만 예외적으로 `requireAdminPage()` 자체 검증). 이번 PR이
새로 만든 문제는 아니고 기존 컨벤션을 그대로 따른 것이지만, 규모가 있는 후속 정리
작업으로 제안할 가치 있음.

### 판정 (2026-08-12)
BLOCKED — Critical 1건(middleware matcher 누락으로 인한 무인증 Server Action 호출
가능), Major 1건(OpenAPI 이중 등록). 그 외 나머지(쿼리 파일 explicit column list,
`useAdminRowActions`/`Switch`/`EmptyState`/`RowActionMenu` 등 공용 위젯 재사용, 마이그레이션
멱등성, 싱글턴 잔존 코드 0건, content_api_configs select_columns가 is_enabled 필터
컬럼을 응답에서 제외하는 기존 관행 준수)는 전부 이 저장소 컨벤션과 일치해 이슈 없음.
`yarn lint`/`yarn build` 통과는 사용자 보고([[no_bash_tool_constraint]] — Bash 도구 없어
직접 미실행), 위 두 이슈는 타입/lint 레벨에서 잡히지 않는 논리·설정 버그라 별도 확인 필요.
