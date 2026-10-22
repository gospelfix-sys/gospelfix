# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

GOSPELFIX(가스펄픽스) 사용자 앱. Next.js 14.2 (App Router) + React 18 + Tailwind + shadcn/ui(base-nova, `@base-ui/react`) + Recoil + axios. 과거 `main/`·`admin/` 모노레포였으나 지금은 폴리레포이며, 이 저장소는 사용자 앱 하나만 담당한다. 관리자 기능과 DB(Supabase)는 별도 저장소 `gospelfix.cms.api`에 있고, **이 앱은 Supabase를 직접 호출하지 않는다.**

## 명령어

패키지 매니저는 **yarn** (npm 금지). Node 24.x.

```bash
yarn dev          # http://localhost:3000 (cms.api가 CMS_API_BASE_URL에 떠 있어야 함, 기본 :3001)
yarn build
yarn lint         # next lint
npx tsc --noEmit  # 타입 체크
yarn pretty       # src 전체 prettier --write (아래 주의 참고)
```

테스트 스위트는 없다. 검증은 `tsc --noEmit` + `yarn lint` + `yarn build`로 한다. 환경변수는 `.env.example` 참고 (`CMS_API_BASE_URL`, `CMS_API_KEY`, `KAKAO_*`, `NEXT_PUBLIC_*`).

## 아키텍처: BFF 데이터 흐름

cms.api 호출은 **오직 `src/app/api/*/route.ts` Route Handler 안에서만** 일어난다.

```
Server Component ─ serverFetch() ─┐
                                  ├─> /api/* Route Handler ─ cmsApiFetch() ─> cms.api (/api/v1/*)
Client Component ─ axiosInstance ─┘
```

- `src/lib/serverFetch.ts`: Server Component/Action이 자기 앱의 `/api/*`를 호출. host 헤더로 절대 URL을 만들고, 원본 `cookie` 헤더를 전달해 `gf_at`가 handler에 도달하게 한다. axios 기반이라 Next fetch 캐시를 타지 않으며 React `cache()`로 요청 내 메모이제이션을 복원한다. 실패 시 `ServerFetchError`.
- `src/lib/cmsApi/client.ts`: `cmsApiFetch()`. `X-API-Key: CMS_API_KEY` + 선택적 `Authorization: Bearer`. 실패 시 `CmsApiError(status, message, field?)`. 서버 전용 — `CMS_API_KEY`가 클라이언트 번들에 노출되면 안 된다.
- `src/lib/axios/instance.ts`: 브라우저 전용 (`baseURL: "/api"`, 401이면 `/login` 리다이렉트). **`axiosInstance`와 cms.api 클라이언트는 보안 경계상 절대 통합 금지.**
- `src/lib/api/*`: `serverFetch`를 감싼 서버측 getter (`getMe()`는 실패 시 throw 대신 `null`).
- Route Handler 관례: `getAccessToken()` → 없으면 `{error}` 401 → `cmsApiFetch(..., {accessToken})` → `catch`에서 `CmsApiError`면 같은 status로 `{error: message}`, 그 외 `console.error("[api/xxx]")` + 500(한국어 메시지). 검증은 수동(`if (!x)` → 400)이며 handler에서 zod를 쓰지 않는다. 동적 handler는 `export const dynamic = "force-dynamic"`.

### 인증

- 쿠키(`src/lib/cmsApi/cookies.ts`): `gf_at`(access), `gf_rt`(refresh, 30일), `gf_exp`(만료 unix초), `gf_kakao_oauth`(state, 5분). httpOnly/sameSite=lax. 이 파일은 Edge middleware도 import하므로 `next/headers`를 import하면 안 된다. 서버 쿠키 헬퍼는 `session.ts`.
- `src/middleware.ts`: 보호 경로는 `/mypage` 뿐. 만료 300초 미만이면 cms.api `/auth/refresh`를 직접 호출(1.5초 타임아웃). matcher가 `/api`를 제외하는 이유는 `serverFetch` 자기호출이 중복 refresh를 일으키기 때문.
- 그 외 refresh는 `/api/auth/refresh`(AuthProvider가 마운트 시 fire-and-forget 호출).
- `/login`, `/register`는 페이지가 아니라 `openAuthModal()`을 열고 `/`로 `replace`한다. `?next=`는 `sanitizeInternalPath`로 검증.
- 카카오 로그인은 `/api/auth/kakao` → 콜백. scope는 `account_email`만.

### 라우트/레이아웃

- 루트 레이아웃 Provider 중첩: `PostHogProvider > RecoilProvider > AuthProvider > CartProvider`, `CookieConsentBanner`는 RecoilProvider 안 형제. **새 추적 SDK는 `CookieConsentBanner`/`useCookieConsent` 게이팅부터 연동.**
- `(public)/@modal` 병렬 라우트: `(.)detail/[slug]`, `(.)blog/[slug]`는 `RouteModal` 인터셉트, 전체 페이지 버전도 별도 존재. 목록에서는 모달, 직접 진입하면 풀 페이지.
- `LayerShell`(`components/layer/`)을 쓰는 페이지(`/`, `introduce`, `creator`, `free-resources`, `upload`): **새 페이지를 추가하면 `LayerSidebar.tsx`에 `SidebarLink`를 반드시 등록**해야 한다(안 하면 고아 라우트).
- 라우트 이력: `/growth` → `/layer`로 리네임(next.config.mjs 영구 리다이렉트), `/mall` → `/`. 현재 `/`는 마켓플레이스.
- `(mypage)/layout.tsx`는 `force-dynamic` 서버 레이아웃.
- 루트 레이아웃에 상주하는 모달(`BatchPaymentModal` 등)은 페이지 이동만 하지 말고 **모든 종료 액션에서 `onClose` 호출**.
- Server Action은 `src/app/actions/`.

### 상태/타입

- Recoil: `src/store/atoms/<domain>Atom.ts` (atom 이름 `xxxAtom`, selector `xxxSelector`, key는 이름과 동일 문자열). 훅은 `src/hooks/` (모두 `"use client"`). 타입은 `src/types/<domain>.types.ts`.
- `redirect()`를 try/catch 안에서 쓰면 `isRedirectError(err)`는 반드시 re-throw.

## 코드 컨벤션

- Prettier: 쌍따옴표, 세미콜론, 100자, 2칸, trailing comma all. **문구 몇 줄 수정에 파일 전체 `prettier --write` 금지** (diff 노이즈) — Edit으로 hunk만 수정.
- 인라인 `style=` 금지 → `className`만. 조건부/병합은 `cn()`(`lib/utils.ts`, clsx+tailwind-merge). 임의값은 Tailwind arbitrary value 또는 `tailwind.config.ts` 토큰(`text-gf-orange` 등).
- **`asChild` 사용 금지** (shadcn base-nova는 `@base-ui/react` 기반). 링크 버튼은 `<Link className={buttonVariants({variant})}>`. 토스트는 `sonner`. `components/ui/form.tsx`는 수작업 구현.
- `any` 금지, props interface 필수, `types/` 재사용. 주석은 한국어, 식별자는 영어.
- 서버 컴포넌트 기본, 훅/핸들러/Recoil/브라우저 API가 필요할 때만 `"use client"`. 위젯급 UI를 `page.tsx`에 인라인하지 말고 `components/`로 분리. 같은 JSX가 2곳 이상 반복되면 추출.
- 컴포넌트 위치: `components/ui/`(원자, 도메인 지식 없음) / `components/[domain]/`(도메인) / `components/layout/`·`widgets/`(복합) / `app/**/page.tsx`(조합·데이터 페칭). 자세한 판단 순서는 `.claude/rules/component-layers.md`.
- **공용 컴포넌트·훅·유틸·스타일은 호출부가 아니라 정의 파일을 고친다** (`.claude/rules/shared-component-changes.md`). 예: `dialog.tsx`는 모바일 여백을 `inset-x-4`(position)로, 너비를 `sm:max-w-*`로 분리해 호출부 오버라이드가 서로 침범하지 않게 했다.
- cms.api의 nullable 필드도 실제 DB는 NOT NULL일 수 있으므로 `null` 대신 `[]`/`0`/`false`를 보낸다.
- Swiper `loop` + `centeredSlides`는 슬라이드가 적으면 멈춘다 → 슬라이드 배열 자체를 반복. SSR 직후 FOUC는 `onSwiper` 전까지 `opacity-0`.
- 브랜드 한글 표기는 "가스펄픽스" (전환 진행 중).

## 기타 주의

- `next.config.mjs`의 `images.unoptimized: true`는 Vercel Image Optimization 402 임시 우회 (결제수단 등록 후 원복 여부 결정 대기).
- 이 저장소에서 cms.api 쪽 DB 스키마/공유 테이블(profiles 등 5개)은 변경 불가. DB 변경은 cms.api 저장소에서만.
- `git-commit-pusher` 에이전트는 Bash가 없어 실제 커밋을 못 한다 → 리뷰(APPROVED) 후 메인 세션이 직접 커밋/푸시하고 `git log`로 검증.
- `pkill -f "next dev"`는 형제 저장소(cms.api) 서버까지 죽인다 → `lsof -i :포트`로 PID 지정.
- 여러 저장소를 오갈 때 `pwd`로 cwd를 확인한 뒤 tsc/lint 실행.
- `.claude/agents/*`의 일부 문서는 과거 모노레포(`main/`, `admin/`, `lib/supabase`, `select('*')`) 기준이라 이 저장소와 맞지 않는다. 컨벤션은 이 문서와 `.claude/rules/`를 우선한다.
- `.claude/memory/MEMORY.md`에 프로젝트 히스토리/결정 사항 인덱스가 있다. 날짜가 박힌 `project_*.md`는 당시 기준이며 최신 리네임/스왑 항목을 먼저 확인할 것.
