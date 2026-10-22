---
name: detail_page_grid_content_placement
description: 상품 상세페이지 grid(오른쪽 sticky 패널 + 왼쪽 옵션) 안/밖에 섹션을 두는 것과 관련된 빈 공간
  버그 패턴 — ProductContentSection이 삭제되고 content_html이 grid 바깥(최상단)으로 이동한 이후 최신 구조
type: project
---

`src/app/(public)/detail/[slug]/page.tsx` → `ProductDetailView.tsx`는
`grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]`로 오른쪽 `PurchaseOptionsPanel`
(`lg:order-2 lg:sticky lg:top-10 lg:self-start`)과 왼쪽 `ProductOptionsSection`/
`CodePreviewSection`(`lg:order-1`)을 배치한다.

## 발견한 버그 패턴 (2026-08-08, 당시 유효)

grid **바깥(아래)**에 별도 섹션을 두면, 오른쪽 sticky 패널의 자연 높이가 왼쪽보다 커서 grid row
전체 높이가 오른쪽 기준으로 늘어나고, 그 아래 형제 섹션이 큰 빈 공간 뒤에 나타난다.

## 2026-08-08 당시 해결책 — 현재는 구조 자체가 바뀌어 무의미해짐

당시엔 문제 섹션(`ProductContentSection`)을 grid **안쪽**, 왼쪽 컬럼 wrapper의 형제로 옮겨
해결했다. **이 컴포넌트는 2026-08-24 `content_html` 통합 리팩터로 완전히 삭제됨.**

## 2026-08-24 현재 구조 — content_html은 grid보다 "앞"에 위치

```tsx
// ProductDetailView.tsx 현재 구조
<div className="mx-auto flex max-w-[1200px] flex-col gap-10">
  {hasContentHtml && <div className="prose-gf" dangerouslySetInnerHTML={...} />}
  <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
    {/* PurchaseOptionsPanel(sticky, order-2) / ProductOptionsSection+CodePreviewSection(order-1) */}
  </div>
  <div><ReviewSection productId={product.id} /></div>
</div>
```

**중요한 판단 포인트**: 2026-08-08 버그는 grid **뒤(after)** 형제에게만 적용된다 — grid의 늘어난
row 높이가 그 아래 형제를 밀어내는 것이 원인이므로, grid **앞(before)**에 오는 요소(지금의
`content_html` 블록)는 이 버그에 영향받지 않는다(일반 문서 흐름상 grid보다 먼저 렌더되므로 grid
height와 무관). 따라서 이번 리팩터(content_html을 grid 밖 최상단으로 이동)는 이 버그를
재도입하지 않음 — 2026-08-24 리뷰에서 확인, APPROVED.

**남아있는 잠재 리스크(이번 리뷰의 스코프 밖, 손대지 않음)**: `ReviewSection`은 여전히 grid
**뒤** 형제로 남아있다. 오른쪽 sticky 패널이 왼쪽보다 훨씬 길어지는 경우(예: 구매 옵션이 매우
많은 상품) grid 높이가 늘어나면서 `ReviewSection` 앞에 빈 공간이 생기는 2026-08-08 패턴이
이론적으로 여전히 재발할 수 있다. 이번 diff가 건드리지 않은 기존 구조라 이번 리뷰의 판정에는
포함하지 않았지만, 다음에 `ReviewSection` 주변 레이아웃을 다루는 diff가 오면 이 리스크를
먼저 확인할 것.

## 판정 이력

- 2026-08-08: APPROVED (ProductContentSection을 grid 안쪽으로 이동)
- 2026-08-24: content_html이 ProductContentSection과 함께 완전히 grid 밖(최상단)으로 이동,
  최상위 wrapper에 `mx-auto max-w-[1200px]` 추가. grid-before 배치라 빈 공간 버그 미해당,
  outer(`max-w-[2400px]`, page.tsx/@modal 양쪽)/inner(`max-w-[1200px]`) 중첩도 CSS 표준대로
  더 좁은 값이 정상 적용됨. APPROVED.
