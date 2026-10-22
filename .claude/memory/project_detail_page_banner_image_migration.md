---
name: project_detail_page_banner_image_migration
description: 상세페이지 최상단 히스토리 — iframe 데모(demo_url) → 정적 배너 이미지(banner_image_url) → 에디터 리치 콘텐츠(content_html). 2026-08-24 하루 안에 두 번 피벗, 최종 상태는 content_html. 2026-08-29 demo_url이 "최상단"과 무관한 새 용도(하단 플로팅 Visit Site 버튼)로 재도입됨 — 아래 3차 항목 참고
metadata:
  type: project
---

⚠️ **이 메모리는 두 번째 피벗까지 반영된 최신 상태다.** 이전 버전은 `banner_image_url`을
최종 상태로 기술했지만, 같은 날 다시 `content_html`로 바뀌었다. `banner_image_url`을
언급하는 다른 메모리/커밋 메시지를 볼 때는 이 파일의 "현재 최종 상태"를 우선한다.

## 현재 최종 상태 (2026-08-24, 2차 피벗 이후)

상세페이지(`/detail/[slug]`) 최상단 영역은 `product.content_html`(관리자 에디터로 작성한
리치 텍스트/이미지)을 직접 렌더링한다. 기존에 구매옵션 패널 아래 별도로 있던 "상세 설명"
섹션(`ProductContentSection`)은 삭제되고 통합됐다 — 같은 `content_html`을 두 곳에서
중복 렌더링하지 않는다.

- `src/components/products/ProductDetailView.tsx` — 최상단에서 `sanitizeContentHtml()` +
  `isContentHtmlEmpty()`로 처리한 `content_html`을 `prose-gf max-w-none` 컨테이너에
  `dangerouslySetInnerHTML`로 렌더링. 비어 있으면 아무것도 렌더링하지 않음(플레이스홀더 없음)
- `src/components/products/ProductContentSection.tsx` — 삭제(기능이 위로 흡수됨)
- `src/types/product.types.ts` — `banner_image_url` 필드 삭제. `content_html` 주석을
  "본문"에서 "최상단 표시"로 갱신

## 히스토리 (왜 두 번 바뀌었는지)

1. **1차**: `demo_url` 라이브 iframe 미리보기(`DevicePreviewFrame`, macOS 브라우저 크롬
   목업) → 정적 배너 이미지(`banner_image_url`, `next/image` 단일 이미지)로 교체.
   cms.api 쪽에도 `banner_image_url` 컬럼/admin 업로드 폼/OpenAPI 스키마를 전부
   구현하고 SQL 마이그레이션까지 실행 완료함.
2. **2차 (당일 재피벗)**: cms.api에서 "상세 콘텐츠 에디터"(리치 텍스트, `content_html`)를
   관리자가 직접 편집할 수 있게 노출하면서, 사용자가 굳이 별도의 단일 배너 이미지 필드를
   쓰지 않고 이 에디터 콘텐츠를 그대로 최상단에 쓰기로 결정. `banner_image_url`은
   프론트엔드에서 완전히 제거.

**Why:** 사용자가 명시적으로 "최상단 배너 자리를 content_html로 교체, 아래 상세설명
섹션은 삭제"를 선택함 — 별도 이미지 업로드보다 이미 있는 리치 에디터로 이미지+텍스트를
자유롭게 구성하는 쪽을 선호.

## ⚠️ cms.api 쪽 정리 필요 (남은 오차)

1차 피벗에서 cms.api에 만든 `banner_image_url` 관련 기능(DB 컬럼, admin 단일 이미지
업로드 UI, `products.server.ts`/`products.admin.ts`의 select 컬럼, OpenAPI 스키마 필드)이
**이제 프론트엔드 어디에서도 쓰이지 않는 고아 기능**이 됐다. 삭제할지, 다른 용도(예: OG
공유 이미지 fallback)로 재활용할지는 사용자가 아직 결정하지 않음 — cms.api 세션에서
이 결정을 다시 물어볼 것. 컬럼/폼 자체는 당장 깨지진 않으니 급하지 않지만, 방치하면
"왜 아무도 안 쓰는 업로드 필드가 admin에 있지"라는 혼란을 남긴다.

**How to apply:** "배너 이미지" 관련 요청을 받으면 이 파일의 "현재 최종 상태"부터 확인하고,
`banner_image_url`을 되살리는 작업이면 왜 필요한지(OG 이미지? 다른 용도?) 먼저 확인한다.

## 3차: demo_url 재도입 — "최상단"이 아니라 완전히 다른 용도 (2026-08-29)

`Product.demo_url`이 다시 타입에 추가됐다. **1차 피벗(iframe 미리보기) 때 쓰이던 "최상단"
용도의 부활이 아니다** — `ProductVisitNav.tsx`라는 신규 전용 컴포넌트가 하단 고정
플로팅 pill 네비게이션의 "Visit Site" 외부 링크 CTA로만 쓴다. 최상단은 여전히
`content_html`(위 "현재 최종 상태" 참고)이 담당하고 변경 없음.

- 판매자 마이페이지 업로드 폼(`SellerProductInput`/`SellerProduct.demo_url`,
  `UploadWorkEditor.tsx`의 "사이트URL" 입력)은 이번 재도입 이전부터 이미 존재했다 —
  `Product`(공개 카탈로그 응답) 쪽에만 필드가 없었을 뿐, 값 자체는 계속 저장되고 있었다.
  `curl /api/products`로 확인한 결과 cms.api가 이미 공개 응답에 `demo_url`을 내려주고
  있었음(license 필드가 optional로 추가됐을 때와 동일한 패턴 — 타입 정의가 실제 API
  계약보다 뒤처져 있었던 경우).
- `public/llms.txt:40`의 products 필드 목록은 1차 피벗 때 `demo_url`을 뺀 채로 남아있다.
  이번 재도입으로 다시 공개 필드가 됐으므로 그 목록도 다시 갱신 대상이다(recurring_issues
  #38/#39와 같은 패턴의 "반대 방향" 재발 — 이번엔 필드를 뺀 게 아니라 넣었는데 문서를
  안 고침). 자세한 리뷰 기록은 `product_visit_nav_review.md` 참고.

**Why:** "demo_url"이라는 같은 필드명이 프로젝트 히스토리에서 두 번째로 완전히 다른
목적(1차: 최상단 iframe 미리보기 소스, 3차: 하단 네비 외부 링크)에 재사용됐다 — 필드명만
보고 과거 히스토리(1차 피벗)를 그대로 적용해 "이미 폐기된 기능이 되살아났다"고 오판하지
않도록 구분해서 기록해둔다.
**How to apply:** `demo_url` 관련 변경을 볼 때는 "최상단 콘텐츠"용인지 "하단 Visit Site
버튼"용인지 반드시 구분해서 판단한다. 후자는 `ProductVisitNav.tsx` 단일 소비처만 있다.
