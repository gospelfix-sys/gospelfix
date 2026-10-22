# 마이페이지 사이드바 개편 (프로필/구매·혜택/보관함/작성한 댓글/계정 설정)

## Context

현재 `/mypage`는 사이드바 없이 프로필 요약 카드 + 구매 내역이 한 페이지에 뒤섞여 있다.
사용자가 참고 이미지처럼 왼쪽 고정 사이드바로 5개 섹션(프로필, 구매/혜택, 보관함, 작성한
댓글, 계정 설정)을 분리해서, 각 기능이 독립된 하위 페이지를 갖는 구조로 개편을 요청했다.

조사 결과 "프로필"·"구매/혜택"·"보관함"은 기존 `getMe()`/`/api/orders`/`/api/downloads`로
바로 구현 가능하지만, "작성한 댓글"(내 리뷰 목록 조회)과 "계정 설정"(이름·아바타·비밀번호
변경, 회원탈퇴)은 **gospelfix와 cms.api 양쪽 다 관련 API가 전혀 없어 백엔드부터 새로
만들어야** 한다. 사용자는 계정 설정을 cms.api PATCH 엔드포인트까지 포함해 완전히 동작하도록
요청했고, 회원탈퇴는 결제 기록 보관을 위해 **소프트 탈퇴**(Auth 계정 비활성화 + 세션 전체
무효화, `profiles`는 PII만 마스킹하고 보존)로 확정했다.

이 작업은 두 개의 독립 저장소(`gospelfix`, `gospelfix.cms.api`)에 걸쳐 있다. cms.api 쪽
변경은 이 세션에서 파일 경로로 직접 수정하되, **커밋/푸시는 각 저장소에서 따로** 진행해야
한다(이 세션의 git-commit-pusher/code-reviewer 에이전트는 gospelfix 기준으로 설정되어
있음). 또한 cms.api의 CLAUDE.md 규칙상 신규 REST 엔드포인트는 `/settings` on/off 토글과
Swagger(`src/libs/openapi/schemas/*.schema.ts`) 등록이 필수이므로 이 작업도 포함한다.

## Phase A — cms.api 백엔드 (`/Users/mac/Documents/work/GospelFix/gospelfix.cms.api`)

**마이그레이션** (`supabase/migrations/014_profile_soft_delete.sql`, 새 파일): `profiles`에
`deleted_at timestamptz` 컬럼 추가. 대시보드 SQL Editor에서 수동 실행 필요(이 저장소 관례).

**신규 쿼리 함수** — `src/libs/supabase/queries/account.ts` (신규 파일):
- `updateProfile(userId, { fullName?, avatarUrl? })` — `profiles` UPDATE
- `changePassword(userId, currentPassword, email, newPassword)` — 먼저
  `supabase.auth.signInWithPassword({email, password: currentPassword})`로 현재 비밀번호
  재검증 후 `supabase.auth.admin.updateUserById(userId, { password: newPassword })`
- `softDeleteAccount(userId)` — `supabase.auth.admin.updateUserById(userId, { ban_duration: "876000h" })`
  (사실상 영구 정지) + `supabase.auth.admin.signOut(userId, "global")`(전 세션 무효화) +
  `profiles` UPDATE로 `deleted_at = now()`, `email`을 `deleted_<uuid>@deleted.local`로
  마스킹, `full_name`/`avatar_url` null 처리
- `getMyReviews(userId)` — `reviews`를 `products(name, thumbnail_url)`와 join해 본인 리뷰만
  조회 (기존 `getAuthApiConfigBySlug` 등과 동일한 패턴 참고)

**신규 라우트**:
- `PATCH src/app/api/v1/auth/me/route.ts` (기존 GET 파일에 메서드 추가) — `{fullName?, avatarUrl?}` → `updateProfile`
- `DELETE src/app/api/v1/auth/me/route.ts` (같은 파일에 추가) — `softDeleteAccount` 호출 후 `{success:true}`
- `POST src/app/api/v1/auth/password/route.ts` (신규) — `{currentPassword, newPassword}` → `changePassword`
- `POST src/app/api/v1/auth/avatar/route.ts` (신규) — multipart 파일을 받아 신규 Storage 버킷
  `avatars`(Public, 대시보드에서 수동 생성 필요)에 업로드 후 `{avatarUrl}` 반환. 저장까지는
  하지 않고 URL만 돌려줌 — 저장은 뒤이은 PATCH 호출이 담당(업로드/저장 책임 분리)
- `GET src/app/api/v1/reviews/me/route.ts` (신규) — `getMyReviews` 프록시

**체크리스트 준수**: 위 5개 엔드포인트 전부 `/settings` REST API 설정에 on/off 토글 추가 +
`src/libs/openapi/schemas/*.schema.ts`에 `registerPath()` 등록.

## Phase B — gospelfix BFF 프록시 라우트

`src/app/api/*` 안에서만 `cmsApiFetch` 호출하는 기존 규칙을 그대로 따른다 (`src/app/api/auth/me/route.ts`, `src/app/api/orders/route.ts` 패턴 참고):

- `src/app/api/auth/me/route.ts`에 `PATCH`/`DELETE` 추가 (DELETE 성공 시 `src/app/api/auth/logout/route.ts`와 동일하게 쿠키 삭제까지 처리)
- `src/app/api/auth/password/route.ts` (신규) — POST 프록시
- `src/app/api/auth/avatar/route.ts` (신규) — multipart body를 그대로 cms.api로 전달
- `src/app/api/reviews/me/route.ts` (신규) — GET 프록시

## Phase C — gospelfix 프론트엔드

**사이드바** — `src/components/mypage/MypageSidebar.tsx` (신규, client component). `usePathname()`으로 active 표시, 5개 항목:
| 라벨 | href |
|---|---|
| 프로필 | `/mypage` |
| 구매 / 혜택 | `/mypage/orders` |
| 보관함 | `/mypage/library` |
| 작성한 댓글 | `/mypage/reviews` |
| 계정 설정 | `/mypage/settings` |

**레이아웃** — `src/app/(mypage)/layout.tsx` 수정: 기존 `<main className="mx-auto max-w-5xl px-6 py-8">` 단일 컬럼을 `mx-auto flex max-w-[1440px] gap-8 px-6 py-8` 구조로 바꿔 좌측에 `MypageSidebar`, 우측에 `{children}`을 배치(1440px는 `DashboardHeader`와 동일 폭으로 통일). 모바일은 사이드바를 상단 가로 스크롤 탭으로 전환.

**페이지 분리**:
- `src/app/(mypage)/mypage/page.tsx` — 기존 파일에서 구매 내역 섹션 제거, 프로필 요약(이름/이메일/권한/가입일)만 남김(읽기 전용, 수정은 계정 설정에서)
- `src/app/(mypage)/mypage/orders/page.tsx` (신규) — `serverFetch<PurchasedOrder[]>("/api/orders")`로 구매/결제 이력 (기존 `mypage/page.tsx`에서 추출)
- `src/app/(mypage)/mypage/library/page.tsx` (신규) — 같은 주문 데이터를 상품 그리드로 표시, 다운로드 버튼은 `src/components/mypage/DownloadButton.tsx`(신규, 기존 `mypage/page.tsx`에 인라인으로 있던 `/api/downloads/{id}` 링크 로직 추출)로 분리
- `src/app/(mypage)/mypage/reviews/page.tsx` (신규) — `serverFetch("/api/reviews/me")`로 내가 쓴 리뷰 목록(상품명/별점/내용/작성일)
- `src/app/(mypage)/mypage/settings/page.tsx` + `src/components/mypage/AccountSettingsForm.tsx`(신규, client) — 이름/아바타 수정 폼, 비밀번호 변경 폼(현재/신규/확인), 위험 구역(회원탈퇴 — shadcn `Dialog`로 확인 절차, 이메일 재입력 등으로 실수 방지, 성공 시 `useAuth().signOut()`과 동일하게 세션 정리 후 홈으로 이동)

## 검증 방법

- `yarn tsc --noEmit`, `yarn lint` (gospelfix), cms.api 쪽도 동일하게 각 저장소에서 실행
- 브라우저로 `/mypage` 전체 5개 탭 이동 확인, 이름/아바타 변경 저장 확인, 틀린 현재 비밀번호로 변경 시도 시 거부되는지 확인, 다운로드 버튼이 signed URL로 리다이렉트되는지 확인
- 회원탈퇴는 실제 계정으로 실행하면 되돌릴 수 없으니(로그인 영구 차단), 테스트 계정으로만 최종 확인 — 실제 사용자 계정으로는 확인 절차 UI만 점검하고 끝까지 실행하지 않는다
- cms.api 변경 사항은 `gospelfix.cms.api` 저장소에서 별도로 커밋 — 이 세션의 git-commit-pusher는 gospelfix 기준이라 자동 처리되지 않음, 완료 후 각 저장소에서 개별적으로 커밋 안내
