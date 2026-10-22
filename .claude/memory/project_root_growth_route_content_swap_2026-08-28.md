---
name: project_root_growth_route_content_swap_2026-08-28
description: 2026-08-28, "/"(에이전시 랜딩)과 "/growth"(모다 마켓플레이스) 콘텐츠를 서로 맞바꿈 — 이전 메모리의 "/growth=마켓플레이스" 서술은 이 날짜 이전 기준
metadata:
  type: project
---

2026-08-28, `/`에 있던 에이전시(공식홈페이지) 랜딩 콘텐츠와 `/growth`에 있던 모다(MODA)
마켓플레이스 콘텐츠의 **URL을 서로 맞바꿨다**. 사용자가 명시적으로 요청한 리팩토링이었다
(파일 자체는 이동, `components/growth/`·`components/main/` 등 컴포넌트 폴더명은 도메인 이름이라
그대로 유지).

- 새 상태: `/` = 모다 마켓플레이스(GrowthShell 사이드바), `/growth` = 에이전시 랜딩,
  `/growth/upload` → `/upload`로 이동
- 이전 상태(이 날짜 이전 메모리는 전부 이 기준): `/` = 에이전시 랜딩, `/growth` = 모다
  마켓플레이스

**Why:** 이 저장소의 `.claude/memory/`와 `.claude/agent-memory/**`에는 "/growth"를 마켓플레이스로
서술하는 히스토리 기록(`project_business_model_vertical_ai_pivot.md`,
`project_product_crud_migration_to_mypage.md`, code-reviewer의
`mall_to_growth_route_rename.md`/`growth_sidebar_redesign_review.md` 등)이 다수 남아있다. 이건
당시 기준으로는 정확한 기록이라 되돌려 고치지 않았다 — 대신 이 메모리가 "언제부터 반대가
됐는지"를 가리키는 기준점 역할을 한다.

**How to apply:**
- 과거 메모리에서 "/growth"가 마켓플레이스를 가리키는 서술을 보면, 이 메모리의 날짜와 비교해서
  그 메모리가 이 날짜 이전 것인지 먼저 확인한다. 이후 것이면 그대로 신뢰하지 말고 실제 코드
  (`src/app/(public)/growth/page.tsx`, `src/app/(public)/page.tsx`)를 먼저 확인한다.
- 이번 스왑에서 함께 갱신된 것: `TopBar`/`Footer`/`NavPopover`의 섹션 판별 로직, `useAuth.ts`·
  `uiAtom.ts`의 로그인 후 기본 리다이렉트, 마이페이지 CTA, `next.config.mjs`의 `/mall` 레거시
  리다이렉트, `CLAUDE.md` 라우트 그룹 다이어그램. 자세한 파일별 diff는 git log 참고
  (커밋 메시지에 이 리팩토링임을 명시).
