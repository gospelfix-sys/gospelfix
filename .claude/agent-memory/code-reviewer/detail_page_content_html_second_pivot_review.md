---
name: detail_page_content_html_second_pivot_review
description: /detail/[slug] 최상단이 banner_image_url 정적 배너에서 content_html(관리자 에디터
  리치 콘텐츠)로 재교체된 2026-08-24 두 번째 피벗 리뷰. ProductContentSection 삭제 + 통합.
metadata:
  type: project
---

2026-08-24, 같은 날 두 번째로 `/detail/[slug]` 최상단을 교체한 diff 리뷰(1차 `demo_url`→
`banner_image_url` 피벗은 [[detail_page_banner_image_migration_review]] 참고, 이미 APPROVED
상태였음). 이번엔 `banner_image_url` 정적 배너 이미지를 완전히 버리고, 기존에 구매옵션 패널
아래 별도 섹션(`ProductContentSection`)으로 있던 `content_html`(관리자 리치 에디터 콘텐츠)을
최상단으로 흡수 통합. 이후 사용자 요청으로 전체 콘텐츠 wrapper에 `mx-auto max-w-[1200px]`도
추가.

## 확인 완료 (문제 없음)

- `sanitizeContentHtml`/`isContentHtmlEmpty`(`lib/sanitizeHtml.ts`)는 `ProductContentSection`이
  쓰던 것과 완전히 동일한 단일 진실 공급원 함수를 그대로 재사용 — 화이트리스트(허용 태그/속성/
  style 값 범위)나 빈 콘텐츠 판정 로직이 전혀 약화되지 않음. sanitize-html 마이그레이션
  자체는 [[sanitize_html_migration_review]]에서 별도로 검증 완료된 상태.
- `dangerouslySetInnerHTML`은 `hasContentHtml`(sanitize 이후 계산) 가드 뒤에서만, sanitize된
  값(`sanitizedContentHtml`)에만 사용됨 — XSS 안전.
- `ProductContentSection.tsx` 삭제 안전성: `grep -rn "ProductContentSection" .` 결과 src 코드
  0건(남은 유일한 hit는 `product.types.ts`의 히스토리 설명 주석, 실제 참조 아님). `llms.txt`도
  이미 이 컴포넌트를 나열하지 않아 문서 드리프트 없음(1차 피벗 리뷰에서 이미 정리된 상태 유지).
- `mx-auto max-w-[1200px]` 최상위 wrapper 배치: 2026-08-08에 발견된 "grid 뒤 형제 빈 공간 버그"
  ([[detail_page_grid_content_placement]])는 grid **뒤** 형제에만 적용되는데, 이번에 옮겨진
  `content_html` 블록은 grid **앞**에 위치해 이 버그와 무관함을 확인. `grid
  lg:grid-cols-[1fr_380px]`도 좁아진 1200px 안에서 `1fr`이 유연하게 줄어들 뿐 깨지지 않음.
- 컨테이너 중첩(`page.tsx`/`@modal/(.)detail/[slug]/page.tsx` 양쪽의 `max-w-[2400px]` outer +
  `ProductDetailView`의 `max-w-[1200px]` inner)은 CSS 표준대로 더 좁은 값이 최종 적용되어 의도한
  대로 동작. 두 라우트(전체 페이지/인터셉팅 모달) 모두 대조 확인.
- Prettier(쌍따옴표/세미콜론)·`style=` 미사용·`asChild` 미사용 전부 확인.

## 판정

**APPROVED** — Critical/Major 없음. Minor 1건(비차단): `hasContentHtml` 계산식
(`sanitizedContentHtml !== "" && !isContentHtmlEmpty(...)`)에서 앞의 `!== ""` 체크는
`isContentHtmlEmpty("")`가 이미 `true`를 반환하므로 논리적으로 중복 — 기능 문제는 없고
가독성 차원의 사소한 지적.
