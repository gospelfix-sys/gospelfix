---
name: doc_auth_redirect_mismatch
description: CLAUDE.md/README.md가 /login,/register의 "인증 상태면 /dashboard 리다이렉트(미들웨어 처리)"를 서술하지만 실제 코드에는 미구현 — llms.txt(2026-07-24 재작성)는 정확히 "미구현"이라고 기록
type: project
---

**발견 사실**: `src/middleware.ts`의 `PROTECTED_PATHS`는 `["/dashboard"]`뿐이고, 인증된 사용자를
`/login`·`/register`에서 쫓아내는 로직이 없다. `src/app/login/page.tsx`, `src/app/register/page.tsx`도
클라이언트 사이드에서 별도 redirect-if-authenticated 로직을 두지 않은 순수 폼 컴포넌트다
(2026-07-24 코드 리뷰 시 세 파일 모두 Read로 직접 확인).

그런데 `CLAUDE.md`는 두 곳에서 반대로 서술한다:
- 라우트 그룹 구조 다이어그램: `├── login/ # /login — 인증 상태면 /dashboard 리다이렉트 (미들웨어 처리)` (register도 동일)
- 인증 흐름 다이어그램: `→ 인증 라우트: /login, /register # 인증 상태면 /dashboard로 리다이렉트`

같은 날 재작성된 `llms.txt`는 이 부분만 정확하게 고쳐서 서술한다:
`→ 인증 라우트: /login, /register # (현재 코드상 인증 상태에서의 자동 리다이렉트는 미구현)`
— 즉 CLAUDE.md와 llms.txt가 정면으로 모순되고, CLAUDE.md 쪽이 실제 코드와 불일치한다.

부수 발견: CLAUDE.md 인증 흐름 다이어그램은 middleware.ts가 "모든 요청 인터셉트"라고 쓰지만,
실제 `config.matcher`는 `/api/*`를 명시적으로 제외한다(주석에 그 이유까지 적혀 있음:
serverFetch의 내부 self-fetch가 매번 middleware를 다시 타면서 refresh가 중복 호출되는 문제 회피).
llms.txt는 "모든 페이지 요청 인터셉트(Edge)"로 더 정확하게 qualify되어 있다.

**Why:** CLAUDE.md는 Claude Code가 매 세션 자동으로 읽는 최상위 지침 파일이라, 여기 적힌 잘못된
설명을 근거로 향후 누군가(에이전트 포함)가 "이미 구현되어 있다고 가정"하고 관련 작업을 건너뛰거나,
반대로 이미 없는 기능을 있는 것처럼 다른 코드에서 참조할 위험이 있다.

**How to apply:** 이후 CLAUDE.md/README.md/llms.txt 리뷰 시 이 항목이 수정되었는지 먼저 확인.
아직 안 고쳐졌다면 Major 이슈로 재보고(문서 정확성 결함, 특히 CLAUDE.md가 에이전트 지침 파일이라는
점에서 일반 오탈자보다 우선순위 높음). 고쳐졌다면 이 메모리 삭제 또는 "해소 확인"으로 갱신.

**2026-08-21 재확인**: CLAUDE.md의 인증 흐름 서술(`/login, /register # (현재 코드상 인증
상태에서의 자동 리다이렉트는 미구현)`)이 llms.txt와 동일하게 정확한 표현으로 수정되어 이
Major는 완전히 해소됨. 다만 같은 라우트 그룹 구조 표에서 **새로운 동일 클래스의 문서
미동기화**를 발견: `├── (public)/  # /mall, /detail/[slug], /blog, /quote 등`이 `/mall` →
`/growth` 라우트 리네이밍(같은 날 별도 작업) 이후에도 갱신되지 않고 남아있음. 자세한 경위는
[[mall_to_growth_route_rename]] 참고 — "CLAUDE.md는 에이전트가 매 세션 자동으로 읽는 지침
파일이라 우선순위 높음"이라는 이 메모리의 교훈이 이번에도 그대로 적용된 사례.
