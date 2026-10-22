---
name: project_quote_chat_modal_feature
description: /layer, /about 공용 "AI 견적 받아보기" 버튼을 /quote 5단계 마법사 대신 채팅형 모달로 전환한 신규 기능 — 구현 완료 (2026-10-13)
metadata:
  type: project
---

`QuoteFloatingButton`(components/main/QuoteFloatingButton.tsx, `/layer`·`/about` 공용)의
"AI 견적 받아보기" 버튼이 `/quote` 5단계 마법사로 이동하는 대신, 같은 페이지 위에 뜨는
채팅형 모달(`QuoteChatModal`)을 열도록 전환됐다. 경쟁사 "조은마케팅 간편견적" 챗봇
스크린샷을 참고해 단계별로 만들어졌다.

**구성 파일**
- `src/components/quote/chat/chatFlow.ts` — 단계 ID(`ChatStepId`)·질문/옵션 데이터·
  `getNextStep()` 순수 함수. `format`이 "여러 메뉴와 페이지"일 때만 `pageCount` 단계를
  거치는 분기 포함.
- `src/components/quote/chat/QuoteChatModal.tsx` — 메인 UI. 환영 화면 → 버튼형 질문
  5개(purpose/format/[pageCount]/showcase/features, features만 다중 선택) → 결과 화면
  (전화번호 입력 + 개인정보 동의 체크박스 + 아코디언 + 답변 요약 박스 + 제출 버튼) → 완료
  화면.
- `src/app/actions/submitQuoteChatAction.ts` — Server Action, 기존 `/api/quotes` Route
  Handler(→ cms.api `POST /api/v1/quotes`)를 재사용. 처음엔 `contactName`을 받지 않고
  `"AI 챗봇 간편견적 (이름 미입력)"` placeholder로 채웠으나, 이후 사용자 요청으로 결과
  화면에 "이름" 입력 필드를 추가해 `ChatQuoteAnswers.contactName`을 실제 사용자 입력값으로
  받도록 변경됨 — placeholder 상수는 제거됨.

**이 기능은 기존 `/quote` 5단계 마법사와 완전히 독립적이다** — 실시간 가격 계산을 하지
않고, 선택지만 모아 리드(lead)로 저장 후 담당 매니저가 후속 연락하는 가벼운 상담 신청
퍼널이다. `/quote`의 `calculateQuote`/`QuoteWizardState`는 건드리지 않음.

**명시적으로 구현하지 않은 것**: SMS 발송(이 프로젝트엔 범용 SMS 인프라가 없음 — 카카오
알림톡용 Solapi만 존재하고 이 기능과 무관), 실시간 가격 계산. 둘 다 사용자가
AskUserQuestion으로 범위 밖임을 명시적으로 확인함.

**Why:** 경쟁사 UX를 참고하되 이 프로젝트 실정(가격 비공개 정책, SMS 미구축, 실제
개인정보처리방침 내용)에 맞게 축소·각색해서 구현했다 — 레퍼런스 스크린샷을 그대로
베끼지 않은 이유는 [[feedback_dont_copy_reference_ui_labeling_scheme]] 참고.

**How to apply:** 이 기능을 다시 수정/확장할 때는 위 3개 파일이 전부다(별도 route나
DB 테이블 신설 없음). `/layer`·`/about` 양쪽에서 브라우저로 전체 플로우(페이지 수 분기
포함)를 직접 테스트했고, cms.api 로그에서 `POST /api/v1/quotes 201`로 실제 저장까지
확인 완료.
