---
name: legal_dialog_migration
description: /terms, /privacy 정적 라우트 → components/legal/LegalDialogTrigger 팝업 전환 리뷰 (2026-08-04, 1차 BLOCKED)
type: project
---

**변경 개요**: `src/app/(public)/terms/page.tsx`, `.../privacy/page.tsx` 정적 라우트를 삭제하고
`src/components/legal/{LegalDialogTrigger,TermsContent,PrivacyContent,RefundContent,ContactCard}.tsx`
로 대체 — 페이지 이동 없이 `Dialog` 팝업으로 약관/개인정보처리방침/환불정책을 보여준다.
`Footer.tsx`, `SignupForm.tsx`, `CookieConsentBanner.tsx`, `WithdrawalNoticeAgreement.tsx`가
`<LegalDialogTrigger type="terms|privacy|refund" anchor?="article-N">{children}</LegalDialogTrigger>`
로 갈아탐. `RefundContent.tsx`/`ContactCard.tsx`는 git status에 안 잡힌 걸 보아 실제로는 이전
커밋(다운로드 기능 제거 PR, [[download_feature_removed]])에서 이미 만들어졌던 파일.

**1차 리뷰 결과(2026-08-04): Major 2건으로 BLOCKED**

1. `PrivacyContent.tsx`(신규)가 결제 처리 주체를 "Toss Payments"로 서술(`제1항`, `제5항` 관련
   문단) — 실제로는 CLAUDE.md에 명시된 대로 Toss Payments SDK/연동이 완전히 제거된 상태이고,
   실제 결제는 `PaymentModal.tsx`/`CartModal`이 구현하는 계좌이체(무통장입금)+카카오페이 QR
   안내 후 관리자 수동 확인 방식. 같은 PR의 `RefundContent.tsx:143`("결제는 카카오페이로
   이루어지며...")과도 정면으로 모순됨 — 같은 `LegalDialogTrigger` 팝업 그룹 안에서 두 컨텐츠가
   서로 다른 결제 수단을 주장. `[[recurring_issues]]` #25(비즈니스 모델 전환 시 일부 조항만
   갱신)와 동일 계열이지만, 이번엔 "본문 vs 정의"가 아니라 "같은 PR 내 서로 다른 파일 간 모순"
   이라는 변형.
2. `LegalDialogTrigger.tsx`의 `handleOpenChange`가 base-ui Dialog의 자동 포커스/스크롤을
   더블 `requestAnimationFrame`으로 "한 프레임 늦게 덮어쓰는" 방식으로 구현됨. 실제 확인 결과
   `@base-ui/react/floating-ui-react/utils/enqueueFocus.js`는 `requestAnimationFrame(exec)`
   **한 번**만 써서 `el.focus()`를 호출하고(이 네이티브 `.focus()`가 스크롤을 유발), 라이브러리는
   `DialogPopup.Props.initialFocus`(boolean | RefObject | 함수)라는 공식 API로 이 동작을 직접
   제어할 수 있게 열어두고 있음. 내부 스케줄링 세부사항(정확히 1프레임 뒤)에 의존하는 대신
   `initialFocus={false}` 또는 함수형 `initialFocus`를 쓰는 게 견고함.

**긍정적으로 확인된 부분**:
- `/terms`, `/privacy`, `/refund` href 잔존 0건(전수 grep) — 라우트 삭제 후 참조 정리 완료.
- `TermsContent.tsx` 제2조④(용어의 정의)가 "웹 템플릿 등 디지털 형태의 결과물 및 관련 소스코드"로
  이미 갱신되어 있음 — `[[download_feature_removed]]`가 지적했던 "정의 조항만 옛 문구 방치" Major
  이슈(#25)가 이 마이그레이션 시점에 완전히 해소됨.
- `style=`, `asChild` 0건. `DialogContent`에 `sm:max-w-2xl`만 오버라이드하고 모바일 `inset-x-4`는
  건드리지 않아 `[[shared-component-changes]]` 원칙(모바일 여백 보존)을 지킴.

**다음 세션 재검증 시**: `grep -n "Toss Payments" src/components/legal/PrivacyContent.tsx`로
문구가 실제 결제 방식(계좌이체/카카오페이)으로 수정됐는지, `LegalDialogTrigger.tsx`가
`initialFocus` prop 기반으로 리팩터링됐는지 확인할 것.

관련: [[recurring_issues]] #25, [[download_feature_removed]]
