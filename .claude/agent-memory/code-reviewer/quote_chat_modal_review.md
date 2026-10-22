---
name: quote_chat_modal_review
description: /layer·/about "AI 견적 받아보기" 버튼을 QuoteChatModal 채팅형 모달로 전환한 신규 기능 리뷰 — 1차 BLOCKED(Major 2건) → 같은 날 즉시 수정 APPROVED
metadata:
  type: project
---

`QuoteFloatingButton.tsx`(수정)+`QuoteChatModal.tsx`/`chatFlow.ts`/`submitQuoteChatAction.ts`
(신규)로 `/quote` 5단계 마법사 대신 가벼운 채팅형 리드 수집 모달을 추가한 기능.
`components/ui/Chip.tsx` 재사용, `cn()`/더블쿼트/세미콜론 등 Prettier 컨벤션, cms.api
NOT NULL 필드 매핑(selectedCategories/selectedItems/stylePreferences/requiredFeatures=[],
estimatedTotal=0, needsSystemDev=false) 전부 정상 확인됨.

**1차 리뷰에서 발견한 Major 2건 (같은 날 즉시 수정 완료)**

1. [[recurring_issues]] #47 — 질문 옵션은 `Chip.tsx`를 정확히 재사용했지만, 결과 화면의
   "수집·이용 내용 자세히 보기" 아코디언 더보기 토글은 raw `<button>`으로 작성됨.
   `Button variant="outline"` + `h-auto w-full justify-start`로 교체해 해소.
2. [[recurring_issues]] #48 — 이 작업 세션이 직접 작성한 신규 memory 파일
   `project_quote_chat_modal_feature.md`가 "`contactName`은 받지 않고 placeholder로
   채움"이라고 서술했는데, 실제 코드는 이미 사용자 요청으로 이름 입력 필드가 추가되어
   `contactName`을 실제 입력값으로 받고 있었음(placeholder 상수 삭제됨). 코드가 아니라
   같은 작업의 신규 memory 파일 서술이 stale했던 사례 — memory 파일 문구를 코드에 맞게
   수정해 해소.

**Why:** 둘 다 "이 PR은 이미 확립된 규칙(Chip 재사용, memory 기록)을 지켰다"는 착시가
있었던 지점에서 발견됐다는 공통점이 있다 — 질문 Chip은 맞게 재사용했지만 같은 파일의
다른 보조 버튼은 아니었고, memory 파일은 작성은 했지만 중간 설계 변경을 반영하지
못했다.

**How to apply:** 앞으로 이 기능을 확장(예: 백 버튼, 답변 수정, UTM 캡처 추가)할 때는
세 파일(`chatFlow.ts`/`QuoteChatModal.tsx`/`submitQuoteChatAction.ts`)이 전부이고,
`/quote`(`QuoteWizard`/`calculateQuote`/`QuoteWizardState`)는 완전히 독립된 별개
플로우이므로 건드릴 필요 없다. UTM 파라미터는 현재 `submitQuoteChatAction.ts`가
`utmParams: {}`로 고정 — 다만 이는 이번 PR의 신규 회귀가 아니라 `QuoteWizard.tsx`의
UTM 캡처 자체가 `/quote` 페이지 URL의 querystring에서만 동작하는 기존 구조적 한계이므로
(`/layer`·`/about`에서 버튼 클릭 시 querystring이 전달되지 않음), 이 기능만의 결함으로
Major 처리하지 않고 백로그로 남겨둠.
