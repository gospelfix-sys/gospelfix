# admin → gospelfix.cms.api REST API 이전 계획

## Context

`gospelfix` 모노레포는 `main/`(사용자 앱, Next.js 14, 3000)과 `admin/`(관리자 앱, Next.js 15, 3001)로 구성되어 있다. 이번 작업의 목적은 `admin/`을 **완전히 삭제**하고, 관리자 기능을 이미 별도 경로에 존재하는 독립 프로젝트 `/Users/mac/Documents/work/GospelFix/gospelfix.cms.api`로 이전한 뒤, `main`이 Supabase에 직접 접근하지 않고 오직 `gospelfix.cms.api`가 제공하는 REST API를 통해서만 데이터를 주고받도록 아키텍처를 전환하는 것이다.

사용자가 확정한 결정사항:
1. **REST 전환 범위**: 인증을 포함한 거의 전체 백엔드. main은 Supabase를 직접 호출하지 않는다.
2. **호출 위치**: main은 서버 사이드(Server Component/Route Handler)에서만 cms.api를 호출한다. 브라우저는 cms.api를 직접 호출하지 않는다.
3. **Supabase 프로젝트**: cms.api는 자체 별도 Supabase 프로젝트(`statkit_` 접두사 스키마)를 버리고, **지금 gospelfix(main/admin)가 실제로 쓰는 기존 Supabase 프로젝트**를 그대로 바라보도록 재연결한다. 기존 테이블명(`products`, `orders`, `news`, `portfolios`, `quote_submissions`, `profiles`, `reviews`)을 그대로 유지한다.
4. **사용자 인증**: main의 일반 사용자(구매자) 로그인/회원가입/OAuth/세션도 cms.api REST API가 대행한다.

### 조사로 확인된 핵심 사실

- **`admin/` 폴더는 완전한 구현체다** (일부 정리된 상태가 아님) — `src/app/(admin)/{products,blogs,portfolios,orders,quotes,users}`, `src/libs/supabase/{products,news,orders,portfolios,quotes,users,storage,reorder,auth}.ts`, `src/components/{products,news,portfolio}` 전부 존재. 이 코드가 이식의 원본이며, 삭제는 이식 완료 후 진행한다.
- **`gospelfix.cms.api`는 빈 스캐폴드가 아니라 상당히 진행된 프로젝트다.** products/blog(news)/portfolio CRUD, `content_api_configs` 테이블 기반 동적 REST GET API, zod-to-openapi + swagger-ui-react 문서화 파이프라인이 이미 동작한다. 단 **쓰기(POST/PUT/DELETE) API가 전혀 없고**, orders/quotes/users는 MOCK 배열뿐이며, 인증은 `mock-auth` 쿠키 + env var 비교로 완전히 대체되어 있다.
- **Toss Payments 연동은 gospelfix에서 이미 제거됨**(최근 커밋). 결제는 계좌이체 + 관리자 수동 승인(`approveOrder`) 방식이므로, PG 연동을 새로 설계할 필요가 없다.
- cms.api의 `supabase/migrations/001_initial_schema.sql`은 애초에 gospelfix 실제 스키마를 추출한 것(2026-07-20)이라 `profiles/products/orders/news/portfolios/quote_submissions/content_api_configs`가 gospelfix와 거의 동일하다. 문제는 이후 `002_statkit_prefix_tables.sql`이 일부 테이블을 `statkit_` 접두사로 갈아엎은 것과, 그 스키마를 참조하도록 일부 쿼리 코드가 이미 수정된 것이다. **`reviews` 테이블은 cms.api 마이그레이션에 아예 없다** — 신규 추가 필요.
- main의 컨벤션 위반 지점(Supabase 직접 호출이 `lib/supabase/` 밖에 있는 곳): `components/products/ReviewForm.tsx`(insert/update), `(dashboard)/page.tsx`·`layout.tsx`(profiles 조회), `ReviewSection.tsx`(getUser). 이번 이전 작업에서 함께 정리한다.
- main의 인증은 Supabase Auth에 강결합(`useAuth.ts`, `login/register page`, `AuthProvider`, `interceptors.ts`가 전부 `supabase.auth.*` 직접 호출). `/api/auth/callback`은 빈 디렉토리(OAuth 콜백 미구현, 죽은 코드).

---

## 설계 원칙: main은 BFF(Backend for Frontend)가 된다

브라우저는 앞으로 cms.api를 절대 직접 호출하지 않는다. main 자신의 Route Handler/Server Action이 브라우저 요청을 받아, 서버 사이드에서 cms.api REST API를 호출하는 구조로 바뀐다.

```
브라우저 → main Route Handler/Server Action (동일 오리진) → cms.api REST API → Supabase(동일 프로젝트)
```

인증 헤더는 두 종류로 구분한다:
- `X-API-Key`: main 서버 ↔ cms.api 서버 간 신뢰 증명. 모든 호출에 포함.
- `Authorization: Bearer <supabase_access_token>`: 사용자 식별이 필요한 엔드포인트에 추가. main이 자신의 httpOnly 쿠키에서 읽어 그대로 전달(pass-through)한다.

세션의 실체(Supabase Auth JWT)는 전환 전후로 동일하므로, **기존 로그인 사용자를 강제 로그아웃시키지 않고** 전환할 수 있다.

---

## 작업 순서 (Phase)

각 Phase는 별도 PR 단위로 나누고, main 쪽 변경(P2~P4)은 `USE_CMS_API` 같은 env 플래그로 감싸 즉시 롤백 가능하게 한다.

| Phase | 내용 | main 사용자 영향 |
|---|---|---|
| **P0** | cms.api: Supabase 재연결(테이블명 원복 + reviews 테이블 신설) + 관리자 인증 실장(mock→실제) + 신규 REST 엔드포인트 전체 구현 | 없음 |
| **P1** | cms.api를 curl/Postman/`/api-docs`로 전수 검증, 어드민 UI e2e(로그인→CRUD→주문승인) | 없음 |
| **P2** | main의 읽기 전용·비인증 데이터 전환: `products.ts`, `news.ts`, `portfolios.ts` → cms.api 호출로 교체 (함수 시그니처 유지) | 상품/뉴스/포트폴리오 페이지만, 롤백 즉시 가능 |
| **P3** | 인증 필요하지만 세션 발급 방식은 안 바뀌는 쓰기 전환: `hasPurchasedProduct`, `getPurchasedOrders`, `reviews.ts`, `ReviewForm`, `/api/orders/create`, `/api/orders/notify-payment`, `/api/downloads/[productId]`, `submitQuoteAction` — 기존 access_token을 그대로 Bearer로 forward만 함 | 주문/리뷰/견적만 영향 |
| **P4** | 인증 이관: `useAuth.ts`, `AuthProvider`, `login/register page`, `interceptors.ts`, `middleware.ts`를 BFF 패턴으로 재작성. 기존 세션 쿠키는 그대로 유효 | 로그인 중 사용자는 무중단, 신규 로그인부터 새 경로 |
| **P5** | main의 `lib/supabase/*` 전체 삭제, `@supabase/supabase-js`·`@supabase/ssr` 의존성 제거 | 없음(내부 정리) |
| **P6** | `admin/` 폴더 삭제, CI/문서 정리 | 없음(내부 정리) |

---

## cms.api: 신규 REST 엔드포인트

공통 규칙: 각 리소스는 `src/libs/openapi/schemas/<resource>.schema.ts`에 zod 스키마 + `register<Resource>Paths(reg)`를 추가하고 `dynamic-spec.ts`의 `TYPED_SLUGS`에 등록하는 기존 패턴을 그대로 따른다. `BearerAuth`(http/bearer) 시큐리티 스킴을 신규 등록해야 한다(현재 `ApiKeyAuth`만 있음). 기존 동적 `GET /api/v1/[resource]`, `GET /api/v1/[resource]/[identifier]`는 유지하고, 신규 쓰기/인증 엔드포인트는 정적 폴더로 추가한다(Next.js가 정적 세그먼트를 동적보다 우선 매칭).

**사용자 인증** `src/app/api/v1/auth/*`:
- `POST /signup`, `POST /login`, `POST /refresh`, `POST /logout`, `GET /me`
- `POST /oauth/authorize-url`, `POST /oauth/callback` — PKCE 흐름: main이 authorize-url을 서버간 호출 → codeVerifier를 main의 httpOnly 단기 쿠키에 저장 → 브라우저를 Google/Kakao 동의화면으로 리다이렉트 → OAuth 제공자가 **main의** `/api/auth/callback`으로 리다이렉트 → main이 codeVerifier+code를 서버간으로 cms.api에 전달해 세션 교환. 브라우저는 cms.api JSON API를 한 번도 직접 안 부른다.

**Orders** `src/app/api/v1/orders/*`: `POST /` (생성, 가격 재검증), `POST /{orderId}/notify-payment`, `GET /me` (구매 목록), `GET /api/v1/downloads/{productId}` (signed URL)

**Reviews** `src/app/api/v1/reviews/*`: `GET ?product_id=`, `POST /` — **서버에서 `hasPurchasedProduct` 재검증** 후 upsert (현재 main은 클라이언트가 넘긴 값을 신뢰하는 구조라 이번에 서버 강제 검증으로 격상)

**Quotes**: `POST /api/v1/quotes`(공개 제출), `GET/GET/DELETE /api/v1/admin/quotes[/{id}]`(어드민)

**어드민 CRUD** (products/blog/portfolio 동일 패턴, 한 번만 기술): `POST /api/v1/admin/products`, `PATCH /{id}`, `DELETE /{id}`, `POST /{id}/duplicate`, `PATCH /reorder`(`{updates:[{id,sort_order}]}` — **upsert 단일쿼리로 N+1 개선**). `blog`, `portfolio`도 동일하게 반복.

**Orders 승인/취소, Users**: `GET /api/v1/admin/orders`, `POST /{id}/approve`, `POST /{id}/cancel`, `GET /api/v1/admin/users`, `PATCH /{id}/role`, `DELETE /{id}`

**Storage**: `POST /api/v1/admin/storage/upload` (multipart, `{bucket,file}`) — admin.ts(service role)로 통일, MIME/크기 검증은 admin의 `storage.ts` 로직 이식

## cms.api: 인증 전환

관리자와 일반 사용자는 **동일한 Supabase Auth 인스턴스와 `profiles` 테이블을 공유**하고 `profiles.role`로만 구분한다.

- `src/middleware.ts`의 `mock-auth` 쿠키 체크 제거, `src/libs/supabase/middleware.ts`(이미 존재하는 `updateSession`, admin 시절 검증된 패턴)로 교체.
- `admin/src/libs/supabase/auth.ts`의 `requireAdmin()`을 두 버전으로 나눠 이식: `requireAdminPage()`(redirect, 페이지용), `requireAdminApi(request)`(401/403 JSON, `/api/v1/admin/*` 라우트용).
- `src/app/sign/in/actions.ts`의 `MOCK_EMAIL/MOCK_PASSWORD` 비교 → `signInWithPassword` + `profiles.role==='admin'` 체크로 교체. `.env`에서 `MOCK_EMAIL`, `MOCK_PASSWORD` 제거.

## main: 변경 파일

**신규 (BFF 레이어)**: `main/src/lib/cmsApi/client.ts`(공통 `cmsApiFetch`, 쿠키에서 access_token 읽어 Bearer 주입, 401시 refresh 후 재시도), `auth.ts`, `orders.ts`, `reviews.ts`, `quotes.ts`, `products.ts`, `news.ts`, `portfolios.ts` — **기존 `lib/supabase/*.ts`와 동일한 함수 시그니처**로 재구현해 호출부 변경을 최소화한다.

**기존 `lib/supabase/*.ts` 처리**: `products.ts`/`news.ts`/`portfolios.ts`는 P2에서 즉시 삭제, `orders.ts`/`reviews.ts`는 P3에서 cms.api 호출로 교체, `storage.ts`는 삭제(다운로드는 `/api/downloads/[productId]`가 cms.api `/api/v1/downloads/{id}`를 호출), `client.ts`/`server.ts`/`middleware.ts`는 P4 완료 후(아무도 `supabase-js` 안 쓰는 것 확인 후) 삭제.

**컨벤션 위반 정리**: `ReviewForm.tsx`(직접 insert/update → main 자신의 `/api/reviews` Route Handler 경유), `(dashboard)/page.tsx`·`layout.tsx`(profiles 직접 조회 → `getMe()` 호출), `ReviewSection.tsx`(getUser 직접 호출 제거, 서버에서 내려받은 prop 사용).

**인증 재작성**: `useAuth.ts`(supabase.auth.* 직접 호출 전부 제거 → main 자신의 `/api/auth/*` Route Handler 호출, 반환 시그니처는 유지), `login/register page`(useAuth 훅으로 통일, 중복 구현 제거), `LeftSidebar`/`PublicHeader`(signOut 직접 호출 제거), `AuthProvider`(onAuthStateChange 구독 제거 → 마운트시 `/api/auth/me` 1회 호출 + 로그인/로그아웃 액션에서 낙관적 갱신), `interceptors.ts`(토큰 주입 로직 삭제, same-origin이라 불필요 — 401시 `/login` 리다이렉트만 유지), `middleware.ts`(§세션 관리 참고), `api/auth/callback/route.ts`(빈 디렉토리 → OAuth 콜백 신규 구현), 신규 `api/auth/{login,signup,logout,me}/route.ts`, `api/auth/oauth/[provider]/route.ts`.

**Recoil**: `authAtom.ts`/`userAtom.ts`/`authSelector.ts` 구조 변경 없음 — 값을 채우는 소스만 바뀐다.

## main: 세션/토큰 관리

- cms.api가 발급한 access_token/refresh_token을 main 도메인의 **httpOnly, secure(prod), sameSite=lax 쿠키**로 저장. 브라우저 JS는 절대 읽지 않음(XSS 방어). `isAuthenticated` 여부만 Recoil에 노출.
- Server Component/Route Handler가 `cookies()`로 access_token을 읽어 `cmsApiFetch`가 자동으로 Bearer 헤더 주입.
- 갱신: `updateSession()` 내부 구현을 cms.api `/api/v1/auth/refresh` 호출로 교체(만료 임박 감지 시). Route Handler 레벨에서도 401 수신 시 1회 refresh 후 재시도(기존 `interceptors.ts` 로직을 서버 사이드로 이식).
- `main/src/middleware.ts`의 `PROTECTED_PATHS=['/dashboard']` 리다이렉트 로직은 그대로 유지, 내부 구현만 교체.

## cms.api: Supabase 프로젝트 재연결

- `.env.local`/배포 환경변수의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`를 **main이 현재 쓰는 값**으로 교체.
- 테이블명 원복 (파일별): `queries/products.admin.ts`/`products.server.ts`(`statkit_products`→`products`), `queries/posts.admin.ts`(`statkit_posts`→`news`), `queries/posts.server.ts`/`posts.ts`(스키마 불일치 고아 코드로 추정 — `news.ts`/`news.server.ts`로 리네임 후 실사용 여부 grep 확인), `queries/portfolios.admin.ts`(`statkit_portfolios`→`portfolios`), `queries/content-api-configs.ts`(`statkit_content_api_configs`→`content_api_configs`).
- 실제 연결 대상 프로젝트에는 애초에 `statkit_*` 테이블이 없으므로 DB 마이그레이션은 불필요 — 코드만 원복하면 기존 `products`/`news`/`portfolios` 테이블과 자동으로 맞아떨어진다.
- `content_api_configs` 테이블이 실제 프로젝트에 없다면 `001_initial_schema.sql`의 해당 섹션(테이블 생성+시드)만 신규 적용.
- **`reviews` 테이블은 cms.api 마이그레이션에 없으므로 신규 작성 필요** — 컬럼은 main의 `reviews.ts`가 기대하는 대로(`id, product_id, user_id, rating, content, created_at`), RLS는 `products` 패턴(공개 read + service_role all)을 따른다.
- `supabase/backups/260720/*.sql`(별도 프로젝트의 백업 데이터)은 재연결 후 불필요하므로 삭제 검토.
- `reorder.ts`의 N+1 `Promise.all` 패턴은 신규 엔드포인트 구현 시 `upsert(rows, {onConflict:'id'})`로 개선.

## admin/ 폴더 삭제

**주의: 위 조사에서 확인했듯 `admin/` 폴더는 완전한 구현체이며 비어있지 않다.** 삭제는 P6에서, cms.api가 (a) 전체 REST 엔드포인트를 갖추고 (b) 실제 관리자 인증으로 전환되었으며 (c) 프로덕션에서 최소 1주기 이상 실사용(주문 승인/CRUD/역할변경 등)되어 문제가 없음을 확인한 뒤 진행한다.

삭제 전 체크리스트: `.github/workflows/ci-admin.yml`(있다면) 제거 → 루트 `CLAUDE.md`에서 admin 관련 섹션(아키텍처, Supabase 쿼리 규칙, 환경변수 등) 제거하고 "관리자 기능은 `gospelfix.cms.api`(별도 저장소)로 이전됨"으로 대체 → `admin/src/libs/supabase/storage.ts` 등 cms.api로 아직 이식 안 된 로직이 없는지 마지막 diff 확인 후 `admin/` 디렉토리 삭제.

---

## 검증 방법

| Phase | 검증 |
|---|---|
| P0 | `curl -H "X-API-Key: $KEY" localhost:3001/api/v1/products` 등으로 GET 전수 확인, `/api-docs`에서 신규 엔드포인트 스펙 렌더링 확인, signup→login→refresh→logout 풀 사이클 Postman 검증, Supabase 대시보드에서 실제 gospelfix 데이터(빈 statkit 테이블 아님)가 조회되는지 확인 |
| P1 | cms.api 어드민 UI에서 실제 로그인 → products/blog/portfolio/orders/quotes/users 각 페이지 CRUD 1회씩, 승인/거절 e2e 1회 |
| P2 | main `/mall`, `/detail/[slug]`, `/blog`, `/blog/[slug]`, 홈(포트폴리오) 페이지 정상 렌더링, `getAllNewsSlugs()` 쓰는 곳(있다면) 정상 동작 |
| P3 | 로그인 후 구매→입금완료→관리자 승인→다운로드 활성화 전체 흐름, 리뷰 작성/수정 반영 확인, 구매 안 한 상태에서 리뷰 작성 API 직접 호출 시 403(서버 강제 검증) 확인, 견적 폼 제출 후 어드민 `/quotes`에 IP/UTM 포함 노출 확인 |
| P4 | (a) 전환 전 로그인해둔 세션이 새로고침 후에도 유지되는지(핵심 회귀), (b) 신규 회원가입→로그인→`/dashboard`, (c) 구글/카카오 OAuth 전체 흐름, (d) access_token 만료 후 자동 refresh, (e) `/dashboard` 비로그인 리다이렉트 유지, (f) 401 발생시 무한루프 없이 `/login` 리다이렉트 |
| P5 | `grep -r "@supabase" main/src`가 빈 결과, `yarn build`(main) 성공 |
| P6 | admin 삭제 후 각 앱 `yarn build`, CI 정상 동작 |

### Critical Files

- `gospelfix/main/src/middleware.ts`, `lib/axios/interceptors.ts`, `components/auth/AuthProvider/index.tsx`, `lib/supabase/{products,orders,reviews,news,portfolios,storage}.ts`
- `gospelfix/admin/src/libs/supabase/{products,news,orders,portfolios,quotes,users,storage,reorder,auth}.ts` (이식 원본)
- `gospelfix.cms.api/src/middleware.ts`, `src/libs/supabase/queries/{products,posts,portfolios,content-api-configs}.*.ts`
- `gospelfix.cms.api/src/libs/openapi/dynamic-spec.ts`, `src/libs/openapi/schemas/`
- `gospelfix.cms.api/supabase/migrations/001_initial_schema.sql`, `002_statkit_prefix_tables.sql`
