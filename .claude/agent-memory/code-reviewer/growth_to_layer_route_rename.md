---
name: growth_to_layer_route_rename
description: "/growth"(에이전시)→"/layer" 전체 경로+컴포넌트 패밀리(Growth*→Layer*) 리네이밍 리뷰, 전수 grep 0건 누락 확인, next.config.mjs 리다이렉트+CLAUDE.md 라우트표 이번엔 처음부터 반영됨, APPROVED
metadata:
  type: project
---

## 배경

2026-09-01, `[[mall_to_growth_route_rename]]`(2026-08-21)에서 발견됐던 두 가지 실수
(next.config.mjs 리다이렉트 누락, CLAUDE.md 라우트표 미동기화)를 사용자/에이전트가 이번
`/growth`→`/layer` 리네이밍에서는 **처음부터 반영**했다 — 재발 방지가 실제로 작동한
사례.

## 변경 범위

- 폴더 이동: `src/app/(public)/growth/` → `src/app/(public)/layer/`,
  `src/components/growth/` → `src/components/layer/`
- 식별자: `GrowthShell`→`LayerShell`, `GrowthTopBar`→`LayerTopBar`,
  `GrowthSidebar`→`LayerSidebar`, `isGrowth`→`isLayer`,
  `GROWTH_NAV_ITEMS`→`LAYER_NAV_ITEMS`, `GrowthPageProps`/`GrowthPage`→`LayerPageProps`/
  `LayerPage`(단 이 두 식별자는 실제로는 `/`(모다 마켓플레이스) `page.tsx`에 있음 — 2026-08-28
  스왑 이후 이름과 실제 렌더링 경로가 애초에 분리돼 있었고, 사용자가 명시적으로 "이름과 URL이
  계속 분리된 채로 남아도 좋다"고 확인한 의도된 상태. `[[project_growth_route_renamed_to_layer_2026-09-01]]`
  참고), NavPopover `section` 타입 `"growth"`→`"layer"`, CSS 스코프 클래스
  `growth-hero-swiper`→`layer-hero-swiper`, `growth-rich-editor-content`→
  `layer-rich-editor-content`(둘 다 대응하는 실제 CSS 규칙이 globals.css에 없음 — 리네임 전에도
  없었던 상태라 이번 세션이 만든 문제 아님, 그대로 안전하게 이관됨)
- `next.config.mjs`: `/growth`→`/layer`, `/growth/:path*`→`/layer/:path*` 영구 리다이렉트
  **신규 추가와 동시에** 커밋 전 반영됨(과거처럼 리뷰에서 지적받고 나서 추가한 게 아님)
- `CLAUDE.md` 라우트 그룹 구조 표도 `/layer(에이전시, 구 /growth — 2026-09-01 리네임)`로
  같은 커밋에서 갱신됨
- `.claude/agent-memory/component-writer/active_state_border.md`,
  `.claude/agent-memory/project-identity.md`(둘 다 "살아있는 문서") — `(구 /growth,
  2026-09-01 리네임)` 각주 형태로 갱신, 날짜 박힌 과거 리뷰 로그(`mall_to_growth_route_rename.md`
  등)는 정책대로 원문 보존, `.claude/memory/MEMORY.md` 최상단에 포인터 메모리 1건만 추가

## 검증 방법

`Grep`으로 `growth|Growth`를 `src/` 전체(파일 확장자 `.ts,.tsx,.mjs,.json`) 전수 검색 →
유일한 매치는 `next.config.mjs`의 리다이렉트 `source` 문자열 자체(의도된 잔존)뿐,
누락 0건. 렌더링되는 모든 파일(`LayerShell`/`LayerTopBar`/`LayerSidebar`/`HeroCarousel`/
`CategoryTabs`/`NavPopover`/`TopBar`/`Footer`/`BackButton`/`upload/page.tsx`/
`upload/loading.tsx`/`(public)/page.tsx`/`(public)/loading.tsx`)을 직접 Read로 대조,
import 경로·href·CSS class 전부 정확히 치환 확인.

## 판정 (2026-09-01)

APPROVED. Critical/Major/Minor 모두 0건 — 과거 `/mall`→`/growth` 리뷰에서 나온 두 Major
패턴이 이번엔 재발하지 않음. `[[recurring_issues]]` #37(라우트 리네임 시 리다이렉트 누락)
항목은 이번 사례로 "정착된 습관"으로 갱신할 만함.
