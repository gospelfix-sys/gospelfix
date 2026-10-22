---
name: cart_batch_checkout_feature
description: 장바구니(cart) + 일괄결제(batch payment) 신규 기능 리뷰 경위 — CartModal/BatchPaymentModal이 루트 레이아웃에 상주하면서 체크아웃 완료 후 모달이 영구히 안 닫히는 Critical 버그
type: project
---

## 배경 (2026-08-03, 1차 리뷰)

상품 상세페이지 레이아웃 개편(Options 좌측/정보패널 우측 sticky, `overflow-x: hidden` →
`clip`), `ProductInfoTicket`/`ReviewCountButton`(티켓 UI) 신규, 장바구니 기능 전체 신규
(`hooks/useCart.ts`, `store/atoms/cartAtom.ts`, `store/selectors/cartSelector.ts`,
`app/api/cart/*`, `app/api/orders/create-batch|notify-payment-batch/route.ts`,
`components/cart/CartModal/`, `components/cart/BatchPaymentModal/`), 청약철회 동의 UI를
`components/widgets/WithdrawalNoticeAgreement.tsx`로 공용화, `layout.tsx`에 `CartProvider`
추가.

## Critical 2건

1. **`ReviewSection.tsx:79` 인라인 `style={{ width: ... }}`** — 별점 분포 바 너비를 런타임
   비율로 계산해 style로 직접 적용. 작성자가 주석으로 "style= 예외"라 표시했지만, CLAUDE.md가
   명시한 유일한 style= 예외는 `@dnd-kit` 드래그 transform뿐이라 이 예외는 아직 문서에
   사전 승인되지 않음. 실용적으로는 정당한 패턴(런타임 계산 percentage는 정적 Tailwind
   클래스로 표현 불가)이므로, 다음 라운드에는 CLAUDE.md의 예외 조항을 "런타임 계산 수치를
   진행률 바 너비로 표시하는 경우"까지 명시적으로 확장하는 것을 제안할 것 — 코드 자체를
   막다른 골목으로 리팩터링하기보다 문서 업데이트가 더 합리적인 해법.
2. **체크아웃 완료 후 `BatchPaymentModal`이 영구히 안 닫힘 (가장 심각)** — `CartModal`이
   `layout.tsx`의 `CartProvider`를 통해 루트 레이아웃에 상주(모든 라우트에서 마운트 유지).
   `CartModal`의 `batchOrder` state는 `BatchPaymentModal.handleGoToMypage()`
   (`router.push("/mypage")`만 호출, `onClose()` 미호출)에서도, `done` 상태에서는 배경
   클릭도 비활성(`onClick={done ? undefined : onClose}`)이라 리셋될 방법이 없음. 기존
   단건 구매 흐름(`BuyButton`+`PaymentModal`)은 페이지 스코프 컴포넌트라 navigate 시
   자연히 언마운트되어 이 문제가 없었지만, 장바구니 모달을 루트 레이아웃으로 승격시키면서
   동일한 "네비게이션해도 안 닫힘" 문제가 새로 발생함 — 사용자가 일괄결제 완료 후
   "마이페이지 바로가기"를 누르면 `/mypage`로 이동은 되지만 완료 화면 오버레이(z-[60],
   `fixed inset-0`)가 새 페이지 위에 계속 떠 있어 이후 세션 내내(하드 리프레시 전까지)
   해당 페이지를 가릴 수 있음. **해결책**: `BatchPaymentModal`의 `handleGoToMypage`가
   `onClose()`를 호출한 뒤(또는 함께) `router.push`하도록 수정.

## Major

3. **장바구니 배지가 마운트 시 자동 조회되지 않음** — `PublicHeader.tsx`의
   `cartItemCountSelector`는 `cartItemsAtom`(기본값 `[]`) 파생값인데, `fetchCart()`를
   호출하는 곳은 `openCart()`/`addToCart()`/`removeMultiple()`뿐이고 `CartProvider`/
   `PublicHeader` 어디에도 마운트 시 자동 `fetchCart()` 호출이 없음. 따라서 기존에 담아둔
   장바구니가 있는 재방문 사용자도 페이지 로드 시 배지가 항상 0으로 보임 — 배지의 존재
   목적(열어보지 않아도 담긴 개수 인지) 자체가 무력화됨. `CartProvider`에 로그인 상태일
   때 마운트 시 1회 `fetchCart()`를 추가할 것을 제안.
4. **`BatchPaymentModal.tsx`가 기존 `PaymentModal.tsx`를 거의 그대로(~140줄) 복제** — QR
   이미지/계좌정보/입금금액/완료화면 구조가 동일, `gray-*`/`orange-*` 순정 Tailwind
   팔레트를 그대로 써서 나머지 신규 카트 UI(`CartModal`, `WithdrawalNoticeAgreement`,
   `ReviewSection`)가 쓰는 `gf-*` 브랜드 토큰과도 불일치. 게다가 같은 PR의 `CartModal`은
   `components/ui/dialog.tsx`(`Dialog`/`DialogContent`)를 정상적으로 재사용하는데
   `BatchPaymentModal`/`PaymentModal`은 raw `fixed inset-0` div로 직접 모달을 구현해
   프로젝트 자체 Dialog 프리미티브를 우회함. "위젯 단위 UI 중복(2곳 이상)" 규칙 위반 —
   공용 `PaymentInstructionModal` 같은 컴포넌트로 추출해 단건/일괄 결제 모두 재사용하도록
   제안(추출 시 Critical #2 수정과 자연히 함께 해결 가능 — 공용 컴포넌트에서 `onClose`
   호출을 강제하면 두 곳 모두 안전해짐).

## 확인된 개선사항 (이전 세션 Major 이슈 해소 확인)

- `LikeButton.tsx`: `hasInteractedRef`/`isMountedRef` 가드로 마운트-GET vs 클릭-POST 레이스
  컨디션 해소 확인 — [[like_button_race_condition]] #26 완전 해소.
- `PurchaseOptionsPanel.tsx`: `PrimaryActionRow` 헬퍼로 무료/문의전용/일반 3분기의
  `flex gap-3 + LikeButton` 반복 제거 확인 — [[like_button_race_condition]] #27 완전 해소.
- `components/ui/checkbox.tsx`: `data-checked:` → `data-[checked]:` Tailwind 버그 수정 확인.
- `overflow-x: hidden` → `clip` 수정으로 상세페이지 sticky 사이드바 정상 동작 확인 (구조적으로
  `lg:sticky lg:top-10 lg:self-start` + `grid-cols-[1fr_380px]` + `lg:order-*` 조합 타당).
- `WithdrawalNoticeAgreement`를 `CartModal`/`PurchaseOptionsPanel` 2곳에서 공용 컴포넌트로
  추출해 위젯 중복을 사전에 피함 (다만 도메인 지식이 있는 컴포넌트라
  `components/widgets/`보다 `components/[domain]/`이 더 적합 — Minor, [[component-layers]]
  참고).

## 판정 (2026-08-03, 1차)

BLOCKED — Critical 2건(style=, 체크아웃 완료 후 영구 미닫힘 모달). 다음 재검증 시 두 Critical
과 Major #3/#4 수정 여부를 최우선 확인할 것.

## 2차 재검증 (2026-08-07) — QR/계좌정보 리팩터링 세션

Critical #2(체크아웃 완료 후 영구 미닫힘)는 `BatchPaymentModal.handleGoToMypage`가
`onClose()`를 먼저 호출한 뒤 `router.push`하도록 수정되어 해소 확인. 이 패턴은
`.claude/memory/feedback_root_layout_modal_close_pattern.md`로 별도 일반화되어 저장됨.

Major #4(BatchPaymentModal이 PaymentModal 복제)는 **절반만 해소**됨:
- 정적 카카오페이 QR 이미지(`public/qr-payment-v1.png`) → 실제 QR 이미지(`public/qr-transfer.png`)로
  교체하면서, QR+계좌정보 블록(100% 동일 중복이었던 부분)을 `src/components/orders/AccountTransferCard.tsx`
  + `src/lib/paymentAccount.ts`(`ACCOUNT_INFO` 단일 소스)로 정확히 추출. `components/[domain]/`
  배치도 [[component-layers]] 기준에 부합.
- 하지만 모달 셸(백드롭·헤더·닫기버튼·버튼그룹·완료화면, ~55~60줄)은 여전히
  `PaymentModal.tsx`/`BatchPaymentModal/index.tsx` 양쪽에 거의 글자 단위로 중복 — 다른 부분은
  입금 금액 카드의 부가 정보(주문번호+상품명 vs 상품개수)와 `handleConfirm`이 호출하는 API
  엔드포인트(`notify-payment` vs `notify-payment-batch`)뿐. 원래 제안했던 공용
  `PaymentInstructionModal` 추출은 아직 미완료.
- 부수 발견: `AccountTransferCard`는 `bg-gf-orange`/`text-gf-orange` 브랜드 토큰을 쓰는데, 같은
  모달의 "입금 금액" 카드는 여전히 `bg-orange-50`/`text-orange-600~800` 순정 Tailwind 팔레트라
  한 모달 안에서 오렌지 계열이 미묘하게 어긋남(Minor).
- `raw fixed inset-0 div` 대신 `components/ui/dialog.tsx` 재사용 여부는 이번에도 미해결 —
  `CartModal`은 `Dialog`/`DialogContent`를 쓰지만 `PaymentModal`/`BatchPaymentModal`은 여전히
  독자적인 `fixed inset-0` 오버레이 구현.

**2026-08-07 판정: BLOCKED (Major 1건 — 모달 셸 중복)**. 다음 재검증 시
`PaymentInstructionModal` 공용 추출 여부를 최우선 확인할 것. 이 세션에서 새로 발견된 항목은
[[recurring_issues]]에도 "AccountTransferCard 이후 남은 모달 셸 중복"으로 후속 등재 예정.

## 3차 재검증 (2026-08-07, 같은 날) — Major 완전 해소, APPROVED

`src/components/orders/PaymentInstructionModal.tsx` 신규 추출로 모달 셸(createPortal, 백드롭,
카드, 닫기버튼, "입금 안내" 타이틀, `AccountTransferCard`, 확인/취소 버튼, 완료 화면)이 완전히
공용화됨. `done`/`loading`/`onConfirm`/`onClose`/`onGoToMypage` prop + `children`(입금 금액
카드 — 주문번호 vs 상품개수로 내용이 실제로 다른 부분만) 구조로, `PaymentModal.tsx`/
`BatchPaymentModal/index.tsx`는 각자의 API 호출 로직(`notify-payment` vs
`notify-payment-batch`)과 `children` 블록만 남기고 `<PaymentInstructionModal>`을 감싸는 얇은
래퍼로 축소됨. grep 재확인 결과 두 파일 간 중복 마크업 없음. `yarn lint`/`yarn build` 통과
확인(사용자 보고).

llms.txt:155의 `/qr-payment-v1.png` → `/qr-transfer.png`로 수정 확인. 플랜 문서
(`.claude/plans/snappy-juggling-swing.md`)에 "실행 후 변경 사항" 섹션이 추가되어 최종 구현과의
차이(정적 이미지 회귀, qrcode.react 제거, createPortal 수정, PaymentInstructionModal 추출)가
기록됨.

남은 항목은 Minor 1건뿐(입금 금액 카드가 `bg-orange-50`/`text-orange-*` 순정 팔레트를 쓰고
`AccountTransferCard`는 `gf-orange` 브랜드 토큰을 씀 — 같은 모달 안 색상 미세 불일치, 블로킹
아님).

**최종 판정: APPROVED.** 자세한 경위는 [[recurring_issues]] #31 참고 (부분 추출 → 완전 추출로
해소된 사례).

## 4차 (2026-08-07, 같은 날) — AccountTransferCard 복사 버튼 hover 제거, APPROVED

계좌번호 "복사" `Button variant="ghost"`의 hover 시각효과를 완전 제거하는 요청(사용자: "복사됨
상태에도 호버 기능 삭제해줘"). 기존 `cn(..., !copied && "hover:bg-gf-orange/15")` 조건부 로직을
제거하고 `hover:bg-gf-orange-bg hover:text-gf-orange`(버튼의 resting 배경/텍스트 색과 동일값)를
정적 문자열로 명시해, `components/ui/button.tsx`의 ghost variant 기본 hover
(`hover:bg-muted hover:text-foreground`)를 두 상태 모두에서 무력화. `cn` import도 함께 제거.

- **cn() 제거는 CLAUDE.md 규칙에 부합**: 조건부 분기가 완전히 사라져 단일 정적 문자열만
  남았으므로, "2개 이상 조합 또는 조건부 클래스일 때만 cn() 필수"라는 규칙상 cn() 불필요 —
  제거가 맞고 미사용 import로 인한 ESLint 에러도 예방됨.
- **shared-component-changes.md 관점에서도 문제없음**: `hover:bg-gf-orange-bg
  hover:text-gf-orange` 문자열 자체는 `ShareButton.tsx`/`ReviewCountButton.tsx`/
  `PaymentInstructionModal.tsx`에도 등장하지만, 그쪽은 resting 배경이 달라 실제로 hover 시
  오렌지 틴트가 보이는 용도(진짜 재사용 가능한 스타일 컨벤션)이고, 여기는 resting 값과
  완전히 동일하게 맞춰 hover를 무효화하는 게 목적이라 의미가 다름 — 이 버튼 하나에만 필요한
  예외이므로 `shared-component-changes.md` 판단 기준 2번("이 호출부만 예외적으로 다른 값이
  필요한가")에 해당해 호출부 오버라이드가 정당함. 공용 `button.tsx`의 ghost variant 자체를
  고칠 이유 없음.
- 접근성 Minor 관찰(블로킹 아님): 클릭 가능한 버튼에서 hover 피드백이 전혀 없는 것은
  일반적으로 어포던스 저하이나, 사용자의 명시적 요청에 따른 디자인 결정이고 아이콘+텍스트
  라벨이 이미 상호작용성을 충분히 전달하므로 문제 삼지 않음.

**판정: APPROVED.**
