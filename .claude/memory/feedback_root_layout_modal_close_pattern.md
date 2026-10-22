---
name: feedback_root_layout_modal_close_pattern
description: 루트 레이아웃(app/layout.tsx)에 상주하는 모달/오버레이는 라우트 이동으로 자연히 언마운트되지 않으므로, 모든 종료 액션이 반드시 onClose를 명시적으로 호출해야 한다
metadata:
  type: feedback
---

페이지 스코프 컴포넌트(`app/**/page.tsx` 트리 안)에 있는 모달은 `router.push()`로 다른
페이지로 이동하면 그 자체로 언마운트되어 자동으로 닫힌다. 하지만 `app/layout.tsx`에서
Provider로 마운트되는 모달(예: `CartProvider` → `CartModal`)은 라우트가 바뀌어도 계속
살아있는 상태이므로, "완료 후 다른 페이지로 이동" 같은 액션에서 `router.push()`만 호출하고
모달을 닫는 state(`onClose()`)를 호출하지 않으면 새 페이지 위에 모달이 계속 떠 있는 채로
남는다.

**Why:** `BatchPaymentModal`(장바구니 배치결제 완료 모달, [[project_cart_batch_checkout_feature]]
참고)의 "마이페이지 바로가기" 버튼이 `router.push("/mypage")`만 호출하고 `onClose()`를
안 불러서, 결제 완료 직후 마이페이지로 이동해도 `fixed inset-0 z-[60]` 오버레이가 그대로
남아 화면을 가리는 버그가 있었다. 기존 단건 구매용 `PaymentModal`은 상품 상세페이지
스코프에 있어서 같은 실수를 해도 페이지 이동 시 자연히 사라졌기 때문에 지금까지 드러나지
않았던 문제였다 — code-reviewer 리뷰에서 Critical로 잡아냄.

**How to apply:** 루트 레이아웃에 상주하는 Provider/모달을 새로 만들거나 수정할 때, "닫기"
동작이 배경 클릭(`onClick={done ? undefined : onClose}`)이나 X 버튼 하나에만 연결돼 있지
않은지 확인한다. 페이지 이동을 트리거하는 모든 버튼(예: "완료 후 다른 화면으로 이동")에서도
`router.push()` 직전에 반드시 `onClose()`를 호출할 것.
