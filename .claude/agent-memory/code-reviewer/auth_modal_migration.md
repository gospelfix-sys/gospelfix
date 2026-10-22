---
name: auth_modal_migration
description: /login,/register 전용 페이지 → AuthModal(Recoil authModalAtom) 팝업 전환 작업의 구조와 발견된 결함 — Major 3건 모두 재검증 후 해소, 2026-07-27 APPROVED
type: project
---

**작업 배경**: 회원가입/로그인을 별도 페이지 대신 어디서든 열 수 있는 모달로 전환.
`useAuth()`에 `sendPhoneCode`/`verifyPhoneCode`/`openAuthModal`/`closeAuthModal` 추가,
`uiAtom.ts`에 `authModalAtom`(`{ view: "login"|"signup"|null, next: string }`) 추가,
`AuthProvider`가 전역으로 `<AuthModal />`을 렌더링. `src/app/login/page.tsx`,
`src/app/register/page.tsx`는 `openAuthModal()` 호출 후 `router.replace("/")`만 하는 thin
wrapper로 축소됨. `href="/login"`, `href="/register"` 하드코딩 링크는 전수 grep 확인 결과
잔존 0건 — 이 전환 자체는 깔끔하게 완료됨(memory #10 "부분 수정" 패턴 재발 없음).

`authModalAtom`은 `useAuth()` 내부에서만 `useRecoilState`로 접근하고, `AuthModal`/
`LoginForm`/`SignupForm` 등 소비 컴포넌트는 모두 `useAuth()` 훅을 통해서만 값을 읽는다
(직접 `useRecoilValue(authModalAtom)` 하는 곳 없음, grep으로 확인) — "atoms 직접 구독 금지"
컨벤션을 신규 atom에 한해서는 준수함. 단, `LeftSidebar.tsx`/`PublicHeader.tsx`는 여전히
`authUserAtom`/`authLoadingAtom`을 `useRecoilValue`로 직접 구독하는 기존 패턴이 남아있음
(이번 PR이 만든 문제는 아니고 이전부터 있던 상태 — 새로 손대는 파일이라면 지적할 것).

**발견된 결함 (2026-07-27 리뷰)**:

1. **SignupForm.tsx 휴대폰 인증 플로우 버그(Major)**: `handleSendCode()`로 인증번호를 발송한
   뒤에도 `phone` input의 `disabled` 조건이 `isPhoneVerified`뿐이라(`codeSent`가 아님),
   코드 발송 후 인증 완료 전에 사용자가 휴대폰 번호를 수정할 수 있다. 이 상태에서
   `handleVerifyCode()`를 누르면 _수정된_ 번호가 `verifyPhoneCode(phone, code)`로 전송되어
   실제로 코드가 발송된 번호와 불일치 — 서버 검증 실패로 이어짐. 수정 방법: `disabled={isPhoneVerified
|| codeSent}`로 변경하고, 번호를 바꾸고 싶으면 재전송 흐름을 타도록 유도(또는 번호 변경 시
   `codeSent`/`phoneVerificationToken`을 리셋).
2. **`--muted` 토큰이 `--background`와 동일해짐(Major, globals.css)**: `--muted: rgba(255,85,0,0.07)`
   → `#f7f5f0`(=`--background`)로 변경되면서 `Avatar` 폴백(`bg-muted`)이 `DashboardHeader`
   (`bg-background`) 위에서 배경색이 완전히 동일해져 원(circle) 채움이 시각적으로 사라짐(단,
   `after:border-border` pseudo-element 테두리는 남아 완전히 안 보이진 않음). `dashboard/layout.tsx`의
   `bg-muted/40`도 사실상 무의미해짐. 의도된 리디자인인지 실사용 화면 스크린샷 확인 필요.
3. **CSS 변수 + opacity 모디파이어 버그 부분 수정(Major)**: 자세한 내용은
   [[recurring_issues]] #20 참고. 특히 이번 PR이 새로 만든 `LoginForm.tsx`/`SignupForm.tsx`의
   에러 배너(`bg-destructive/10`)가 동일 버그에 노출되어 있어, PR이 고치려던 문제를 신규
   코드에 재도입함.
4. **AuthModal 닫힘 애니메이션 중 폼 콘텐츠 플립(Minor)**: `AuthModal/index.tsx`가
   `{authModalView === "signup" ? <SignupForm/> : <LoginForm/>}`로 분기하는데, `view`가
   `null`이 되는 순간(닫기 트리거) 삼항이 `<LoginForm/>`으로 즉시 폴백되어 회원가입 모달을
   닫을 때 100ms 페이드아웃 동안 SignupForm→LoginForm으로 내용이 바뀌는 깜빡임 가능성.
   `DialogTitle`의 sr-only 텍스트도 동일하게 순간 전환됨.
5. **휴대폰 인증 발송 엔드포인트에 클라이언트 측 스로틀만 존재(Minor/확인 필요)**:
   `sendPhoneCode`의 재전송 제한(`countdown`)은 순수 React state라 새로고침/모달 재오픈으로
   쉽게 우회 가능. `/api/auth/phone/send-code` BFF 라우트 자체는 rate limit이 없음 — 최종
   방어가 `gospelfix.cms.api` 쪽에 있다는 전제(이번 리뷰 범위 밖)가 맞는지 다음에 cms.api
   리뷰 시 확인.
6. **Input 접근성 라벨 제거(Minor)**: 기존 `/login`,`/register` 페이지는 `<label>이메일</label>`
   등 명시적 라벨을 사용했으나, 신규 `LoginForm`/`SignupForm`은 아이콘 + `placeholder`만
   사용하고 `<label>`/`aria-label`이 없음.

**긍정 확인 사항**: `button.tsx`의 `React.forwardRef<HTMLElement, ...>` 전환은 `@base-ui/react/button`의
`Button.d.ts`(`React.ForwardRefExoticComponent<... RefAttributes<HTMLElement>>`)와 정확히 일치 —
타입/런타임 모두 올바름. `passwordConfirm` 불일치 시 제출 버튼 disabled + `handleSubmit` 내부
재검증 이중 방어로 우회 불가. `phoneVerificationToken`은 서버(`verifyPhoneCode` 응답)에서만
발급되므로 클라이언트가 위조 불가 — "서버가 최종 재검증" 전제와 일치.

## 재검증 이력 (2026-07-27, 총 2라운드) — 최종 APPROVED

**1라운드 수정**: 사용자가 Major 1·3과 Major 2 일부(`input.tsx`/`dialog.tsx` content ring/
`LoginForm`/`SignupForm` 에러 배너)를 수정. 재검증 결과 `button.tsx`가 "수정 완료"로 선언된
스코프에 포함되어 있었음에도 라이트모드 상시 적용 클래스 2곳(`bg-primary/80`[default variant],
`hover:bg-secondary/80`[secondary variant])이 여전히 남아있는 것을 grep으로 발견 — **"다 고쳤다"는
자기 보고를 곧이곧대로 믿지 않고 grep으로 재검증해서 실제 누락을 잡아낸 사례**. 이때
`dialog.tsx:91`의 하드코딩 rgba(구 `--muted` 값 `#f7f5f0`)가 같은 라운드에서 `--muted`를
`#f0eee8`로 바꾸면서 즉시 동기화가 깨지는 것도 함께 발견(하드코딩 rgba 접근법의 태생적
취약점을 PR 스스로 증명한 사례).

**2라운드 수정**: `button.tsx` 잔여 2곳 + dark: 전용 3곳(`dark:bg-input/30`,
`dark:hover:bg-input/50`, `dark:hover:bg-muted/50`, 실사용 불가 코드지만 일관성 위해 함께 정리)
전부 rgba로 치환, `dialog.tsx:91`도 새 `--muted`(#f0eee8=rgb(240,238,232))에 맞춰
`rgba(240,238,232,0.5)`로 재동기화. grep 재확인 결과 `button.tsx`에 버그 패턴 0건, 값도 모두
현재 토큰과 일치 확인 → **APPROVED**.

**Why(패턴 기록)**: 코디네이터가 "N건 모두 수정했습니다"라고 보고해도, `recurring_issues.md`
#10/#12/#14/#15/#20과 동일하게 "일부만 고치고 종료"가 반복될 수 있다. 특히 이번처럼 사용자가
스스로 명시한 파일 스코프(`button.tsx`)조차 완전히 커버되지 않을 수 있으므로, 재검토 요청을
받으면 파일을 다시 Read하고 동일 grep 패턴을 재실행해 "수정 완료" 주장을 검증한 뒤 판정할 것 —
diff 요약 텍스트만 보고 승인하지 않는다.
**How to apply**: 이후 이 프로젝트에서 "N건 모두 수정" 류의 재검토 요청을 받으면, 이전 리뷰에서
사용한 것과 동일한 grep 패턴(`(bg|text|border|ring)-(primary|secondary|muted|accent|destructive|
foreground|background|card|popover|border|input|ring)(-foreground)?/[0-9]` 등)을 반드시 재실행해
0건인지 직접 확인 후 APPROVED 판정을 내린다.
