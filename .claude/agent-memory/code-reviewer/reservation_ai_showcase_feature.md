---
name: reservation_ai_showcase_feature
description: 홈페이지 신규 "예약 통합 AI 쇼케이스"(ReservationAiShowcase, 100% 클라이언트 로컬 목업 데모) 리뷰 — 1차 BLOCKED(Major 2건: raw button 토글 3중 반복 + localStorage 복원 후 ID 카운터 리셋으로 인한 예약 ID 충돌 버그) → 2026-09-29 헤어살롱→프랜차이즈 도메인 전환 라운드에서 BLOCKED 재발(Major 3건: CHAT_RULES "가맹" 키워드 우선순위 오류, 예약변경 플로우 미완결, Chip.tsx 미재사용 raw button 회귀)
metadata:
  type: project
---

2026-08-17(추정, 세션 currentDate 기준) 홈페이지 "/"에 마케팅 카피 전환("예약 문의를 놓치지
않는 AI 시스템")과 함께 신규 인터랙티브 데모 섹션 추가. 챗봇(슬롯 채우기: 날짜/시간→이름)

- 예약 폼 + 통합 현황 피드(상태 전환+알림) + 고객 검색으로 구성, 예약 데이터는
  `localStorage`(`gospelfix_reservation_demo_v1`)에 저장. 관련 파일:
  `src/components/main/reservation-showcase/*`, `src/lib/reservationDemo/*`,
  `src/types/reservationDemo.types.ts`.

**1차 리뷰 BLOCKED 사유**:

1. **Major — raw `<button>` 토글/칩 3중 반복** (`recurring_issues` #9/#17/#22/#23/#28/#32/#33/#35와
   동일 패턴의 9번째 재발):
   - `ReservationFormPanel.tsx:62-76` 희망 서비스 선택 pill 토글
   - `ReservationFeedPanel.tsx:62-77` 예약 상태 변경 pill 토글
   - `CustomerSearchPanel.tsx:48-56` 고객 이름 quick-chip 버튼
     기존에 정확히 같은 목적(선택 가능한 pill 버튼)을 `components/ui/`(또는 도메인) 별도 파일로
     추출한 확립된 선례(`components/quote/ui/QuoteSelectCard.tsx`, `components/ui/Tab.tsx`)가
     있음에도, 새 파일 3곳에 각각 raw button + `cn()`으로 반복 작성됨. 위젯 단위 UI 중복이자
     아토믹 UI 미분리 이중 위반 — 공용 `Chip`/`PillToggle` 컴포넌트로 추출해 3곳이 재사용하도록
     요구.
2. **Major — localStorage 복원 후 ID 카운터가 매 마운트마다 리셋되어 예약 ID 충돌**:
   `ReservationAiShowcase.tsx:32` `const reservationIdRef = useRef(1)`가 컴포넌트 마운트마다
   (=페이지 새로고침마다) 항상 1부터 시작하는데, `addReservation`이 `id: \`new-${reservationIdRef.current++}\``로
ID를 발급(`:67`). 첫 방문에서 "new-1", "new-2"를 만들어 localStorage에 저장한 뒤 새로고침하면
이 값들이 `reservations`state로 복원되지만`reservationIdRef`는 다시 1부터 시작 — 새로고침
후 새 예약을 추가하면 이미 존재하는 "new-1"과 ID가 충돌한다. `ReservationFeedPanel.tsx:26`이
`key={reservation.id}`를 쓰므로 React key 중복 경고가 발생하고, `handleStatusChange`의
`r.id === id`매칭이 충돌한 두 카드 모두를 동시에 갱신해버리는 실제 기능 버그로 이어짐.
섹션 카피 자체가 "새로고침해도 유지됩니다"라고 새로고침 시나리오를 직접 홍보하고 있어
사용자가 실제로 이 버그를 밟을 가능성이 낮지 않음.
**How to apply**: ID를`useRef(1)`류 마운트별 카운터로 발급하는 코드가 `localStorage`/서버
등 마운트 간 지속되는 데이터와 함께 쓰이는 diff를 리뷰할 때는 항상 "복원된 데이터의 ID
범위와 새 카운터의 시작값이 겹치지 않는가"를 확인한다. 해결책은 복원 시
`Math.max(...restored.map(idNum)) + 1`로 카운터를 재보정하거나, 애초에
`crypto.randomUUID()`/`Date.now()` 기반 ID로 바꿔 충돌 가능성을 구조적으로 제거하는 것.

**긍정 확인 사항 (1차부터 문제 없음)**:

- SSR/hydration: `hydrated` state로 최초 렌더는 항상 시드 데이터로 그리고, `useEffect`에서만
  `localStorage`를 읽어 덮어씀 — hydration mismatch 없음. 쓰기도 `hydrated` 가드로 복원 전
  덮어쓰기 방지.
- IME(한글 조합) 처리: `ChatPanel.tsx`가 `e.nativeEvent.isComposing` 체크로 Enter 조합 확정과
  전송을 정확히 분리.
- 챗봇 슬롯 채우기 상태 머신(`idle → awaiting_datetime → awaiting_name → idle`): `idle`이
  아닐 때는 키워드 매칭 없이 다음 메시지를 그대로 슬롯 값으로 받는 설계가 의도대로 문서화되어
  있고("예약" 등 트리거 단어가 답변에 섞여도 질문이 반복되지 않음), 탭 전환 시 `ChatPanel`이
  언마운트되지 않고 `hidden` 클래스로만 숨겨져 대화/상태가 보존됨(의도적, 좋은 설계).
- 스타일 컨벤션: `style=` 없음, `cn()` 일관 사용, 쌍따옴표/세미콜론 준수, `Tab.tsx`(role="tab"/
  aria-selected 내장) 정상 재사용.
- `[animation:notification-slide-in_0.35s_ease-out]` 임의값은 `globals.css`에 실제로 정의된
  `@keyframes notification-slide-in`을 참조하는 정당한 사용(`style=` 우회 아님).
- `bg-gf-orange/15`/`border-gf-orange/30` 배지 opacity 모디파이어는 `HeroBanner.tsx`/
  `CtaBanner.tsx`에 이미 동일하게 쓰이는 기존 패턴이라 [[recurring_issues]] #20(semantic
  shadcn 토큰 opacity 드롭 버그)과 무관 — 신규 이슈 아님.
- 섹션 배경(`bg-gf-bg`) 위 카드가 자체 `bg-white` 패널이라 [[recurring_issues]] #30(카드/배경
  동일색 시인성 저하) 재발 없음.

**Minor (백로그)**:

- `CustomerSearchPanel.tsx:73` `customer.visits.map((visit, i) => <li key={i}>`가 index를
  key로 사용하는데, `deriveSearchableCustomers`가 새 visit을 배열 앞에 `unshift`하므로 순서가
  바뀜 — 시각적으로 드러나는 버그는 아니지만(정적 텍스트라 실질 영향 낮음) 관용적으로는
  `${visit.date}-${visit.service}` 같은 안정적 key 권장.
- `JSON.parse(raw) as MockReservation[]` 타입 단언이 런타임 검증 없이 이뤄짐 — 데모용이라
  실사용 리스크는 낮음.

**컴포넌트 위치**: `components/main/reservation-showcase/`는 기존 `components/main/`
컨벤션(HeroBanner/CtaBanner/StatsSection/QuoteFloatingButton 등 홈페이지 전용 블록)과
일치하고, 파일 6개를 하위 폴더로 묶은 것도 합리적 — [[component-layers]] 기준 위반 없음.

**참고**: `CtaBanner.tsx:39-45`의 회원가입 CTA가 raw `<button onClick={() => openAuthModal("signup")}>`
인데, 같은 패턴이 `NavPopover.tsx`/`LeftSidebar.tsx`/`LoginForm.tsx`에도 이미 광범위하게
존재하는 것으로 grep 확인됨 — 이번 diff로 새로 생긴 코드가 아니라 오래전부터 있던 프로젝트
전역 컨벤션(마이너 미준수)이라 이번 리뷰의 BLOCKED 사유에는 포함하지 않음. 다만 새로운
`openAuthModal` 트리거를 또 추가할 일이 생기면 이번 기회에 공용 트리거 컴포넌트로 정리하는
것을 다음 라운드 백로그로 제안.

**2026-08-17 재검증(같은 날) — 전부 해소, APPROVED**:

1. ID 충돌: `ReservationAiShowcase.tsx:38-58`에 localStorage 복원 직후 `/^new-(\d+)$/`로
   기존 id의 최댓값을 스캔해 `reservationIdRef.current = maxIssuedId + 1`로 재보정하는 코드
   추가 확인 — 새로고침 후 추가되는 예약이 더 이상 기존 항목과 충돌하지 않음.
2. raw button: `src/components/ui/Chip.tsx` 신규 생성 확인 — `Tab.tsx`와 동일하게
   `active`/색상/크기를 전부 호출부 `className`으로 위임하는 얇은 아토믹 컴포넌트
   (`ButtonHTMLAttributes` 확장, `aria-pressed` 내장). `ReservationFormPanel.tsx`/
   `ReservationFeedPanel.tsx`/`CustomerSearchPanel.tsx` 3곳 모두 `Chip`으로 교체 확인,
   `reservation-showcase/` 디렉토리 전체 grep 결과 raw `<button>` 0건.
3. Minor(index key)도 `key={`${visit.date}-${visit.service}`}`로 교체 확인.
   `Chip.tsx`는 앞으로 "선택 가능한 pill 버튼"이 필요할 때 재사용할 공용 선례로 추가됨 —
   `QuoteSelectCard.tsx`/`Tab.tsx`와 함께 다음 리뷰에서 참고할 것.

**2026-09-29 헤어살롱→프랜차이즈 도메인 전환 라운드 — 1차 BLOCKED (Major 3건)**:

배경: 헤어살롱(커트/펌/PT상담) 데모 → 프랜차이즈 가맹 상담 데모로 도메인 전환 + 브랜드
인트로/퀵리플라이 칩/데이터 기반 답변(매출·창업비용)/예약 취소 실플로우 추가.
변경 파일: `ChatPanel.tsx`, `ReservationAiShowcase.tsx`, `lib/reservationDemo/chatRules.ts`,
`lib/reservationDemo/mockData.ts`, `public/logo_gbk.webp`(신규).

1. **Major — CHAT_RULES에서 "가맹" 키워드가 배열 index 1(매우 앞)에 있어, "가맹"과 다른
   구체적 의도(창업비용/시간/취소/변경/예약)가 함께 있는 자연스러운 문장을 전부 가로챔**:
   `matchGeneralReply`는 `.find()`로 첫 매칭만 쓰는데, `RESERVATION_SERVICES`의 첫 항목이
   "가맹 상담"인 도메인 특성상 "가맹 상담 예약해주세요"/"가맹 예약 취소해주세요"/"가맹
   창업비용 알려주세요" 같은 문장이 전부 정적 FRANCHISE_INQUIRY_REPLY로 빠지고 실제 예약/
   취소/정보 플로우가 시작되지 않음. 매출/순이익 규칙만 "가맹"보다 앞에 둬 해결했을 뿐,
   나머지 규칙에는 동일 문제가 남음. **해결책**: "가맹" 규칙을 배열 맨 끝(예약/상담 규칙
   뒤)으로 옮겨 순수 폴백 역할만 하도록 조정.
2. **Major — "변경" 규칙이 `startsBookingFlow`/`startsCancelFlow` 없이 정적 응답만 반환,
   QUICK_REPLIES가 이 미완결 플로우를 유도**: "원하시는 새 시간을 알려주세요"라고 물어놓고
   `bookingStep`이 `idle`로 남아, 다음 사용자 입력이 idle 상태의 `matchGeneralReply`로
   재진입해 키워드 불일치 시 엉뚱한 FALLBACK_REPLY가 나옴. 취소 플로우(`awaiting_cancel_name`
   상태 전이 + 실제 상태 변경까지 완결)와 비대칭.
3. **Major — recurring_issues #9/#17/#22/#23/#28/#32/#33/#35/#36 패턴 재발(10번째),
   이번엔 같은 기능 디렉토리 자체의 과거 수정 이력과 직결**: 신규 QUICK_REPLIES 칩
   (`ChatPanel.tsx:178`)이 바로 위 2026-08-17 라운드에서 이 디렉토리의 raw button을
   없애기 위해 만든 `components/ui/Chip.tsx`(주석에 "빠른 검색 칩" 용도로 명시)를 쓰지
   않고 raw `<button>`으로 재작성됨.

**긍정 확인**: `awaiting_cancel_name` 상태 분기(못 찾으면 같은 단계 유지, 무한루프 없음),
`handleChatReservationCancelled`의 stale closure 우려(매 렌더 최신 클로저 + `isTyping` 가드로
실제 레이스 없음), localStorage id 재보정 로직(2026-08-17 수정 유지 확인), `followUp` 단일
optional string 설계(현재 범위에 적절한 최소 설계, 3개 이상 말풍선 필요해질 때만 배열로 확장
권장)는 모두 문제 없음.

재검증 대기 중 — 3건 수정 확인 시 APPROVED 예상.
