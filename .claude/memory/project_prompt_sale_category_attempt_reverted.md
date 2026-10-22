---
name: project_prompt_sale_category_attempt_reverted
description: "완성 소스 + 프롬프트 파일 별도 판매" 비즈니스 모델 확장 시도 — 별도 카테고리 신설했다가 되돌리고 최종적으로 "코드 미리보기" 섹션 상시 노출로 단순화한 히스토리
metadata:
  type: project
---

2026-08-13, 사용자가 비즈니스 모델을 "완성 소스+세팅"(소상공인용) 외에 "프롬프트 파일
별도 판매"(개발자·에이전시용)로 확장하고 싶다고 요청. 결과적으로 시도했던 복잡한 설계는
전부 되돌리고, 훨씬 단순한 형태로 정착했다. 전체 과정과 최종 상태를 기록한다.

## 시도했던 설계 (전부 되돌림)

1. `gospelfix`(프론트)에 `product.types.ts`의 `PRODUCT_CATEGORY_LABELS`/
   `PRODUCT_CATEGORIES`/`PRODUCT_FORMAT_LABELS` 3곳에 `prompt` 카테고리를 신설하고,
   `CodePreviewSection.tsx`가 카테고리별로 "코드 미리보기"/"프롬프트 미리보기" 제목을
   분기하도록 구현 → 커밋 `2fb2527`
2. `gospelfix.cms.api`(관리자)의 `ProductForm/index.tsx`에도 동일하게 `prompt` 카테고리를
   추가하고, 유료 상품이어도 `category === 'prompt'`면 "다운로드 파일"/"코드 미리보기"
   섹션이 노출되도록 조건을 확장
3. 조사 과정에서 중요한 아키텍처 제약을 발견함: 이 서비스는 계좌이체(무통장입금)만
   지원하고 카카오페이 같은 PG 자동승인을 쓰지 않는다 (`confirm-payment` 라우트가 프론트
   어디서도 호출되지 않고, `notify-payment`만 쓰임). `notify-payment`(cms.api)는
   `amount === 0`(무료)이면 즉시 `paid`, 유료면 `pending_confirm`(관리자 수동 확인 필요)
   으로 분기한다 — 즉 **"결제 즉시 자동 다운로드"는 이 결제 인프라로는 원천적으로 불가능**
   하고, 최선은 "관리자가 입금 확인 승인하는 즉시 자동 다운로드"였다.

## 사용자가 방향을 바꾼 지점

관리자 화면에서 실제로 확인해보니 "기존과 다를 게 없다"는 피드백이 나왔고, 이후 사용자가
"카테고리에 prompt를 새로 만들 필요는 없는 것 같다"고 판단해 전면 되돌리기를 요청했다.
최종적으로 원한 것은 훨씬 단순했다: **별도 카테고리·별도 상품 개념 없이, 기존 "코드
미리보기" 섹션을 무료든 유료든 상관없이 항상 노출**되게만 해달라는 것.

## 최종 상태 (커밋 완료, 배포됨)

- `gospelfix` 커밋 `308cead`: prompt 카테고리 관련 코드 전부 원복 (`2fb2527`을 정확히 되돌림)
- `gospelfix.cms.api` 커밋 `341b7f1`:
  - prompt 카테고리·`handlePriceTypeChange`·"다운로드 파일" 섹션·`handleSave` 가드 전부 원복
  - "코드 미리보기" 섹션만 `priceType` 조건 없이 항상 노출되도록 남김 (핵심 변경)
  - `codePreview` state를 lazy initializer로 바꿔, 탭이 0개면 빈 탭 1개를 기본 노출
    (관리자가 "탭 추가"를 누르지 않아도 바로 입력 가능). 빈 탭 그대로 저장해도
    `products.admin.ts`의 `sanitizeCodePreview`가 label/code 둘 다 빈 항목을 걸러내
    DB에는 안 남음

## 남은 상태 / 앞으로 참고할 것

"프롬프트 파일 별도 판매"라는 원래 비즈니스 목표는 아직 정식으로 해결되지 않았다.
지금은 관리자가 아무 상품(카테고리·가격 무관)의 "코드 미리보기" 섹션에 자유롭게 텍스트
(예: 프롬프트 발췌본)를 탭으로 추가할 수 있는 선까지만 지원한다. 실제 "프롬프트 파일을
결제 받고 판매"하는 흐름(다운로드 파일 업로드, 결제-다운로드 연결)은 아직 없다 — 이 주제가
다시 나오면 이 메모리와 [[feedback_prefer_minimal_extension_over_new_concept]]을 먼저
참고할 것. `gospelfix.cms.api` 저장소는 `/Users/mac/Documents/work/GospelFix/gospelfix.cms.api`
(형제 디렉토리)에 있다.
