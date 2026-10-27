# 코드 컨벤션

현재 코드베이스에서 실제로 지키고 있는 규칙을 정리한 문서다. `CLAUDE.md`의 "코드 컨벤션"은
요약이고, 이 문서가 예시와 근거를 담은 상세판이다. 둘이 어긋나면 `CLAUDE.md`를 먼저 고치고
이 문서를 맞춘다. 컴포넌트를 어느 폴더에 둘지는
[`component-layers.md`](./component-layers.md), 공용 코드 수정 원칙은
[`shared-component-changes.md`](./shared-component-changes.md)를 따른다.

## 1. 포맷·린트

- Prettier(`.prettierrc`): 쌍따옴표, 세미콜론, 한 줄 100자, 들여쓰기 2칸, trailing comma `all`.
- ESLint: `next/core-web-vitals` + `next/typescript` + `prettier`.
- 검증 순서: `npx tsc --noEmit` → `yarn lint` → `yarn build`. 테스트 스위트는 없다.
- **문구 몇 줄 고치려고 파일 전체에 `prettier --write`를 돌리지 않는다.** 포맷 diff가 섞여 리뷰가
  어려워진다. `Edit`으로 해당 hunk만 수정한다. `yarn pretty`는 전체 정리를 요청받았을 때만 쓴다.
- 패키지 매니저는 yarn만 쓴다. 설치는 `yarn install --frozen-lockfile`.

## 2. 네이밍·언어

| 대상 | 규칙 | 예 |
|------|------|----|
| 주석 | 한국어 | `// 4xx는 정상적인 비즈니스 에러라 제외` |
| 식별자(변수·함수·타입) | 영어 | `fetchSignupCoupon` |
| 컴포넌트 파일 | PascalCase | `BatchPaymentModal.tsx` |
| 훅 | `use` 접두사, `src/hooks/` | `useAuth.ts` |
| 타입 파일 | `<domain>.types.ts` | `product.types.ts` |
| Recoil atom | `xxxAtom`, key는 이름과 동일 | `authUserAtom` |
| Recoil selector | `xxxSelector`, key는 이름과 동일 | `isAuthenticatedSelector` |
| 사용자 노출 문구 | 한국어, 브랜드는 "가스펄픽스" | |

- 주석은 "무엇"이 아니라 "왜"를 적는다. 코드를 읽으면 알 수 있는 내용은 쓰지 않는다.
- 경로 별칭은 `@/`를 쓴다(`@/lib/...`, `@/types/...`). 상위 상대경로(`../../`)는 쓰지 않는다.

## 3. TypeScript

- `any`와 `as any` 금지. 모르는 값은 `unknown`으로 받고 좁힌다.
- 컴포넌트 props는 반드시 `interface`로 선언한다.
- 도메인 타입은 `src/types/<domain>.types.ts`에 두고 재사용한다. 같은 모양을 파일마다 다시 정의하지
  않는다.
- 타입만 가져올 때는 `import type`을 쓴다.
- 외부 응답을 캐스팅할 때는 좁은 타입으로 한다: `error.response?.data as { error?: string } | undefined`.

## 4. 스타일링 (Tailwind)

- 인라인 `style=` 금지. `className`만 쓴다.
- 조건부·병합 클래스는 `cn()`(`lib/utils.ts`, clsx + tailwind-merge)을 쓴다.
- 임의 값은 Tailwind arbitrary value(`w-[320px]`) 또는 `tailwind.config.ts` 토큰(`text-gf-orange`)을
  쓴다. 새 색은 토큰으로 먼저 등록한다.
- 호출부에서 공용 컴포넌트의 클래스를 덮어쓸 때, tailwind-merge가 같은 그룹의 모바일 보장 값까지
  지우지 않는지 확인한다(사례: `dialog.tsx`).

## 5. 모션

- 움직이는 모든 UI(등장/퇴장, 전환, 호버·탭 피드백, 로딩, 스크롤 연동)는 **`motion/react`** 로 만든다.
- 새 CSS `@keyframes`, `tailwindcss-animate`, `data-open:animate-in` 같은 v4 문법은 쓰지 않는다
  (Tailwind 3.4라 CSS가 생성되지 않는다).
- motion은 `transform`을 인라인으로 쓰므로 `-translate-*`와 충돌한다. 위치 잡기는 flex 래퍼에 맡긴다.
  기준 구현은 `components/ui/dialog.tsx`.
- 기존 CSS 애니메이션은 그 코드를 수정할 때 함께 옮긴다. 일괄 리팩터링은 요청이 있을 때만 한다.
- 모션 요청은 `motion-designer` 에이전트가 맡고, 구조·스타일은 `component-writer`가 맡는다.

## 6. 컴포넌트·UI 라이브러리

- **서버 컴포넌트가 기본.** 훅, 이벤트 핸들러, Recoil, 브라우저 API가 필요할 때만 `"use client"`를
  파일 최상단에 쓴다.
- 위젯급 UI를 `page.tsx`에 인라인하지 않고 `components/`로 분리한다. 같은 JSX가 2곳 이상 반복되면
  추출한다.
- shadcn/ui는 base-nova(`@base-ui/react`) 기반이다. **`asChild` 금지.** 링크 버튼은
  `<Link className={buttonVariants({ variant })}>`로 만든다.
- 토스트는 `sonner`. `components/ui/form.tsx`는 수작업 구현이다.
- 루트 레이아웃에 상주하는 모달(`BatchPaymentModal` 등)은 페이지 이동만 하지 말고 **모든 종료
  액션에서 `onClose`를 호출**한다.
- `LayerShell`을 쓰는 새 페이지를 추가하면 `layerNav.ts`의 `LAYER_NAV_ITEMS`에 등록한다(안 하면 고아
  라우트).
- Swiper `loop` + `centeredSlides`는 슬라이드가 적으면 멈춘다 → 슬라이드 배열 자체를 반복한다.
  SSR 직후 FOUC는 `onSwiper` 전까지 `opacity-0`으로 막는다.

## 7. 상태·훅

- 전역 상태는 Recoil: atom은 `src/store/atoms/<domain>Atom.ts`, selector는
  `src/store/selectors/<domain>Selector.ts`.
- 훅은 `src/hooks/`에 두고 모두 `"use client"`를 단다.
- 서버에서 가져온 데이터는 Recoil에 복제하지 말고 서버 컴포넌트에서 props로 내린다.
- 새 추적 SDK(분석·광고)는 `CookieConsentBanner` / `useCookieConsent` 게이팅부터 연동한다.

## 8. 데이터 흐름 (BFF)

```
Server Component ─ serverFetch() ─┐
                                  ├─> /api/* Route Handler ─ cmsApiFetch() ─> cms.api
Client Component ─ axiosInstance ─┘
```

- cms.api는 **`src/app/api/*/route.ts` 안에서만** 호출한다. 컴포넌트·훅에서 `cmsApiFetch`를 직접
  부르지 않는다.
- `axiosInstance`(브라우저용)와 cms.api 클라이언트(서버용)는 보안 경계상 **절대 합치지 않는다.**
  `CMS_API_KEY`가 클라이언트 번들에 들어가면 안 된다.
- 서버 컴포넌트의 데이터 조회는 `src/lib/api/*` getter(`serverFetch` 래퍼)를 쓴다. `getMe()`처럼
  실패 시 throw 대신 `null`을 돌려주는 getter도 있으니 시그니처를 확인한다.
- Supabase를 직접 호출하지 않는다. DB 스키마·공유 테이블 변경은 cms.api 저장소에서만 한다.
- cms.api의 nullable 필드도 실제 DB는 NOT NULL일 수 있다. `null` 대신 `[]` / `0` / `false`를 보낸다.

## 9. Route Handler 작성 순서

```ts
export const dynamic = "force-dynamic"; // 동적 handler

export async function POST(request: NextRequest) {
  const accessToken = await getAccessToken();
  if (!accessToken) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = await request.json();
  if (!body.productId) return NextResponse.json({ error: "..." }, { status: 400 });

  try {
    const data = await cmsApiFetch(path, { method: "POST", body: JSON.stringify(body), accessToken });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof CmsApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/xxx]", error);
    return NextResponse.json({ error: "한국어 실패 메시지" }, { status: 500 });
  }
}
```

- 순서: 토큰 확인(없으면 401) → 수동 검증(`if (!x)` → 400) → `cmsApiFetch` → `catch`.
- `CmsApiError`면 같은 status와 `{ error: message }`로 돌려준다. 그 외는 `console.error("[api/xxx]")`
  후 500과 한국어 메시지.
- handler에서는 zod를 쓰지 않는다. 검증은 수동으로 한다.
- 로그에 `X-API-Key`, `Authorization`, 요청 body, 쿼리스트링을 남기지 않는다.
- `cmsApiFetch`는 연결 실패와 5xx에서 `[cmsApi] 요청 실패` 로그를 남긴다. 네트워크 오류의 status는 여전히
  500으로 던져지므로 구분은 로그의 `code` / `status: null`로 한다.

## 10. 인증·라우팅

- 쿠키 상수와 헬퍼는 `src/lib/cmsApi/cookies.ts`. Edge middleware도 import하므로 **`next/headers`를
  import하지 않는다.** 서버 쿠키 헬퍼는 `session.ts`.
- 보호 경로는 `/mypage`뿐이다(`src/middleware.ts`).
- `/login`, `/register`는 페이지가 아니라 `openAuthModal()`을 열고 `/`로 `replace`한다. `?next=` 값은
  `sanitizeInternalPath`로 검증한 뒤에만 이동한다.
- `redirect()`를 `try/catch` 안에서 쓰면 `isRedirectError(err)`는 반드시 다시 throw한다.
- Server Action은 `src/app/actions/`에 둔다.

## 11. 보안·공개 저장소

- 이 저장소는 **공개**다. 시크릿(`CMS_API_KEY` 등)은 `.env`에만 두고 커밋하지 않는다
  (`.env.example`만 허용).
- `.claude/memory/`, `.claude/plans/`는 `.gitignore` 대상이다. 사업·결제·수수료 같은 내부 정보를 담으므로
  사용자의 명시적 확인 없이 커밋하거나 푸시하지 않는다.
- 환경변수를 바꾸면 Vercel 재배포가 필요하다. `CMS_API_BASE_URL`은 호스트까지만 넣는다(코드가
  `/api/v1/...`을 붙인다).
- 사용자 HTML을 렌더링할 때는 `lib/sanitizeHtml.ts`를 거친다.

## 12. 커밋 규칙

- 1인 프로젝트라 브랜치와 PR 없이 `main`에서 직접 커밋하고 푸시한다.
- 커밋 요청이 오면 `code-reviewer`가 먼저 APPROVED를 내야 한다. `git-commit-pusher`는 Bash가 없어
  실제 커밋을 못 하므로, 리뷰 후 메인 세션이 직접 커밋·푸시하고 `git log`로 확인한다.
- 커밋 메시지는 한국어, `feat:` / `fix:` / `chore:` / `docs:` 접두사. 별건 변경은 목적별로 나눠
  커밋한다.
- 여러 저장소를 오갈 때는 `pwd`로 cwd를 확인한 뒤 `tsc` / `lint`를 실행한다. `pkill -f "next dev"`는
  형제 저장소(cms.api) 서버까지 죽이므로 `lsof -i :포트`로 PID를 지정한다.
