# /growth 페이지 전면 재설계 (왼쪽 사이드바 + 상단 검색바 레이아웃)

## Context

사용자가 `/growth`("모다" 마켓플레이스) 페이지를 대대적으로 재설계해달라고 요청했다. "모든
템플릿" 섹션(카테고리 필터 + 상품 카드 그리드)만 남기고 나머지 섹션은 전부 삭제하며, 참고
이미지("웹쟁이" 사이트 캡처 — 왼쪽 고정 사이드바 내비게이션 + 상단 검색바/아이콘 + 카드형
히어로 배너 캐러셀 + 필터 pill + 카드 그리드)와 같은 레이아웃으로 바꾸는 것이 목표다.

이 레이아웃은 GospelFix가 현재 전 페이지에서 쓰는 떠 있는 캡슐형 `TopBar`(스크롤에 따라
넓은 헤더 ↔ 압축 알약으로 모핑, 모든 페이지 공통)와 구조적으로 다르다. 사용자와 확인한 결과:

- **TopBar 처리**: `/growth`에서만 기존 캡슐형 TopBar를 완전히 숨기고, 새 사이드바+상단바가
  그 역할을 대체한다. 다른 페이지(`/`, `/detail` 등)는 기존 TopBar를 그대로 유지한다.
- **색상**: 참고 이미지의 빨간 포인트/화이트 테마가 아니라, GospelFix 기존 컬러 토큰
  (`gf-orange` 포인트, `gf-bg` 배경, `gf-black` 텍스트)을 그대로 쓰고 레이아웃 구조만
  참고한다.
- **히어로 배너**: 기존 `HeroBanner`(전체 화면 단일 슬라이드)의 데이터(배지/헤드라인/CTA)는
  유지하되, 참고 이미지처럼 여러 장이 동시에 보이는 카드형 멀티 배너 캐러셀로 재설계한다.
- **사이드바 메뉴**: 홈 + 카테고리 4개(랜딩페이지/대시보드/이커머스/기업·단체) + 구분선 +
  마이페이지(로그인 시) — 기존 `PRODUCT_CATEGORIES`(`src/types/product.types.ts`)를 그대로
  재사용한다.
- **검색 인풋**: 참고 이미지에는 있지만, 상품 전문 검색은 현재 백엔드/프론트 어디에도 없는
  기능이라 이번 범위에서는 **시각적 배치만 구현하고 기능은 연결하지 않는다**(placeholder
  input). 실제 검색이 필요하면 별도 후속 작업으로 진행한다.

## 현재 구조 (조사 결과)

`src/app/(public)/growth/page.tsx`는 위→아래로: 추천인 배너(`ReferralCodeCard`, 조건부) →
`HeroBanner`(단일 슬라이드) → 인라인 "모다 브랜드 소개 바" → 인라인 "기술 스택 ticker" →
**갤러리 섹션(= 모든 템플릿, 유지 대상)**: `CategoryFilter` + `FilterDropdown`×2(정렬/가격) +
`ProductCard` 그리드 → 인라인 "왜 모다인가?" → `CtaBanner`. 데이터는
`serverFetch<Product[]>("/api/products?category=...&sort=...&price=...")` +
`getMe()` + `getReferralBanners()`를 `Promise.all`로 병렬 조회한다.

- `ReferralCodeCard`는 `(mypage)/layout.tsx`에서도 쓰는 **공용 컴포넌트** → 삭제 금지,
  growth에서 참조만 제거.
- `CtaBanner`, `CategoryFilter`는 이 변경 후 다른 사용처가 없어질 예정 → 최종 삭제 전 grep으로
  재확인 후 삭제.
- `HeroBanner`는 growth 전용이었으므로 삭제 없이 새 위치(`components/growth/`)로 옮기고
  내부를 재작성한다.
- 인라인 섹션(소개 바/ticker/왜 모다인가)은 다른 파일과 공유되지 않아 자유롭게 삭제 가능.

## 구현 계획

### 1. 신규 도메인 폴더 `src/components/growth/`

기존 `components/products/`, `components/orders/`와 동일한 컨벤션(도메인별 폴더,
`component-layers.md`의 "features" 계층)으로 growth 전용 컴포넌트를 모은다.

**`GrowthShell.tsx`** ("use client") — 모바일 사이드바 열림 상태(`mobileMenuOpen`)만 관리하는
최소 클라이언트 래퍼. `GrowthSidebar`(Suspense로 감싸 `useSearchParams` 대응)와
`GrowthTopBar`(`onMenuClick` prop 전달)를 렌더링하고, 서버에서 렌더된 나머지 콘텐츠는
`children`으로 그대로 통과시킨다. 데스크톱 사이드바 폭만큼 콘텐츠 영역에 `lg:pl-[220px]`
오프셋을 준다(사이드바가 `fixed`이므로).

**`GrowthSidebar.tsx`** ("use client") — 데스크톱(`lg:` 이상): `fixed left-0 top-0 h-dvh
w-[220px] flex-col border-r gf-border gf-bg-white`로 항상 노출. 모바일: `open`/`onClose`
props로 제어되는 `fixed inset-0 z-40` 오버레이 슬라이드인 패널(기존 `CompactNav`의
클릭-아웃사이드-닫기 패턴 재사용). 내용: 로고(`/`) → 홈(전체) + `PRODUCT_CATEGORIES`의
landing/dashboard/ecommerce/corporate 4개(각 라벨은 `PRODUCT_CATEGORY_LABELS` 그대로 사용,
"홈"만 "전체" 대신 커스텀 라벨) → 구분선 → 마이페이지(로그인 시) / 로그인(비로그인 시).
활성 카테고리는 `useSearchParams().get("category")`로 판단(기존 `CategoryFilter.tsx`와 동일
로직).

**`GrowthTopBar.tsx`** ("use client") — `sticky top-0 z-10 h-16 border-b gf-border
gf-bg-white`. 좌측: 모바일 전용 햄버거 버튼(`onMenuClick` prop, `lg:hidden`). 중앙: 검색
인풋(UI만, `components/ui/input.tsx` 재사용, 기능 미연결 — placeholder). 우측: 장바구니
아이콘(`useCart().openCart`, `cartItemCountSelector` 배지 — 기존 `TopBar.tsx`의 `CompactNav`
패턴 그대로 재사용) + 로그인 상태에 따른 컨트롤(`authUserAtom`, `authLoadingAtom` 재사용).

**`HeroCarousel.tsx`** — `src/components/main/HeroBanner.tsx`를 이 경로로 이동 후 재작성.
기존 `SLIDES` 데이터(배지/헤드라인/CTA href)는 그대로 유지. 컨테이너를 전체 화면 단일 슬라이드
대신 기존 공용 래퍼 `components/ui/AppSwiper.tsx`(이미 다른 곳에서 쓰는 Swiper 패턴, 새로
만들지 않고 재사용)로 감싸 `slidesPerView`를 반응형(모바일 ~1.15, `lg:` 이상 ~2.2)으로 설정,
카드 3장이 부분적으로 겹쳐 보이는 멀티 배너 캐러셀로 재설계. 카드 내부는 `rounded-2xl`
+ 배지 + 헤드라인(축소) + CTA 버튼으로 간소화(기존의 큰 통계 줄/세로 데코 텍스트는 카드가
작아지므로 제거). 페이지네이션은 `AppSwiper`의 기존 `pagination` prop 그대로 사용(참고
이미지의 커스텀 "01—02" 프로그레스바는 새로 만들지 않고 기존 Swiper 불릿 스타일 재사용).

### 2. `src/app/(public)/growth/page.tsx` 재작성

- 데이터 페칭: `serverFetch<Product[]>("/api/products?...")` 호출은 그대로 유지. `getMe()` +
  `getReferralBanners()` 호출은 `ReferralCodeCard` 제거로 더 이상 필요 없으므로 삭제.
- `ReferralCodeCard`, `HeroBanner`(구), `CtaBanner`, `CategoryFilter`, 인라인
  소개바/ticker/"왜 모다인가" 섹션 참조를 모두 제거.
- `<GrowthShell>`로 감싸고, 그 안에 `<HeroCarousel />` → 갤러리 섹션(기존 헤더 문구 "Gallery"
  / "모든 템플릿" or `getCategoryLabel(currentCategory)`, 총 개수 표시 유지) → 필터 행(기존
  `FilterDropdown`×2를 우측 정렬로 유지, `CategoryFilter`는 사이드바로 이전했으므로 제거) →
  기존 `ProductCard` 그리드(그대로 재사용, `checkIsNew`/`isPick` 로직 변경 없음) 순서로
  배치한다.

### 3. `src/components/layout/TopBar.tsx` 수정

- `TopBar()` 함수 최상단에 `if (pathname.startsWith("/growth")) return null;` 추가 — growth는
  자체 헤더(`GrowthShell`)를 쓰므로 전역 TopBar를 렌더링하지 않는다.
- `OVERLAY_HERO_PATHS` 배열에서 `/growth`를 제거(사실상 `"/"` 하나만 남으므로, 배열 자체를
  없애고 `isOverlayHero = pathname === "/"`로 단순화해도 됨).
- `GROWTH_PATHS = ["/growth", "/detail"]`는 `/detail` 페이지의 `CompactNav`가 "모다" 섹션
  탭 활성 상태를 판단하는 데 계속 쓰이므로 그대로 둔다(early return 이후 `/growth` 자체는
  이 배열에 도달하지 않지만, `/detail`은 여전히 이 배열을 거쳐야 하므로 변경 불필요).

### 4. 삭제

구현 중 아래 파일들이 실제로 다른 곳에서 더 이상 참조되지 않는지 `grep`으로 재확인한 뒤 삭제한다.

- `src/components/main/CtaBanner.tsx` (growth에서만 쓰였음, growth 재작성으로 참조 소멸)
- `src/components/products/CategoryFilter.tsx` (사이드바로 기능 이전, growth 외 사용처 없음)
- `src/components/main/HeroBanner.tsx` (내용을 `components/growth/HeroCarousel.tsx`로 이동
  했으므로 원본 삭제)

## 검증 방법

1. `yarn lint`, `yarn build` 통과 확인(특히 삭제된 컴포넌트의 잔존 import가 없는지 타입
   체크로 확인됨).
2. `yarn dev`로 로컬 서버 실행 후 `/growth` 접속:
   - 데스크톱 폭에서 왼쪽 사이드바가 고정으로 보이고, 카테고리 클릭 시 `?category=...` URL이
     바뀌며 그리드가 필터링되는지 확인.
   - 모바일 폭(또는 브라우저 반응형 모드)에서 사이드바가 숨겨지고 햄버거 버튼으로 슬라이드인
     드로어가 열리는지 확인.
   - 히어로 캐러셀이 여러 장 카드로 보이고 스와이프/네비게이션이 동작하는지 확인.
   - 장바구니 아이콘 클릭 시 기존 `CartModal`이 정상적으로 열리는지(회귀 확인).
   - `/`, `/detail/[slug]` 등 다른 페이지에서는 기존 캡슐형 TopBar가 그대로 보이는지(회귀
     확인 — growth 전용 early return이 다른 라우트에 영향 주지 않는지).
3. `code-reviewer` 에이전트로 최종 검토(공용 컴포넌트 삭제 전 사용처 재확인, `style=` 미사용,
   `cn()` 사용, 컴포넌트 위치 규칙 준수 여부 등).
