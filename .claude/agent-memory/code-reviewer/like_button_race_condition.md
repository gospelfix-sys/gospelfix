---
name: like_button_race_condition
description: 상품 상세 좋아요(하트) 버튼 기능 리뷰 경위 — LikeButton.tsx 마운트-fetch/클릭-toggle 레이스 컨디션 및 PurchaseOptionsPanel 위젯 중복
type: project
---

2026-07-31, 상품 상세페이지 좋아요(하트) 버튼 기능 리뷰 (`src/components/products/LikeButton.tsx`
신규, `src/app/api/products/like/route.ts` 신규, `PurchaseOptionsPanel.tsx`/`product.types.ts` 수정).

## 구조 자체는 기존 컨벤션을 잘 따름

- 컴포넌트 위치: `components/products/LikeButton.tsx` — [[component-layers]] 기준 features
  계층(도메인 액션에 결합) 정확히 준수.
- `route.ts`는 `src/app/api/reviews/route.ts`와 동일한 패턴(GET은 공개, 실패 시 안전한 기본값 반환;
  POST는 `getAccessToken()` 없으면 401, `CmsApiError`면 status 그대로 전달) — 일관성 양호.
- 스타일 규칙(인라인 style 금지, cn() 사용, 토큰 재사용, 쌍따옴표/세미콜론) 위반 없음.
- `BuyButton.tsx`와 높이(h-14) 정렬되어 flex 레이아웃 깨짐 없음.

## 발견된 Major 2건

1. **마운트 시 자동 재조회(useEffect GET) vs 클릭 낙관적 업데이트(POST) 순서 역전 레이스** — GET의
   `.then`이 `cancelled`(언마운트 전용) 가드만 가지고 있어, 클릭 이전에 시작된 GET이 클릭 이후
   POST보다 늦게 resolve되면 최신 상태를 stale 값으로 덮어씀. 자세한 원인/해결책은
   [[recurring_issues]] #26 참고.
2. **PurchaseOptionsPanel의 3개 분기(무료/문의전용/일반) 각각에 동일한 `flex gap-3` 래퍼 +
   LikeButton 조합이 반복** — 위젯 단위 UI 중복(2곳 이상) 스타일 규칙 위반. 자세한 내용은
   [[recurring_issues]] #27 참고.

## 판정 (2026-07-31, 1차)

BLOCKED — Major 2건 존재. Critical 없음(보안/데이터 손실 이슈 없음). 사용자가 아직 실제 로그인
세션으로 토글 성공 케이스를 브라우저에서 검증하지 않았다고 밝혔으므로, 위 2건 수정과 함께 실제
토글 E2E 확인도 권고.

이 메모리는 다음 재검증 라운드에서 수정 여부 확인 후 상태를 갱신할 것.
