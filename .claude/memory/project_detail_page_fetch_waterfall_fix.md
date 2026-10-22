---
name: project_detail_page_fetch_waterfall_fix
description: 상품 상세페이지가 product/reviews/coupons를 순차 await로 가져오던 fetch 워터폴을 Promise.all로 개선 — 다른 서버 컴포넌트 페이지에도 같은 패턴이 있는지 점검 필요
metadata:
  type: project
---

`src/app/(public)/detail/[slug]/page.tsx`의 `TemplateDetailPage`가 `product` →
`reviews` → `coupons`를 세 번 순차 `await`로 가져오고 있었다. `reviews`는
`product.id`가 있어야 조회 가능해 의존 관계가 있지만, `coupons`는 `product`와 아무
관계가 없는데도 마지막에 순차로 붙어 있었다.

**적용한 수정**: `product`와 `coupons`를 `Promise.all`로 병렬 조회하고, `product.id`가
필요한 `reviews`만 그 이후에 조회하도록 재배치. 3단 순차 대기 → 2단(병렬 1회 + 순차
1회)으로 축소.

**Why:** 사용자가 "페이지 전환이 느리다"고 보고해서 진단하는 과정에서 발견했다. 실측
결과 dev 모드 콜드 컴파일이 체감 지연의 대부분(0.5~2.9초)을 차지했고, 이 워터폴
자체의 실측 영향은 그보다 작았지만(프로덕션 빌드에서 전 페이지 6~90ms로 확인) 실제
불필요한 순차 대기였던 건 맞다.

**현재 상태**: 커밋 완료(`e0f6964`, 2026-08-11).

**How to apply:** 이 저장소의 다른 `page.tsx`(Server Component)에서 `await
serverFetch(...)`가 여러 번 연달아 나오면, 뒤 호출이 앞 호출의 결과값(예: id)에
실제로 의존하는지부터 확인한다. 의존하지 않는데 순차로 쓰여 있으면 `Promise.all`로
묶을 수 있는 후보다. `/growth`(구 `/mall`), `/blog` 등은 이번에 확인했을 때 fetch가 1번뿐이라
해당 없었음(2026-08-11 기준).

**후속 발견 → 수정 완료**: code-reviewer가 `src/app/(mypage)/mypage/orders/page.tsx`에서
`allOrders`와 `coupons`를 순차 await로 조회하는데 서로 무관하다는 동일 패턴을
발견했고(2026-08-11), 같은 세션에서 `Promise.all`로 병렬화 완료. 비로그인 분기는
`([[], []] as [PurchasedOrder[], Coupon[]])`로 명시 타입 처리(느슨한 `any[][]` 추론
방지).
