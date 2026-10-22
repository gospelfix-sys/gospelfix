# cms.api `/profile` 페이지 아바타 이미지 저장 안 되는 버그 수정

## Context

`gospelfix.cms.api`(관리자 앱)의 `/profile`(관리자 본인 프로필 설정) 페이지에서 이름은 저장되지만
프로필 이미지는 전혀 저장되지 않는 버그를 사용자가 보고했다. 원인 확인 완료:
`handleFileChange`가 `FileReader.readAsDataURL()`로 이미지를 base64로 **브라우저 메모리에만**
올려두고(`avatarPreview` state), `handleSave`가 호출하는
`src/libs/supabase/queries/profile.ts`의 `updateProfile(id, full_name)`은 `full_name`만
저장할 뿐 Storage 업로드도, `avatar_url` 컬럼 저장도 전혀 하지 않는다. "저장되었습니다" 토스트는
뜨지만 로컬 상태만 낙관적으로 바뀌고 새로고침하면 원래대로 돌아간다.

조사 결과, 이미 `POST /api/v1/auth/avatar`라는 아바타 업로드 REST 라우트가 있지만 이건
**외부 서버(gospelfix/main)가 `X-API-Key`+`Authorization: Bearer` 헤더를 forward하는 서버-투-서버
호출 전용**으로 설계되어 있어, cms.api 내부의 `/profile` 페이지(클라이언트 컴포넌트)가 재사용하기
부적절하다(서버 전용 비밀값 `INTERNAL_API_KEY`를 클라이언트에 노출시켜야 하고, 이 저장소에 자기
자신의 REST API를 호출한 선례도 없음). 대신 이 앱에는 이미 "클라이언트 폼 → 서버에서 인증 확인 →
`createAdminClient()`로 처리" 패턴(`sign/in/actions.ts`, `products/actions.ts` 등 기존 Server
Action들)과, 페이지/Server Action 전용 인증 헬퍼 `requireAdminPage()`(`queries/auth.ts`)가 이미
있으므로 이를 그대로 재사용한다. 이 방식은 `avatars` 버킷에 새 Storage RLS 정책을 만들 필요도
없다(admin client가 RLS를 우회하므로).

## 구현

### 1. `queries/account.ts` 확장

- `updateProfile`의 `avatarUrl` 파라미터 타입을 `string`에서 `string | null`로 변경(아바타
  제거 시 컬럼을 null로 만들 수 있도록). 기존 `if (updates.avatarUrl !== undefined) patch.avatar_url
  = updates.avatarUrl;` 로직은 그대로 유지(undefined면 미변경, null이면 명시적으로 지움).
- 신규 함수 `uploadAvatar(userId: string, file: File): Promise<string>` 추가: `avatar/route.ts`의
  기존 업로드 로직(타입 검증 jpeg/png/webp, 5MB 제한, `${userId}/${Date.now()}.${ext}` 경로,
  `createAdminClient()`로 `avatars` 버킷에 upsert 업로드 후 `getPublicUrl`)을 그대로 옮겨온다.

### 2. `src/app/api/v1/auth/avatar/route.ts` 리팩터링

인라인 업로드 로직을 1번에서 만든 `uploadAvatar()` 호출로 교체(중복 제거, 동작은 완전히 동일하게
유지 — X-API-Key/Bearer 인증, 400/401/403 에러 응답 등 라우트 자체의 나머지 로직은 그대로).

### 3. `src/app/(admin)/profile/actions.ts` 신규 (`'use server'`)

```ts
'use server';

export async function updateMyProfileAction(
  fullName: string,
  avatarFile: File | null,
  removeAvatar: boolean,
): Promise<{ avatarUrl: string | null }> {
  const user = await requireAdminPage(); // 미인증/비관리자면 /sign/in으로 redirect

  let avatarUrl: string | null | undefined;
  if (avatarFile) {
    avatarUrl = await uploadAvatar(user.id, avatarFile);
  } else if (removeAvatar) {
    avatarUrl = null;
  }
  // avatarFile도 없고 removeAvatar도 false면 avatarUrl은 undefined로 남아 기존 값 유지

  await updateProfile(user.id, { fullName, avatarUrl });
  return { avatarUrl: avatarUrl ?? null };
}
```

`requireAdminPage()`(`queries/auth.ts`, "페이지/Server Action에서 사용"이라고 이미 문서화된
헬퍼)로 클라이언트가 보낸 id를 신뢰하지 않고 서버가 직접 세션에서 관리자를 식별한다.

### 4. `src/app/(admin)/profile/page.tsx` 수정

현재 `avatarPreview: string | null` 하나로 "새로 선택한 파일의 base64 미리보기"와 "저장 여부
판단"을 동시에 하려다 보니 실제 File 객체가 유실되는 게 근본 문제다. state를 분리한다:

- `avatarFile: File | null` — 새로 선택한 원본 파일(업로드용, 신규 state)
- `avatarPreview: string | null` — 화면 표시 전용(기존 로직 그대로, base64 or 기존 avatar_url)
- `handleFileChange`: 검증 통과 시 `setAvatarFile(file)`도 함께 호출(기존 `setAvatarPreview`는
  유지). 허용 타입을 `avatar/route.ts`와 동일하게 jpeg/png/webp로 맞춘다(현재 클라이언트만
  gif를 추가로 허용하고 있어 서버와 불일치 — gif 선택 시 저장 단계에서야 실패하는 걸 방지).
- `clearAvatar`: `setAvatarFile(null)`도 함께 호출.
- `handleSave`: `updateProfile(profile.id, full_name)` 대신
  `updateMyProfileAction(fullName, avatarFile, avatarFile === null && avatarPreview === null &&
  profile?.avatar_url != null)` 호출. 반환된 `avatarUrl`로 `setUserProfile`을 갱신(기존처럼
  base64 미리보기 문자열이 아니라 실제 Storage public URL을 Recoil state에 저장 — 새로고침해도
  올바른 이미지가 뜨게 됨).

### 손대지 않는 것
- `avatars` 버킷 자체나 Storage RLS 정책 — 이번 방식은 admin client를 쓰므로 불필요.
- `avatar/route.ts`의 인증 로직(X-API-Key, Bearer) — 그대로 유지, 업로드 부분만 공용 함수 호출로
  교체.
- `profile.ts`의 `updateProfile(id, full_name)` — 더 이상 `/profile` 페이지에서 쓰이지 않게
  되지만, 이 함수를 삭제할지는 이번 스코프 밖(다른 호출부가 전혀 없다는 건 확인했으나, 죽은 코드
  정리는 별도 판단 필요 — 우선 남겨두고 사용자에게 삭제 여부만 알린다).

## 검증

- `yarn tsc --noEmit`, `yarn lint` (cms.api)
- 수동 QA: 관리자 로그인 → `/profile`에서 (a) 이름만 변경 후 저장 → 새로고침해도 유지되는지,
  (b) 이미지 업로드 후 저장 → 새로고침해도 이미지가 유지되는지(실제 Storage public URL로 저장되는지
  네트워크 탭에서 확인), (c) 이미지 삭제 후 저장 → `avatar_url`이 실제로 null이 되고 새로고침 후
  이니셜 placeholder로 돌아오는지, (d) jpg가 아닌 gif 파일 선택 시 클라이언트에서 바로 거부되는지
- code-reviewer 리뷰 → APPROVED 확인 후 커밋/push
