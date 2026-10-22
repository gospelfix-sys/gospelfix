---
name: project_posthog_analytics_setup
description: PostHog 애널리틱스 SDK 도입 완료 — posthog-js 설치, PostHogProvider/PostHogPageView 컴포넌트, 쿠키 동의 연동. 커밋 a9fa81b
metadata:
  type: project
---

2026-08-13, 사용자가 PostHog 설치 wizard(`npx -y @posthog/wizard@latest`) 화면을 보고
설치를 요청. wizard는 대화형(브라우저 로그인 필요)이라 자동화 불가 판단, 수동 설치로 진행.

## 구현 내용 (커밋 `a9fa81b`)

- `posthog-js` 패키지 설치
- `src/components/providers/PostHogProvider.tsx` 신규 — `posthog.init()`을 `useEffect`
  안에서 호출(StrictMode 이중 마운트 대비 `posthog.__loaded` 가드 포함), `posthog-js/react`의
  `PostHogProvider`(client prop)로 감쌈
- `src/components/providers/PostHogPageView.tsx` 신규 — App Router 클라이언트 라우팅에서
  `capture_pageview: false` + `usePathname`/`useSearchParams` 기반 수동 `$pageview` 캡처.
  `useSearchParams` 쓰는 부분만 `Suspense`로 격리
- `src/app/layout.tsx` — `<PostHogProvider>`로 `<body>` 최상위를 감쌈
- 필요 환경변수: `NEXT_PUBLIC_POSTHOG_KEY`(PostHog 대시보드의 "Project API Key"="Project
  token", 동일한 값의 다른 명칭), `NEXT_PUBLIC_POSTHOG_HOST`(리전, 이 프로젝트는 US Cloud
  `https://us.i.posthog.com`). `.env*` 파일은 권한상 직접 못 읽어서 값 확인은 사용자가 직접 함

## 중요 — 쿠키 동의 게이팅 필수 연동

이 프로젝트에는 이미 `CookieConsentBanner`+`useCookieConsent` 쿠키 동의 아키텍처가
있어서, `PostHogProvider`는 `consentStatus === "accepted"`일 때만 `posthog.init()`과
`PostHogPageView` 렌더링이 실행되도록 게이팅되어 있다. 1차 구현 때 이걸 빠뜨려서
code-reviewer가 BLOCKED 판정을 냈던 사례 — 자세한 내용은
[[feedback_check_cookie_consent_before_new_tracking_tool]] 참고.

## 검증 완료

로컬에서 `yarn dev` 실행 후 PostHog 대시보드 Activity 로그에 `Pageview`, autocapture
(`clicked link with text ...`), `Web vitals` 이벤트가 정상 기록되는 것을 사용자가 직접
확인함.
