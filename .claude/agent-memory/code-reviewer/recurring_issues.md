---
name: recurring_issues
description: 코드 리뷰에서 반복 발견되는 이슈 패턴(번호별 규칙·재발 징후·올바른 방법)과 아키텍처 리뷰 포인트. 개별 리뷰 로그는 통합되어 삭제됨
type: feedback
---

개별 리뷰 이력(BLOCKED/APPROVED 진행 로그)은 버리고 패턴만 남겼다. 번호는 리뷰 보고에서 인용하기 쉽도록 새로 매겼다.
각 항목은 현재 코드에서 유효함을 확인한 것만 담았다. 컨벤션 원문은 루트 `CLAUDE.md`와 `.claude/rules/`가 우선이다.

## A. 반복 이슈 패턴

### 1. raw `<button>` 재발 (Major, 가장 많이 재발)
- 규칙: 클릭 UI는 `components/ui/button.tsx`(`Button`/`buttonVariants`), 토글·칩은 `ui/Chip.tsx`, 탭은 `ui/Tab.tsx`를 쓴다. 링크 버튼은 `<Link className={buttonVariants()}>`.
- 재발 징후: 신규·전면 재작성 파일의 닫기(X), 아코디언 더보기, 복사, 옵션 토글, 칩, 팝업 트리거. 같은 디렉토리에 Chip/Button 선례가 있어도 재발한다. `components/ui/` 내부 파일도 예외가 아니다(RouteModal 닫기 버튼 사례).
- 방법: 리뷰 시작 때 `grep -rn "<button" src`로 전수 확인. 같은 마크업이 2곳 이상이면 먼저 `ui/`로 추출한다. 단일 위젯 전용 장식 요소(진행바 dot 등)는 Minor로 하향 가능.

### 2. 인라인 스타일 우회 (Critical)
- 규칙: `style=` 금지. `style={{` grep만으로는 부족하다. 서드파티의 `customStyle`/`contentStyle`/`wrapperStyle` 등 "Style" prop에 정적 값을 넣는 변형도 위반이다.
- 방법: 정적 값이면 라이브러리가 `className`을 DOM에 포워딩하는지 소스로 확인하고 Tailwind로 교체. 런타임 계산값(motion `MotionValue`, 에디터가 계산한 색, 라이브러리 테마 객체)만 예외이며 반드시 "style= 예외 허용" 사유 주석을 단다. 현재 예외: `TopBar.tsx`(MotionValue), `CodePreviewSection.tsx`(Prism 테마), `RichTextEditor.tsx`(선택 색 표시).

### 3. 공용 컴포넌트는 정의 파일을 고친다 + tailwind-merge 함정 (Major)
- 규칙: 호출부마다 같은 클래스를 반복하지 않는다(`.claude/rules/shared-component-changes.md`).
- 함정: 접두사 없는 `max-w-lg`가 같은 그룹의 모바일 여백 `max-w-[calc(100%-2rem)]`를 지운다. 그래서 `dialog.tsx`는 여백을 flex 래퍼 `p-4`(padding), 너비를 `sm:max-w-*`로 분리했다. 새 공용 프리미티브도 "여백"과 "최대 너비"를 서로 다른 CSS 속성으로 설계한다.
- 재발 징후: `ui/*`를 덮어쓰는 호출부 className, 같은 위젯이 분기마다 복제된 래퍼(예: 무료/유료 분기마다 반복되는 flex+LikeButton). "100% 동일 블록"만 추출하고 바깥 셸 중복을 방치하는 부분 추출도 같은 계열이다.

### 4. Tailwind opacity 모디파이어 + CSS 변수 색 토큰 (Major)
- 현상: `tailwind.config.ts`의 색 토큰이 `var(--x)` 순수 값이라 `bg-primary/10`, `ring-foreground/10`, `ring-ring/50`, `bg-destructive/10` 같은 `/N` 클래스가 조용히 생성되지 않을 수 있다. 현재도 `card.tsx`, `select.tsx`, `popover.tsx`, `checkbox.tsx`, `MypageSidebar.tsx` 등에 남아 있다(`bg-muted/50`, `bg-primary/10`, `ring-ring/50` 등).
- 방법: 새 코드에서 `/N`을 CSS 변수 토큰에 쓰면 실제 CSS가 생성됐는지 확인한다(`yarn build` 후 확인하거나 hex/rgba 임의값 사용). 근본 해결은 토큰을 `rgb(var(--x) / <alpha-value>)` 형식으로 바꾸는 것이다. "N건 모두 수정했다"는 보고는 같은 grep을 다시 돌려 검증한다(실제로 누락이 나온 적 있음).
- 연관: `gf-*` 토큰과 값이 같은 임의값(`border-[#e8e5df]` 등)은 토큰(`border-gf-border`)으로 쓴다(Minor).

### 5. className 조합은 `cn()` (Major)
- 템플릿 리터럴(`className={`a ${b}`}`)이나 `.join(" ")` 금지. 상태·카테고리별 색 매핑 `Record<string,string>`을 문자열에 끼워 넣는 코드에서 자주 나온다. 현재 `className={\`` 사용 0건.

### 6. 루트 레이아웃 상주 모달의 종료 처리 (Critical)
- 규칙: `CartProvider`/`BatchPaymentModal`처럼 루트에 상주하는 모달은 페이지 이동만 하지 말고 완료·취소·닫기 등 **모든 종료 경로에서 `onClose`** 를 호출한다. 이동만 하면 모달이 영구히 남는다.
- 연관: 공용 모달 셸이 복제되면(결제 안내 모달 2개 등) 셸 컴포넌트로 추출한다. 헤더 배지처럼 마운트 시 조회가 필요한 상태는 마운트-fetch 여부를 확인한다.

### 7. 마운트-fetch와 클릭 낙관적 업데이트의 레이스 (Major)
- 징후: `useEffect`로 초기 상태를 조회하는 컴포넌트(`LikeButton.tsx`)에서 사용자가 응답 전에 토글하면 늦게 온 stale 응답이 최신 상태를 덮어쓴다. 언마운트용 `cancelled` 가드만으로는 부족하다.
- 방법: 클릭 시 `hasInteractedRef.current = true`를 세우고 fetch 콜백에서 스킵하거나, 요청 세대 카운터/AbortController로 최신 요청만 반영한다(현재 `LikeButton.tsx`가 전자로 처리).
- 연관: 렌더 중 `array[index]`를 읽는 회전 UI는 배열이 줄면 `undefined`가 된다. 인덱스를 렌더 시점에도 클램프한다. `useEffect` deps에 state 전체 객체를 넣고 effect 안에서 setState하면 불필요한 재실행·무한루프 위험이 있으니 실제로 읽는 필드만 deps에 둔다.

### 8. IME 조합 중 실시간 필터링 (Major)
- 규칙: slug/아이디/코드처럼 "허용 문자만 + 실시간 필터링" input은 한글 조합 중 매 keystroke 필터링하면 입력이 깨진다.
- 방법: `onChange`에서 `isComposing`이면 원본 값을 그대로 두고, `onCompositionEnd`에서 정리한다. 기준 구현은 `UploadWorkEditor.tsx`와 `hooks/useUploadWorkForm.ts`의 `handleSlugChange`. Enter 전송 키 처리는 `e.nativeEvent.isComposing`(`ChatPanel.tsx` 선례).

### 9. `next/link` + `download` 속성 (Critical)
- `Link`는 `download`를 검사하지 않고 클릭을 클라이언트 라우팅으로 가로챈다(`node_modules/next/dist/client/link.js`의 `isModifiedEvent` 확인). 파일 다운로드는 plain `<a href download>`를 쓴다. `ProductInfoChips.tsx`가 올바른 예다. 리뷰 시 `grep -rn "download" src`로 `<Link ... download>` 조합을 확인한다.

### 10. 라우트·값 리네이밍 후 잔존 참조 (Major)
- 내부 참조: 라우트 경로와 enum성 값(`?category=`)은 라벨 매핑만 고치지 말고 `href`/쿼리스트링에 하드코딩된 옛 값까지 전수 grep. 가능하면 `CategoryTabs`처럼 상수 배열에서 `map()`으로 생성한다.
- 외부 참조: 서비스된 적 있는 라우트를 지우거나 리네임하면 `next.config.mjs` `redirects()`에 이전 경로를 넣는다(현재 `/mall`, `/growth`, `/quote` 처리 있음). 영구(308)는 되돌릴 수 없으니 되살아날 수 있는 경로는 `permanent: false`.
- 동기화 대상: 루트 `CLAUDE.md` 라우트 설명, `layerNav.ts`의 `LAYER_NAV_ITEMS`(LayerShell 페이지 신규 시 미등록하면 고아 라우트), `llms.txt`, `public/llms.txt`.

### 11. 문서-코드 불일치 (Major)
- 징후: 컴포넌트 삭제, 타입 필드 리네임, 의존성 교체(예: iconoir→lucide), 기능 삭제·재도입, 비즈니스 모델 변경 때 `CLAUDE.md`, `.claude/agents/*.md`, `llms.txt`, `public/llms.txt`, `README.md`, `docs/`, 약관 조항(`TermsContent`의 정의 조항 포함)이 옛 서술을 유지한다.
- 방법: 삭제·변경 대상 이름을 `src`뿐 아니라 저장소 루트의 문서 전체에 `grep -rln`으로 전수 검색한다. 에이전트 지침 문서가 stale이면 에이전트가 정답을 반대로 오탐하므로 일반 오탈자보다 우선순위가 높다. 법적 문서의 약속(라이선스 설명, 결제 서술)이 서로 모순되지 않는지도 본다.

### 12. 컴포넌트 삭제·레이아웃 개편 시 부속 파일 동기화 (Major/Minor)
- `loading.tsx` 스켈레톤: 카드 비율·섹션 패딩·레이아웃 셸을 바꾸면 같은 세그먼트의 `loading.tsx`도 맞춘다(CLS). 전면 재설계일수록 놓친다. 권장: fetch와 무관한 실제 셸 컴포넌트를 `loading.tsx`가 그대로 재사용하고 데이터 영역만 스켈레톤으로 둔다(`LayerShellLoading.tsx` 선례).
- 고아 CSS: 컴포넌트를 지우면 `globals.css`의 전용 클래스·`@keyframes`도 확인한다(Minor).

### 13. 전체 폭 fixed 오버레이의 클릭 가로채기 (Critical)
- `fixed inset-x-0 ... flex justify-center` 컨테이너는 투명한 좌우 여백도 히트박스라서, z-index가 높으면 아래 요소(모달 닫기 버튼 등)의 클릭을 가로챈다. 컨테이너에 `pointer-events-none`, 실제 보이는 자식에 `pointer-events-auto`를 준다(올바른 예: `ProductVisitNav.tsx`).
- 하단 고정 요소(네비, 쿠키 배너, 플로팅 버튼)를 새로 놓거나 옮길 때는 서로 겹치는지(`bottom-*`, z-index, 모바일 폭)를 같이 본다.

### 14. Swiper loop 최소 슬라이드
- `loop` + `centeredSlides` + 소수점 `slidesPerView`는 슬라이드가 적으면 마지막→처음에서 멈춘다. 슬라이드 배열 자체를 반복한다(최소 5개 이상 확보). breakpoints를 바꾸면 반복 횟수를 재검토한다. `slideToLoop`는 첫 반복 구간으로만 이동하니 활성 인덱스와 같은 dot 클릭은 가드한다. 현재 코드에 loop 사용처는 없고(홈 히어로가 교체됨) 일반 패턴으로만 유효.

### 15. 서버/클라이언트 경계의 무거운 라이브러리
- `sanitize-html` 같은 서버향 파서는 `"use client"` 컴포넌트 안에서 import하지 않는다. async Server Component에서 먼저 처리하고 결과만 prop으로 넘긴다(`PortfolioSwiper.tsx`는 호출부에서 사전 살균된 값만 받도록 정리됨). 사용자·관리자 HTML은 `lib/sanitizeHtml.ts`(`sanitizeContentHtml`)를 거치며, `a`의 `rel`/`target`은 강제 덮어쓴다. `<img src>`를 정규식으로 따로 뽑아 쓰면 스킴 검증을 우회하니 일관되게 검증한다. 외부 URL(`demo_url` 등)을 `href`/`src`에 쓸 때는 `https?` 화이트리스트로 프로토콜을 검증한다.

### 16. 상세 페이지 grid 안/밖 섹션 배치
- sticky 사이드 패널이 있는 grid의 형제 섹션(grid 뒤에 오는 `ReviewSection` 등)은 패널 높이 때문에 빈 공간이 생길 수 있다. 섹션을 grid 안/밖으로 옮기는 diff는 두 컬럼 높이 차에서 빈 공간이 생기는지 본다.

### 17. 작은 UI·구현 컨벤션
- 활성 Tab/Chip: `border-gf-orange bg-gf-orange-bg text-gf-orange`(비활성은 `border-gf-border bg-gf-white text-gf-black`). 오렌지 pill은 시그니처 스타일로도 쓰이니 사용자 확인 없이 다른 기능 버튼에 소급하지 않는다.
- `/mypage` 최대 너비 `max-w-[1200px]`는 `DashboardHeader.tsx`와 `(mypage)/layout.tsx` 두 파일에 있으므로 함께 바꾼다. 여러 경로에서 진입하는 페이지의 뒤로가기는 고정 href가 아니라 `router.back()`(`BackButton.tsx`).
- 팝업의 초기 포커스는 더블 rAF 해킹 대신 base-ui `initialFocus`(`LegalDialogTrigger.tsx`). 모달은 `aria-label`/`aria-labelledby`를 갖고 ESC·포커스 트랩이 동작해야 한다.
- 요청에 없는 기존 데이터 전체에 소급되는 렌더링 변경, 작업 중 범위가 바뀐 뒤 갱신되지 않은 메모리·문서 서술은 Major로 지적한다.
- cms.api가 지원하지 않는 값을 클라이언트가 계산해 금액·상태로 보내지 않는다. 서버가 재검증하는 값은 클라이언트 계산을 신뢰 근거로 쓰지 않는다. 5xx 구분 없는 2단계 호출(생성→후속)은 단계별 실패 메시지를 분리한다.

## B. 아키텍처 메모

### BFF 데이터 흐름
- cms.api는 `src/app/api/*/route.ts`에서만 `cmsApiFetch()`로 호출. Server Component는 `serverFetch()`(자기 `/api/*` 호출), 브라우저는 `axiosInstance`. 둘은 `CMS_API_KEY` 보안 경계 때문에 합치지 않는다.
- `serverFetch`는 axios 기반이라 Next fetch 캐시와 Request Memoization을 타지 않으므로 `cache(serverFetchImpl)`로 요청 내 dedupe를 복원했다(`src/lib/serverFetch.ts`). 같은 인자(문자열)면 `getMe()`, `generateMetadata`+페이지의 중복 호출이 한 번만 나간다. 옵션 객체는 참조 동일성으로 키가 잡히므로 POST를 새 리터럴로 호출하면 항상 miss(안전). 옵션 객체를 변수로 재사용하는 POST가 생기면 의도치 않은 dedup을 점검한다. 새 getter는 서로 다른 엔드포인트를 몇 번 부르는지 본다.
- `cmsApiFetch`는 항상 `CmsApiError`로 감싸 던지고 인증 헤더가 에러 로그로 새지 않는다. 호출자 `headers`가 인증 헤더를 덮어쓰지 않는 병합 순서를 유지한다. 로그에 키·Authorization·body를 남기지 않는다.
- 새 Route Handler 확인: `getAccessToken()`→401, 수동 검증→400, `cmsApiFetch`, `catch`에서 `CmsApiError` 상태 전달, 동적 handler는 `force-dynamic`.
- cms.api 필드(nullable 포함)는 DB가 NOT NULL일 수 있다. `null` 대신 `[]`/`0`/`false`. DB·cms.api 변경은 cms.api 저장소 소관이며 이 앱은 Supabase를 호출하지 않는다(`next.config.mjs`의 `images.remotePatterns`에 `**.supabase.co`는 이미지 호스팅용으로 남아 있다).

### 쿠키·middleware
- 쿠키 상수는 `lib/cmsApi/cookies.ts`(Edge에서도 import하므로 `next/headers` 금지), 서버 헬퍼는 `session.ts`. 보호 경로는 `/mypage`뿐.
- middleware matcher는 `/api`를 제외한다(`serverFetch` self-call마다 refresh가 중복·경합하는 것을 막기 위해). middleware가 갱신한 쿠키는 다음 요청부터 반영되며 같은 렌더 중에는 이전 토큰을 쓴다(만료 마진 300초라 정상). 이를 회귀로 오인하지 않는다. 추가 refresh는 `/api/auth/refresh`(AuthProvider).
- `/login`, `/register`는 `openAuthModal()`을 연 뒤 `/`로 replace. 인증 상태에서 자동 리다이렉트하는 서술을 문서에 쓰지 않는다. 카카오 scope는 `account_email`만.

### 모달 병렬 라우트
- `(public)/@modal`의 `(.)detail/[slug]`, `(.)blog/[slug]`는 `RouteModal`이 가로채고 전체 페이지도 별도 존재(SEO·직접 진입). `RouteModal`은 exit 애니메이션이 끝난 뒤 `onExitComplete`에서 `router.back()`. 브라우저 뒤로가기로 닫으면 슬롯이 즉시 언마운트돼 fade-out이 없는 것은 프레임워크 한계. 슬롯용 `default.tsx`는 필수. 활성 탭 판정용 값과 링크 이동용 값을 같은 prop으로 쓰면 활성 상태가 어긋난다(href/linkHref 분리). 모달과 전체 페이지가 같은 렌더 컴포넌트(`NewsDetailContent` 등)를 공유한다.

### 검증 환경
- Bash가 없는 세션이면 tsc/lint/build를 못 돌렸다는 사실을 보고에 명시한다(`no_bash_tool_constraint.md`). 의존성 락파일이 재생성돼 `@types/react`가 두 벌 설치되면 `ReactNode` 타입 에러가 난다(`yarn install --frozen-lockfile`).
