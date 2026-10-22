---
name: project_mypage_library_merged_into_orders
description: /mypage/library(보관함) 페이지 삭제, /mypage/orders(구매/혜택) 3탭(OrdersTabs)으로 통합 완료
metadata:
  type: project
---

`/mypage/library`("보관함" 메뉴)를 완전히 삭제하고, 그 안에 있던 "결제 대기중"(입금
계좌·QR 재확인)과 "구매한 상품 다운로드" 두 섹션을 `/mypage/orders`("구매 / 혜택")로
옮겼다. `orders` 페이지는 신규 `components/mypage/OrdersTabs.tsx`를 통해 "결제 대기" /
"보유 쿠폰" / "구매한 상품" 3개 탭으로 재구성됐다(`components/mypage/MyProductsList.tsx`의
기존 `components/ui/Tab.tsx` 탭 패턴 재사용). `MypageSidebar.tsx`, `SidebarProfileMenu.tsx`,
`PendingOrderCard.tsx`, `BuyButton.tsx`에 있던 `/mypage/library` 링크와 "보관함" 문구도
전부 `/mypage/orders`·"구매 / 혜택"으로 동기화했다. 2026-08-26 커밋(`ae7d55a`) 완료.

**Why:** 사용자가 "보관함"과 "구매 내역"이 별도 메뉴로 나뉘어 있는 게 중복돼 보인다고
판단해 하나로 합쳐달라고 요청함(`MypageSidebar.tsx` 주석에 기록된 것과 같은 맥락의 UX
정리 — "프로필" 단일화 때와 동일한 패턴).

**How to apply:** 이제 이 프로젝트에 `/mypage/library` 라우트는 존재하지 않는다 — 사용자가
"보관함"을 다시 언급하면 `/mypage/orders`의 "결제 대기" 탭(입금 확인)이나 "구매한 상품" 탭
(다운로드)을 가리키는 것으로 이해할 것. 구매한 디지털 상품 다운로드 UI를 새로 추가/수정할
일이 생기면 `library/page.tsx`가 아니라 `OrdersTabs.tsx`를 고쳐야 한다.
