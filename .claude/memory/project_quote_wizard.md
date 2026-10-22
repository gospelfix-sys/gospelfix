---
name: 견적 마법사 구조 및 수정 이력
description: main/ 앱의 /quote 페이지 QuoteWizard 컴포넌트 단계 구조, 주요 수정 내역, 주의 사항
type: project
---

견적 마법사는 5단계로 구성되며 `src/components/quote/steps/` 에 위치한다.

| 파일 | 단계 | 설명 |
|------|------|------|
| Step01DesignType.tsx | STEP 01 | 서비스 유형 선택 (shopping_mall / homepage / ai_mvp / maintenance) |
| Step02ScopeDetail.tsx | STEP 02 | 세부 범위 선택 (카테고리별 라인 항목 체크) |
| Step03ScheduleStyle.tsx | STEP 03 | 일정·스타일·타겟 선택 |
| Step04ContactInfo.tsx | STEP 04 | 연락처 입력 및 Server Action 제출 |
| Step05Result.tsx | STEP 05 | 견적서 결과 (가격 표시, PDF 다운로드, 카카오 상담) |

**주요 수정 이력 (2026-07-14):**
- CookieConsentBanner를 하단→상단 이동, 배경을 gf-orange로 변경, 거부 버튼 제거
- Step02 전체 서비스에서 가격 표시 `<p>` 태그 일괄 삭제
- submitQuoteAction에서 Supabase 누락 컬럼 5개 추가 (shop_industry, shop_status, production_scope, required_features, needs_system_dev) — DB ALTER TABLE 필요
- QuoteSubmissionRow 타입에 위 5개 필드 추가
- DESIGN_CATEGORIES에 `priceFrom?: string` 추가 (쇼핑몰 1,000,000원~, 홈페이지 880,000원~)
- Step05 카테고리 헤더 우측에 `최소 {priceFrom} · 부가세 별도` 표시 추가

**Why:** 견적 흐름에서 사용자가 서비스 선택/범위 선택 단계에서 가격에 집중하지 않도록 설계 변경.

**How to apply:** 가격 관련 UI 변경 시 Step05Result만 수정 대상으로 삼는다. Step01·02에는 가격 정보 추가 금지.
