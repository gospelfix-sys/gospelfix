---
name: introduce_page_sidebar_link_review
description: 신규 /introduce 페이지가 앱 어디서도 링크되지 않아 1차 BLOCKED → LayerSidebar 하단에 SidebarLink 추가로 재검증 APPROVED
metadata:
  type: project
---

## 배경

`src/app/(public)/introduce/page.tsx`(모다 마켓플레이스 "소개" 페이지) 신규 추가 1차 리뷰에서
Major로 BLOCKED 판정: 페이지 자체는 정상 렌더링되지만 앱 내 어디에도 `/introduce`로 가는
링크가 없어 사용자가 URL을 직접 입력하지 않는 한 도달 불가능했다.

## 재검증에서 반영된 3가지 수정

1. `src/components/layer/LayerSidebar.tsx`의 `SidebarContent` — 기존
   `<nav className="flex flex-1 ...">`(HOME/FREE RESOURCES/CREATOR, `SidebarLink` 3개) 바로
   아래, `<SidebarProfileMenu>` 바로 위에 `<div className="px-3 pb-2">` 블록을 추가하고 그
   안에 `SidebarLink`(icon=`Info`, label="소개", href="/introduce")를 배치. nav가 `flex-1`이라
   이 블록은 사이드바 최하단(프로필 메뉴 바로 위)에 위치 — 사용자가 명시적으로 요청한 배치.
2. `src/app/(public)/introduce/page.tsx`의 100자 초과 줄(metadata description)을 여러 줄로
   분할 — Prettier printWidth 100 준수.
3. `LayerSidebar.tsx` 모바일 닫기 버튼의 중복 hover 클래스
   (`hover:bg-gf-bg hover:text-gf-gray2`)에 "ghost variant 기본 hover를 의도적으로
   무력화"라는 설명 주석 추가.

## 검증 방법 및 결과

- `Grep`으로 `introduce` 전수 검색 → `LayerSidebar.tsx`(링크+active 판정),
  `Footer.tsx`(isModaShell 좌측 패딩), `TopBar.tsx`(MODA_SHELL_PATHS로 전역 TopBar 숨김)
  3곳에서 일관되게 처리됨 확인.
- `LayerShell`을 사용하는 라우트 전수 확인(`/`, `/upload`, `/free-resources`, `/creator`,
  `/introduce` 자신) → `LayerSidebar`가 이 모든 페이지에서 렌더링되므로, 특히 마켓플레이스
  홈("/")에서 데스크톱 항상-노출 사이드바 + 모바일 드로어 양쪽 경로로 `/introduce`에 도달
  가능해짐. Major 이슈 해소 확인.
- 신규 추가된 코드(사이드바 "소개" 블록, Footer/TopBar의 `/introduce` 배열 항목)는 모두
  100자 이내, `cn()` 사용, `style=` 없음, 기존 `SidebarLink` 패턴을 정확히 재사용 —
  CLAUDE.md 컨벤션 위반 없음.
- 참고: `LayerSidebar.tsx`/`Footer.tsx`/`TopBar.tsx`에 남아있는 일부 긴 `className`
  단일 문자열(100자 초과)은 Prettier가 문자열 리터럴을 강제 줄바꿈하지 않는 것이라
  코드베이스 전반에 이미 존재하는 정상 패턴(신규 이슈 아님).

## 판정 (2026-09-07)

APPROVED. Critical/Major 0건. Minor(비차단): "소개" `SidebarLink`가 시맨틱
`<nav>` 요소 바깥의 `<div>`에 위치해 스크린리더 랜드마크 탐색 시 HOME/FREE
RESOURCES/CREATOR와 다른 그룹으로 인식될 수 있음 — 기능상 문제는 없으므로 비차단.
