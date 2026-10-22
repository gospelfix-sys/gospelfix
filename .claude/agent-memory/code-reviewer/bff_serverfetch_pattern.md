---
name: bff_serverfetch_pattern
description: 2026-07-24 도입된 serverFetch()(자기 자신 /api/* 호출) + cmsApiFetch(axios) 이중 BFF 구조와, 그로 인해 발견된 middleware 재실행/토큰 refresh 중복 호출 리스크
type: project
---

**2026-07-24부로 데이터 페칭 구조가 한 번 더 바뀜**: 기존에는 `src/lib/cmsApi/{products,news,portfolios,orders,reviews,auth}.ts`가
cms.api를 직접 호출하고 Server Component가 이 함수를 import해서 썼다. 이제는 그 로직을 전부
`src/app/api/*/route.ts` Route Handler로 옮기고, Server Component/Server Action은
`src/lib/serverFetch.ts`의 `serverFetch()`로 **자기 자신의 `/api/*`를 다시 fetch**해서 데이터를 가져온다.
동시에 `src/lib/cmsApi/client.ts`(`cmsApiFetch`)는 네이티브 fetch에서 axios 기반으로 재작성됨(공개
인터페이스는 동일 유지).

- `serverFetch()`는 `next/headers`의 `headers()`로 절대 URL(host + x-forwarded-proto)을 만들고,
  원본 요청의 Cookie 헤더를 수동으로 forward한다. `cache: "no-store"` 하드코딩.
- `cmsApiFetch()`는 axios 에러를 항상 `CmsApiError(status, message)`로 감싸서 던지므로, 원본 axios
  에러 객체(요청 config에 X-API-Key/Authorization 헤더 포함)가 route handler의 `console.error`로
  유출될 위험은 없음 — 이 부분은 안전하게 설계됨.

**Why:** cms.api REST API 접근을 Route Handler로 일원화하고, Server Component에서는 항상 동일 오리진
`/api/*`만 호출하도록 구조를 통일하기 위함(BFF 패턴 강화).

**How to apply / 발견된 리스크:**
- `middleware.ts`의 matcher(`/((?!_next/static|_next/image|favicon.ico|...).*)`,
  `.claude` 밖 `src/middleware.ts`)는 `/api/*`를 제외하지 않는다. 즉 `serverFetch()`가 만드는
  **모든 내부 self-fetch 호출도 매번 middleware를 다시 통과**하며, refreshToken이 만료 5분 이내면
  매번 cms.api `/api/v1/auth/refresh`를 다시 호출한다. 한 페이지 렌더에서 `getMe()` +
  `serverFetch("/api/orders")` + `serverFetch("/api/reviews")`처럼 서로 다른 경로를 여러 번
  호출하면(예: 상품 상세 페이지의 ReviewSection), 페이지 1회 로드에 refresh 호출이 여러 번
  중복 발생할 수 있다. 이 inner 호출들의 Set-Cookie는 serverFetch가 응답 헤더를 처리하지 않으므로
  버려지고, 실제 브라우저에 반영되는 건 가장 바깥쪽(원 브라우저 요청)의 middleware 패스뿐이다 —
  즉 안쪽 refresh 호출들은 순수하게 낭비성 네트워크 호출이며, Supabase가 refresh_token 회전(rotation)을
  쓴다면 동시에 같은 refresh_token으로 여러 번 refresh를 시도하는 레이스 컨디션으로 세션이 깨질
  잠재적 위험도 있다.
  - 리뷰 시 항상 확인: 페이지 하나가 몇 개의 서로 다른 `/api/*` 엔드포인트를 serverFetch하는지, 그
    개수만큼 middleware가 재실행된다는 점을 감안해서 성능/리스크를 판단할 것.
  - 개선 방향 제안(아직 미적용): middleware matcher에서 `/api/*` 제외하고 Route Handler 자체에서
    개별적으로 `getAccessToken()`(만료 시 401)을 쓰거나, refresh 로직을 별도 락/캐시로 감싸는 방법 검토 필요.

**2026-07-24 2차 재검증 결과: 위 개선 방향이 실제로 적용되어 확인됨.**
`src/middleware.ts`의 `config.matcher`가 `"/((?!api|_next/static|_next/image|favicon.ico|...).*)"`로
바뀌어 `/api/*`가 완전히 제외됨. 10개 `src/app/api/**/route.ts`가 모두 `getAccessToken()`으로 각자
쿠키 기반 인증을 자체 판단하므로 이 변경으로 인증 로직 자체가 깨지지는 않음. `/dashboard` 보호는
`PROTECTED_PATHS`가 `/api` 밖의 경로이므로 여전히 middleware를 통과해 정상 동작.
- 추가로 확인한 구조적 사실(리뷰 시 "회귀"로 오인하지 말 것): middleware가
  `response.cookies.set(...)`으로 refresh된 토큰을 설정해도, 이는 **다음 요청(브라우저 재요청)에만
  반영**된다 — 현재 요청 파이프라인(Server Component가 `headers()`/`cookies()`로 읽는 원본 request)은
  수정되지 않으므로, 같은 렌더 사이클 안에서 Server Component/Route Handler가 여전히 refresh 이전의
  (거의 만료된) access_token을 사용한다. 이는 `/api` 제외 여부와 무관하게 이전부터 존재하던 특성이며,
  이번 matcher 변경으로 새로 생긴 회귀가 아니다. 만료 마진(5분) 이내에는 토큰이 아직 유효하므로
  실사용에는 문제없다.
- `dashboard/page.tsx`, `dashboard/layout.tsx`처럼 같은 렌더 트리 안에서 완전히 동일한 URL(`/api/auth/me`)로
  `getMe()`를 두 번 호출하는 경우는 Next.js의 fetch 요청 메모이제이션(동일 렌더 패스 내 동일 fetch 시그니처
  자동 dedupe)으로 실제 네트워크 호출은 1번만 나간다 — 이건 문제 없음. 문제는 서로 다른 경로(엔드포인트)를
  여러 번 부르는 경우다.

**2026-07-24 3차 재검증(코드 리뷰) 결과: 위 "dedupe로 문제없음" 전제가 깨짐 — `serverFetch.ts`가 native
fetch에서 axios로 재작성됨.** `src/lib/serverFetch.ts`가 이제 `axios.request()`를 사용한다(주석은
"axios는 Next가 패치한 전역 fetch를 거치지 않아 Data Cache에 안 잡힌다"는 이유만 언급하고, Data Cache와
별개인 **Request Memoization**(동일 렌더 패스 내 동일 fetch 호출 자동 dedupe, Next 공식 문서가 `page.tsx`
+ `generateMetadata` + `layout.tsx`에서 같은 데이터를 가져오는 표준 패턴으로 안내하는 바로 그 기능)까지
같이 사라진다는 점은 언급/고려되지 않음). axios는 Next가 패치한 전역 `fetch`를 아예 거치지 않으므로 이
자동 dedupe도 적용되지 않는다.
- 실사용 영향(코드로 확인): `(dashboard)/layout.tsx` + `(dashboard)/dashboard/page.tsx`가 각각
  `getMe()`(`serverFetch("/api/auth/me")`)를 호출 → `/dashboard` 1회 방문에 `/api/auth/me` 왕복 2회.
  `detail/[slug]/page.tsx`의 `generateMetadata`와 페이지 컴포넌트가 각각 동일한
  `serverFetch(\`/api/products/${slug}\`)`를 호출 → 상품 상세 1회 방문에 동일 엔드포인트 왕복 2회.
  `ReviewSection.tsx`가 `getMe()`를 한 번 더 호출 → 상품 상세 페이지에서 `/api/auth/me`가 최대 3회까지
  중복 호출될 수 있음. 각 호출은 이 앱 자신의 Route Handler를 거쳐 다시 `cmsApiFetch()`로 cms.api까지
  가므로, 중복분만큼 cms.api 부하와 SSR 지연이 그대로 늘어난다.
- React `cache()`로 `getMe()`/`serverFetch()`를 감싸는 처리가 코드베이스 어디에도 없음(2026-07-24 기준
  `grep "from \"react\"".*cache` 매치 0건) — 완화책 미적용 상태.
- **How to apply**: serverFetch 관련 리뷰 시 "axios라서 Data Cache는 안 잡히니 cache:no-store 불필요"라는
  주석만 보고 넘어가지 말고, Request Memoization 손실 여부까지 별도로 확인할 것. 개선 방향: `getMe()`(및
  필요 시 개별 `serverFetch` 호출)를 `import { cache } from "react"`의 `cache()`로 감싸 요청 단위
  메모이제이션을 복구하거나, serverFetch를 axios 대신 Next가 패치한 global fetch 기반으로 되돌리는 방안을
  제안할 것.

**2026-07-24 4차 재검증(수정사항 확인) 결과: APPROVED — Major 이슈 해소 확인됨.**
`src/lib/serverFetch.ts`가 `serverFetchImpl`(원본 구현) + `export const serverFetch =
cache(serverFetchImpl)`로 수정됨. 실제 호출부(`dashboard/layout.tsx` + `dashboard/page.tsx`의
`getMe()`, `detail/[slug]/page.tsx`의 `generateMetadata`+페이지 컴포넌트, `ReviewSection.tsx`의
`getMe()`/`serverFetch("/api/orders")`)를 모두 grep으로 확인한 결과, 전부 `serverFetch(path)` 또는
`serverFetch(path, { GET options })` 형태의 **단일 string 인자** 호출이라 React `cache()`가 같은 렌더
패스 내에서 정확히 dedupe한다(Next 공식 문서가 권장하는 "non-fetch 데이터 소스를 cache()로 감싸는" 표준
패턴과 동일).
- **mutation(POST) 안전성 확인**: 코드베이스에서 서버 사이드 `serverFetch(path, { method: "POST", ... })`
  호출은 `src/app/actions/submitQuoteAction.ts` 단 1곳뿐(주문/리뷰는 클라이언트 `axiosInstance`가 자신의
  `/api/orders/*`, `/api/reviews`를 직접 호출 — serverFetch 미경유). 이 호출은 매번 새로운 객체
  리터럴(`{ method: "POST", body: JSON.stringify(...) }`)을 인자로 넘기므로, React `cache()`가 object
  인자에 대해 참조 동일성(reference identity)으로 키를 잡는 특성상 서로 다른 호출은 항상 cache miss로
  처리되어 실제 요청이 그대로 나간다 — 즉 "다른 mutation이 잘못 캐시되어 스킵되는" 부작용 없음. 다만 이
  구조는 향후 POST 호출부가 늘어나도 안전하다는 뜻이지, 동일 인자로 의도적 재호출을 막는 dedup 목적으로
  cache()를 쓸 수 없다는 뜻이기도 함(참조 동일성 기반이라 재사용 변수를 넘기지 않는 한 그런 dedup은
  애초에 발생하지 않음) — 향후 리뷰 시 POST 호출부가 옵션 객체를 변수로 재사용(예: 루프 안에서 같은
  객체 참조 재사용)하는 패턴이 생기면 그때는 의도치 않은 dedup 위험을 재점검할 것.
- Minor 수정도 확인됨: `src/lib/axios/instance.ts` 주석 들여쓰기 0칸/trailing whitespace 제거 및 "이
  앱은..." 표현으로 교정 완료. `src/components/products/ReviewForm.tsx`의 102자 함수 시그니처 라인은
  멀티라인으로 재포맷되어 100자 이내로 해소됨.
- 이번 재검증에서 새로운 이슈는 발견되지 않음(`AuthProvider/index.tsx`도 함께 훑어봤으나 client-side라
  serverFetch cache 이슈와 무관하고 cancelled 플래그로 race condition도 잘 처리됨).
