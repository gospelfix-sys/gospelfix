---
name: library_page_merged_into_orders
description: /mypage/library(보관함) 페이지 삭제 → /mypage/orders(구매/혜택)로 통합, OrdersTabs 신설
type: project
---

`/mypage/library` 페이지(결제 대기중 + 구매한 상품 다운로드)를 완전히 삭제하고
`/mypage/orders`("구매 / 혜택")에 "결제"/"보유 쿠폰"/"구매한 상품" 3탭 UI로 병합했다
(신규 `components/mypage/OrdersTabs.tsx`). 이 페이지를 참조하던 `MypageSidebar.tsx`,
`SidebarProfileMenu.tsx`, `PendingOrderCard.tsx`, `BuyButton.tsx`의 링크/문구를 전부
`/mypage/orders`·"구매 / 혜택"으로 동기화했다.

**Why:** 사용자 관점에서 "보관함"과 "구매 내역"이 별도 메뉴로 나뉘어 있는 게 중복돼
보였다는 피드백(`MypageSidebar.tsx` 주석 참고, `SidebarProfileMenu.tsx`에서 "프로필"
단일화와 같은 맥락의 UX 정리).

**How to apply:** `OrdersTabs.tsx`는 기존 `MyProductsList.tsx`의
`components/ui/Tab.tsx` 재사용 탭 패턴(role="tablist" + active 시
`border-gf-orange text-gf-orange`, 비활성 시 `border-transparent text-gf-gray2
hover:text-gf-black`, 라벨 뒤 카운트 숫자 병기)을 정확히 그대로 따랐다 — 이 프로젝트의
"탭 UI"는 항상 이 패턴을 참고하면 된다. 검증 결과 `library` 문자열의 잔존 참조(깨진
링크/import) 0건, 다운로드·결제 대기 확인 기능 손실 없이 이전 확인, 컴포넌트 위치도
`components/mypage/`(도메인=mypage) 계층 배치로 적절함. Critical/Major 없이 APPROVED.
