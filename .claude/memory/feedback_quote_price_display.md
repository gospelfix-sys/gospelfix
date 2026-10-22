---
name: 견적 마법사 가격 노출 위치
description: 견적 마법사에서 가격은 Step05 견적서 단계에서만 표시 — Step01(서비스 유형 선택), Step02(세부범위 선택)에는 가격 노출 금지
type: feedback
---

가격 정보는 Step05 Result(견적서) 단계에서만 표시한다.

**Why:** 서비스 유형 선택(Step01)이나 세부 범위 선택(Step02) 단계에서 가격을 노출하면 사용자 혼란을 유발한다는 사용자 피드백.

**How to apply:**
- Step01DesignType, Step02ScopeDetail에 가격 관련 텍스트(`priceFrom`, 단가, formatKRW 등) 표시 금지
- 최소 시작가(`priceFrom`) 및 개별 라인 항목 가격은 Step05Result 내 카테고리 카드 헤더에만 표시
- `DESIGN_CATEGORIES`의 `priceFrom` 값: 쇼핑몰 `"1,000,000원~"`, 홈페이지 `"880,000원~"` (ai_mvp, maintenance는 미설정)
- Step05에서 표시 형식: `최소 {priceFrom} · 부가세 별도` (카테고리 헤더 우측)
