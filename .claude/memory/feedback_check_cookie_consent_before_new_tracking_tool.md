---
name: feedback_check_cookie_consent_before_new_tracking_tool
description: 새 분석/추적 SDK(PostHog 등)를 앱에 붙일 때는 반드시 기존 CookieConsentBanner/useCookieConsent 쿠키 동의 게이팅부터 확인하고 연동할 것 — 빠뜨려서 code-reviewer가 BLOCKED 판정을 낸 사례
metadata:
  type: feedback
---

이 프로젝트(`gospelfix`)에는 `src/components/layout/CookieConsentBanner.tsx` +
`src/hooks/useCookieConsent.ts`로 이미 "분석 도구는 쿠키 동의 후에만 초기화한다"는
옵트인(opt-in) 아키텍처가 구축되어 있다. `useCookieConsent()`는 `"accepted" | null`을
반환하고, 배너의 "동의" 클릭 시 `"cookieConsent"` 커스텀 이벤트로 상태가 전파된다.

**Why:** [[project_posthog_analytics_setup]] 작업에서 PostHog `Provider`를 처음
작성할 때 이 게이팅을 전혀 참조하지 않고 마운트 즉시 `posthog.init()`을 호출하도록
구현했다. code-reviewer 1차 리뷰에서 Critical로 BLOCKED — 사용자가 쿠키 배너의 "동의"를
누르기 전(심지어 배너를 무시하고 이탈해도)부터 추적이 시작되는 문제였다. 쿠키 정책 문구
("쿠키(분석·광고)를 사용합니다")와 실제 동작이 모순되는 법적/정책적 리스크였다.
`useCookieConsent()`를 구독해서 `consentStatus === "accepted"`일 때만 `init()`/이벤트
캡처가 실행되도록 고친 뒤에야 APPROVED로 재검토 통과했다.

**How to apply:** PostHog뿐 아니라 GA, 광고 픽셀, 세션 리플레이 등 브라우저에서 사용자
행동을 수집하는 어떤 SDK를 새로 붙이든, 구현 전에 반드시 `useCookieConsent()` 훅으로
게이팅해야 한다. "일단 동작 확인하고 나중에 동의 로직 붙이자"는 순서로 가지 말고, 처음
설계 단계에서부터 동의 상태를 조건으로 넣을 것.
