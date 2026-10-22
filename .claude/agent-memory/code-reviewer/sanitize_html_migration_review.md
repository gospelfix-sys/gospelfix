---
name: sanitize_html_migration_review
description: isomorphic-dompurify(jsdom) → sanitize-html 교체 리뷰 기록 (500 에러 인시던트 대응, [[incident-blog500-sanitize-html]] 참고)
metadata:
  type: project
---

블로그 상세/홈 500 에러(jsdom → @exodus/bytes ERR_REQUIRE_ESM) 근본 해결을 위해 `isomorphic-dompurify`를
`sanitize-html`(htmlparser2 기반, jsdom 비의존)로 교체. 신규 `src/lib/sanitizeHtml.ts`가
`sanitizeContentHtml()`을 export하고 `NewsDetailContent.tsx`(Server Component), `PortfolioSwiper.tsx`
(Client Component) 두 곳에서 사용.

**화이트리스트 자체는 안전하다고 판단**: allowedTags에 script/iframe/svg/object 없음, allowedSchemes를
http/https/mailto로 제한(javascript: 차단), allowedStyles를 color/text-align/font-weight 3개 속성만
허용(CSS injection 표면 최소화), `a` 태그에 `simpleTransform`으로 rel=noopener noreferrer + target=_blank를
**강제 오버라이드**(콘텐츠가 이미 rel/target을 갖고 있어도 덮어씀 — reverse tabnabbing 방지에 유효).

**리뷰에서 발견한 이슈 2건 (Major)**:

1. **PortfolioSwiper.tsx가 "use client" 컴포넌트인데 그 안에서 sanitizeContentHtml()을 호출** — `sanitize-html`은
   원래 서버향 라이브러리로 `postcss`, `htmlparser2`, `deepmerge`, `parse-srcset` 등 무거운 의존성 체인을
   가짐. 이 컴포넌트가 클라이언트 컴포넌트이므로 이 의존성 전체가 브라우저 JS 번들에 포함됨 — 게다가 호출부
   상위(`src/app/(public)/page.tsx`)는 이미 async Server Component라서, `portfolios` fetch 직후 그 자리에서
   `description`을 사전 sanitize해 이미 안전한 HTML 문자열을 prop으로 넘기면 클라이언트 번들에서 sanitize-html
   자체를 완전히 제거할 수 있었음. 서버→클라이언트 경계로 원본(미살균) HTML이 그대로 넘어간다는 defense-in-depth
   관점의 약점이기도 함.
2. **NewsDetailContent.tsx의 `splitImagesFromContent()`가 정규식으로 `<img>`를 추출한 src를 sanitizeContentHtml()의
   allowedSchemes(http/https/mailto) 검증 없이 그대로 `<img src={src}>`에 사용** — React가 속성으로 다루므로 HTML
   인젝션 위험은 없지만(문자열 이스케이프됨), 갤러리 이미지 경로만 스킴 화이트리스트를 우회하는 비일관성이 있음.
   실질 악용 가능성은 낮음(img src의 javascript:는 최신 브라우저에서 미실행) — Minor로 하향 가능하나 일관성
   측면에서 기록.

**결론**: Critical 없음, 위 2건은 Major(수정 권장)로 리포트하고 APPROVED(조건부)는 아님 — 사용자가 명시적으로
"이슈 목록으로 답변" 요청했으므로 BLOCKED가 아닌 이슈 목록 형태로 전달함. 근본 크래시 원인(jsdom/ESM)은
해결된 것으로 판단됨(jsdom이 yarn.lock/node_modules에서 완전히 제거됨, `sanitize-html`은 순수 CJS이고
`postcss`/`htmlparser2`도 pure JS라 native require(esm) 문제 재발 가능성 낮음).

**Why**: 프로덕션 500 에러의 근본 원인이 "서버 번들에 jsdom 같은 무거운 Node 전용 라이브러리가 딸려들어간 것"
이었기 때문에, 그 교훈을 정반대 방향(클라이언트 번들에 서버향 라이브러리가 불필요하게 딸려들어가는 것)에도
적용해서 점검한 것 — 같은 클래스의 "번들 경계 오염" 문제.
**How to apply**: 앞으로 이 저장소에서 서버/클라이언트 컴포넌트 경계를 넘나드는 유틸리티(sanitize, markdown
파서, PDF/이미지 처리 등)를 리뷰할 때는 항상 "이 로직이 Server Component에서 먼저 실행되고 결과만 prop으로
넘길 수 있는가"를 먼저 확인할 것. "use client" 컴포넌트 안에서 무거운 파싱/새니타이징 라이브러리를 직접
import하고 있으면 Major로 지적.

**2026-07-29 후속 리뷰 — font-size 화이트리스트 + .prose-gf 타이포그래피 CSS 추가 (커밋 전)**

관리자 에디터가 `<span style="font-size:24px/14px">`로 저장하는데 `allowedStyles`에 `font-size`가
빠져 있어 sanitize 과정에서 통째로 삭제되던 버그를 발견 → `sanitizeHtml.ts`의 `"*"` 화이트리스트에
`"font-size": [/^\d+(\.\d+)?(px|rem|em)$/]` 추가, `globals.css`의 `.prose-gf`에 h1~h6/ul/ol/li/
blockquote/hr/a/img 타이포그래피 복원 규칙 추가(Tailwind preflight가 초기화한 값 복구 목적).

리뷰 결과 **Critical/Major 없음, Minor만 4건**:
1. font-size 정규식에 상한/하한 없음(`0px`~`99999px`까지 통과) — 관리자만 입력 가능한 신뢰된 콘텐츠라
   보안 위험은 아니지만, UX 방어 차원에서 합리적 범위(예: 8~72px) 제한을 권고.
2. `.prose-gf img` 신규 규칙이 사실상 죽은 코드 — `NewsDetailContent.tsx`의
   `splitImagesFromContent()`가 렌더링 전에 모든 `<img>` 태그를 정규식으로 잘라내 별도 갤러리
   Swiper로 렌더링하므로, `.prose-gf` 컨테이너 내부에는 `<img>`가 남지 않음. 당장 버그는 아니지만
   "적용 안 되는 CSS"로 혼란을 줄 수 있어 주석으로 명시하거나 제거 검토 권고.
3. `.prose-gf h1/h2/h3:first-child`만 `margin-top: 0` 처리되고 `h4/h5/h6:first-child`는 빠져있어
   본문이 소제목(h4~h6)으로 시작하면 상단 여백이 남는 엣지 케이스.
4. `PortfolioSwiper.tsx`(포트폴리오 설명)도 동일한 `sanitizeContentHtml()`을 쓰므로 이번 font-size
   허용으로 인라인 스타일은 함께 살아나지만, 렌더링 컨테이너 클래스가 `.prose-gf`가 아니라
   `.description`(a 태그 규칙만 존재)이라 만약 포트폴리오 설명에도 h1~h6/ul/ol이 들어가면 동일한
   preflight 초기화 문제가 재발할 수 있음. 다만 사이드바 형태의 짧은 텍스트(`text-xs max-w-sm`)라
   실질 위험은 낮음 — 실사용 콘텐츠에 헤딩/리스트가 등장하면 재점검 필요.

CSS 충돌 검증: `.prose-gf h1~h6`/`ul/ol/li`/`blockquote`/`hr`/`a`/`img` 신규 규칙은 selector가
기존 `.prose-gf p:empty`, `.prose-gf p:has(> br:only-child)` (p 태그 전용)와 겹치지 않아 충돌 없음.
`prose-gf` 클래스는 `NewsDetailContent.tsx` 한 곳에서만 사용되고(`PortfolioSwiper.tsx`는 별도
`.description` 클래스) `@tailwindcss/typography` 플러그인도 미설치라 `.prose`류 이름 충돌도 없음.
Bash 도구 미탑재 세션이라 `yarn build`/`tsc`/`eslint` 실행은 못 했음 — 사용자가 이미 로컬에서
`yarn build` 성공과 curl SSR 검증을 마쳤다고 보고함.
