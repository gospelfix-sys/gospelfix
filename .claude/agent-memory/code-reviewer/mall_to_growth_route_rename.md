---
name: mall_to_growth_route_rename
description: /mall → /growth 전체 경로 리네이밍 + ReferralCodeCard z-index(z-40→z-50) 수정 리뷰. 앱 내부 일관성은 완전(grep 전수 0건 누락), Major 2건(CLAUDE.md 라우트 표 미동기화, next.config.mjs 영구 리다이렉트 누락)
type: project
---

## 배경

2026-08-21, `/mall` 상세페이지에서 쿠폰 안내 플로팅 배너(`ReferralCodeCard.tsx`)가 하단 고정
Footer와 z-index가 같아(둘 다 `z-40`) 겹쳐 보이는 버그를 발견 → `ReferralCodeCard.tsx`를
`z-50`으로 올려 `Footer`(`z-40`) 위에 항상 뜨도록 수정한 뒤, 이어서 `/mall` 경로 전체를
`/growth`로 리네이밍(폴더 `git mv`, 참조 13개 파일 문자열 치환, 내부 식별자
`MALL_PATHS`→`GROWTH_PATHS`/`isMall`→`isGrowth`/`MALL_NAV_ITEMS`→`GROWTH_NAV_ITEMS`/타입
`"mall"|"official"`→`"growth"|"official"`까지 함께 리네이밍).

## 검증 방법

이 세션은 Bash 도구가 없어([[no_bash_tool_constraint]]) `git diff`를 직접 실행하지 못하고,
`Grep`으로 `/mall`(대소문자 무시 포함), `growth`, `GROWTH_PATHS`/`isGrowth`/`GROWTH_NAV_ITEMS`,
`shopping_mall`을 전체 `src/` 및 저장소 루트에 전수 검색 + 관련 파일 전문(`Read`)을 대조하는
정적 검증만 수행. `yarn tsc --noEmit`/`yarn build`는 사용자가 이미 로컬에서 통과 확인했다고
전달함(직접 재실행은 못 함).

## 검증 결과 — 앱 내부 일관성은 완전 (Critical 0건)

- `src/app/(public)/mall/` 폴더가 완전히 사라지고 `growth/page.tsx`+`growth/loading.tsx`만
  존재(git mv 정상 확인, orphan 파일 없음).
- `grep -rn "/mall" src`: 실제 라우트 문자열 occurrence 0건. 유일한 매치는
  `RouteModal.tsx`의 범용 주석("news/mall 등 도메인을 모르는 wrapper")뿐 — 라우트 참조 아님.
- `grep -in "mall" src`(대소문자 무시)로 11개 파일 매치 확인 결과, 전부 다음 중 하나로
  무해함: (a) `shopping_mall`(견적 위저드 카테고리, 라우트와 무관한 별개 도메인 — 사용자가
  명시적으로 "건드리지 않음"이라 밝힌 부분과 정확히 일치, `lib/quote/*`/`Step02~03`/
  `quote.types.ts`/`QuoteWizard.tsx` 6개 파일), (b) `growth/page.tsx`/`growth/loading.tsx`
  내부의 미변경 식별자(`MallPageProps`/`MallPage`/`MallLoading` — 아래 Minor 참고),
  (c) `LeftSidebar.tsx`의 로고 텍스트 `"MALL"`(라우트와 무관한 브랜드 표기, 이번 diff 범위
  밖 파일).
- `GROWTH_PATHS`/`isGrowth`/`GROWTH_NAV_ITEMS`/`section: "growth"|"official"` 전부 일관되게
  적용 확인(`PublicHeader.tsx`, `NavPopover.tsx`), 옛 이름(`MALL_*`/`isMall`) 잔존 0건.
- 나머지 11개 참조 파일(`CtaBanner.tsx`, `HeroBanner.tsx`(6곳 — 과거 recurring_issues #10에서
  바로 이 파일이 `/main` 링크 미수정으로 걸렸던 전례가 있어 특히 주의 깊게 확인), `Footer.tsx`,
  `DevicePreviewFrame.tsx`, `CategoryFilter.tsx`, `ProductDetailView.tsx`,
  `(public)/page.tsx`, `mypage/orders/page.tsx`, `mypage/library/page.tsx`, `useAuth.ts`,
  `uiAtom.ts`) 전부 `/growth`로 정확히 치환됨, 전수 대조 완료.
- `NavPopover.tsx`의 `href`/`linkHref` 분리 컨벤션([[blog_modal_parallel_routes]] 회귀
  교훈)도 `GROWTH_NAV_ITEMS`에서 그대로 유지됨(둘 다 `/growth...`로 동일값이지만 구조는 보존).
- `ReferralCodeCard.tsx`는 이미 `z-50`으로 적용되어 있고, `Footer`/`CookieConsentBanner`(둘 다
  `z-40`)보다 항상 위에 뜬다. `dialog.tsx`/`select.tsx`/`RouteModal.tsx`(모두 `z-50`)와의
  잠재적 동률 우려는, 이 프로젝트 모달들이 `DialogPrimitive.Portal`(base-ui, `document.body`에
  append)을 쓰므로 DOM 순서상 항상 나중에 렌더되어 실제 충돌 없음(코드로 확인).
  `cookieConsent === "accepted" ? "bottom-4 sm:bottom-6" : "bottom-40 sm:bottom-24"` 동적
  오프셋은 [[nav_header_popover_menu]] 5~6차 리뷰에서 제안했던 "배너 노출 상태 구독" 해법이
  이미 반영되어 있음(이번 diff 범위 밖, 기존 승인 상태 재확인).

## Major 1 — `next.config.mjs`에 `/mall` → `/growth` 영구 리다이렉트 없음

`redirects()`에는 `www.` 표준화 규칙만 있고 옛 경로 리다이렉트가 없음. `/mall`은
`docs/PRD.md`/`docs/ROADMAP.md`에 이미 존재 기능으로 문서화된 라이브 프로덕션 라우트라,
외부에 공유된 링크·북마크·검색엔진 인덱스가 있다면 이번 리네이밍 이후 그대로 404가 된다.
자세한 일반화된 패턴은 [[recurring_issues]] #37 참고. 권장 수정:

```js
async redirects() {
  return [
    // ... 기존 www 리다이렉트 ...
    { source: "/mall", destination: "/growth", permanent: true },
    { source: "/mall/:path*", destination: "/growth/:path*", permanent: true },
  ];
},
```

## Major 2 — `CLAUDE.md` 라우트 그룹 구조 표 미동기화

"라우트 그룹 구조" 섹션의 `├── (public)/  # /mall, /detail/[slug], /blog, /quote 등 — 공개
접근`이 여전히 `/mall`을 가리킴. `.claude/memory/*.md`, `.claude/agent-memory/code-reviewer/*.md`는
이번 작업 범위에 포함되어 정확히 갱신됐지만(예: `recurring_issues.md` #10 항목에 "2026-08-21
`/mall`에서 `/growth`로 라우트명 변경"이라는 주석까지 정확히 추가됨), CLAUDE.md 자체는 이번
범위에서 빠짐. CLAUDE.md는 매 세션 자동으로 로드되는 지침 파일이라
[[doc_auth_redirect_mismatch]]와 동일한 우선순위 높은 문서 미동기화 패턴([[recurring_issues]]
#19)에 해당. `llms.txt`/`docs/ROADMAP.md`/`docs/PRD.md`도 동일하게 `/mall`을 참조하지만,
`llms.txt`는 이미 다른 여러 항목(로그인/약관 라우트가 모달로 전환된 사실 등)에서도 오래
전부터 갱신되지 않은 상태라 이번 diff가 새로 만든 드리프트는 아님(기존 stale 상태 유지) —
CLAUDE.md만 "이번 작업으로 새로 어긋난" 문서.

## Minor — 내부 식별자 잔존 (기능 영향 없음)

`growth/page.tsx`의 `interface MallPageProps`/`function MallPage`, `growth/loading.tsx`의
`function MallLoading`이 리네이밍되지 않고 남음. `lib/discount.ts`의 주석
(`"mall/page.tsx의 checkIsNew()와 동일한 패턴"`)도 옛 파일 경로를 가리킴. 라우트 문자열이
아니므로 404 등 실사용 영향은 없으나, `MALL_PATHS`→`GROWTH_PATHS` 등 다른 식별자는 전부
꼼꼼히 바꾼 것과 대비해 일관성이 떨어짐.

## 판정 (2026-08-21, 1차)

BLOCKED — Major 2건(리다이렉트 누락, CLAUDE.md 미동기화). Critical 0건, 앱 코드베이스
내부의 `/mall`→`/growth` 치환 자체는 완벽(전수 검증 완료).

## 재검증 (2026-08-21, 2차, 같은 날) — 전부 해소, APPROVED

세 항목 모두 정확히 반영 확인:
- `next.config.mjs`: `{ source: "/mall", destination: "/growth", permanent: true }` +
  `{ source: "/mall/:path*", destination: "/growth/:path*", permanent: true }`가 기존 `www.`
  리다이렉트 뒤에 추가됨(308 영구 리다이렉트로 SEO 가치 보존).
- `CLAUDE.md` 라우트 표: `/mall` → `/growth`로 수정, `grep -in mall CLAUDE.md` 0건.
- 내부 식별자: `GrowthPageProps`/`GrowthPage`(`growth/page.tsx`), `GrowthLoading`
  (`growth/loading.tsx`), `lib/discount.ts` 주석의 `growth/page.tsx` 갱신 전부 확인.

재검증 시 직접 재실행한 `grep -in "mall" src`/`next.config.mjs`/`CLAUDE.md` 결과 남은 매치는
전부 무해(`shopping_mall` 도메인 개념, `LeftSidebar.tsx`의 무관한 브랜드 텍스트 `"MALL"`,
`RouteModal.tsx`의 범용 주석, 리다이렉트 `source` 문자열 자체) — 새 회귀 없음.

**`docs/ROADMAP.md`/`docs/PRD.md`/`llms.txt` 처리 여부 판단(코디네이터 질의에 대한 답변)**:
`docs/ROADMAP.md`/`docs/PRD.md`는 `/mall` 외엔 최신 상태라 트리비얼한 후속 수정으로 충분(커밋
비차단). `llms.txt`는 이미 `/login`·`/register`(모달 전환 전 서술), `/privacy`·`/terms`(다이얼로그
전환 전 서술), `isomorphic-dompurify`(sanitize-html 교체 전 서술) 등 이번 작업과 무관한 드리프트가
누적되어 있어, `/mall` 한 줄만 대증 수정하면 오히려 "일부만 최신화된 애매한 문서"가 됨 — 다음에
이 파일을 다룰 때 전체 재작성으로 한 번에 처리할 것을 권고, 이번 스코프에서는 보류가 타당.

**최종 판정: APPROVED.**
