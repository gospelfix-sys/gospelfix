---
name: project_digital_download_to_production_migration
description: 2026-07-30 판매 모델을 "즉시 디지털 파일 다운로드"에서 "제작/상담 진행형 서비스"로 전환한 이력
metadata:
  type: project
---

2026-07-30, 상품 판매 모델을 "구매 즉시 디지털 파일 다운로드"에서 "구매 후 담당자가
제작/상담을 진행하는 서비스형"으로 전환함. 사용자가 명시적으로 확인한 의도된 비즈니스
피벗이며, 단순 리팩터링이 아니라 결제 완료 후 구매자가 결과물을 받는 방식 자체가
바뀐 것.

**Why:** `file_path` 기반 즉시 다운로드 대신 담당자가 요구사항에 맞춰 실제로
제작(용역)을 진행하는 방식으로 상품 구조가 바뀜. 이에 따라 `Product.production_solution`,
`ProductOption.is_inquiry_only`(카카오톡 채널 문의), `work_period_days` 필드가 추가되고
`file_path`/`platform_options` 기반 다운로드 구조는 제거됨.

**How to apply:** 앞으로 구매 흐름·마이페이지·마케팅 카피·법적 문서에서 "다운로드"를
전제로 한 문구를 새로 추가하지 말 것. "제작 진행", "제작 상담", "결과물 전달" 등의
표현을 사용한다. [[project_toss_payments_history]]의 결제 흐름 다이어그램도 이 변경에
맞춰 갱신되었다.

## 제거된 것

- `src/app/api/downloads/[productId]/route.ts` — cms.api 다운로드 signed URL 프록시 (삭제)
- `src/components/mypage/DownloadButton.tsx` (삭제)
- `Product.file_path`, `platform_options` 관련 타입/UI

## 추가/변경된 것

- `Product.production_solution: string | null`
- `ProductOption.is_inquiry_only: boolean` — 카카오톡 채널 문의 연결
- `ProductOption.work_period_days` — 제작 소요 기간
- `PlatformOptionToggle.tsx` → `OptionToggle.tsx` 이름 변경 (플랫폼 선택이 아닌 옵션 토글 일반화)
- `BuyButton.tsx`에 `useRef` 기반 동기 중복 요청 락(`isRequestingRef`) 추가 — 결제/제작 신청은
  중복 주문 방지가 더 중요해짐

## 문구가 바뀐 곳 (전부 "다운로드" → "제작/상담" 표현으로 교체됨)

- `src/components/main/HeroBanner.tsx` (슬라이드 1)
- `src/app/(public)/growth/page.tsx` (ticker, feature 카드)
- `src/components/products/BuyButton.tsx`, `PaymentModal.tsx` (완료 모달 안내 문구)
- `src/app/(public)/terms/page.tsx` 제2조④/제4조/제8조 — 청약철회 제한 조건을
  "다운로드 시작" → "제작(용역) 제공 개시"로 변경. 전자상거래법 제17조 제2항 제5호
  법적 근거, 7일 철회 기간, 회사 귀책 환불 예외 로직은 그대로 유지, 트리거 조건
  문구만 교체함 (법률 자문 없이 임의로 철회권 자체를 축소하지 않도록 주의).

## 관련 커밋

`1223938` — "♻️ refactor: 다운로드 기반 판매 모델 → 제작/상담 진행형 서비스로 전환"
