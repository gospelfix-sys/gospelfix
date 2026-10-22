---
name: incident-blog500-sanitize-html
description: 블로그 상세/홈페이지 500 에러 프로덕션 장애 — isomorphic-dompurify를 sanitize-html로 교체해 해결, 프로덕션 재현 확인 대기 중
metadata:
  type: project
---

2026-07-28 밤 `gospelfix.vercel.app`에서 블로그 상세 페이지(`/blog/[slug]`)와 홈페이지(`/`, PortfolioSwiper 포함)가
프로덕션에서만 500 에러. 로컬 재현 안 됨. Vercel 런타임 로그로 근본 원인 확정:

```
Error [ERR_REQUIRE_ESM]: require() of ES Module /var/task/node_modules/@exodus/bytes/...
```

**의존성 체인**: `isomorphic-dompurify` → `jsdom@29.1.1` → `whatwg-url@16`/`html-encoding-sniffer@6` →
`@exodus/bytes@1.15.1`(순수 ESM, `"type":"module"`, engines `^20.19.0 || ^22.12.0 || >=24.0.0` 요구).
Next.js가 `jsdom`을 기본 `serverComponentsExternalPackages`로 처리해 webpack 번들링을 건너뛰고 네이티브
`require()`로 로드하는데, 그 네이티브 require가 순수 ESM인 `@exodus/bytes`를 못 읽어서 서버리스 함수가
모듈 로드 단계에서 통째로 크래시(React 렌더링 도달 전 — 그래서 `error.tsx`가 아니라 Next.js 범용 폴백
500 페이지가 뜸).

**이미 시도했으나 실패한 수정 2건** (둘 다 이미 main에 커밋/배포됨, 효과 없음 확인됨):
1. `b4b9827` — DOMPurify.addHook/removeHook → 단일 정규식 replace로 롤백 (진짜 원인 아니었음)
2. `a53499b` — `package.json`에 `engines.node: "22.x"` 추가해 Node 22 강제 (require(esm) 기대) →
   배포 후 30분+ 지나서도 여전히 동일 에러 발생 확인됨 (Vercel 런타임 로그로 확정)

**사용처 2곳** (Explore 에이전트로 확인 완료):
- `src/components/news/NewsDetailContent.tsx:1,33` — Server Component, `news.content` sanitize
- `src/components/portfolio/PortfolioSwiper.tsx:5,43` — Client Component (`"use client"`), `item.description` sanitize
- 둘 다 옵션 없이 기본 설정으로 `DOMPurify.sanitize()` 호출 후 `dangerouslySetInnerHTML`

**다음 세션에서 할 일 (사용자와 논의된 방향, 아직 미실행)**:
`isomorphic-dompurify`(jsdom 기반)를 jsdom 의존성이 없는 순수 JS 라이브러리인 `sanitize-html`로
교체하는 것을 권장함 — 이 문제 자체가 원천적으로 재발 불가능한 구조가 됨. 사용자가 아직 이 방향에
최종 동의는 안 했고("컴퓨터 꺼야 해서 멈춰달라"고 요청), 로그 확인까지만 진행된 상태.

**Why**: 두 번의 "긴급 수정"이 모두 실패했는데, 둘 다 code-reviewer 에이전트 APPROVED를 받고 배포됐음에도
실제 프로덕션에서 검증 안 하고 다음 수정으로 넘어간 게 문제였음.
**How to apply**: 다음 대화에서 이 파일을 이어받아, (1) 사용자에게 `sanitize-html` 교체 진행 여부 재확인,
(2) 진행 시 `NewsDetailContent.tsx`/`PortfolioSwiper.tsx` 두 곳 모두 수정, `package.json`에서
`isomorphic-dompurify` 제거 + `sanitize-html` 추가, CLAUDE.md의 "설치된 라이브러리" 표도 갱신 필요.
(3) 코드 변경 후에는 반드시 **실제 프로덕션 배포 후 curl/브라우저로 재현 확인**까지 마치고 나서 "해결됨"
으로 보고할 것 — 이번 인시던트처럼 로컬/리뷰 통과만으로 해결 선언하지 말 것.

---

**2026-07-29 갱신 — 코드 변경 완료, 리뷰 완료, 프로덕션 미검증**

`sanitize-html` 교체 작업 실행 완료 (`src/lib/sanitizeHtml.ts` 신규, 두 호출부 교체, package.json/CLAUDE.md
갱신). code-reviewer가 diff를 리뷰해 Major 2건(자세한 내용은 [[sanitize_html_migration_review]])을 지적했고
사용자가 대응 후 커밋/배포 예정. **아직 프로덕션 배포 후 실제 재현 확인 전 단계** — 위 (3) 항목의 "실제
배포 후 검증" 의무는 이번에도 유효함. 다음 대화에서 배포 완료 여부와 `/blog/[slug]`, `/`(홈) 500 에러
재발 여부를 반드시 확인할 것.

**2026-07-29 갱신 2 — Major 2건 반영 완료, 커밋/배포 전 단계**

- Major 1 (PortfolioSwiper가 클라이언트 번들에 sanitize-html 포함): `src/app/(public)/page.tsx`에서
  `serverFetch` 직후 `portfolios.map()`으로 `description`을 미리 `sanitizeContentHtml()` 처리해 넘기도록
  변경, `PortfolioSwiper.tsx`에서 `sanitize-html` import 제거. 효과 확인: `/` 라우트 First Load JS가
  215 kB → 142 kB로 감소(`yarn build` 출력 비교).
- Major 2 (NewsDetailContent 갤러리 이미지 src가 스킴 화이트리스트 우회): `splitImagesFromContent`의
  순서를 "원본에서 img 추출 → sanitize"에서 "sanitize 먼저 → sanitize된 결과에서 img 추출"로 뒤집음.
  sanitize-html 기본값(`allowedSchemesAppliedToAttributes`)이 `src`에도 스킴 검증을 적용한다는 것을
  `node -e`로 직접 확인(`javascript:` 스킴은 속성째 제거됨).
- Minor 1 (`allowedStyles.color`의 `rgb(` 정규식 미앵커링): `/^rgb\(/` → `/^rgb\([\d\s,%.]+\)$/`로 수정.
- `yarn build` 성공, 변경 파일 전체 `prettier --check` 통과 확인.
- **다음 세션 필수 작업**: 아직 커밋/배포 전 상태. 배포 후 `/blog/[slug]`, `/`(홈) 실제 프로덕션 재현
  확인까지 마쳐야 이 인시던트를 종결할 수 있음.

**2026-07-29 갱신 3 — 커밋 `b75becd` 푸시 완료, 후속 버그(font-size 삭제) 발견·수정**

`b75becd`로 sanitize-html 교체 커밋을 origin/main에 푸시 완료. 그 직후 사용자가 "관리자 에디터와
클라이언트 상세 페이지의 스타일이 많이 다르다"고 스크린샷으로 제보 — 실제 DB 콘텐츠를 curl로 확인해보니
관리자 에디터가 모든 텍스트에 `<span style="font-size:24px/14px">`를 입혀 저장하는데, `sanitizeHtml.ts`의
`allowedStyles`가 `font-size`를 허용 목록에서 빠뜨려 전부 삭제되고 있었음(sanitize-html 교체 작업 자체가
만든 새 회귀). 여기에 더해 `.prose-gf` 클래스에 h1~h6/ul/ol/li 등 타이포그래피 규칙이 아예 없어서 Tailwind
preflight의 리셋(font-size: inherit, list-style: none 등)이 그대로 노출되던 2차 원인도 함께 발견.

수정: `sanitizeHtml.ts`에 `font-size`(px 8~72, rem/em 0~10 범위 제한) 허용 추가, `globals.css`의
`.prose-gf`에 h1~h6/ul/ol/li/blockquote/hr/a/img 타이포그래피 복원 규칙 추가. code-reviewer 리뷰
APPROVED(Minor 4건, 그중 h4~h6:first-child 여백/img 규칙 주석/font-size 범위 제한은 즉시 반영, PortfolioSwiper의
`.description`은 현재 실사용 위험 낮아 보류). 커밋/배포 대기 중 — 이번에도 배포 후 실제 프로덕션에서
`/blog/[slug]` 렌더링을 관리자 에디터 화면과 눈으로 비교 확인할 것.
