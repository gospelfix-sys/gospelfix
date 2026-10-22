---
name: project_growth_route_renamed_to_layer_2026-09-01
description: 2026-09-01, "/growth"(에이전시 랜딩) 경로와 Growth* 컴포넌트 패밀리를 전부 "/layer"·Layer*로 리네임 — 이전 메모리의 "/growth"·"components/growth"·"GrowthShell" 등 서술은 이 날짜 이전 기준
metadata:
  type: project
---

2026-09-01, 사용자 요청으로 `/growth`(에이전시 공식홈페이지) 경로를 `/layer`로 리네임했다.
[[project_root_growth_route_content_swap_2026-08-28]]에서 이미 확인됐듯 `/growth`는 "모다
마켓플레이스"가 아니라 "에이전시" 콘텐츠였다(2026-08-28 스왑 이후). 사용자가 URL뿐 아니라
`GrowthShell`/`GrowthTopBar`/`GrowthSidebar`/`components/growth/*`/`isGrowth` 등 "Growth"
명명 패밀리 전체도 함께 "Layer"로 바꾸길 원해 그렇게 처리했다 — 단, 이 컴포넌트 패밀리는
실제로는 `/`(모다 마켓플레이스)에서 렌더링되고 `/layer`(에이전시)와는 무관하다. 즉 이름과
실제 URL이 애초에 분리돼 있었고, 리네임 후에도 여전히 분리된 채다(의도된 선택, 재차 확인함).

- 새 상태: `/growth` 폴더/경로 → `src/app/(public)/layer/page.tsx`(`/layer`, 에이전시 콘텐츠
  그대로). `src/components/growth/` → `src/components/layer/`,
  `GrowthShell`→`LayerShell`, `GrowthTopBar`→`LayerTopBar`, `GrowthSidebar`→`LayerSidebar`,
  `isGrowth`→`isLayer`, `GROWTH_NAV_ITEMS`→`LAYER_NAV_ITEMS`, NavPopover `section` 값
  `"growth"`→`"layer"`, CSS 클래스 `growth-hero-swiper`→`layer-hero-swiper`,
  `growth-rich-editor-content`→`layer-rich-editor-content`.
- `next.config.mjs`에 `/growth`→`/layer`, `/growth/:path*`→`/layer/:path*` 영구 리다이렉트
  추가 완료(과거 `/mall`→`/growth` 리네임 때 이 리다이렉트를 빠뜨렸던 실수 —
  code-reviewer `recurring_issues.md` #37 — 재발 방지).
- 이전 상태(이 날짜 이전 메모리는 전부 이 기준): `/growth` 경로, `components/growth/*`,
  `GrowthShell`/`GrowthTopBar`/`GrowthSidebar`/`isGrowth` 등 식별자.

**Why:** [[feedback_route_rename_docs_memory_triage]] 정책에 따라 과거 기록(날짜 박힌
`project_*.md`, `feedback_swiper_*.md`, code-reviewer의 `mall_to_growth_route_rename.md`/
`growth_sidebar_redesign_review.md`/`growth_upload_mypage_split_review.md`/
`recurring_issues.md` 등 리뷰 로그, `docs/cms-api-video-upload-handoff.md`)은 그 시점 기준으론
정확한 서술이라 개별 수정하지 않았다. 대신 CLAUDE.md 라우트 다이어그램,
`.claude/agent-memory/project-identity.md`, `.claude/agent-memory/component-writer/
active_state_border.md`(컨벤션 문서의 예시 경로)만 살아있는 문서로서 직접 갱신했다.

**How to apply:**
- 과거 메모리에서 "/growth", "components/growth/", "GrowthShell" 등을 보면 이 메모리의
  날짜와 비교해서 이 날짜 이전 기록인지 먼저 확인한다. 실제 코드 확인이 필요하면
  `src/app/(public)/layer/page.tsx`, `src/components/layer/*`를 본다.
- "Growth"라는 이름이 나오는 코드/문서를 새로 만들 필요가 있으면 전부 "Layer"로 통일한다
  (혼재 금지).
