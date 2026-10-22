---
name: topbar_morphing_header_migration
description: PublicHeader.tsx 완전 삭제 후 TopBar.tsx(MorphingHeader+CompactNav)로 흡수 통합, 스크롤 연동 폭/투명도 애니메이션 뷰포트 클램프 버그 수정. APPROVED (2026-08-24)
type: project
---

## 배경

`components/layout/PublicHeader.tsx`(과거 하단→상단 고정 pill 헤더, [[nav_header_popover_menu]]
참고)가 완전히 삭제되고, 이미 존재하던 `components/layout/TopBar.tsx`가 두 라우트 그룹의 헤더
역할을 모두 흡수:

- `MorphingHeader`(홈 `/`, `/growth` 등 `OVERLAY_HERO_PATHS` — 히어로 배너 위에 겹쳐도 안전한
  라우트): 스크롤 0~`SCROLL_MORPH_RANGE`(300px) 구간 동안 `useTransform(scrollY, ...)`로 넓은
  로고+로그인 헤더 → 압축 pill로 폭/투명도가 연속 전환.
- `CompactNav`(그 외 모든 라우트): 처음부터 압축 pill 고정 표시, 섹션 탭(가스펄픽스/모다) +
  장바구니(모다에서만) + 햄버거 메뉴(`NavPopover` 재사용).

## 이번 리뷰에서 확인한 핵심 설계 포인트 (모두 정상 — APPROVED)

1. **뷰포트 클램프 버그 수정**: 기존엔 `WIDE_WIDTH`(1280)/`COMPACT_WIDTH`(460) 상수를 그대로
   보간했는데, 좁은 화면에서 헤더가 `max-w-[calc(100vw-2rem)]`에 항상 눌려 스크롤 초반 구간이
   "죽은 구간"처럼 보이는 버그가 있었음. `viewportWidth` state(+resize 리스너)로
   `effectiveWideWidth = Math.min(WIDE_WIDTH, viewportWidth - 32)` /
   `compactWidth = Math.min(COMPACT_WIDTH, viewportWidth * 0.75)`로 보간 양 끝을 실제 렌더링
   가능한 값으로 재계산 — 정상 동작 확인.
2. **SSR 안전성**: `useState(WIDE_WIDTH)` 리터럴 초기값(→ `window.innerWidth` 아님)이라 서버에서
   에러 없음. 효과 실행 전 초기 렌더가 실제 기기 폭과 달라도 `motion.header`의 CSS
   `max-w-[calc(100vw-2rem)]`가 방어선 역할을 해서 시각적 튐 없음 — JS 계산값이 부정확해도 CSS
   하드캡이 항상 최종 렌더 폭을 보정하는 이중 방어 구조.
3. **`style={{ width }}`/`style={{ opacity }}` — CLAUDE.md의 style= 금지 규칙 위반 아님**:
   `useTransform`/`useMotionValue`가 반환하는 MotionValue는 React 리렌더를 우회해 DOM에 직접
   값을 쓰는 framer-motion의 핵심 최적화 메커니즘이라, `style` prop 외에 바인딩할 방법이
   없다(공식 문서 표준 패턴). `@dnd-kit`의 `CSS.Transform.toString()` 예외와 동일한 성격의
   "JS가 런타임에 계산하는 값" 케이스 — CLAUDE.md에 dnd-kit 예외만 명시되어 있고 framer-motion
   MotionValue 예외는 아직 문서화 안 됨(Minor, 다음 CLAUDE.md 갱신 시 함께 추가 제안).
4. **`useTransform`에 매 렌더 새 배열 리터럴 전달**: 공식 framer-motion 예제도 동일한 인라인
   배열 패턴을 쓰고(`useTransform(x, [0,1], [0,-300])`), 배열 크기가 매번 동일하고 요소 수가
   작아 성능 문제 없음 — 프로젝트 전체에서 이 패턴이 유일한 framer-motion 스크롤 연동 사용처.
5. **공용 컴포넌트 수정 원칙 준수**: `TopBar.tsx` 정의 파일 자체를 고쳤고 호출부(`layout.tsx`)는
   `<TopBar />` 그대로 — [[shared-component-changes]] 규칙 위반 없음.
6. **`(public)/page.tsx` 히어로 `pt-28` 추가**: 헤더(`top-[20px]` + `h-16`≈84px)와 히어로 배지가
   겹치는 버그 수정. 다른 라우트(`about`, `blog/[slug]`, `detail/[slug]` 등)는 이미 `pt-20`
   표준을 쓰고 있어 패턴 일관성 확인(홈만 `min-h-[100vh]` 센터 정렬이라 `pt-28`로 약간 더 여유).
7. **`ReferralCodeCard`(bottom-anchored, z-50)/`CookieConsentBanner`(`bottom-0`, z-40)와 헤더
   (top-anchored, z-30)는 서로 다른 화면 영역이라 충돌 없음** — [[nav_header_popover_menu]]에서
   반복됐던 "플로팅 위젯 bottom 오프셋 충돌" 클래스의 버그는 이번 변경 범위 밖.

## Major 발견 → 즉시 수정

`llms.txt:199`가 삭제된 `PublicHeader`를 그대로 나열하고 `TopBar`는 언급 없음 —
[[recurring_issues]] #19/#38과 동일 패턴(#39로 신규 기록). code-reviewer가 리뷰 중 직접
`{TopBar,Footer,LeftSidebar,NavPopover,CookieConsentBanner}.tsx`로 수정, 해소 확인.
`public/llms.txt`는 애초에 layout 컴포넌트 섹션이 없어 갱신 대상 아님.

## 참고

- Bash 도구가 이 세션에 없어 `tsc`/`eslint`/`build` 미실행 — Read/Grep 기반 정적 검증만 수행.
  사용자에게 로컬 `yarn build`/`yarn lint` 실행 권고함. [[no_bash_tool_constraint]] 참고.
- 이전 히스토리: [[nav_header_popover_menu]](구 PublicHeader 하단/상단 이동 리뷰 7차),
  [[mall_to_growth_route_rename]](`GROWTH_PATHS`/`OVERLAY_HERO_PATHS` 등 `/growth` 명명 확인).
