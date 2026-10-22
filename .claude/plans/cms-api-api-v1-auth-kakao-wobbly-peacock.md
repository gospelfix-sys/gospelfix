# 카카오 로그인 연동 (main 앱)

## Context

cms.api 저장소에 `POST /api/v1/auth/kakao`가 이미 구현·배포되어 있다 (2026-09-05,
`.claude/memory/project_oauth_signup_benefits_requirement.md` 및
`.claude/plans/serene-growing-crayon.md` 참고). 이 엔드포인트는 **"카카오 인가 code를
검증하고 Supabase 세션을 발급"**하는 역할만 하며, 계획 문서에 명시된 대로 **"카카오 인가
URL 생성과 CSRF `state` 검증은 main(이 저장소)의 책임"**이다. 즉 이번 작업의 범위는
cms.api를 호출하는 쪽 절반 — 카카오 인가 URL로 리다이렉트하고, 콜백을 받아 code를
교환하고, 세션 쿠키를 심는 전체 왕복 흐름을 이 저장소에 새로 구현하는 것이다.

기존 코드 조사 결과, 뼈대는 이미 일부 준비돼 있다: `OAuthProvider = "google" | "kakao"`
타입과 `useAuth().signInWithOAuth()` 스텁(`throw new Error(...)`)이 이미 존재한다. 이번
작업은 이 스텁을 실제 리다이렉트 흐름으로 채우고, cms.api 계약(`{ code, redirectUri,
referralCode? } → { user, session, isNewUser }`)에 맞춰 새 API 라우트 2개를 추가하고,
로그인/회원가입 모달에 버튼 UI를 추가하는 것이다.

기존 이메일 로그인과 동일하게 `gf_at`/`gf_rt`/`gf_exp` httpOnly 쿠키 체계를 그대로
재사용하므로, `authUserAtom`/`isAuthenticatedSelector` 등 상태 관리 쪽은 **변경이 필요
없다** — provider와 무관하게 동일한 세션 형태이기 때문이다.

**사용자와 확정한 사항**:
- 카카오 버튼은 로그인 폼과 회원가입 폼 양쪽에 모두 추가한다 (cms.api가 신규/기존 사용자를
  자동 판별하므로 진입점 구분이 필요 없다).
- 버튼 모서리는 참고 이미지의 알약형(`rounded-full`) 대신 `docs/design.md`의 "모달 안
  기능성 버튼은 `rounded-lg`" 규칙을 따른다 — 기존 "로그인"/"회원가입" 제출 버튼과 동일한
  모서리로 통일한다. 흰 배경 + 검은 보더 + 말풍선 아이콘 + 텍스트 구성은 참고 이미지 그대로
  유지한다.

## 전체 흐름

```
[로그인/회원가입 모달의 카카오 버튼 클릭]
  → signInWithOAuth("kakao")가 현재 authModal(next/view/referralCode)을 쿼리로 실어
    window.location.href = "/api/auth/kakao?next=...&view=...&referralCode=..." 로 이동
  → GET /api/auth/kakao (신규)
      - CSRF state(nonce) 생성, { state, next, view, referralCode }를 httpOnly 쿠키(5분)에 저장
      - https://kauth.kakao.com/oauth/authorize?client_id=...&redirect_uri=...&state=...
        &scope=account_email 로 302 리다이렉트
  → 카카오 로그인/동의 화면 → 사용자 승인
  → GET /api/auth/kakao/callback (신규, Kakao 콘솔에 등록된 KAKAO_REDIRECT_URI)
      - state 쿠키 검증(불일치/누락 시 즉시 실패 처리, 쿠키는 항상 삭제)
      - cmsApiFetch("/api/v1/auth/kakao", { code, redirectUri, referralCode })
      - 성공 시 setSessionCookies(...) 후 저장해둔 next로 리다이렉트
      - 실패 시 /login?next=...&view=...&kakaoError=<code> 로 리다이렉트
  → src/app/login/page.tsx의 LoginRedirect가 kakaoError/view를 읽어 openAuthModal(view, next,
    undefined, errorMessage) 호출 → 로그인/회원가입 폼에 기존 에러 박스로 메시지 표시
```

## 배경 조사에서 확인한 재사용 포인트

- `cmsApiFetch()` (`src/lib/cmsApi/client.ts`) — cms.api 호출은 route.ts 안에서만, 기존
  `login/route.ts`와 동일 패턴으로 사용.
- `setSessionCookies()` (`src/lib/cmsApi/session.ts`) — 로그인과 동일한 쿠키 발급 함수 그대로
  재사용. 새 쿠키 도우미(state 저장/소비)도 이 파일에 같은 스타일로 추가한다.
- `baseCookieOptions` (`src/lib/cmsApi/cookies.ts`) — CSRF state 쿠키 옵션도 이 파일에 상수로
  추가한다(호출부에 인라인 옵션을 반복하지 않음 — `.claude/rules/shared-component-changes.md`
  원칙).
- `src/app/login/page.tsx`의 `next` 검증 패턴(`startsWith("/") && !startsWith("//")`) —
  callback에서 그대로 재사용해 open-redirect를 막는다.
- `LoginForm.tsx`/`SignupForm.tsx`의 기존 에러 박스(`rounded-lg bg-[rgba(220,38,38,.1)] ...`)
  — 새 토스트 시스템을 만들지 않고 이 기존 UI를 그대로 재사용한다. (조사 중 발견: `sonner`의
  `<Toaster/>`도, `store/atoms/uiAtom.ts`의 `toastAtom`도 실제로는 어디서도 구독되지 않는
  죽은 코드라 지금 화면에 아무것도 띄우지 못한다 — 이번 기능은 이 상태에 의존하지 않고 기존에
  실제로 동작 중인 `LoginForm`/`SignupForm`의 로컬 에러 박스를 재사용한다. 전역 토스트 자체를
  고치는 건 이번 작업 범위 밖이라 별도로 진행하지 않는다.)

## 구현할 파일

### 1. `src/lib/cmsApi/cookies.ts` (수정)

state 쿠키 이름/옵션 상수 추가:

```ts
export const KAKAO_OAUTH_STATE_COOKIE = "gf_kakao_oauth";
export const kakaoOAuthStateCookieOptions = {
  ...baseCookieOptions,
  maxAge: 300, // 인가 왕복 도중에만 필요한 5분짜리 단발성 쿠키
};
```

### 2. `src/lib/cmsApi/session.ts` (수정)

`setSessionCookies`/`clearSessionCookies`와 같은 스타일로 두 함수 추가:

```ts
interface KakaoOAuthState {
  state: string;
  next: string;
  view: "login" | "signup";
  referralCode?: string;
}

export async function setKakaoOAuthStateCookie(value: KakaoOAuthState): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(KAKAO_OAUTH_STATE_COOKIE, JSON.stringify(value), kakaoOAuthStateCookieOptions);
}

export async function consumeKakaoOAuthStateCookie(): Promise<KakaoOAuthState | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(KAKAO_OAUTH_STATE_COOKIE)?.value;
  cookieStore.delete(KAKAO_OAUTH_STATE_COOKIE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as KakaoOAuthState;
  } catch {
    return null;
  }
}
```

### 3. `src/app/api/auth/kakao/route.ts` (신규, `runtime = "nodejs"`)

- GET. 쿼리 `next`/`view`/`referralCode`를 읽고 `next`는 `/login/page.tsx`와 동일한 open-redirect
  방어 검증을 거친다.
- `crypto.randomUUID()`로 state nonce 생성 → `setKakaoOAuthStateCookie({ state, next, view, referralCode })`.
- `process.env.KAKAO_CLIENT_ID` / `process.env.KAKAO_REDIRECT_URI` 누락 시 `/login?kakaoError=config`로
  리다이렉트(설정 누락을 즉시 알 수 있도록).
- `https://kauth.kakao.com/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&state=...&scope=account_email`
  로 `NextResponse.redirect(...)`.

### 4. `src/app/api/auth/kakao/callback/route.ts` (신규, `runtime = "nodejs"`)

- GET. `code`/`state`/`error` 쿼리 파싱, `consumeKakaoOAuthStateCookie()`로 저장해둔 값을 꺼내며
  쿠키는 결과와 무관하게 항상 삭제됨.
- 쿠키 없음 / `state` 불일치 / 카카오가 `error`를 보냄 / `code` 없음 → 실패 처리.
- 성공 조건 충족 시 `cmsApiFetch("/api/v1/auth/kakao", { method: "POST", body: JSON.stringify({ code, redirectUri: process.env.KAKAO_REDIRECT_URI, referralCode }) })`
  호출 (기존 `login/route.ts`의 `LoginResponse` 형태 + `isNewUser` 필드).
- 성공: `setSessionCookies({ accessToken: session.access_token, refreshToken: session.refresh_token, expiresAt: session.expires_at })`
  후 저장해둔 `next`로 리다이렉트.
- 실패(위 검증 실패 또는 `CmsApiError`/네트워크 에러): `console.error`로 서버 로그만 남기고,
  `/login?next=<next>&view=<view>&kakaoError=<denied|state|failed|config>`로 리다이렉트
  (구체적 에러 메시지는 절대 쿼리 문자열로 노출하지 않는다 — 코드만 전달).

### 5. `src/store/atoms/uiAtom.ts` (수정)

`authModalAtom`에 `error?: string` 필드 추가:

```ts
export const authModalAtom = atom<{
  view: AuthModalView;
  next: string;
  referralCode?: string;
  error?: string;
}>({ key: "authModalAtom", default: { view: null, next: "/" } });
```

### 6. `src/hooks/useAuth.ts` (수정)

- `openAuthModal(view, next?, referralCode?, error?)`로 시그니처 확장, `setAuthModal`에 `error`도 반영.
- 반환 객체에 `authModalError: authModal.error` 추가.
- `signInWithOAuth`를 스텁에서 실제 구현으로 교체 (kakao만 지원, google은 기존처럼 에러):

```ts
const signInWithOAuth = useCallback(
  (provider: OAuthProvider) => {
    if (provider !== "kakao") {
      throw new Error(`${provider} 소셜 로그인은 현재 준비 중입니다.`);
    }
    const params = new URLSearchParams({
      next: authModal.next,
      view: authModal.view === "signup" ? "signup" : "login",
    });
    if (authModal.referralCode) params.set("referralCode", authModal.referralCode);
    window.location.href = `/api/auth/kakao?${params.toString()}`;
  },
  [authModal.next, authModal.referralCode, authModal.view],
);
```

### 7. `src/components/auth/AuthModal/KakaoLoginButton.tsx` (신규)

`LoginForm`/`SignupForm` 양쪽에서 재사용하는 공용 버튼(도메인 로직상 `features` 계층,
`components/auth/` 아래 위치). "또는" 구분선 + 버튼을 한 컴포넌트에 묶어 중복을 없앤다:

```tsx
"use client";

import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function KakaoLoginButton() {
  const { signInWithOAuth } = useAuth();

  return (
    <div className="mt-1 flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gf-line" />
        <span className="text-xs text-gf-gray2">또는</span>
        <div className="h-px flex-1 bg-gf-line" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => signInWithOAuth("kakao")}
        className="h-11 w-full gap-2 border-gf-black text-gf-black hover:bg-gf-black/5"
      >
        <MessageCircle className="size-4" />
        카카오로 1초만에 시작하기
      </Button>
    </div>
  );
}
```

(모서리는 `Button` `size="lg"` 기본값인 `rounded-lg`를 그대로 따른다 — 별도 지정 불필요.)

### 8. `src/components/auth/AuthModal/LoginForm.tsx` / `SignupForm.tsx` (수정)

- `useAuth()`에서 `authModalError`도 구조분해.
- 로컬 `error` state 초기값을 `useState(() => authModalError ?? "")`로 변경 (기존엔 `""`).
- `<form>` 아래(제출 버튼 다음, 안내 문구 위)에 `<KakaoLoginButton />` 추가.

### 9. `src/app/login/page.tsx` (수정)

`LoginRedirect`가 `kakaoError`/`view` 쿼리를 읽어 에러 메시지와 함께 올바른 뷰로 모달을 연다:

```tsx
const KAKAO_ERROR_MESSAGES: Record<string, string> = {
  denied: "카카오 로그인이 취소되었거나 인증에 실패했습니다.",
  state: "요청이 만료되었습니다. 다시 시도해주세요.",
  failed: "카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.",
  config: "카카오 로그인을 사용할 수 없습니다. 잠시 후 다시 시도해주세요.",
};

useEffect(() => {
  const rawNext = searchParams.get("next") ?? "/mypage";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/mypage";
  const kakaoError = searchParams.get("kakaoError");
  const view = searchParams.get("view") === "signup" ? "signup" : "login";
  openAuthModal(view, next, undefined, kakaoError ? (KAKAO_ERROR_MESSAGES[kakaoError] ?? KAKAO_ERROR_MESSAGES.failed) : undefined);
  router.replace("/");
}, []);
```

기존 동작(쿼리 없이 `/login` 접근 시 `openAuthModal("login", next)`)은 그대로 유지된다.

## 환경변수 (신규)

cms.api의 `.env.example`에 이미 있는 `KAKAO_CLIENT_ID`(REST API 키)와 **동일한 값**을 이
저장소의 `.env.development`/`.env.production`에도 추가해야 한다 (인가 URL 생성에 필요, 시크릿은
불필요 — 토큰 교환/시크릿 사용은 전부 cms.api 쪽 책임). 추가로 각 환경의 콜백 URL을 고정값으로
지정한다(요청 Host 헤더로 동적 생성하지 않음 — 호스트 헤더 스푸핑 방지 + 카카오 콘솔에 등록한
값과 정확히 일치시키기 위함):

```env
KAKAO_CLIENT_ID=...                                          # cms.api와 동일한 값
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback   # 운영에서는 실제 도메인으로 교체
```

**주의**: 이 값들을 카카오 개발자 콘솔(내 애플리케이션 > 카카오 로그인 > Redirect URI)에도
`KAKAO_REDIRECT_URI`와 정확히 동일하게 등록해야 하고, "카카오 로그인 활성화" + "이메일
필수 동의" 설정이 이미 cms.api 쪽 계획대로 되어 있어야 한다(사용자가 카카오 비즈 인증 후 별도
진행하기로 확정된 부분). 이 저장소의 `.env.*` 파일은 이번 세션 권한 설정상 직접 읽기/쓰기가
막혀 있어(디렉토리 접근 거부), 구현 단계에서 Edit 시도 후 막히면 사용자에게 직접 값 추가를
요청한다.

## 검증 방법

1. `yarn tsc --noEmit` (또는 `yarn build`)으로 타입 에러 없는지 확인.
2. cms.api 로컬 서버(`KAKAO_CLIENT_ID`/`KAKAO_CLIENT_SECRET` 설정 + `auth_api_configs`에
   `kakao` 활성화된 상태)와 이 저장소 dev 서버(`KAKAO_CLIENT_ID`/`KAKAO_REDIRECT_URI` 설정)를
   함께 띄운 뒤, 로그인 모달 → "카카오로 1초만에 시작하기" 클릭 → 카카오 동의 화면 → 승인 →
   `next`로 정확히 돌아오고 `authUserAtom`이 채워지는지(헤더에 로그인 상태 반영) 확인.
3. 회원가입 모달에서도 동일 버튼으로 진입해 동작 확인 (같은 이메일로 재로그인 시 쿠폰/추천인이
   중복 발급되지 않는지는 cms.api 쪽 책임 — main에서는 정상적으로 세션만 발급되면 됨).
4. 카카오 동의 화면에서 "취소"를 눌러 `kakaoError=denied`로 돌아왔을 때 로그인 모달에 에러
   메시지가 실제로 보이는지 확인 (기존 죽은 토스트 시스템에 의존하지 않는지 검증하는 핵심 지점).
5. state 쿠키를 브라우저 개발자 도구에서 임의로 지운 뒤 콜백 URL을 직접 호출해 `kakaoError=state`로
   안전하게 처리되는지 확인 (CSRF 방어 확인).
6. `code-reviewer` → APPROVED 확인 후 커밋 (CLAUDE.md 절대 규칙).
