---
name: feedback_layer_shell_page_needs_sidebar_link
description: LayerShell 정적 페이지를 새로 추가할 때 Footer.tsx/TopBar.tsx 경로 배열 등록만으로는 실제 내비게이션 링크가 생기지 않아 도달 불가능한 고아 라우트가 된다
metadata:
  type: feedback
---

`Footer.tsx`의 `isModaShell`, `TopBar.tsx`의 `MODA_SHELL_PATHS`는 "이 경로가 전역
Footer/TopBar 대신 LayerShell(자체 사이드바+상단바)을 쓴다"는 **셸 판별용** 목록일 뿐,
사용자가 실제로 클릭해서 들어갈 수 있는 내비게이션 링크가 아니다. 새 페이지를
`components/layer/LayerSidebar.tsx`의 `SidebarContent`(HOME/FREE RESOURCES/CREATOR
목록 또는 하단 링크 영역)에 `SidebarLink`로 등록하지 않으면, 페이지 자체는 완성돼
있어도 URL을 직접 입력하지 않는 한 아무도 도달할 방법이 없는 고아 라우트가 된다.

**Why:** 2026-09-07, `/introduce` 정적 페이지(모다 소개)를 추가하면서 `Footer.tsx`/
`TopBar.tsx`의 경로 배열에는 정확히 등록했지만 `LayerSidebar.tsx`에 `SidebarLink`
추가를 빠뜨렸다. code-reviewer가 이를 Major(BLOCKED)로 지적: "완성된 콘텐츠 페이지가
앱 어디에서도 링크되지 않아 기능적으로 무의미하다." 직전 커밋들에서 `/free-resources`,
`/creator`를 추가할 때는 이 등록 단계를 거쳤는데 `/introduce`만 누락된 것 — 반복되는
작업 패턴에서 마지막 단계 하나를 빠뜨리기 쉬운 지점임을 보여준다.

**How to apply:** `src/app/(public)/` 아래 `LayerShell`을 쓰는 새 정적/플레이스홀더
페이지를 추가할 때는 다음 3곳을 항상 함께 확인한다 — (1) `Footer.tsx`의 `isModaShell`
경로 배열, (2) `TopBar.tsx`의 `MODA_SHELL_PATHS`, (3) `LayerSidebar.tsx`의
`SidebarContent`에 실제 `SidebarLink` 추가. 앞의 두 개만 하고 세 번째를 빠뜨리면
code-reviewer가 Major로 막을 가능성이 높다. 사이드바 내비게이션에 넣을 위치(상단 주요
메뉴 vs 하단 보조 링크)는 사용자에게 확인하는 것이 안전하다 — 이번엔 처음엔 상단 메뉴에
넣었다가 사용자가 "사이드바 하단에 이동해줘"로 정정해 하단(프로필 메뉴 바로 위, nav의
`flex-1`을 이용해 자연스럽게 하단에 고정)으로 옮겼다.
