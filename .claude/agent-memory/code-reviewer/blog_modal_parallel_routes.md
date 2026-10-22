---
name: blog_modal_parallel_routes
description: /blog/[slug]를 Next.js 14 Parallel/Intercepting Routes(@modal, (.)[slug])로 모달 오픈하는 구조 — 최초 도입 사례. Major 3건 발견 후 전부 수정 확인 APPROVED(2026-07-28), 이후 이미지 갤러리+BackToBlogButton 공통화 라운드에서 Major 2건 재발로 BLOCKED(2026-07-29), 이후 /blog 목록 페이지 자체를 삭제하고 메인페이지 BlogSwiper로 통합 + @modal을 (public) 최상위로 이동하는 대규모 재구성, NavPopover 활성탭 회귀 1건 발견 후 즉시 수정 APPROVED(2026-08-05)
type: project
---

**작업 배경**: 블로그 상세(`/blog/[slug]`)를 목록에서 클릭 시 팝업 모달로 열되, 직접 URL
접근/공유 링크(하드 네비게이션)에서는 기존처럼 전체 페이지로 보이게 하는 기능. 이 저장소에서
Next.js Parallel Routes(`@modal` 슬롯) + Intercepting Routes(`(.)[slug]`)를 사용한 **최초
사례**이므로, 이후 다른 도메인(`growth`/`detail` 등)에 동일 패턴을 적용할 때 이 메모리를 참고할 것.

**구조**:
- `src/app/(public)/blog/layout.tsx` — `{children}{modal}` 렌더, `@modal` 슬롯을 prop으로 받음
- `src/app/(public)/blog/@modal/default.tsx` — 슬롯 미매치 시 `null` 반환(필수 보일러플레이트)
- `src/app/(public)/blog/@modal/(.)[slug]/page.tsx` — 같은 세그먼트 레벨을 가로채는 `(.)` 컨벤션 사용(정확함 — `[slug]`와 `@modal`이 둘 다 `blog` 세그먼트의 직계 자식이므로 `(.)`가 맞고 `(..)` 아님)
- `src/app/(public)/blog/[slug]/page.tsx` — 하드 네비게이션/직접 URL/SEO용 독립 풀페이지(그대로 유지, `generateMetadata` 포함)
- `src/components/ui/RouteModal.tsx` — 도메인 무관 범용 모달 wrapper(`components/ui/` 배치 적절). `createPortal` + `framer-motion`의 `AnimatePresence`로 backdrop+popup 페이드, `onExitComplete`에서만 `router.back()` 호출(닫힘 애니메이션이 실제로 끝난 뒤 라우팅 — 애니메이션 도중 라우팅하면 슬롯이 즉시 언마운트되어 fade-out이 재생 안 되는 문제를 의도적으로 회피한 설계)
- `src/components/news/NewsDetailContent.tsx` — 풀페이지/모달 두 곳에서 공유하는 렌더 로직 추출(좋은 패턴, `/main` 식 부분 중복 없음)

**Why**: 목록→상세 전환 시 페이지 전체 리로드 없이 빠른 미리보기 UX를 제공하면서도, 공유
링크/크롤러에게는 정상적인 SEO 메타데이터를 가진 독립 페이지를 유지하기 위해 Next.js 공식
권장 패턴(Vercel 사진 모달 예제와 동일 구조)을 그대로 채택함.

**2026-07-28 리뷰에서 발견된 Major 3건 (BLOCKED 판정 사유)**:

1. **`NewsDetailContent.tsx:26` template literal로 className 조합** — CLAUDE.md가 명시적으로
   금지하는 패턴(`className={\`btn ${cond ? "a" : ""}\`}`)을 그대로 사용:
   `` className={`... ${CATEGORY_COLOR[news.category] ?? "bg-gray-100 text-gray-600"}`} ``.
   `cn()` 미사용 + 100자 초과 라인(약 167자) 동반. `cn("inline-flex ... font-bold",
   CATEGORY_COLOR[news.category] ?? "bg-gray-100 text-gray-600")`로 교체 필요.
2. **`RouteModal.tsx`의 닫기 버튼이 raw `<button>`** — 같은 코드베이스의
   `components/ui/dialog.tsx`(`DialogContent`의 닫기 버튼)는 이미 `<Button variant="ghost"
   size="icon-sm">`를 재사용하는데, `RouteModal.tsx`는 동일 목적(닫기 아이콘 버튼)에 raw
   `<button>` + 수동 Tailwind 클래스를 사용해 프로젝트 내 확립된 관례(Button 재사용)에서
   벗어남. `components/ui/` 파일 내부라 위치 규칙(#9/#17)은 지켰지만 "이미 있는 atomic
   컴포넌트를 다시 감싸지 않고 raw 태그로 되돌아간" 새로운 변형 패턴.
3. **모달 접근성 3중 결함**:
   - `role="dialog" aria-modal="true"`에 `aria-label`/`aria-labelledby` 없음 → 스크린리더가
     대화상자 이름을 못 읽음(WCAG 4.1.2).
   - 초기 포커스 코드가 사실상 죽은 코드: `closeButtonRef.current?.focus()`가 담긴
     `useEffect(() => {...}, [])`가 **최초 렌더(`mounted=false`→`null` 반환) 직후 한 번만
     실행**되는데, 이 시점엔 아직 `mounted`가 `false`라 버튼이 DOM에 없어 `ref.current`가
     `null` → focus 호출이 항상 no-op. `mounted`가 `true`로 바뀌어 실제 버튼이 렌더된 후에는
     deps가 `[]`라 effect가 재실행되지 않아 영원히 포커스가 안 감. `useEffect(...,
     [mounted])`로 바꾸거나 두 effect를 합쳐야 함.
   - Tab 키 포커스 트랩이 전혀 없어(Escape 핸들러만 존재) 키보드 사용자가 모달 뒤 배경
     콘텐츠로 Tab 아웃 가능.

**Minor(비차단)**:
- `package.json`에 `tw-animate-css` 추가됐으나 `src/` 전체에 0건 사용(미사용 의존성).
- `NewsDetailContent.tsx`의 썸네일이 `next/image` 대신 raw `<img>`(eslint-disable 주석 포함) —
  같은 PR의 `blog/page.tsx` 리스트 카드는 동일 필드(`thumbnail_url`)에 `next/image`를 정상
  사용 중이라 방식 불일치.
- `framer-motion` 신규 의존성 추가는 `onExitComplete`로 "종료 애니메이션 후 router.back()"을
  구현하기 위한 합리적 선택으로 보이나(기존 `tailwindcss-animate` data-state 애니메이션만으론
  이 콜백 타이밍을 못 잡음), 새 런타임 의존성이므로 팀 논의 가치는 있음 — 블로킹 사유 아님.
- 브라우저 네이티브 뒤로가기(제스처/버튼)로 모달을 닫으면 `@modal` 슬롯이 라우팅에 의해 즉시
  통째로 언마운트되어, X 버튼 클릭 시(`setOpen(false)`→`onExitComplete`→`router.back()`)와
  달리 fade-out 애니메이션이 재생되지 않음 — Intercepting Routes + 커스텀 exit 애니메이션의
  공통적인 프레임워크 한계, QA에서 실제 동작 확인 권장.

**How to apply**: 이후 다른 도메인(growth 상품 상세 등)에 동일 `RouteModal` 패턴을 재사용할
계획이 있다면, 위 접근성 결함(특히 초기 포커스 죽은 코드)은 `RouteModal.tsx` 자체를 고치면
모든 도메인에 한 번에 적용되므로 최우선으로 근본 수정 제안할 것. `(.)[slug]` vs `(..)`
컨벤션은 세그먼트 깊이를 반드시 확인(이번 건은 `(.)`가 정확함).

**2026-07-28 재검토 결과 — Major 3건 전부 해소 확인, APPROVED**:
1. `NewsDetailContent.tsx` — `cn("inline-flex ... font-bold", CATEGORY_COLOR[news.category] ??
   "bg-gray-100 text-gray-600")`로 교체 확인. 100자 초과도 해소.
2. `RouteModal.tsx` 닫기 버튼 — `Button variant="ghost" size="icon-sm"` 사용으로 교체 확인.
   `closeButtonRef`를 `React.useRef<HTMLElement>(null)`로 선언해 `Button`의
   `React.forwardRef<HTMLElement, ...>` 타입과 정확히 일치(타입 에러 없음).
3. 접근성 3건:
   - 초기 포커스: `useEffect(() => setMounted(true), [])`와 별개로
     `useEffect(() => { if (!mounted) return; closeButtonRef.current?.focus(); }, [mounted])`로
     분리 — `mounted`가 true로 바뀐 뒤 실제로 focus 호출됨. 죽은 코드 해소.
   - Tab 트랩: keydown 핸들러에 `FOCUSABLE_SELECTOR`로 `popupRef.current` 내부 focusable 요소를
     순회해 첫/마지막 요소에서 Shift+Tab / Tab 경계를 wrap하는 로직 추가. 표준 focus trap 패턴,
     `popupRef.current`를 콜백 내부에서 지연 평가하므로 effect deps(`[]`)와 무관하게 항상 최신
     DOM을 참조 — 버그 없음.
   - `aria-label`: `RouteModal`에 필수 prop `ariaLabel: string` 추가, `role="dialog"` 요소에
     적용. 호출부(`blog/@modal/(.)[slug]/page.tsx`)에서 `ariaLabel={news.title}` 전달 확인.

새로운 회귀(regression) 없음. `'a[href], ... [tabindex]:not([tabindex="-1"])'`처럼 내부에
큰따옴표가 있는 문자열에 홑따옴표를 쓰는 것은 prettier의 정상 동작(이스케이프 최소화)이며
프로젝트의 "쌍따옴표 우선" 규칙 위반이 아님 — 향후 리뷰에서 오탐하지 말 것.

**2026-07-28 후속 커밋 리뷰 — 모달 레이아웃 풀블리드 전환 + 목록 그리드화, APPROVED**:
- `RouteModal.tsx`: popup을 `inset-4 sm:inset-8 lg:inset-16 rounded-3xl`(반응형 여백+둥근
  모서리)에서 `inset-0 top-6`(상단만 여백, 나머지 화면 끝까지)+각진 모서리로 변경. `inset-0`과
  `top-6`을 함께 쓰는 조합은 Tailwind 코어 플러그인 등록 순서상 `top-*`가 `inset-*`보다 뒤에
  생성되어 동일 명시도에서도 항상 `top-6`이 이김 — 정상 동작하는 관용 패턴(오탐 주의). 닫기
  버튼은 `variant="ghost"`의 기본 hover(`hover:bg-muted` 등)를 `hover:bg-black
  hover:text-white hover:opacity-100 dark:hover:bg-black`로 완전히 덮어써 호버 시 무변화로
  고정 — `cn(buttonVariants({variant,size,className}))` 체인에서 cva가 `className`을 항상
  마지막에 append하고 그 결과를 `cn()`(tailwind-merge)이 다시 처리하므로, 같은 속성
  (`hover:bg-*`, `dark:hover:bg-*`)의 마지막 선언이 확실히 이긴다 — 정상 동작 확인.
  콘텐츠 스크롤 영역의 `scrollbar-hide` 제거 후 `grep -rn scrollbar-hide src` 결과 프로젝트
  전체에서 이 클래스의 마지막 사용처였음이 드러남(`globals.css`엔 정의만 남고 소비처 0건) —
  당장 문제는 아니나 죽은 CSS이므로 다음에 건드릴 때 정리 후보로 기록.
- `blog/page.tsx`: `AppSwiper`+`SwiperSlide`(가로 스크롤) → `grid grid-cols-2 lg:grid-cols-4`로
  전환. `AppSwiper`/`SwiperSlide` import 완전 제거 확인(미사용 import 없음). `key={item.id}`를
  `Link`에 직접 부여(이전 대비 안전 — index key 없음). `next/image`의 `sizes`를
  `(max-width: 1024px) 50vw, 25vw`로 변경 — Tailwind `lg` 브레이크포인트(1024px)와 미디어
  쿼리 값이 정확히 일치해 실측 렌더 폭과 최적화 힌트가 어긋나지 않음.
- Critical 0건(`style=`/`asChild` 미검출, grep 전수 확인), Major 0건. 기존에 이 파일에서
  지적됐던 접근성 3건(#22 포함)은 이번 diff가 건드리지 않은 영역이라 그대로 유지됨(재확인
  결과 회귀 없음). **APPROVED**.

**2026-07-29 후속 커밋 리뷰 — portfolio_images 갤러리 + BackToBlogButton 공통화, Major 2건으로 BLOCKED**:
- `RouteModal.tsx`: `RouteModalContext`(`React.createContext<(() => void) | null>`)를 새로 추가,
  `useRouteModalClose()` export. Provider value가 `() => setOpen(false)`라서 기존 설계 원칙
  ("모든 닫기 트리거는 setOpen(false)만 호출, router.back()은 onExitComplete에서만")을 정확히
  지킴 — 신규 패턴 도입이지만 회귀 없음. `mounted`가 true가 되기 전까지 `null`을 반환하므로
  children(BackToBlogButton 포함)이 context 값 확정 전에는 아예 마운트되지 않아 hydration
  mismatch 우려 없음(soft navigation으로만 도달하는 라우트라 SSR html 대조 자체가 발생하지 않음).
- `BackToBlogButton.tsx`(신규): 풀페이지/모달 2곳에 중복되던 "모든 블로그 보기" 버튼을 정확히
  프로젝트 규칙대로 컴포넌트화(위치 `components/news/`도 적절). `useRouteModalClose()`가 null이면
  `<Link href="/blog">`, 함수면 `<button onClick={closeModal}>`로 분기 — 정상 동작, 잘된 패턴.
- **Major 1**: `NewsImageGallery.tsx`(신규)의 prev/next 원형 아이콘 버튼 2개가 raw `<button>` —
  같은 diff의 `RouteModal.tsx`는 정확히 같은 목적에 `Button variant="ghost" size="icon-sm"`을 이미
  재사용 중이라 한 PR 안에서도 파일별로 관례 준수가 엇갈림. 자세한 내용은 [[recurring_issues]] #23.
- **Major 2**: `NewsDetailContent.tsx`의 `splitImagesFromContent`가 작업 범위(portfolio_images 갤러리
  추가)를 넘어 본문에 삽입된 모든 `<img>`를 무조건 제거해 갤러리로 이동 — 신규 필드를 안 쓰는 기존
  발행 게시물까지 소급 적용되는 콘텐츠 렌더링 변경. 원본 `alt` 속성도 유실됨. 자세한 내용은
  [[recurring_issues]] #24.
- Critical 0건(`style=`/`asChild`/홑따옴표 grep 전수 확인 결과 없음). `swiper/types` 서브패스 import는
  `node_modules/swiper/package.json`의 `exports["./types"]`와 `types/public.d.ts`의
  `export type { Swiper, ... }`로 유효성 확인(타입 에러 아님). **BLOCKED** — 위 Major 2건 수정 후
  재검증 필요.

**2026-08-05 대규모 재구성 — `/blog` 목록 페이지 삭제 + 메인페이지 통합 + `@modal` 슬롯을
`(public)` 최상위로 이동, Major 1건 발견 즉시 수정 후 APPROVED**:
- 구조 변경: `src/app/(public)/blog/@modal/*` → `src/app/(public)/@modal/*`로 이동(파일 내용
  자체는 무변경, 디렉토리만 이동). `(.)blog/[slug]` intercepting 컨벤션이 세그먼트 깊이상 정확함
  (`@modal`이 이제 `blog`와 형제 세그먼트이므로 `(.)`가 맞음). `blog/layout.tsx`(구 `{modal}`
  렌더 담당)는 삭제되고 그 역할이 `(public)/layout.tsx`에 흡수됨 — `(public)` 그룹 전체(`/growth`,
  `/detail/[slug]`, `/about` 등)에서 모달 슬롯이 함께 렌더되지만 `@modal/default.tsx`가 미매치
  시 `null`을 반환하므로 다른 라우트에 부작용 없음.
- `src/components/news/BlogSwiper.tsx`(신규): 구 `blog/page.tsx`의 카드 마크업을 그대로
  `AppSwiper`로 감싸 메인페이지(`(public)/page.tsx`)에 삽입. 카드 `Link`는 `href="/blog/${slug}"`
  + `scroll={false}` 유지(intercepting route 진입 컨벤션 그대로 보존). prev/next 화살표는
  `swiper/types`의 `Swiper` 인스턴스를 `useState`로 들고 `slidePrev/slideNext` 호출 —
  `NewsImageGallery.tsx`(2026-07-29에 이미 도입된 패턴)와 동일한 컨벤션이라 일관성 있음.
- **Major 1 (발견 후 즉시 수정, [[recurring_issues]] 패턴과 유사한 "href 문자열 변경 시 매칭
  로직 미동기화" 사례)**: `NavPopover.tsx`의 `OFFICIAL_NAV_ITEMS`에서 블로그 항목의
  `href`/`linkHref`를 모두 `"/blog"` → `"/#blog"`로 바꿨는데, `isActive()`의 `official` 분기는
  `pathname.startsWith(hrefPath)`로 매칭한다. `pathname`(`usePathname()`)은 URL 해시(`#...`)를
  절대 포함하지 않으므로 `pathname.startsWith("/#blog")`는 항상 `false` — 블로그 상세 모달
  (`/blog/[slug]`)을 보고 있어도 "블로그" 탭이 영원히 활성화(주황색) 표시되지 않는 회귀. 같은
  파일의 `MALL_NAV_ITEMS`는 애초에 매칭용 `href`와 이동용 `linkHref`를 분리해 두는 컨벤션을 쓰고
  있었으므로, `OFFICIAL_NAV_ITEMS`도 동일하게 `{ href: "/blog", linkHref: "/#blog", ... }`로
  분리해 수정(리뷰 중 직접 Edit). `href`는 상세 모달 경로 매칭용으로만 쓰이고 실제 클릭 이동은
  `linkHref`(`/#blog`)를 그대로 사용하므로 UX 변경 없이 활성 탭 표시만 복원됨.
- `Footer.tsx`(공식 홈페이지 링크)도 동일하게 `/blog` → `/#blog`로 변경됐지만 `Footer.tsx`에는
  active 상태 매칭 로직 자체가 없어(단순 `<Link>` 나열) 동일한 회귀가 발생하지 않음 — active
  매칭 로직이 있는 파일(`NavPopover.tsx`, `LeftSidebar.tsx`)만 이 패턴의 위험 대상.
- 상품 카테고리 `"blog"`(뉴스 블로그와 무관한, 몰 상품 분류상 우연히 동명이었던 값) 전체 삭제
  (`product.types.ts`의 `PRODUCT_CATEGORIES`, `LeftSidebar.tsx`, `growth/page.tsx` labelMap) —
  `CategoryFilter.tsx`가 `PRODUCT_CATEGORIES`를 순회만 하는 구조라 자동 반영 확인. 단
  `PRODUCT_FORMAT_LABELS.blog`(상품 상세 "제공형태" 칩용, 별개 매핑)는 삭제되지 않고 남아있음 —
  카테고리 값 `"blog"`가 더 이상 존재하지 않으므로 사실상 도달 불가능한 죽은 엔트리(Minor, 비차단
  cleanup 후보).
- `RouteModal.tsx`: 배경 스크롤 잠금을 `document.body.style.overflow`뿐 아니라
  `document.documentElement.style.overflow`(html)에도 거는 방어 보강 — CLAUDE.md의 `style=` JSX
  속성 금지 규칙과는 무관(imperative DOM 스크립트, React 엘리먼트의 `style=` prop이 아님).
- Critical 0건. 이 라운드에서 커밋 그룹 2개(모달 이동+카테고리 정리+RouteModal 스크롤락)가 서로
  다른 3가지 관심사를 한 커밋에 묶은 점은 기능적 문제는 아니라 Minor(조직적 제안)로만 기록.
  Major 1건은 리뷰 중 직접 수정 완료 — **APPROVED**.
