---
name: Toss Payments 연동 히스토리
description: Toss PG사 결제 연동을 구현했다가 카카오페이 QR로 전환한 이력 — 추후 재적용 시 참고
type: project
---

Toss Payments SDK를 연동했다가 2026-07-16에 카카오페이 QR 수동 입금 방식으로 전환함.

**Why:** 초기 런칭 단계에서 PG사 계약/심사보다 간단한 QR 송금이 운영 부담이 적다는 판단.

**How to apply:** 추후 Toss 재연동 시 아래 파일들을 복원하면 됨 (git 히스토리에 존재).

## 삭제된 Toss 파일 목록

- `main/src/lib/toss/payments.ts` — Toss Payments 클라이언트 설정 (`loadTossPayments`)
- `main/src/app/api/payments/confirm/route.ts` — Toss 결제 승인 API (멱등성 보장, pending→confirming→paid 원자적 상태 전환)
- `main/src/app/payments/success/page.tsx` — 결제 성공 콜백 페이지 (`?paymentKey=...&orderId=...&amount=...`)
- `main/src/app/payments/fail/page.tsx` — 결제 실패/취소 콜백 페이지

## Toss 결제 흐름 (복원 시 참고)

```
BuyButton 클릭
  → POST /api/orders/create        # orders 레코드 생성 (status: pending)
  → Toss SDK requestPayment()      # 결제창 띄움
  → /payments/success?paymentKey=&orderId=&amount=
  → POST /api/payments/confirm     # Toss API 승인 + status: paid
  → /payments/fail                 # 실패/취소 시
```

## 카카오페이 QR 현재 흐름

```
BuyButton 클릭
  → POST /api/orders/create        # orders 레코드 생성 (status: pending)
  → PaymentModal 표시              # QR 이미지 + 계좌 정보 노출
  → POST /api/orders/self-confirm  # 사용자가 "입금 완료" 누르면 status: paid
  → /mypage                        # 마이페이지에서 제작 진행 상황 확인 (2026-07-30부터 다운로드 아님, [[project_digital_download_to_production_migration]] 참고)
```

## 패키지

- `@tosspayments/tosspayments-sdk` — package.json에서 제거 필요 (yarn remove)
