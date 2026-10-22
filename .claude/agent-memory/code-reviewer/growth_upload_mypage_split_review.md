---
name: growth_upload_mypage_split_review
description: /about 모핑헤더 확장 + /growth 사이드바 프로필메뉴 + /mypage 설정·프로필 분리 + /growth/upload Tiptap 에디터 신규(HEAD a78ca42 이후 누적 diff) 배포 전 리뷰
type: project
---

2026-08-25, HEAD(a78ca42) 이후 누적된 미커밋 변경사항 최종 배포 전 리뷰. 범위:

1. `TopBar.tsx`의 `isOverlayHero`에 `/about` 추가 — `about/page.tsx` 히어로 `pt-28`로 홈
   히어로(`page.tsx:66`)와 정확히 동일한 값 확인. `TopBar`는 `(public)/layout.tsx`에서만
   렌더되므로 `/mypage`(DashboardHeader 별도 사용)에는 영향 없음.
2. `GrowthSidebar.tsx` — "로그인" 링크를 `<nav>` 내부에서 `SidebarContent` 최하단 sibling으로
   이동(`SidebarProfileMenu.tsx` 신규와 함께 최하단 고정). `SidebarContent`가 데스크톱
   고정(`hidden lg:flex`)과 모바일 드로어(`lg:hidden`) 양쪽에서 동일하게 재사용되므로 구조
   변경이 양쪽에 동일 반영됨 확인.
3. `/mypage` 설정/프로필 분리 — `AccountSettingsForm.tsx` 삭제 후 잔존 참조 0건(grep 확인).
   `AccountSettingsCards.tsx`(계정 이메일 표시/비밀번호 변경/회원탈퇴)는 `/auth/password`,
   `/auth/me` DELETE를 그대로 재사용. `ProfileSettingsForm.tsx`(이름/아바타)는 `/auth/avatar`
   POST, `/auth/me` PATCH를 그대로 재사용 — 기존 API 계약과 100% 일치.
4. `/growth/upload`(`UploadWorkEditor.tsx` 신규) — Tiptap 리치 에디터(`RichTextEditor.tsx`,
   `richTextStyle.ts`)는 raw `<button>` 없이 전부 `Button` 컴포넌트로 감싼 `ToolbarButton` 통해
   렌더링, `cn()` 사용 준수. 색상 피커 스와치의 `style={{ backgroundColor: currentColor }}`만
   `style=` 사용 — 사용자가 색상 피커로 선택하는 무한 집합의 hex 값이라 정적 Tailwind 클래스로
   표현 불가능한 경우이며, `@dnd-kit` 런타임 transform과 동일 성격의 정당한 예외로 주석 처리됨
   (CLAUDE.md 예외 조항과 일치, code_preview_section_review의 customStyle Critical 사례와는
   다름 — 그쪽은 config 객체로 전체 테마를 재정의해 className으로 충분히 대체 가능했던 반면
   이번 건은 진짜 임의값). Tiptap 이미지 삽입(`insertImages`, `handleDrop`)은
   `URL.createObjectURL(file)`만 사용하고 백엔드 업로드 호출 없음 — 의도된 스코프(주석에 명시)
   확인.
5. `globals.css`/`docs/design.md`의 `--gf-bg` `#f1f1eb`→`#f3f3f4` 변경은 `--muted`(#f0eee8,
   card.tsx/avatar.tsx/button.tsx 등에서 별도 사용)와 완전히 분리된 변수라 grep으로 영향范위
   확인 — 의도대로 격리됨. `SidebarProfileMenu.tsx` 트리거의 `hover:bg-gf-bg` 오버라이드도
   이 버튼 1곳에만 적용되어 전역 `--muted` 사용처에 영향 없음.

## 발견 및 조치

- **Major(즉시 수정 완료)**: `CLAUDE.md` "설치된 라이브러리" 표에 `@tiptap/*`(package.json에
  10개 서브패키지, `^3.28.0`) 누락 — recurring_issues #19(의존성 교체 시 CLAUDE.md 미동기화)와
  동일 패턴. 리뷰 중 직접 표에 한 줄 추가해 해소(`| `@tiptap/react`, `@tiptap/starter-kit`,
  `@tiptap/pm` 등 `@tiptap/*` | ^3.28.0 | ... |`).
- **Minor(비차단)**: `GrowthShell.tsx`(기존)와 `UploadWorkEditor.tsx`(신규)가 거의 동일한 외곽
  셸 마크업(`min-h-dvh bg-gf-bg` + `Suspense`로 감싼 `GrowthSidebar` + `lg:pl-[220px]`
  래퍼)을 각자 인라인으로 갖고 있음 — 다만 실제로 복잡하고 오류 위험이 큰 로직(사이드바 자체,
  모바일 드로어, 프로필 메뉴)은 `GrowthSidebar` 한 곳에만 있고 중복된 건 얕은 wrapper div
  뿐이라 Major로 격상하지 않음. 백로그: 필요 시 `GrowthSidebarShell({ header, children })`로
  공용화 제안.
- **Minor(비차단)**: `UploadWorkEditor.tsx`의 로컬 `Chip`(removable 태그, label+X 버튼)이
  기존 `components/ui/Chip.tsx`(active 토글 pill, reservation-showcase 3파일에서 재사용 중)와
  이름은 같지만 용도/API가 다름(토글 선택 vs 제거 가능한 태그) — 실제 중복 아님, 다만 향후
  탐색 시 혼동 가능성 있어 이름 차별화(`RemovableChip` 등) 고려 가능.

## 최종 판정

APPROVED. Critical 0건, 발견된 Major 1건(CLAUDE.md 문서 동기화)은 리뷰 중 즉시 수정 완료.
