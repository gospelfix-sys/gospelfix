---
name: mypage_shared_layout_conventions
description: /mypage 그룹 max-width는 DashboardHeader.tsx와 (mypage)/layout.tsx 두 파일에 나뉘어 있어 한쪽만 바뀌면 정렬 불일치가 생긴다; 다중 진입 경로 페이지의 뒤로가기는 고정 href가 아닌 router.back()이어야 한다
type: feedback
---

`/mypage/**` 화면의 최대 너비는 `src/components/dashboard/DashboardHeader.tsx`(헤더 내부
`<div>`)와 `src/app/(mypage)/layout.tsx`(`<main>`) 두 개의 독립 파일에 각각
`max-w-[...]`로 지정돼 있다. 시각적으로는 하나의 컨테이너처럼 이어져 보이지만 실제로는 서로
다른 컴포넌트라, 한쪽만 값을 바꾸면 헤더와 본문의 좌우 정렬이 어긋난다.

**Why:** 2026-08-25 세션에서 사용자가 `max-w-[1440px]`를 `1200px`로 바꿔달라고 두 번(헤더용
className 한 번, 본문용 className 한 번) 따로 요청했다 — 하나의 요청으로 착각하고 한 파일만
고치면 회귀가 남는다.

**How to apply:**
- `/mypage` 레이아웃 관련 PR을 리뷰할 때 `max-w-[...]` 값이 두 파일에서 동일한지 diff로
  확인한다. 한쪽만 바뀌었다면 Major로 지적한다.

## 뒤로가기 버튼의 이동 대상

`/mypage`처럼 여러 진입 경로(사이드바 프로필 메뉴, 직접 URL 등)를 가진 페이지에 뒤로가기
버튼을 추가하는 diff를 보면, `<Link href="/">` 같은 **고정 경로**가 아니라
`next/navigation`의 `useRouter().back()`을 쓰고 있는지 확인한다. 고정 href는 실제 진입
경로와 무관하게 항상 같은 곳으로 보내 "뒤로가기"라는 이름과 동작이 어긋나는 결함이 된다
(Minor~Major, 진입 경로가 실제로 여러 곳인 페이지에 한해).

**참고 구현:** `src/components/mypage/BackButton.tsx`, `src/app/(mypage)/layout.tsx`에 1회만
배치되어 모든 하위 라우트에 자동 노출됨(페이지별 중복 배치가 아님 — 정상 패턴).
