# /layer "AI 견적 받아보기" 버튼 → 채팅형 견적 모달로 전환

## Context

현재 `/layer`(에이전시 홈)와 `/about` 페이지 우측 하단의 "AI 견적 받아보기" 플로팅 버튼
(`QuoteFloatingButton`)은 단순히 `<Link href="/quote">`로 5단계 `QuoteWizard` 풀페이지로
이동시킨다. 사용자가 첨부한 스크린샷(조은마케팅 간편견적 사례)처럼, 버튼 클릭 시 **모달로
채팅형 UI**가 뜨고 AI가 질문을 던지면 사용자가 말풍선 버튼(퀵리플라이)으로 답하며 대화가
쌓이는 경험을 원한다. 마지막엔 연락처를 입력해 "상담 신청"으로 연결한다 — 사용자가
AskUserQuestion에서 확정한 바와 같이, 실시간 견적 금액을 계산하지 않고 **선택지만 수집해
상담 신청으로 연결**하는 가벼운 리드 수집 퍼널이다. 기존 `/quote` 5단계 마법사(실제 가격
계산, `calculateQuote`)는 건드리지 않고 그대로 유지한다 — 둘은 서로 다른 목적(상세 견적 계산
vs 가벼운 리드 수집)의 별개 플로우다.

`QuoteFloatingButton`은 `/layer`와 `/about` 두 페이지에서 동일하게 쓰이는 공용 컴포넌트이므로
(`.claude/rules/shared-component-changes.md` 원칙에 따라), 정의 파일 자체를 고쳐 두 페이지
모두에 동일한 채팅 모달 UX를 제공한다 — 사용자 확인 완료.

## 설계 개요

- **UI**: 기존 `components/ui/dialog.tsx`(Dialog/DialogContent)를 재사용. `DialogContent`에
  `sm:max-w-md` + 고정 높이(`h-[min(680px,85vh)]`) + `flex flex-col` 레이아웃만 얹어서 헤더
  고정 / 메시지 영역 스크롤 / 하단 영역 고정 구조를 만든다. 기본 `inset-x-4`(모바일 여백)·
  `showCloseButton`(우상단 X)은 그대로 상속되므로 공용 정의를 건드릴 필요 없음 — 호출부에서
  `sm:max-w-md`처럼 같은 유틸리티 그룹을 의도적으로 오버라이드하는 것은 기존 `CartModal`·
  `BatchPaymentModal`과 동일한 허용 패턴이다.
- **대화 상태머신**: `components/main/reservation-showcase/ChatPanel.tsx`의 메시지 리스트
  (`role: "ai" | "user"`) + 말풍선 스타일(`rounded-2xl rounded-bl-sm` / `rounded-br-sm`,
  `gf-bg`/`gf-orange` 토큰)을 그대로 차용하되, 그 챗봇의 자유 텍스트 입력 + 규칙 매칭
  (`chatRules.ts`)은 가져오지 않는다. 이번 플로우는 전부 **버튼(퀵리플라이) 선택형**이라 훨씬
  단순한 선형 단계 전이로 충분하다 — `components/ui/Chip.tsx`(이미 ChatPanel이 퀵리플라이에
  쓰는 공용 원자 컴포넌트)를 옵션 버튼으로 재사용.
- **단계 구성** (조은마케팅 스크린샷 + 기존 `QuoteWizard` 질문 내용을 참고해 재구성):
  1. `purpose` — "먼저, 홈페이지를 새로 제작하시나요?" → `새로 제작해요` / `운영 중인
     사이트를 다시 만들래요`
  2. `format` — "어떤 형태의 홈페이지를 생각하고 계세요?" → `한 페이지에 내용을 담고
     싶어요` / `여러 메뉴와 페이지가 필요해요`
  3. `pageCount` — **`format === "여러 메뉴와 페이지"`일 때만** 분기 진입 — "필요한 페이지는
     어느 정도로 예상하시나요?" → `5페이지 이하` / `6~10페이지` / `11~20페이지` /
     `21페이지 이상` / `아직 잘 모르겠어요`
  4. `showcase` — "홈페이지를 통해 가장 보여주고 싶은 것은 무엇인가요?" → `회사 또는 브랜드
     소개` / `서비스 소개` / `제품 소개` / `프로젝트와 사례` / `특정 사업이나 프로젝트 홍보` /
     `아직 잘 모르겠어요`
  5. `contact` — AI 말풍선 안에 이름/연락처 입력창 + "상담 신청하기" 버튼을 인라인 폼으로
     렌더링 (버튼 선택형이 아닌 유일한 단계). 두 값 모두 비어있지 않아야 제출 버튼 활성화 —
     전화번호 자동 포맷팅(`Step04ContactInfo.tsx`의 `formatPhoneNumber`)은 가볍게 생략하고
     단순 필수값 검사만 적용 (이 모달은 상세 견적이 아닌 가벼운 리드 수집이 목적).
  6. `done` — 제출 성공 시 AI 말풍선 "감사합니다, {이름}님! 남겨주신 연락처로 1영업일 이내
     담당 매니저가 연락드릴게요 🙌"로 마무리, 입력 영역 비활성화.
- **제출 처리**: 새 Server Action `submitQuoteChatAction.ts`가 기존 `/api/quotes` Route
  Handler(`src/app/api/quotes/route.ts`)를 그대로 호출한다 — cms.api
  `POST /api/v1/quotes`는 `contactName`/`contactValue`만 필수이고 나머지는 전부
  nullable이므로(`gospelfix.cms.api/src/app/api/v1/quotes/route.ts` 확인 완료), 채팅에서
  모은 답변들을 사람이 읽기 좋은 텍스트로 합쳐 `projectSummary`에 담고 나머지 필드는
  `null`/빈 배열로 채운다. **cms.api 저장소는 수정하지 않는다** — 기존 엔드포인트 스키마
  범위 내에서 그대로 쓸 수 있음을 확인했다.
  - `submitQuoteAction.ts`(기존 5단계 마법사용)는 `QuoteWizardState` 전체를 매핑하는 반면,
    채팅 플로우는 애초에 그 타입과 데이터 모양이 다르므로(페이지 수 구간, 보여주고 싶은 것
    등은 `LineItemId` 체계와 매핑되지 않음) 별도의 좁은 인터페이스를 가진 액션을 새로
    만든다 — 억지로 `QuoteWizardState`에 끼워 맞추지 않음.

## 변경/추가 파일

1. **신규** `src/components/quote/chat/chatFlow.ts`
   - 단계 ID 타입(`ChatStepId`), 각 단계의 질문 문구 + 옵션 라벨 배열을 데이터로 정의.
   - `pageCount` 분기를 고려한 "다음 단계 계산" 순수 함수 하나 포함 (`getNextStep(current,
     formatAnswer)` 형태).

2. **신규** `src/components/quote/chat/QuoteChatModal.tsx`
   - `"use client"`. Props: `{ open: boolean; onOpenChange: (open: boolean) => void }`.
   - `Dialog`/`DialogContent`/`DialogTitle` (`components/ui/dialog.tsx`) + `Chip`
     (`components/ui/Chip.tsx`) + `Input`, `Button`(shadcn) 재사용.
   - 메시지 턴 배열(`{id, role: "ai"|"user", text}[]`) state + 현재 `step` state로 선형
     진행. 옵션 클릭 시: 사용자 턴 추가 → 답변 기록 → `chatFlow.ts`의 다음 단계 계산 →
     다음 AI 질문 턴 추가. `contact` 단계에서만 이름/연락처 로컬 input state + 제출 버튼.
   - 제출 시 `submitQuoteChatAction` 호출, 성공 시 `done` 메시지 추가 + `sonner`
     `toast.success`, 실패 시 `toast.error` (CartModal과 동일한 에러 처리 패턴).
   - 메시지 영역은 `overflow-y-auto` + 메시지 추가 시 자동 스크롤(`useRef` + `scrollIntoView`
     또는 `scrollTop = scrollHeight`, `ChatPanel.tsx`에는 없던 부분이라 새로 작은 `useEffect`
     추가).
   - 모달이 닫힐 때(`onOpenChange(false)`) 상태를 초기값으로 리셋해, 다시 열면 처음부터
     시작하도록 한다 (세션 지속은 요구사항에 없으므로 `sessionStorage` 등 추가하지 않음).

3. **신규** `src/app/actions/submitQuoteChatAction.ts`
   - `"use server"`. `submitQuoteAction.ts`와 동일한 `headers()` 기반 IP/UA/Referer 캡처
     패턴을 그대로 따르되, 입력 타입은 채팅 전용 좁은 인터페이스(`ChatQuoteAnswers`: 목적/
     형태/페이지수(optional)/보여주고 싶은 것/이름/연락처).
   - 답변들을 줄바꿈으로 합쳐 `projectSummary`로 구성, 나머지 `/api/quotes`가 받는 필드는
     `null`/`[]`/`{}`로 채워 `serverFetch("/api/quotes", { method: "POST", body:
     JSON.stringify(...) })` 호출 (기존 Route Handler 그대로 재사용 — 신규 API 라우트 불필요).

4. **수정** `src/components/main/QuoteFloatingButton.tsx`
   - 최상위 `<Link href="/quote">` → `<button type="button" onClick={() =>
     setChatOpen(true)}>`로 교체 (동일한 시각 스타일 className 유지, 버튼 기본 appearance는
     프로젝트의 Tailwind preflight로 이미 리셋되어 있어 추가 reset 클래스 불필요).
   - 컴포넌트 내부에 `const [chatOpen, setChatOpen] = useState(false)` 추가, 최상단
     `<QuoteChatModal open={chatOpen} onOpenChange={setChatOpen} />` 렌더.
   - "오늘 그만보기"/"닫기" 버튼 로직(localStorage dismiss)은 그대로 유지 — 이건 플로팅
     버튼 자체의 노출 여부 제어이지 모달과 무관.
   - 이 파일은 `/layer`·`/about` 양쪽에서 import되므로 변경이 두 페이지 모두에 자동
     반영된다 (사용자 확인 완료).

## 손대지 않는 것

- `/quote` 라우트와 `QuoteWizard`/`Step01~05`/`calculateQuote` — 그대로 유지, 이번 변경과
  완전히 독립.
- `gospelfix.cms.api` 저장소 — 기존 `/api/v1/quotes` 스키마로 충분해 수정 불필요.
- `components/main/reservation-showcase/ChatPanel.tsx` — 디자인 패턴(말풍선 클래스)만
  참고해 새 파일에 다시 작성하고, 이 파일 자체나 `chatRules.ts`는 import/수정하지 않는다
  (서로 다른 도메인 — 예약 데모 vs 견적 리드 수집).

## 검증

1. `yarn dev` 실행 후 브라우저로 `/layer` 접속, 우측 하단 "AI 견적 받아보기" 클릭 →
   모달이 뜨는지, 첫 AI 질문이 바로 보이는지 확인.
2. 각 분기 끝까지 클릭으로 진행: (a) `한 페이지` 선택 시 `pageCount` 단계를 건너뛰고
   바로 `showcase`로 넘어가는지, (b) `여러 메뉴` 선택 시 `pageCount` 단계가 추가로
   나타나는지 확인.
3. `contact` 단계에서 이름/연락처 비워둔 채 제출 버튼이 비활성화 상태인지, 값을 채우면
   활성화되는지 확인 후 제출 → 네트워크 탭에서 `POST /api/quotes` 요청과 200(201) 응답
   확인, 완료 메시지 말풍선 노출 확인.
4. 모달을 닫고 버튼을 다시 클릭해 처음 단계부터 새로 시작되는지 확인.
5. `/about` 페이지에서도 동일한 버튼/모달이 똑같이 동작하는지 확인.
6. 모바일 뷰포트(또는 Chrome DevTools 모바일 에뮬레이션)에서 모달이 화면 여백
   `inset-x-4` 기준으로 잘리지 않고 스크린샷과 유사한 비율로 보이는지 확인.
7. `yarn lint`로 타입/린트 에러 없는지 확인.
