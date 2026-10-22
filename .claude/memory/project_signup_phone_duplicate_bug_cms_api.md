---
name: 회원가입 휴대폰 번호 중복 버그 — cms.api에서 수정 완료
description: 회원가입 시 "회원가입 처리 중 오류가 발생했습니다" 불투명 에러의 원인이 휴대폰 번호 중복이었던 사건, 수정은 전부 gospelfix.cms.api 저장소에서 이루어짐
metadata:
  type: project
---

2026-08-19, 사용자가 `<redacted-email>`(이후 `test@naver.com`으로 재현)으로 회원가입이
안 된다고 보고. 이 저장소(`gospelfix`, 사용자 앱)의 회원가입 화면(`app/register/page.tsx`,
`components/auth/AuthModal/SignupForm.tsx`, `app/api/auth/signup/route.ts`)은 모두 정상 —
`serverFetch`/프록시 구조상 실제 로직은 전부 `gospelfix.cms.api`의
`/api/v1/auth/signup/route.ts`에 있고, **이 저장소에는 어떤 코드 변경도 필요하지 않았다**.

**원인**: 재현에 쓴 휴대폰 번호(`<redacted-phone>`)가 이미 다른 계정에 연결돼 있어
`profiles.phone` 유니크 제약 위반 → `handle_new_user()` 트리거 실패 → Supabase GoTrue가
원인 상세 없이 빈 바디+500 반환 → 클라이언트에는 "회원가입 처리 중 오류가 발생했습니다"라는
뭉개진 메시지만 노출됨.

**수정**: `gospelfix.cms.api`에서 `auth.signUp()` 호출 전 `findProfileByPhone()`로 휴대폰
중복을 사전 검증하고, 중복 시 "이미 가입에 사용된 휴대폰 번호입니다. 로그인 또는 비밀번호
찾기를 이용해 주세요." 한국어 메시지를 반환하도록 변경(커밋 `883fd61`). 자세한 진단 과정과
코드는 `gospelfix.cms.api/.claude/memory/supabase-email-rate-limit-confirm-email.md` 참고.

**Why**: 이 저장소는 BFF 프록시 구조([[architecture]] 참고 — `serverFetch` → 이 앱의
`/api/*` Route Handler → cms.api REST API)라서, 인증/회원가입 관련 버그는 거의 항상 실제
로직이 있는 `gospelfix.cms.api` 쪽 원인이다. 향후 비슷한 보고를 받으면 이 저장소의 프록시
라우트(`app/api/auth/*`)가 아니라 cms.api의 `/api/v1/auth/*` route.ts부터 확인할 것.

**How to apply**: "회원가입 안 됨", "로그인 안 됨" 류의 보고가 오면 이 저장소 파일을 먼저
뒤지지 말고, cms.api 저장소로 이동해서 재현·디버깅하는 것이 더 빠르다. 이 저장소 쪽에서 볼
것은 클라이언트가 받은 에러 메시지를 그대로 사용자에게 보여주고 있는지(폼 에러 핸들링) 정도뿐.
