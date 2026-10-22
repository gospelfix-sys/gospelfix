---
name: kakao-login-setup
description: 카카오 로그인 연동 진행 상황 — 콘솔 URI 설정 혼동 함정, scope=account_email만 요청하기로 한 결정과 이유
metadata:
  type: project
---

카카오 로그인 연동(`.claude/plans/cms-api-api-v1-auth-kakao-wobbly-peacock.md` 참고)은
2026-09-05 기준 코드 구현이 완료됐고, 이후 카카오 디벨로퍼스 콘솔 설정 단계에서 두 가지가
확정됐다.

## 1. 콘솔의 두 "리다이렉트 URI" 설정을 혼동하기 쉬움

카카오 디벨로퍼스 콘솔 "카카오 로그인" 섹션에는 이름이 비슷한 별개의 두 설정이 있다.

- **Redirect URI** — `GET /oauth/authorize`의 `redirect_uri`와 정확히 일치해야 하는,
  로그인 인가 코드 콜백 주소. `src/app/api/auth/kakao/route.ts`가 실제로 쓰는 값이자
  `KAKAO_REDIRECT_URI` 환경변수와 콘솔에 반드시 동일하게 등록해야 하는 값.
- **로그아웃 리다이렉트 URI** — "카카오계정과 함께 로그아웃" 부가 기능 전용 콜백. 이 저장소의
  카카오 **로그인** 흐름에서는 전혀 쓰이지 않는다.

**Why:** 사용자가 "redirect_uri mismatch" 계열 오류를 겪고 "로그아웃 리다이렉트 URI"
섹션에 콜백 URL을 등록했지만 동일한 문제가 재발했다 — 실제로 필요한 건 그 위/별도의
"Redirect URI" 섹션이었다. 콘솔 화면에서 두 섹션의 문구가 비슷해 혼동하기 쉽다.

**How to apply:** 카카오 로그인 관련 리다이렉트/콜백 오류를 디버깅할 때, 사용자가 콘솔
스크린샷을 보내면 어느 섹션인지("Redirect URI"인지 "로그아웃 리다이렉트 URI"인지) 먼저
확인한다. 코드(`src/app/api/auth/kakao/route.ts`, `callback/route.ts`)는 이미 올바른
`KAKAO_REDIRECT_URI` 값만 사용하므로, 이 오류는 거의 항상 콘솔 쪽 "Redirect URI" 섹션
누락/불일치가 원인이다.

## 2. scope는 account_email만 요청, 닉네임/프로필사진은 의도적으로 제외

`src/app/api/auth/kakao/route.ts`의 인가 URL에 `scope=account_email`만 명시한다(원래
계획 문서 설계와 동일 — 구현 중 누락됐던 걸 2026-09-05에 다시 추가함). 닉네임/프로필사진은
필수·선택 동의 어느 쪽으로도 요청하지 않기로 확정했다.

**Why:** (1) `profiles.full_name`/`avatar_url` 컬럼은 존재하지만 실제로 화면에 노출·활용하는
곳이 없고, 이메일/비밀번호 회원가입 폼도 애초에 이름을 받지 않아 두 경로 간 맞출 기준값이
없다. (2) "카카오로 1초만에 시작하기"라는 버튼 카피와 상충 — 필수 동의 항목이 늘수록 동의
화면 이탈률이 올라간다.

**How to apply:** 나중에 마이페이지 등에서 프로필 사진/닉네임을 실제로 보여줄 계획이 생기면
그때 "선택 동의" 항목으로 scope를 확장하는 걸 재검토한다. 그 전까지는 scope에 닉네임/프로필
항목을 추가하지 않는다.

## 3. 로컬/실서버(Vercel) 이중화 — `KAKAO_REDIRECT_URI` 한 값으로는 양쪽을 동시에 못 맞춘다

2026-09-06, 사용자가 "`.env`의 `KAKAO_REDIRECT_URI`가 `http://localhost:3000/...`로
박혀 있어 실서버(`https://gospelfix.vercel.app/`)에서 카카오 로그인이 안 된다"고 보고.

**Why:** 이 앱은 Next.js + Vercel 배포다. 로컬 `.env`(`.env.local` 포함)는 로컬
`yarn dev`에만 적용되고, Vercel에 올라간 실서버는 Vercel 대시보드의 Environment
Variables 값을 쓴다(대시보드 값이 `.env` 파일보다 우선). 게다가 카카오 OAuth는
①인가 요청과 토큰 교환 요청의 `redirect_uri`가 정확히 일치해야 하고, ②그 값이 콘솔
"Redirect URI"(위 1번 항목) 목록에 등록돼 있어야 한다 — 이 두 요구사항이 겹쳐서, 로컬과
실서버가 서로 다른 도메인을 쓰는 이상 값 하나로는 양쪽 다 만족시킬 수 없다.

**How to apply:** 로컬/실서버 카카오 로그인을 동시에 되게 하려면 세 곳을 모두 맞춰야
한다(코드 수정 불필요 — `route.ts`/`callback/route.ts`는 이미 `process.env.KAKAO_REDIRECT_URI`를
올바르게 참조함).
1. 로컬 `.env`: `KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/kakao/callback` 유지
2. Vercel 프로젝트 → Settings → Environment Variables(Production)에
   `KAKAO_REDIRECT_URI=https://gospelfix.vercel.app/api/auth/kakao/callback` 추가 후 재배포
3. 카카오 디벨로퍼스 콘솔 "Redirect URI" 목록에 위 두 URI를 **모두** 등록

**미확인 상태:** 이 세션에서는 코드 확인·설명만 진행했고, 2번(Vercel 대시보드)·3번(카카오
콘솔)이 실제로 설정됐는지는 확인하지 못했다. 다음에 카카오 로그인 관련 문의가 오면 이 세
곳이 실제로 반영됐는지부터 물어볼 것.
