# 예약 통합 AI — "가스펄픽스 단독 기능" 쇼케이스 + 포지셔닝 카피 교체

## Context

사용자가 예약업 소상공인 인사이트 문서(`reservation-insight.md`)를 근거로, GospelFix를 "AI 홈페이지 파는 곳"이 아니라 "예약 문의를 놓치지 않는 AI 시스템을 파는 곳"으로 재포지셔닝하고 싶어한다. 인사이트 문서가 제시한 4단계(①채널 통합 ②실시간 상태 ③자동 알림 ④고객 검색)를 실제로 조사한 결과, 완전한 프로덕션 시스템(실제 카카오톡 채널/네이버 톡톡 연동, Supabase DB, 알림톡 자동발송)은 이 저장소(gospelfix, 마케팅 사이트)가 아니라 별도 저장소 `gospelfix.cms.api`(Supabase 직접 접근 권한을 가진 관리자 백엔드)에서만 가능하다는 게 확인됐다.

사용자와 합의된 스코프:
1. **단계적으로 둘 다** — 이번 세션은 이 저장소에 실제로 클릭/입력이 동작하는 인터랙티브 데모 위젯(Phase A)만 구현. 실제 운영 가능한 관리자 백엔드(Phase B)는 `gospelfix.cms.api`의 별도 세션에서 진행할 수 있도록 스펙만 문서화.
2. **채널은 자체 채널로 축소** — 카카오톡 채널/네이버 톡톡 같은 3rd-party API 연동은 사업자 승인이 별도로 필요해 이번 범위 밖. "채널 통합"은 GospelFix 자체 AI 챗봇 + 예약 문의 폼 2개를 하나의 피드로 모으는 것으로 시뮬레이션.
3. Phase A는 100% 클라이언트 로컬 상태(`useState`) 기반 규칙 매칭 시뮬레이션 — 실제 LLM 호출 없음.
4. 채팅 입력 UI는 "Paseo"(코딩 에이전트 오케스트레이션 툴)의 Agent Input Area UX를 **디자인 참고만** 한다 — 반응형 입력 밀도 조정, 탭 전환에도 입력 내용 유지, 전송 중 실시간 상태 표시를 이 프로젝트 방식(순수 CSS `hidden` 토글, `useState`)으로 재해석.
5. 카피 교체는 전 업종 대상 "대표 카피"만 — 이사·카페·병원·학원 등 업종별 AUDIENCE 카드는 이미 각자에 맞는 카피가 있어 그대로 둔다.

---

## Part 1 — 포지셔닝 카피 교체 (대표 카피만)

`❌ "AI 홈페이지를 팝니다" → ✅ "예약 문의를 놓치지 않는 AI 시스템을 팝니다"` 톤으로, 전 업종에 공통 노출되는 4곳만 교체한다.

### 1. `src/app/(public)/page.tsx` — 홈 히어로 배지 (L69)
```diff
- GOSPELFIX — 업종별 AI 홈페이지 & 24시간 자동응대
+ GOSPELFIX — 예약 문의를 놓치지 않는 AI 시스템
```

### 2. `src/components/main/HeroBanner.tsx` — 슬라이드 1 (L17-20)
```diff
- headline: "업종별 AI 홈페이지",
- headlineAccent: "AI 챗봇",
- headlineSuffix: " 탑재",
- desc: "뷰티·이사·카페 등 업종에 맞는 AI 홈페이지.\n24시간 자동응대 AI 챗봇까지 탑재되어 오늘 구매하면 내일 오픈합니다.",
+ headline: "예약 문의를 놓치지 않는",
+ headlineAccent: "AI 시스템",
+ headlineSuffix: "을 팝니다",
+ desc: "밤 11시에 온 예약 문의도 AI 챗봇이 즉시 응대합니다.\n뷰티·이사·카페 등 업종에 맞게, 오늘 구매하면 내일 바로 오픈합니다.",
```
(CTA/링크/stats는 그대로 유지 — `/mall?category=landing`)

### 3. `src/components/main/CtaBanner.tsx` — 하단 CTA 서브카피 (L32-34)
```diff
- 업종에 맞는 AI 홈페이지, 오늘 구매하면 내일 오픈.
- <br />
- AI 챗봇 자동응대까지 포함해 바로 사용하세요.
+ 예약 문의를 놓치지 않는 AI 시스템, 오늘 구매하면 내일 오픈.
+ <br />
+ 밤 11시에 와도 AI 챗봇이 즉시 응대합니다.
```

### 4. `src/app/(public)/about/page.tsx` — 히어로 헤드라인/서브카피 (L84-93)
```diff
- 당신의 업종에 맞는 AI 홈페이지,
- <br />
- 오늘 구매하면 내일 오픈.
+ 예약 문의를 놓치지 않는
+ <br />
+ AI 시스템을 팝니다.
```
서브카피(L88-94)는 "아임웹·카페24..." 문장 안의 `업종에 맞는 AI 홈페이지`/`24시간 자동응대 챗봇` 강조 문구를 유지하되 문장 서두만 예약 문의 프레이밍으로 다듬는다(예: "밤 11시 예약 문의도 놓치지 않는" 도입구 추가). `metadata.description`(L8)은 About 페이지 성격상 그대로 둬도 무방 — 필요시 구현 단계에서 함께 조정.

> `mall/page.tsx`, `PRODUCT_FORMAT_LABELS`, AUDIENCE 카드는 업종별/카테고리별 범용 문구라 이번 범위에서 **제외**.

---

## Part 2 — 예약 통합 AI 쇼케이스 위젯 (Phase A, 이번 세션 구현)

### 배치 위치
`src/app/(public)/page.tsx`의 **AUDIENCE 섹션(L150 `</section>`)과 포트폴리오 섹션(L152 시작) 사이**에 새 섹션 삽입. AUDIENCE 첫 카드가 이미 "밤 11시 예약 문의" 페인포인트를 언급하므로 바로 이어서 "그 문제를 이렇게 해결합니다"로 자연스럽게 연결된다.

섹션 카피:
- 배지: `가스펄픽스 단독 기능`
- 헤드라인: `흩어진 예약을, 하나의 화면으로.` (`하나의 화면으로`는 `text-gf-orange` 강조)
- 서브카피: `카카오톡으로 오든, 홈페이지 폼으로 오든 — 모든 예약이 실시간으로 한 곳에 모입니다. 아래에서 직접 눌러보세요.`

### 파일 구조 (신규)
```
src/components/main/reservation-showcase/
├── ReservationAiShowcase.tsx     # 섹션 진입점 (named export) — page.tsx가 import
├── ChatPanel.tsx                 # 챗봇 채널 — Paseo 참고 입력 UI
├── ReservationFormPanel.tsx      # 예약 문의 폼 채널
├── ReservationFeedPanel.tsx      # 통합 피드 + 상태 토글(인라인)
├── NotificationPreview.tsx       # 확정 시 슬라이드인 문자 알림 미리보기
└── CustomerSearchPanel.tsx       # 고객 이름 검색 + 히스토리 타임라인

src/types/reservationDemo.types.ts   # ReservationChannel/Status, MockReservation, MockCustomer, ChatMessage
src/lib/reservationDemo/mockData.ts  # MOCK_RESERVATIONS(5~6건, chatbot/form 혼합), MOCK_CUSTOMERS(2~3명)
src/lib/reservationDemo/chatRules.ts # matchChatReply(): 키워드 배열 → 고정 응답, quote/constants.ts 컨벤션과 동일 위치
```
`quote/` 도메인(`steps/`+`lib/quote/`+`types/quote.types.ts` 분리 구조)을 그대로 따르는 선례 — 5개 파일이 상태를 공유하므로 `HeroBanner` 단일 파일 패턴보다 이쪽이 맞다.

### 상태 흐름 (모두 `useState`, Recoil 불필요 — 단일 컴포넌트 트리 내부 상태)
- `ReservationAiShowcase`가 `reservations: MockReservation[]`(초기값 `MOCK_RESERVATIONS`)와 `activeNotification` 상태를 소유. `ChatPanel`/`ReservationFormPanel`이 새 예약을 추가하는 콜백을 props로 받는다.
- **채널 통합 시연**: `ChatPanel`에서 사용자가 "예약"이 포함된 문장을 보내면 `matchChatReply()`가 응답을 주는 동시에, 새 `MockReservation`(`channel: "chatbot"`, `status: "pending"`)이 우측 피드에 실시간 추가된다. 폼 제출도 동일하게 `channel: "form"`으로 추가 — 두 입구가 한 피드로 모이는 걸 눈으로 보여주는 핵심 장치.
- **실시간 상태 시연**: `ReservationFeedPanel`의 각 카드에 4-상태(대기/확정/변경/취소) 세그먼트 버튼(`DevicePreviewFrame`의 `deviceBtn(active)` cn() 패턴을 4-상태로 일반화) — 클릭 시 즉시 `status` 변경.
- **자동 알림 시연**: 상태가 `"confirmed"`로 바뀌는 순간 `activeNotification` 세팅 → `NotificationPreview`가 슬라이드인 → `CodePreviewSection`의 `copied` 타이머(`useEffect`+`setTimeout`+cleanup)와 동일한 패턴으로 4초 뒤 자동 소멸. `globals.css`에 새 `@keyframes notification-slide-in` 추가(기존 `quote-model-rise-in`/`hero-timer` 옆에 — 새 keyframe **추가**는 공용 스타일 수정 규칙과 무관).
- **고객 검색 시연**: `CustomerSearchPanel`이 `query` state로 `MOCK_CUSTOMERS.filter(c => c.name.includes(query))`, 빠른 검색 칩(이름 3개 버튼)과 함께 제공. 결과 없을 때 "김민지, 박서연, 이하늘로 검색해보세요" 안내.

### 레이아웃
- `grid grid-cols-1 lg:grid-cols-2 gap-6` — 데스크톱 좌(입력 채널)/우(통합 대시보드), 모바일 세로 스택.
- 좌/우 각각 기존 `Tab`(`role="tablist"`) 컴포넌트로 내부 전환(좌: 챗봇/폼, 우: 통합현황/고객검색). **양쪽 탭 콘텐츠 모두 항상 마운트, `cn(active ? "block" : "hidden")`으로 가시성만 토글** — 탭을 오가도 입력 중이던 채팅 초안/폼 값이 사라지지 않음(Paseo의 "초안 유지" UX를 Recoil 없이 순수 CSS로 재해석).
- `ChatPanel`: 메시지 리스트(`aria-live="polite"`) + 하단 입력 바. `Input`+`Button`(기존 컴포넌트 재사용) + `onKeyDown`에서 Enter 전송. 전송 직후 `isTyping=true`→700~900ms 후 응답 push(`animate-bounce` 점 3개로 "AI가 답변을 준비 중" 표시). 음성입력/이미지첨부는 제외.
- 아이콘 전용 버튼은 전부 `aria-label` 필수(`DevicePreviewFrame` 컨벤션), 상태 버튼은 `aria-pressed`.

### 재사용할 기존 코드
- `src/components/ui/Tab.tsx`, `src/components/ui/button.tsx`, `src/components/ui/input.tsx`, base-ui `Select`
- `cn()` (`@/lib/utils`)
- 상태 토글 시각 패턴: `src/components/products/DevicePreviewFrame.tsx`의 `deviceBtn(active)`
- 타이머 자동소멸 패턴: `src/components/products/CodePreviewSection.tsx`의 `copied`/`useEffect`
- 섹션 배지/헤드라인 톤: `src/components/main/CtaBanner.tsx`, `StatsSection.tsx`

---

## Part 3 — Phase B 스펙 (별도 저장소 `gospelfix.cms.api`, 이번 세션에서 구현하지 않음)

실제 운영 가능한 예약 관리 시스템은 `gospelfix.cms.api`(포트 3001, Supabase 직접 접근)에서 **기존 `orders` 도메인 패턴을 그대로 재사용**해 구축한다. 별도 세션에서 진행할 것을 권장(그 저장소는 자체 CLAUDE.md/전용 서브에이전트를 갖고 있음).

- **DB**: 신규 `moda_reservations` 테이블(고객명/연락처/channel/status enum/희망일시/메모) — 이 저장소 규칙상 스키마 작업은 `supabase-db-architect` 서브에이전트에게 위임해야 함.
- **쿼리 레이어**: `src/libs/supabase/queries/reservations.admin.ts` — `orders.admin.ts`의 2단계 조회(FK join 대신 별도 조회+Map 매핑) + 검색/날짜 필터 + `.range()` 페이지네이션 패턴을 그대로 복제.
- **관리자 UI**: `src/app/(admin)/reservations/page.tsx` + `ReservationsTable.tsx` + `ReservationsFilters.tsx` — `orders/` 3종 세트를 복제. `Sidebar/index.tsx`의 `NAV_ITEMS`에 한 줄 추가.
- **고객 검색+히스토리**: 현재 `users` 도메인에도 없는 완전 신규 기능. `moda_orders`+`gospelfix_quote_submissions`+`moda_reservations`를 이름으로 교차 조회해 병합하는 새 쿼리 함수 필요.
- **자동 알림톡**: Solapi 인프라(`phone-verification.ts`)는 이미 있으나 "인증번호 1건" 전용 템플릿뿐 — "예약 확정/변경/취소" 안내용 **신규 알림톡 템플릿을 카카오 비즈니스 채널에서 별도 심사(통상 1~3영업일)** 받아야 함. 이건 코드로 해결 불가한 사업자 승인 절차이므로 사용자가 먼저 진행해야 한다.
- **실시간 상태**: 이 저장소에 Realtime/WebSocket 인프라가 전무 — Supabase Realtime 채널 구독을 신규 도입하거나, 당장은 기존 `orders`처럼 `router.refresh()` 수동 갱신으로 MVP를 내고 realtime은 2차 개선으로 분리하는 게 현실적.
- **외부 채널(카카오톡 채널 상담/네이버 톡톡) 실연동**: 각 플랫폼 공식 비즈니스 API 승인이 있어야 코드 작업이 의미가 있음 — 이번 스펙에서는 제외, 승인 확보 시 별도 작업으로 확장.

---

## Verification

**Part 1 (카피)**: `yarn lint` 통과 확인, `yarn dev` 후 `/`, `/about` 육안 확인.

**Part 2 (위젯)**: `yarn dev` 후 `localhost:3000/`에서
- [ ] 챗봇 탭 "예약하고 싶어요" 입력→Enter→"입력 중" 인디케이터→AI 응답→우측 피드에 챗봇 배지 카드 슬라이드인
- [ ] "가격"/"몇시"/"취소"/무관한 문장(폴백) 각각 테스트
- [ ] 챗봇 탭에 텍스트 입력한 채로 폼 탭 전환 후 되돌아왔을 때 입력 유지되는지
- [ ] 폼 제출 → 우측 피드에 폼 배지 카드 추가
- [ ] 카드 상태 버튼(대기/확정/변경/취소) 클릭 → 즉시 반영, "확정" 클릭 시 알림 버블 슬라이드인 후 ~4초 뒤 자동 소멸
- [ ] 고객 검색 탭에서 "김민지" 입력 및 빠른 검색 칩 클릭, 존재하지 않는 이름 시 안내 문구
- [ ] 390px 폭에서 좌/우 세로 스택 확인, 키보드 Tab 이동으로 전체 인터랙션 가능한지
- [ ] `yarn lint`, `yarn tsc --noEmit` 통과

**Part 3**: 이번 세션에서는 구현하지 않음 — 스펙 문서를 사용자에게 전달, 필요 시 `gospelfix.cms.api` 저장소에서 별도 세션 시작.
