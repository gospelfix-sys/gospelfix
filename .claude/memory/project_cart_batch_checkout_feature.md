---
name: project_cart_batch_checkout_feature
description: 장바구니(담기/조회/삭제) + 선택 항목 일괄결제(배치 체크아웃) 기능, 2026-08-03 완료 후 배포됨. gospelfix+cms.api 양쪽 저장소에 걸친 기능
metadata:
  type: project
---

실제 백엔드가 포함된 장바구니 기능을 두 단계로 나눠 구현했다: (1) 담기/조회/개별삭제, (2)
장바구니 팝업 안에서 전체선택/선택삭제 + 결제수단(계좌이체만) + 청약철회 동의 + 선택 항목
일괄결제("배치 체크아웃"). 두 단계 모두 계획 승인(Plan Mode) → 구현 → code-reviewer 리뷰 →
Critical/Major 수정 → 재검토 APPROVED → 의미 단위 커밋 → 푸시까지 완료했고, 두 저장소 모두
배포 파이프라인에 반영됨(커밋 `865fd94`~`4a03ce0`).

**핵심 구조**
- `CartProvider`(`components/cart/CartProvider`)가 `app/layout.tsx` 루트에 상주 —
  페이지가 아니라 앱 전체에 걸쳐 `CartModal`이 항상 마운트돼 있다. 관련 함정은
  [[feedback_root_layout_modal_close_pattern]] 참고.
- 주문 1건 = 상품 1건 구조는 유지하고, 배치 결제는 선택 항목 개수만큼 `pending` 주문을 반복
  생성한 뒤 그 order_id들을 한 번에 `pending_confirm`으로 전환하는 방식(cms.api
  `/api/v1/orders/batch`, `/api/v1/orders/notify-payment-batch`).
- 결제수단은 실제로 존재하는 계좌이체(무통장입금) 하나만 노출 — 존재하지 않는 PG(토스페이 등)
  UI를 흉내내지 않기로 명시적으로 결정함.
- "할인/쿠폰" 섹션은 사용자가 명시적으로 이번 스코프에서 제외(placeholder도 없음) — 다음
  기능으로 남아있음.
- 청약철회 동의 UI는 `components/widgets/WithdrawalNoticeAgreement.tsx`로 분리해
  `PurchaseOptionsPanel`(단건 구매)과 `CartModal`(배치 결제) 양쪽에서 재사용.
- "장바구니 담기" 버튼은 FREE/일반 구매 옵션에서는 노출하되, "커스터마이징"(문의전용,
  `is_inquiry_only`) 옵션에서는 숨긴다(문의 전용 상품은 장바구니 담기 대상이 아님, 사용자
  요청으로 확정).

**cms.api 쪽 신규 파일**: `supabase/migrations/025_add_cart_items.sql`,
`src/libs/supabase/queries/cart.ts`, `src/app/api/v1/cart/*`,
`src/app/api/v1/orders/batch/route.ts`, `src/app/api/v1/orders/notify-payment-batch/route.ts`.
배치 생성 원자성 함정은 [[feedback_batch_insert_compensating_transaction]] 참고(cms.api
저장소 메모리에 기록).

**How to apply**: 이 기능을 확장(쿠폰/할인, PG 연동, 다른 결제수단 추가)할 때는 이 메모리와
연결된 두 feedback 메모리를 먼저 확인할 것.
