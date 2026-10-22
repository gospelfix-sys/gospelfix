---
name: nav_header_popover_menu
description: PublicHeader.tsx/NavPopover.tsx 하단 고정 네비게이션 팝업 개편 — 1차 BLOCKED(Major 2건) → 재검증 APPROVED → 다크테마 스타일 튜닝(3차) APPROVED 경위
type: project
---

## 배경

`components/layout/PublicHeader.tsx`(하단 고정 pill 헤더) + `components/layout/NavPopover.tsx`
(그 위에서 아래→위로 펼쳐지는 그리드 애니메이션 팝업 메뉴)로 구성된 네비게이션 개편.

## 1차 리뷰 — BLOCKED (Major 2건)

1. **상단 줄 클릭 시 메뉴 미닫힘**: 로고 `Link`(href="/"), GOSPELFIX `Link`, STORE `Link` 3곳에
   `onClick`이 없어 메뉴가 열린 채로 다른 섹션 이동 시 팝업이 안 닫힘.
2. **닫힌 상태에서 포커스/스크린리더 노출**: `grid-rows-[0fr]` + `overflow-hidden`으로 시각적으로만
   숨겨져 있어, 키보드 Tab 이동 시 화면에 안 보이는 메뉴 항목에 포커스가 가고 스크린리더도 읽음.

## 2차 리뷰 — APPROVED (2026-07-31)

- Major #1: `PublicHeader.tsx`의 로고/GOSPELFIX/STORE `Link` 3곳 모두 `onClick={() =>
  setMenuOpen(false)}` 추가 확인 (67, 78, 91행). 클릭 이벤트는 Next.js Link의 실제 네비게이션
  여부(같은 경로 재클릭 포함)와 무관하게 항상 발생하므로 모든 케이스에서 정상 동작.
- Major #2: `NavPopover.tsx` 최상위 컨테이너에 `aria-hidden={!menuOpen}` +
  `{...({ inert: !menuOpen ? "" : undefined } as React.HTMLAttributes<HTMLDivElement>)}` 추가 확인.
  React 18 타입에 `inert`가 없어 캐스팅이 필요했던 점은 타당한 우회이며, 구조적 타이핑상
  `{ inert: string }`이 전부 optional인 `HTMLAttributes`의 서브타입으로 인정되어 `as unknown as`
  이중 캐스팅 없이도 tsc 통과 가능(실제로 확인됨). `menuOpen`이 true가 되면 `inert: undefined`가
  스프레드되어 속성 자체가 제거되므로 재상호작용 가능 상태로 정상 복귀.
- 새로운 회귀 없음: `grid-rows-[0fr]`/`transition-[grid-template-rows]` 애니메이션 클래스,
  `menuRef` 기반 outside-click 처리 로직 모두 그대로 유지되어 변경과 무관.

## 재사용 가능한 판단 기준

- **`React.HTMLAttributes` 등 `React.X` 타입 참조에 `import React` 없어도 OK**: 이 프로젝트는
  `@types/react`의 UMD 전역 네임스페이스(`export as namespace React`)에 의존하는 관례가 이미
  여러 파일에 존재함(`PurchaseOptionContext.tsx`의 `React.ReactNode`, `AppSwiper.tsx`의
  `React.ReactNode` 등 — 둘 다 `import React`/`import type React` 없음). `tsconfig.json`의
  `isolatedModules: true`도 이 전역 네임스페이스 참조를 막지 않는다. 따라서 앞으로 리뷰에서
  `React.HTMLAttributes`/`React.ReactNode` 등을 보고 "React import 누락"으로 잘못 지적하지
  말 것 — 코드베이스 기존 확립 패턴과 일치한다.
- `aria-hidden` + `inert` 동시 적용은 중복(inert가 암묵적으로 접근성 트리에서 제외함)이지만
  해롭지 않은 방어적 패턴으로 통과 처리(Minor 지적 대상 아님).

## 3차 리뷰 — 다크테마 스타일 튜닝 (2026-08-01, APPROVED)

`package.json` engines.node 22.x→24.x(엔진-strict 설정 없음 확인, 안전) + `NavPopover.tsx`
순수 스타일 변경(활성 nav 아이템 `bg-gf-orange text-white`→`text-gf-orange` 텍스트 전용, 로그인
버튼 오렌지 배경 제거 후 회원가입과 동일 스타일 통일, 두 버튼 사이 세로 구분선
`<div className="w-px bg-white/10 my-1 shrink-0" />` 추가) 리뷰.

- **`shrink-0`만 있고 `flex-none`/`grow-0` 명시가 없는 구분선이 `flex-1` 형제 사이에서 안전한 이유**:
  Tailwind 유틸리티 클래스가 없으면 브라우저 기본값 `flex: 0 1 auto`가 적용되어 `flex-grow`는
  이미 0이다. `shrink-0`은 `flex-shrink`만 0으로 고정해 컨테이너가 좁아져도 1px 폭이 찌그러지지
  않게 보장한다. 즉 `flex-1` 형제 두 개가 `flex-basis: 0%`로 남는 공간을 정확히 절반씩 나눠
  갖고, 구분선은 항상 `w-px` 그대로 유지된다 — 앞으로 이런 "flex 형제 사이 구분선" 패턴을 볼 때
  `grow-0`을 별도로 안 써도 버그가 아님을 판단 기준으로 삼을 것.
- **로그인/회원가입 버튼 className이 완전히 동일한 문자열로 수렴**: 두 `<button>`의 className이
  글자 하나 안 틀리고 동일해짐. 위젯 중복 판정 규칙(2곳 이상 반복 시 컴포넌트 추출) 대상이긴
  하나, 각 버튼은 단일 정적 문자열이고 조합 로직이 없어 `cn()` 위반도 아니며 규모가 작아
  Minor 제안(공유 상수/컴포넌트 추출)에 그침 — Major/BLOCKED 사유 아님.
- 로그인/회원가입이 여전히 raw `<button>` (shadcn `Button` 미사용)인 점은 이번 diff로 새로 생긴
  문제가 아니라 이전 세션부터 존재하던 패턴이며, 과거 1~2차 리뷰에서도 Major로 지적되지 않고
  통과된 이력이 있음 — 이번처럼 스타일만 바뀐 diff에서 새삼 BLOCKED 사유로 끌어올리지 않는다.

## 4차 리뷰 — 하단(bottom-6) → 상단(top-6) 고정 위치 이동 (2026-08-06, BLOCKED)

`PublicHeader.tsx`가 `fixed bottom-6` → `fixed top-6`로 전면 이동(NavPopover/PublicHeader DOM
순서 반전, 그림자 방향 반전, `border-b`→`border-t`, 로고 아이콘 삭제, 모바일 좌우 패딩 축소).

- **DOM 순서/그림자/보더 방향 반전은 모두 정확**: 메인 바가 먼저, `NavPopover`가 그 아래
  (`border-t border-white/10`)에 위치해 top-anchored 헤더에서 자연스럽게 아래로 펼쳐짐. 그림자도
  `shadow-[0_4px_24px_...]`(하향)로 정확히 반전됨. `aria-hidden`/`inert` 접근성 패턴, `menuRef`
  outside-click 로직 모두 순서 변경과 무관하게 그대로 유지됨.
- **Major(신규 발견): `CookieConsentBanner`와의 z-index/위치 충돌**. `src/app/layout.tsx`(루트
  레이아웃, 모든 페이지 공통)에 마운트되는 `CookieConsentBanner.tsx`가 `fixed top-0 left-0 right-0
  z-40`(전체 폭, `bg-black`, 모바일에서 `flex-col`로 텍스트+버튼이 세로로 쌓여 상당히 높음) 형태로
  이미 화면 상단을 점유하고 있었는데, `PublicHeader`가 `bottom-6`에서 `top-6 z-50`(가로 중앙 정렬
  pill, z-index가 배너보다 높음)으로 이동하면서 최초 방문자(쿠키 동의 전) 화면에서 두 UI가 같은
  상단 영역에서 겹치게 됨. 헤더가 배너보다 z-index가 높아 배너의 안내 문구/버튼 위에 올라타
  가려질 수 있음 — 헤더가 이동하기 전에는 두 컴포넌트가 각각 상/하단을 나눠 써서 충돌이 없었으나,
  이번 변경으로 처음 생긴 회귀. `(public)/page.tsx`(메인) 히어로 섹션의 `pt-24`류 여백은
  `about/page.tsx`엔 있지만 메인 페이지는 `min-h-[100vh] justify-center`로 센터 정렬이라 상단
  침범 가능성은 낮음(Minor로만 언급, 이번 diff에 포함된 파일 아님).
- **참고(오검출 방지)**: `ScrollBadge.tsx`(카카오 문의, `bottom-32/bottom-8 z-30`)와
  `QuoteFloatingButton`(재작성 후 `bottom-[152px]/bottom-24 z-30`)은 좌표상 겹칠 수 있어 보이지만,
  실제로는 `ScrollBadge`는 `/quote` 페이지(`QuoteMain.tsx`)에만, `QuoteFloatingButton`은 메인/about
  페이지에만 렌더링되어 **동시에 나타나지 않으므로 실제 충돌 아님** — grep으로 렌더 위치를 반드시
  대조할 것(좌표 계산만으로 오탐 내리기 쉬운 사례).
- **해결 방향 제안**: (a) `CookieConsentBanner`를 하단(`bottom-0`)으로 옮기거나, (b) 배너가
  visible한 동안 헤더의 top 오프셋을 늘리거나, (c) 배너 z-index를 헤더보다 높게 두어 배너가 항상
  최상단에 보이도록 한다. 다음 라운드 재검증 시 실제 브라우저 스크린샷으로 겹침 여부 재확인 필요.

## 5차 재검증 — (a) 채택 후 새로 드러난 잠재적 회귀 (2026-08-06, BLOCKED 유지)

사용자가 (a)안(`CookieConsentBanner`를 `top-0`→`bottom-0 z-40`)을 적용해 헤더와의 충돌은
해소됐으나(코드 확인 완료), 배너가 이제 `ScrollBadge`(`/quote`, `bottom-32`≒128px `z-30`)·
`QuoteFloatingButton`(메인/about, `bottom-[152px]`≒152px `z-30`)과 **같은 화면 하단·z-40>z-30**을
공유하게 됨. 모바일에서 배너 텍스트("GOSPELFIX은 ... 개인정보처리방침" + `flex-col` 버튼)가
좁은 화면에서 2~3줄로 줄바꿈될 경우 추정 높이(`py-4`32px + 텍스트 2~3줄 40~60px + `gap-4`16px +
버튼 36px ≈ 124~144px)가 `ScrollBadge`의 128px 오프셋과 매우 근접/초과하고
`QuoteFloatingButton`의 152px 오프셋과도 여유가 크지 않아, 실기기(좁은 폭)에서 검정 배너가
버튼 하단부를 가리거나 클릭을 가로챌 가능성이 있음 — **정적 분석만으로는 확정 불가, 실기기/뷰포트
스크린샷 확인 필요**.
**제안 수정**: `useCookieConsent()`가 반환하는 `null`(미동의=배너 표시 중일 가능성)을
`ScrollBadge`/`QuoteFloatingButton`에서 구독해 배너 노출 중에는 bottom 오프셋을 추가로 올리거나,
반대로 배너 쪽에 `max-w-*`를 줘서 화면 우측 하단(플로팅 버튼 영역)을 침범하지 않는 좌측 정렬
토스트 형태로 바꾸는 것을 다음 라운드에 제안.

## 6차 재검증 — 상태 결합 대신 여백 확보로 해소, APPROVED (2026-08-06)

사용자가 제안한 "상태 구독" 대신 더 단순한 방식 채택: (1) `CookieConsentBanner.tsx`
모바일 패딩/간격 축소(`px-6 py-4 gap-4` → `px-4 py-3 gap-2`, `sm:`는 기존값 유지, 법적 고지
텍스트는 그대로 보존), (2) `ScrollBadge.tsx`(`/quote` 전용) bottom 오프셋 상향
(`bottom-32`→`bottom-40`, `sm:bottom-8`→`sm:bottom-20`). `QuoteFloatingButton`은 이미 여유가
있어 변경하지 않음(사용자가 여러 차례 조정한 값이라 보존).

**계산 재검증 결과**: 모바일 배너 최악(3줄 wrap) 추정 높이 `py-3(24)+text 3줄(60)+gap-2(8)+
button(36)=128px` vs `ScrollBadge` 새 오프셋 160px → 32px 여유(4줄 wrap하는 극단적 케이스도
148px로 여전히 12px 여유). 데스크톱 배너(가로 1줄) 추정 `button(36)+py-4(32)=68px` vs
`ScrollBadge` 새 오프셋 80px → 12px 여유(다소 타이트하지만 양의 마진 확보, Minor 수준).
`QuoteFloatingButton`은 모바일 152px/데스크톱 96px로 배너 최대 높이 대비 기존에도 충분한 여유가
있었음을 재확인. `QuoteFloatingButton`/`ScrollBadge`는 `/quote`(ScrollBadge)와 메인·about
(QuoteFloatingButton) 페이지에만 각각 렌더링되어 서로 동시 노출되지 않음(5차 리뷰에서 이미
확인된 사실, 재확인 불필요).

**최종 판단**: Major 전량 해소 확인, APPROVED. 데스크톱 12px 여백은 타이트하지만 계산상 양수이고
극단적 케이스(초협소 데스크톱 폭에서 배너 텍스트 2줄 wrap)는 발생 가능성이 낮아 Minor로만 기록,
BLOCKED 사유 아님.

## 7차 리뷰 — QuoteFloatingButton 모바일 bottom 오프셋 재축소로 배너 충돌 재발 (2026-08-07, BLOCKED)

`QuoteFloatingButton.tsx`의 모바일 컨테이너 위치를 `bottom-[68px]` → `bottom-4`(16px)로 낮춘
unstaged 변경. 6차 리뷰 이후 `bottom-[152px]`에서 다시 `bottom-[68px]`로 한 차례 더 낮아져 있던
상태(별도 세션, 메모리 미기록)에서 이번에 16px까지 추가로 낮춤.

**픽셀 계산(위젯은 `flex-col` 컨테이너 — Link 카드가 먼저, "오늘 그만보기/닫기" 행이 마지막 자식
이라 시각적으로 가장 아래에 위치, 컨테이너 자체는 `bottom-4`로 앵커링)**:
- 위젯 하단(닫기 행) y=[16, 50], 카드 y=[58, 208], 카드 내부 CTA 알약(`absolute inset-x-4
  bottom-4`, 카드 하단에서 16px 인셋) y=[74, 118] (모두 viewport 하단 기준 px).
- `CookieConsentBanner.tsx`(`fixed bottom-0 ... z-40`, `px-4 py-3 gap-2` + 줄바꿈되는 안내문 +
  버튼)의 모바일 실측 예상 높이는 6차 리뷰에서 계산한 ~128~148px 그대로 재사용 가능 → 배너 커버
  범위 y=[0, ~132].
- **"AI 견적 받아보기" CTA 알약(y=[74,118])이 배너 커버 범위(y=[0,132])에 완전히 포함** —
  z-40(배너) > z-30(위젯)이라 배너가 위에 렌더링되고 `pointer-events` 차단도 없어, 쿠키 미동의
  상태(모든 신규 방문자의 최초 진입 시점)의 모바일 화면에서 이 플로팅 버튼의 핵심 CTA가 시각적으로
  가려지고 클릭도 배너가 가로챈다.
- **변경 전(`bottom-[68px]`)과의 대조**: 이전엔 CTA 알약이 y=[118,162]로 배너 범위(0~132)와
  14px만 겹쳐 거의 안전했음 — 이번 diff가 그 여유를 없애고 새로 회귀를 만든 것이 명확함(정적
  계산만으로도 고신뢰 판단 가능, 5~6차 리뷰의 "실기기 확인 필요" 수준의 불확실성이 아님).
- **How to apply**: 이 프로젝트에서 `bottom-*` 값을 가진 신규/기존 플로팅 위젯(플로팅 CTA, 배지,
  토스트 등)의 오프셋을 낮추는 diff는 항상 `CookieConsentBanner.tsx`(z-40, `bottom-0`, 전체 폭)와의
  겹침을 픽셀 단위로 재계산해야 한다 — 이미 4~6차 리뷰에서 같은 배너가 두 차례(`PublicHeader`,
  `ScrollBadge`) 회귀를 일으킨 반복 진앙지. `useCookieConsent()`(`src/hooks/useCookieConsent.ts`)가
  이미 존재하므로, 정적 오프셋 대신 배너 visible 여부(`status === null` 그리고 아직 dismiss 안 한
  최초 로드 시점)에 따라 위젯의 bottom 오프셋을 동적으로 올리는 방식을 근본 해결책으로 우선
  제안한다(5차 리뷰에서 제안했다가 6차에서 "정적 여백 확보"로 대체 채택된 것과 동일한 아이디어를
  재사용). 단순 대안은 모바일 오프셋을 배너 최대 높이(~132~148px)보다 크게(`bottom-32`~`bottom-40`
  대) 유지하는 것.
