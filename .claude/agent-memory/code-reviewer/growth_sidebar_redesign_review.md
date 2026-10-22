---
name: growth_sidebar_redesign_review
description: /growth 페이지를 여러 섹션 랜딩(추천인 배너/히어로/ticker/CtaBanner)에서 왼쪽 고정 사이드바+갤러리 레이아웃으로 전면 재설계한 리뷰. 1차 Bash 없이 정적 검증, Major(loading.tsx 완전 미동기화) 1건 BLOCKED → 2차 재검증 APPROVED
type: project
---

## 배경 (2026-08-25, 749d523 이후 누적 diff 리뷰)

`/growth`를 "여러 섹션 랜딩페이지"(추천인 배너 `ReferralCodeCard`, 단일 히어로 슬라이드
`HeroBanner`, 인라인 ticker/"왜 모다인가", `CtaBanner`)에서 "왼쪽 고정 사이드바 + 상단
검색바 + 카드형 히어로 캐러셀 + 언더라인 카테고리 탭 + 갤러리"로 전면 재작성. 신규
`src/components/growth/`: `GrowthShell`(모바일 사이드바 open state 관리),
`GrowthSidebar`(데스크톱 고정 220px + 모바일 드로어), `GrowthTopBar`(햄버거+검색
placeholder+장바구니+마이페이지), `HeroCarousel`(`AppSwiper` 기반 멀티카드), `CategoryTabs`
(Server Component, `PRODUCT_CATEGORIES`에서 "all" 제외). 삭제:
`components/main/{CtaBanner,HeroBanner}.tsx`, `components/products/CategoryFilter.tsx`.
`TopBar.tsx`는 `/growth`에서 `return null`(growth가 자체 헤더 사용), `Footer.tsx`는
`isGrowth && "lg:left-[220px]"` 오프셋으로 사이드바와 겹침 방지.

## 검증 방법

이 세션은 Bash 도구가 없어([[no_bash_tool_constraint]]) `git diff`/`git status`를 직접
실행하지 못함. 사용자가 설명한 변경 배경을 바탕으로 관련 파일 전체를 `Read`하고, 삭제된
3개 파일의 잔존 참조를 `Grep`으로 전수 검색하는 정적 검증만 수행. `yarn lint`/`yarn build`는
사용자가 이미 클린 빌드로 재확인했다고 전달함(직접 재실행은 못 함).

## 검증 결과 — 대부분 정상

- 삭제된 3개 파일(`CtaBanner.tsx`/`HeroBanner.tsx`/`CategoryFilter.tsx`) 잔존 참조 0건
  (Glob으로 파일 자체가 사라짐도 확인, Grep 매치는 전부 `HeroCarousel.tsx`/`globals.css`의
  무해한 주석 2곳뿐).
- `CategoryTabs.tsx`는 정말 Server Component(useState/useEffect/useSearchParams 없음,
  `currentCategory`를 prop으로 받아 `searchParams`를 서버에서 await한 페이지가 내려줌) —
  클라이언트 훅 누락 없음, "use client" 불필요가 맞음.
- `Footer.tsx`의 `lg:left-[220px]`가 `GrowthSidebar`의 `w-[220px]`와 정확히 일치. `cn()`
  둘째 인자로 조건부 전달해 규칙 준수. `inset-x-0`(그룹 `inset-x`)과 `lg:left-[220px]`
  (그룹 `left`)는 tailwind-merge에서 서로 다른 클래스 그룹이라 충돌 제거 대상이 아니고,
  Tailwind 코어 플러그인의 유틸리티 생성 순서상 같은 미디어쿼리 내에서 `left`가 `inset-x`
  뒤에 오므로 CSS 캐스케이드로도 정상 동작(과거 `dialog.tsx` `max-w-lg` 사고와는 다른
  케이스 — 그때는 두 클래스가 tailwind-merge상 동일 그룹이라 하나가 완전히 제거됐었음).
- `GrowthTopBar.tsx`의 마이페이지 링크(`Link href="/mypage"` + `cn(buttonVariants({variant:
  "ghost"}), ...)`)가 `TopBar.tsx`의 `WideContent`와 동일 패턴으로 일관됨.
- `PRODUCT_CATEGORIES`/`getCategoryLabel` 단일 소스를 `CategoryTabs`/`growth/page.tsx`가
  그대로 재사용 — [[recurring_issues]] #12(카테고리 라벨 3중 하드코딩) 재발 없음.
- `HeroCarousel`의 `ctaHref`(`/growth?category=landing|dashboard|ecommerce`)가
  `PRODUCT_CATEGORIES` 실제 값과 일치 — [[recurring_issues]] #10(`/main` 깨진 링크) 계열
  재발 없음.
- 따옴표/세미콜론/`cn()` 사용 등 Prettier·CLAUDE.md 컨벤션 전반 준수, `style=` 인라인 0건,
  `asChild` 0건.

## Major 1 — `growth/loading.tsx` 완전 미동기화 (BLOCKED 사유)

신규 레이아웃(사이드바 여백, 카드형 히어로, 언더라인 탭, 섹션 패딩)이 전혀 반영되지 않고
옛 페이지 스켈레톤 그대로 방치됨(사이드바 `lg:pl-[220px]` 없음, 히어로가 옛 전체화면
단일 배너 높이, 이제 없는 "ticker 스켈레톤" 잔존, 카테고리 스켈레톤이 pill 5개로 옛
`CategoryFilter` 형태). [[recurring_issues]] #40(신규, #13의 대규모 재발) 참고. 매
네비게이션마다 로딩 중 풀블리드 화면 → 사이드바 포함 화면으로 크게 튀는 CLS 발생.
**수정 필요**: `loading.tsx`를 `GrowthShell`(사이드바+탑바) 골격에 맞춰 스켈레톤을 다시
그릴 것.

## Minor (블로킹 아님)

- `globals.css`의 `@keyframes ticker`, `.hero-timer-circle`/`@keyframes hero-timer`,
  `.grain-texture`(주석 "HeroBanner 유틸리티")가 `HeroBanner.tsx` 삭제 후 고아 CSS로 남음.
  [[recurring_issues]] #41(신규) 참고.
- `GrowthSidebar.tsx`의 `SidebarLink` 함수 시그니처 한 줄이 약 105자로 `.prettierrc`
  printWidth(100) 초과 — 재포맷 권장.
- 비활성 사이드바 항목(`SidebarLink`의 `disabledReason` 분기)이 `<div aria-disabled="true">`
  (호스트 role 없는 generic div)로 렌더되어 `aria-disabled`가 스크린리더에 의미 있게
  전달되지 않을 수 있음. 키보드 포커스 불가(탭 순서 제외)는 의도대로 정상 동작. `title`
  속성은 터치/모바일 기기에서 노출되지 않으므로, 사유(`disabledReason`)를 hover 전용이
  아니라 시각적으로도 항상 보이는 "준비중" 배지 등으로 보완 권장.
- `CategoryTabs.tsx`가 `role="tablist"`/`role="tab"`/`aria-selected`를 실제 페이지 이동
  링크(`<Link href>`)에 적용 — 진짜 ARIA 탭 패턴(단일 tabindex, 화살표 키 이동, 패널
  show/hide)을 구현하지 않았으므로 스크린리더 사용자에게 잘못된 상호작용 기대를 줄 수
  있음. `role` 제거 후 `aria-current="page"` 방식의 일반 네비게이션 링크로 바꾸거나, 진짜
  탭 키보드 패턴을 구현하는 것을 고려.
- (이번 diff와 무관, 기존 이슈 carry-over) `CartProvider`가 마운트 시 `fetchCart()`를
  호출하지 않아 카트 배지가 열기 전까지 항상 0으로 보이는 문제([[cart_batch_checkout_feature]]
  Major #3, 아직 미해결)가 `GrowthTopBar`에도 그대로 노출됨 — 새 버그는 아니지만 노출
  지점이 하나 늘었다는 점 참고.

## 판정 (2026-08-25, 1차)

BLOCKED — Major 1건(`growth/loading.tsx` 미동기화). Critical 0건, 앱 코드베이스 내부
일관성(삭제 파일 잔존 참조, 카테고리/링크 단일 소스, 컨벤션 준수)은 전수 검증 결과 문제
없음.

## 2차 재검증 (같은 날) — loading.tsx 재작성 후 APPROVED

`growth/loading.tsx`를 상품 fetch와 무관하게 즉시 렌더 가능한 실제 컴포넌트(`GrowthShell`,
`HeroCarousel`, `CategoryTabs currentCategory=""`, `FilterDropdown options=[]`×2)를 그대로
재사용하고, fetch 결과에 의존하는 카드 그리드만 `ProductCard`와 동일 치수(rounded-2xl,
aspect-[1080/1350], border-t px-5 py-3.5 등)의 `animate-pulse` 스켈레톤으로 남기는 방식으로
재작성. `page.tsx`와 최상위 래퍼(`GrowthShell` 재사용이라 100% 동일)부터 섹션 패딩까지
구조적으로 완전히 일치함을 코드 대조로 확인 — CLS 문제 해소. `CategoryTabs`에
`currentCategory=""`를 넘기는 것은 4개 탭이 모두 비활성으로 렌더될 뿐 문자열 비교라 타입/
런타임 에러 없음. `GrowthShell`/`HeroCarousel`/`GrowthSidebar`/`GrowthTopBar`가 loading
fallback에서도 완전히 인터랙티브하게 렌더되는 것은 의도된 설계(상품 목록만 기다리고 나머지
셸은 즉시 조작 가능하게 함)이며, `useCart()`의 카트 개수는 루트에서 별도 Provider가 채우는
Recoil atom을 구독할 뿐이라 loading.tsx의 중복 마운트가 별도 fetch를 유발하지 않음(부작용
없음 확인). [[recurring_issues]] #40 해소로 갱신 완료.

**최종 판정**: APPROVED. Critical/Major 0건. Minor(#41 고아 CSS, SidebarLink 100자 초과,
비활성 항목 접근성, CategoryTabs role=tab 오용)는 1차 리뷰에서 이미 non-blocking 확인된
사항으로 그대로 유지, 이번 재검증에서 판정에 영향 없음.
