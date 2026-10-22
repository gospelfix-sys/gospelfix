---
name: detail_page_banner_image_migration_review
description: /detail/[slug] 최상단 demo_url iframe(DevicePreviewFrame)을 banner_image_url 정적 이미지로 완전 교체한 리뷰 기록
metadata:
  type: project
---

2026-08-24, `/detail/[slug]` 상세페이지 최상단을 `product.demo_url` 라이브 iframe 미리보기
(`DevicePreviewFrame.tsx`, macOS 브라우저 크롬 목업)에서 정적 배너 이미지(`product.banner_image_url`,
next/image `fill`+`aspect-[2000/840]`+`object-cover`)로 완전히 교체한 gospelfix 측 diff 리뷰.
cms.api 쪽 스키마/어드민 폼 작업은 별도 세션([[project_detail_page_banner_image_migration]] 참고,
`.claude/memory/`에 위치)에서 진행 예정이라 이 리뷰 시점에는 `banner_image_url`이 항상 null이라
실제 이미지 렌더링은 미검증 상태(플레이스홀더만 확인 가능).

## 확인 완료 (문제 없음)

- `DevicePreviewFrame.tsx` 삭제 안전성: `grep -rn "DevicePreviewFrame" src` 결과 0건 — src 내
  실제 import/사용처 없음. `llms.txt`/`.claude/plans/*.md`/메모리 파일에만 과거 참조 잔존(문서
  드리프트는 아래 Major 항목 참고).
- 모달 닫기 기능 공백 없음: `components/ui/RouteModal.tsx`가 X버튼(`Button variant="ghost"
  size="icon-sm"`)·backdrop 클릭·Escape 키 3가지 닫기 트리거를 이미 전담하고 있어
  `DevicePreviewFrame`이 갖고 있었을 "목록으로" 버튼 제거로 인한 네비게이션 공백 없음.
- `next/image` 패턴 일관성: `ProductCard.tsx`의 기존 `Image fill + object-cover` 관례를 그대로
  재사용. `banner_image_url` null일 때 `<Image>` 자체를 렌더링하지 않고 플레이스홀더 텍스트로
  분기하므로 런타임 에러 없음(`src` 빈 문자열을 넘기는 흔한 실수 없음).
- `next.config.mjs`의 `remotePatterns`에 `**.supabase.co`가 이미 있어 배너 이미지 도메인도
  기존 설정으로 커버됨 — 추가 설정 불필요.
- Prettier 컨벤션(쌍따옴표/세미콜론) 및 `style=` 미사용 확인.

## Major — llms.txt 문서 드리프트 (recurring_issues #38 신규 → 재검증 필요)

루트 `llms.txt:197`가 여전히 `components/products/{ProductCard,CategoryFilter,
DevicePreviewFrame}.tsx`로 삭제된 파일을 나열하고, `public/llms.txt:40`의 products 테이블 필드
목록도 `demo_url`을 그대로 나열하며 `banner_image_url`은 없음. `llms.txt`는 외부 AI 크롤러가
소비하는 공개 문서라 CLAUDE.md류보다 파급 범위가 넓다. 자세한 패턴은
[[recurring_issues]] #38 참고.

## Minor — 배너 이미지 `sizes` 속성이 컨테이너 최대폭과 불일치

`ProductDetailView.tsx:46`의 `sizes="(max-width: 1200px) 100vw, 1200px"`는 1200px 초과
뷰포트에서 항상 1200px 소스를 요청하는데, 실제 배너를 감싸는 컨테이너(`detail/[slug]/page.tsx`,
`@modal/(.)detail/[slug]/page.tsx` 둘 다)는 `max-w-[2400px]`까지 늘어난다. 초광폭 모니터
(예: 2560px 이상)에서는 실제 렌더 폭(~2320px)보다 작은 소스 이미지가 선택되어 배너가 약간
흐리게 보일 수 있음. 기능 차단 사유는 아니라 Minor.

## 판정

1차 리뷰(2026-08-24): **BLOCKED** — Major 1건(llms.txt 문서 드리프트) 잔존. 코드 자체(타입/
ProductDetailView/파일 삭제)는 문제 없음. llms.txt 두 파일만 갱신하면 즉시 해소 가능한
경미한 수정이므로 재검증 라운드에서 빠르게 APPROVED로 전환될 가능성 높음.

2차 재검증(같은 날): `llms.txt:197`에서 `DevicePreviewFrame` 제거(`{ProductCard,
CategoryFilter}.tsx`로 축소), `public/llms.txt:40`의 `demo_url`→`banner_image_url` 교체,
`ProductDetailView.tsx:46`의 `sizes`를 `(max-width: 2400px) 100vw, 2400px`로 컨테이너
최대폭과 일치시킴 — 3건 모두 파일 직접 대조로 수정 확인. `grep -rln "DevicePreviewFrame\|
demo_url" .` 재확인 결과 src 코드 안에는 설명 주석 1건만 남아 문제 없음(`README.md`의
`demo_url TEXT`는 이번 diff와 무관한 별개의 레거시 스키마 섹션 전체가 오래전부터 outdated된
것이라 이번 판정과 분리해서 다뤘음). **APPROVED**.
