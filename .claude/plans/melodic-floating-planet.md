# `/` ↔ `/growth` 라우트 콘텐츠 스왑 리팩토링

## Context

현재 사이트는 두 개의 독립된 "섹션"을 갖고 있다.

- **에이전시(공식홈페이지) 섹션**: `/`(`src/app/(public)/page.tsx`) — 히어로, 업종별 추천, 예약 AI
  쇼케이스, 포트폴리오/블로그 스와이퍼로 구성된 랜딩페이지. `/about`, `/guide`, `/blog`,
  `/quote`도 같은 섹션에 속한다.
- **모다(MODA) 마켓플레이스 섹션**: `/growth`(`src/app/(public)/growth/page.tsx` +
  `growth/upload/page.tsx`) — 템플릿/작품 판매 갤러리, 자체 사이드바(`GrowthShell`)를 쓰는
  쇼핑몰. `/detail/[slug]`(상품 상세)도 같은 섹션으로 취급된다.

`TopBar.tsx`에는 이미 "에이전시 / 모다" 탭 전환 UI가 존재하고, `NavPopover.tsx`도
`section: "official" | "growth"`로 두 섹션의 내비게이션을 분리 관리하고 있다 — 즉 이 두 섹션은
코드 구조상 이미 명확히 분리되어 있고, 이번 작업은 **그 두 섹션이 담당하는 URL을 서로
맞바꾸는 것**이다.

- `/`에 있던 에이전시 콘텐츠 → `/growth`로 이동
- `/growth`에 있던 모다 마켓플레이스 콘텐츠(`+upload` 하위 라우트 포함) → `/`(및 `/upload`)로 이동

컴포넌트 폴더명(`components/growth/`, `components/main/`)은 URL이 아니라 "모다/에이전시"라는
**도메인 개념**을 나타내므로 그대로 둔다 — 리네이밍은 이번 스코프에서 제외한다. 대신 두 섹션이
서로를 참조하거나(탭 전환 링크), 자기 자신을 참조하는(사이드바 로고, CTA, 로그인 후 리다이렉트
기본값 등) 모든 하드코딩된 경로 문자열을 스왑 이후 실제 위치에 맞게 고쳐야 한다. 사전 grep으로
`"/growth"` 문자열이 등장하는 지점을 전수 조사했고, 아래 각 파일이 그 대상이다.

---

## Phase 1 — 라우트 파일 스왑 (핵심 이동)

파일이 서로 자리를 바꾸는 것이므로 `mv`가 아니라 Read → Write로 양쪽 내용을 동시에 다룬다
(중간에 덮어써서 유실되지 않도록 먼저 두 파일 내용을 모두 읽어 확보한 뒤 작성).

| 기존 경로 | 새 경로 |
|---|---|
| `src/app/(public)/page.tsx` (에이전시, `OfficialHomePage`) | `src/app/(public)/growth/page.tsx` |
| `src/app/(public)/growth/page.tsx` (모다 갤러리) | `src/app/(public)/page.tsx` |
| `src/app/(public)/growth/loading.tsx` | `src/app/(public)/loading.tsx` (신규 생성, 기존에 없었음) |
| `src/app/(public)/growth/upload/page.tsx` | `src/app/(public)/upload/page.tsx` (신규 디렉토리) |
| `src/app/(public)/growth/upload/loading.tsx` | `src/app/(public)/upload/loading.tsx` |

이동 후 `src/app/(public)/growth/upload/` 디렉토리는 비므로 정리한다. 대상 경로
(`(public)/upload`, `(public)/loading.tsx`)에는 기존 파일이 없음을 확인했으므로 충돌은 없다.

**이동하면서 함께 고칠 내용 (파일 내용 자체의 자기참조 링크):**
- 옮겨진 에이전시 페이지(`growth/page.tsx`가 될 파일) 116행의
  `<Link href="/growth" ...>` (모다 마켓플레이스로 가는 CTA) → `href="/"`로 수정. 마켓플레이스가
  이제 루트에 있으므로.
- metadata(`title`/`description`)는 각 페이지 파일에 co-located 되어 있으므로 파일을 통째로
  옮기면 자동으로 올바른 위치에 붙는다 (에이전시 메타데이터는 `/growth`로, 모다 메타데이터는
  `/`로) — 별도 수정 불필요.

---

## Phase 2 — `components/growth/*` 내부 경로 리터럴 수정

이 컴포넌트들은 파일 위치(`components/growth/`)는 그대로 두지만, 이제 새 루트(`/`, `/upload`)에
마운트되므로 내부에 하드코딩된 `/growth` 경로를 실제 새 위치로 고친다.

- `src/components/growth/GrowthTopBar.tsx:53` — `/growth/upload` → `/upload`
- `src/components/growth/GrowthSidebar.tsx:109` — `/growth` → `/`
- `src/components/growth/CategoryTabs.tsx:27` — `/growth` → `/`, `` `/growth?category=${cat.value}` `` → `` `/?category=${cat.value}` ``
- `src/components/growth/UploadWorkEditor.tsx:565, 592` — 두 곳의 `href="/growth"`(취소/뒤로가기 버튼) → `href="/"`
- `src/components/growth/HeroCarousel.tsx:32, 42, 52` — `ctaHref: "/growth?category=..."` 3건 → `ctaHref: "/?category=..."`
- `src/components/growth/SidebarProfileMenu.tsx:46` — `signOut("/growth")` → `signOut("/")`

---

## Phase 3 — 전역 레이아웃 컴포넌트의 섹션 판별 로직 재작성

가장 주의가 필요한 부분. 단순 문자열 치환이 아니라 **"루트(`/`)는 모든 경로가 `startsWith`로
매치되어 버린다"**는 함정이 있어 로직 자체를 고쳐야 한다.

### `src/components/layout/TopBar.tsx`

1. **18행** `const GROWTH_PATHS = ["/growth", "/detail"];`
   → 두 가지 별개 용도로 분리해서 재정의:
   ```ts
   // GrowthShell(자체 사이드바+상단바)이 전역 TopBar 대신 렌더링되는 경로
   const MODA_SHELL_PATHS = ["/upload"];
   // "모다" 탭 활성 판정 대상 경로 (셸 경로 + /detail 상품 상세)
   const MODA_ACTIVE_PATHS = ["/upload", "/detail"];
   ```
2. **28행** `if (pathname.startsWith("/growth")) return null;`
   → 루트 "/"는 정확히 일치할 때만, 나머지는 접두사로 판정:
   ```ts
   if (pathname === "/" || MODA_SHELL_PATHS.some((p) => pathname.startsWith(p))) return null;
   ```
3. **33행** `isOverlayHero`: 히어로 배너가 있는(오버레이 헤더가 필요한) 페이지는 에이전시
   페이지이므로, 그 페이지가 옮겨간 위치를 반영:
   ```ts
   const isOverlayHero = pathname === "/growth" || pathname === "/about";
   ```
4. **114행, 207행** `isGrowth` 판정 로직:
   ```ts
   const isGrowth = pathname === "/" || MODA_ACTIVE_PATHS.some((p) => pathname.startsWith(p));
   ```
5. **144행(WideContent), 251행(CompactNav)** "모다" 탭 링크 `href="/growth"` → `href="/"`
6. **135행(WideContent), 238행(CompactNav)** "에이전시" 탭 링크는 현재 `href="/"` →
   `href="/growth"`로 변경 (라벨이 가리키는 콘텐츠를 따라간다).
7. 로고(124행)와 로그아웃 리다이렉트(118, 223행)의 `href="/"` / `signOut("/")`는 "사이트
   루트로 이동"이라는 일반적 의미이므로 그대로 둔다 — 루트 자체가 바뀌는 게 아니라 루트의
   콘텐츠만 바뀌므로 변경 불필요.

### `src/components/layout/Footer.tsx`

1. **33행** `const isGrowth = pathname.startsWith("/growth");` (사이드바 폭만큼 여백 확보용)
   → 모다 셸이 실제 렌더링되는 경로 기준으로:
   ```ts
   const isModaShell = pathname === "/" || pathname.startsWith("/upload");
   ```
   그리고 39행 `isGrowth && "lg:left-[220px]"` → `isModaShell && "lg:left-[220px]"`
2. **62행** 브랜드 로고 `<Link href="/growth" ...>` → `href="/"`
3. **13행** `FOOTER_LINKS`의 `{ href: "/#blog", label: "블로그" }` → 블로그 섹션(`id="blog"`)이
   에이전시 페이지와 함께 `/growth`로 이동하므로 `{ href: "/growth#blog", label: "블로그" }`

### `src/components/layout/NavPopover.tsx`

1. **14, 16-17행** `GROWTH_NAV_ITEMS` — `href`/`linkHref` 둘 다 `/growth` → `/`,
   `` `/growth?category=${c.value}` `` → `` `/?category=${c.value}` ``
2. **27행** `OFFICIAL_NAV_ITEMS`의 블로그 항목 —
   `{ href: "/blog", linkHref: "/#blog", label: "블로그" }` → `linkHref`만
   `"/growth#blog"`로 변경 (`href="/blog"`는 블로그 상세 인터셉트 모달 라우트 활성 매칭용이라
   그대로 유지 — 코드 내 주석에 이미 명시된 규칙).

---

## Phase 4 — 인증/모달 리다이렉트 기본값

- `src/hooks/useAuth.ts:61` — `signIn`의 기본 `redirectTo = "/growth"` → `"/"`
  (로그인 후 마켓플레이스로 보내는 의도이므로, 마켓플레이스의 새 위치를 따라간다)
- `src/store/atoms/uiAtom.ts:12` — `authModalAtom` 기본값 `next: "/growth"` → `next: "/"`

---

## Phase 5 — 마이페이지 CTA/빈 상태 링크

- `src/app/(mypage)/mypage/products/page.tsx` — `actionHref="/growth"` → `"/"`,
  `<Link href="/growth/upload">` → `href="/upload"`, `actionHref="/growth/upload"` → `"/upload"`
- `src/components/mypage/OrdersTabs.tsx:89` — `actionHref="/growth"` → `"/"`
- `src/components/mypage/MyProductCard.tsx:73` — `` `/growth/upload?id=${product.id}` `` →
  `` `/upload?id=${product.id}` ``

---

## Phase 6 — `next.config.mjs` 레거시 리다이렉트

`/mall` 관련 영구 리다이렉트(구 URL 호환용)가 현재 "모다" 섹션을 가리키고 있으므로, 마켓플레이스의
새 위치를 따라가야 한다:
```js
{ source: "/mall", destination: "/", permanent: true },
{ source: "/mall/:path*", destination: "/:path*", permanent: true },
```

---

## Phase 7 — 주석 정확성 수정 (동작에는 영향 없음, 사소하지만 정확성 위해 포함)

- `src/types/product.types.ts:127` — 주석 중 "공개 카탈로그(/growth, ..." 부분의 경로 표기를
  실제 위치(`/`)로 갱신
- `src/lib/discount.ts:20` — 주석 중 "growth/page.tsx의 checkIsNew()" 부분을 파일이 옮겨간 새
  경로(`(public)/page.tsx`) 기준으로 갱신

---

## 실행 순서 요약

1. Phase 1 (파일 이동) — 가장 먼저, 이게 끝나야 나머지가 의미를 가짐
2. Phase 2, 3, 4, 5, 6을 순서 무관하게 진행 (서로 독립적인 파일들)
3. Phase 7 (주석)은 마지막에 정리

각 Phase는 파일 수가 적고 변경도 명확한 문자열/조건식 교체라 서브에이전트 병렬화보다 직접
순차적으로 Edit 하는 편이 더 정확하다 (특히 Phase 3의 TopBar/Footer 로직은 세밀한 의미 판단이
필요해 한 사람이 일관되게 처리하는 게 안전함).

## 검증 방법

1. `yarn build` — TypeScript 타입 체크 + 빌드 성공 확인 (라우트 충돌, import 경로 깨짐 등 즉시 발견)
2. `yarn lint` — ESLint 통과 확인
3. `yarn dev`로 개발 서버 기동 후 브라우저로 직접 확인:
   - `/` → 모다 갤러리(GrowthShell 사이드바)가 뜨는지, 전역 TopBar가 안 뜨는지
   - `/growth` → 에이전시 랜딩(히어로/포트폴리오/블로그 섹션)이 뜨는지, 전역 TopBar가
     오버레이 히어로 스타일로 뜨는지
   - `/upload` → 작품 업로드 폼이 정상 동작하는지 (신규 등록 + `?id=` 쿼리로 기존 상품 수정 진입)
   - TopBar의 "에이전시"/"모다" 탭을 클릭해 각각 `/growth`, `/`로 이동하고 활성 탭 하이라이트가
     맞는지
   - Footer가 `/`와 `/upload`에서 사이드바와 안 겹치는지, 브랜드 로고 클릭 시 `/`로 이동하는지,
     "블로그" 링크가 `/growth#blog`로 정상 스크롤되는지
   - `/mypage/products`에서 판매자 아닌 계정으로 접근 시 "쇼핑몰 보기" 버튼이 `/`로,
     "새 상품 등록" 버튼이 `/upload`로 이동하는지
   - 로그인 성공 후 기본 리다이렉트가 `/`로 가는지
   - 구 URL 호환용 `/mall` 접속 시 `/`로 308 리다이렉트되는지
