---
name: product_visit_nav_review
description: 상세페이지 하단 플로팅 pill 네비(ProductVisitNav, 로고/Info/Visit Site) 신규 리뷰 — RouteModal 닫기 버튼 클릭 가로채기(Critical) + demo_url 프로토콜 미검증 XSS 표면(Major) + public/llms.txt 미동기화(Major), 1차 BLOCKED → 2차 Critical+demo_url Major 해소, APPROVED
metadata:
  type: project
---

2026-08-29, `src/components/products/ProductVisitNav.tsx`(신규) + `Product.demo_url?`
필드 재도입 + `ProductDetailView.tsx`에 `id="product-info"`/`pb-24` 추가를 리뷰했다.
`TopBar.tsx`의 `CompactNav`(검정 알약 헤더) 디자인 토큰만 재사용하고 컴포넌트 자체는
새로 만든 접근은 적절함 — `/detail`에서 `TopBar`가 숨겨지는 것과 충돌하지 않는다.

## 1차 리뷰 결과: BLOCKED

### Critical — RouteModal 닫기 버튼 클릭 가로채기

`ProductVisitNav`의 `<nav className="fixed inset-x-0 bottom-6 z-40 ...">`가
`inset-x-0`로 전체 화면 폭 히트박스를 가지는데(실제 보이는 pill은 `w-fit` 자식일 뿐),
`pointer-events-none` 분리가 없어 그 투명 여백이 클릭을 가로챈다. 인터셉트 모달
(`@modal/(.)detail/[slug]/page.tsx` → `RouteModal.tsx`)의 뒤로가기 버튼
(`absolute bottom-4 right-4 z-10 size-[60px]`)과 세로 구간이 항상 겹치고, z-40 >
z-10이라 nav가 위에 뜬다 — 화면 폭과 무관하게 100% 재현. 상세 메커니즘·수정 가이드는
recurring_issues #45 참고.
**수정 제안**: 바깥 `<nav>`에 `pointer-events-none`, 실제 pill div에
`pointer-events-auto` 추가 (TopBar.tsx의 크로스페이드 레이어가 이미 쓰는 관례와 동일).

### Major — `demo_url`을 프로토콜 검증 없이 `<a href>`에 그대로 사용 (XSS 표면)

`<a href={demoUrl} target="_blank" rel="noopener noreferrer">`는 seller가 입력한
`demo_url`을 검증 없이 그대로 렌더링한다. `target=_blank`+`rel=noopener noreferrer`는
지켰지만(tabnabbing 방지는 OK), `javascript:` 등 위험한 스킴을 걸러내지 않는다.
이 프로젝트에는 이미 `RichTextEditor.tsx:138-143`에 정확히 이 문제를 막는 선례가
있다(`new URL(url)` 파싱 후 `["https:","http:","mailto:"].includes(protocol)` 화이트
리스트). `UploadWorkEditor.tsx`의 `<Input type="url">`은 HTML5 레벨의 형식 검사일 뿐
스킴 화이트리스트가 아니라서 `javascript:` 문자열도 통과할 수 있다. 승인 상품만
노출되므로(관리자 검수 게이트) 완전히 열린 벡터는 아니지만, 이미 있는 방어 패턴을
재사용하지 않은 방어 결핍(defense-in-depth 누락)으로 Major 판단.
**수정 제안**: `ProductVisitNav`(또는 렌더 전 `ProductDetailView`)에서 `demoUrl`이
`http://`/`https://`로 시작하는지 확인 후에만 링크를 렌더링.

### Major — `public/llms.txt`의 products 필드 목록 미동기화 (recurring_issues #38/#39 반대 방향 재발)

`public/llms.txt:40`은 1차 `banner_image_url` 피벗 때 `demo_url`을 제거한 채로 남아
있다. 이번 재도입으로 `demo_url`이 다시 공개 카탈로그 응답의 실제 필드가 됐으므로
그 목록도 다시 갱신 대상. 히스토리는 `project_detail_page_banner_image_migration.md`
"3차: demo_url 재도입" 절 참고.

## 확인 완료(문제 없음)

- `id="product-info"`는 `PurchaseOptionsPanel` 전체를 감싸는 올바른 위치 —
  라이선스 카드 등 다른 영역이 아니라 실제 "상품 정보" 카드 전체로 정확히 스크롤됨.
- `pb-24`는 `docs/design.md` 4번 섹션의 표준 패턴(`pt-20 pb-24`)과 정확히 일치 —
  임의값 남발이 아니라 오히려 컨벤션 재사용. 페이지 하단 여유 공간도 (전체 페이지
  `pb-10`+내부 `pb-24`, 모달 `py-14`+내부 `pb-24`) 양쪽 다 100px 이상 확보되어
  ReviewSection이 플로팅 nav에 가려지지 않음.
- Info 버튼은 `components/ui/button.tsx`의 `Button`을 사용(raw `<button>` 아님) —
  recurring_issues #9 계열 재발 없음. `h-9`로 size override도 `cn()`/cva 병합 규칙상
  정상적으로 default(`h-8`)를 이김(dialog.tsx의 max-width 버그와 달리 같은 속성 그룹
  안에서 마지막 값이 이기는 정상 케이스).
- 모달 안에서 `fixed` 자손인 `ProductVisitNav`는 popup(`motion.div`)에 framer-motion이
  적용한 `transform`(y 애니메이션) 때문에 popup의 박스를 containing block으로 삼게
  되지만, popup이 `top-6`만 오프셋을 주고 `left/right/bottom`은 `inset-0`(뷰포트와
  동일)이라 `bottom-6` 좌표 계산 결과가 실제 뷰포트 기준과 우연히 동일 — 시각적 위치
  자체는 어긋나지 않는다(다만 popup의 inset 값이 바뀌면 깨질 수 있는 암묵적 전제라
  주석 없이 유지되는 건 fragile).
- `/detail`(전체 페이지)에는 `QuoteFloatingButton`(다른 플로팅 CTA) 등 경쟁하는 다른
  fixed 하단 요소가 없음 — `QuoteFloatingButton`은 `/growth`,`/about` 페이지에만
  개별적으로 렌더링됨. 모달 케이스 외에는 겹침 없음.

## 런타임 확인 필요 (정적 분석으로 확정 불가)

- pill 콘텐츠 폭(로고+구분선+Info+Visit Site) 추정 330~370px vs `px-6`(24px×2) 제외
  가용폭 — iPhone SE급(375px) 이하 좁은 화면에서 실제로 줄바꿈/잘림 없이 들어가는지
  브라우저 렌더링으로 확인 필요. `w-fit`이라 폭 제한이 없어 초과 시 그대로 화면 밖으로
  넘칠 수 있음(참고 대상인 `CompactNav`보다 항목 수가 많아 겹침 여유가 더 적음).

## 2차 재검증(같은 날, 2026-08-29): Critical + demo_url Major 해소 확인, APPROVED

- **Critical(닫기 버튼 클릭 가로채기)**: `<nav className="pointer-events-none z-40 flex
  justify-center px-6 ...">` + 실제 pill `<div className="pointer-events-auto ...">`로 분리됨
  — recurring_issues #45의 수정 제안과 정확히 일치. `RouteModal.tsx`의 닫기 버튼도 `bottom-4`
  → `bottom-6`로 nav의 `bottom-6`과 동일 오프셋으로 맞춰짐. 해소 확인.
- **Major(demo_url 프로토콜 미검증)**: `const isSafeDemoUrl = !!demoUrl &&
  /^https?:\/\//.test(demoUrl);`로 화이트리스트 검증 추가, `isSafeDemoUrl`일 때만 `<a href>`
  렌더링. `javascript:` 등 위험한 스킴 차단 확인. 해소 확인.
- **Major(public/llms.txt 미동기화)**: 사용자가 이번 커밋 범위에서 명시적으로 제외 요청 —
  판정에서 제외, 별도 트래킹 필요.
- **런타임 확인 필요 항목 재평가**: pill(가운데 정렬, `w-fit`)과 닫기 버튼(`right-4`,
  `size-[60px]`)이 좁은 화면(iPhone SE급 375px 부근)에서 시각적으로 겹칠 가능성 자체는
  여전히 남아있음 — 다만 이제 pill의 `pointer-events-auto` 영역만 클릭을 가로채므로(투명
  전체폭 히트박스는 사라짐), 실제 pill이 그 지점까지 넓어지는 좁은 화면에서만 국소적으로
  재현되는 시각적/상호작용 오버랩이며, Critical이었던 "화면 폭과 무관한 100% 재현" 버그와는
  성격이 다르다. 정적 분석으로 폭을 확정할 수 없어 Blocking 사유로 보지 않고 Minor
  런타임 확인 백로그로 하향.
