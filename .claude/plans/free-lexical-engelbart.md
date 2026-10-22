# 추천인 코드(50% 쿠폰) + 리뷰 작성 보상(20% 쿠폰) 시스템

## Context

앞선 논의에서 "친구 초대 시 5,000포인트 적립" 형태의 포인트 정책을 검토했으나, 사용자가
포인트 원장 대신 **기존에 이미 구현되어 있는 쿠폰 시스템을 재사용**하는 방향으로 정책을
확정했다: 추천인 코드를 입력하면 추천인+피추천인 모두에게 50% 할인 쿠폰을, 구매 후 리뷰를
작성하면 20% 할인 쿠폰을 지급한다. 목적은 신규 가입 촉진(추천)과 재방문/재구매 유도(리뷰)
둘 다를 잡는 것이다.

조사 결과 `gospelfix.cms.api`에는 이미 "회원가입 시 20% 할인 쿠폰 자동 발급" 기능이
구현되어 있다(`coupons` 테이블, `coupons.ts` 쿼리 모듈, `orders` 테이블의
`coupon_id`/`discount_amount` 연동, 결제 완료 시점 `markCouponUsed` 처리, 쿠폰 1회성
사용을 보장하는 partial unique index까지). 이번 작업은 이 기존 인프라를 그대로 재사용해
쿠폰 **발급 경로**만 두 곳(회원가입 추천인 코드, 리뷰 작성) 추가하는 것이지, 결제/검증
로직은 건드리지 않는다.

**사용자 확정 정책**:
- 추천인 코드 입력 시 추천인 + 피추천인 **모두** 50% 쿠폰 (30일 유효)
- 리뷰 작성 시 작성자 20% 쿠폰 (30일 유효), 최초 작성 시에만(수정 시 재지급 안 함)
- 추천인 코드는 **회원가입 시에만** 입력 가능(가입 후 마이페이지에서 별도 입력 불가)
- 어뷰징 방지는 기본 수준만(자기추천 방어 코드 + 기존 휴대폰 인증 유니크 제약에 의존, 횟수
  제한 등 추가 정책 없음)

## 발견한 기존 구조 (재사용 대상)

- `gospelfix.cms.api/src/libs/supabase/queries/coupons.ts` — `issueSignupCoupon`(20%,
  30일), `validateCouponForOrder`, `markCouponUsed`. 쿠폰 발급의 핵심 로직(코드 생성+재시도)이
  `issueSignupCoupon` 내부에 인라인되어 있어, 이번에 50%/20% 발급도 필요하므로 공용
  `issueCoupon(userId, discountRate, validDays)`로 추출해 재사용한다.
- `gospelfix.cms.api/src/app/api/v1/auth/signup/route.ts` L74-80 — 세션 즉시 발급 시
  `issueSignupCoupon` 호출하는 지점. 추천인 코드 처리도 같은 자리(같은 try/catch 격리
  패턴)에 추가한다.
- `gospelfix.cms.api/src/app/api/v1/reviews/route.ts` L63 — `upsertReview` 호출 지점.
  리뷰 최초 작성 판별 후 쿠폰 발급 훅을 여기 추가한다.
- `gospelfix.cms.api/src/app/api/v1/auth/me/route.ts` + `libs/supabase/queries/account.ts`의
  `getProfileById` — 이미 `{user, profile}`을 반환하므로 `profile.referral_code`만
  select 목록에 추가하면 프론트까지 별도 엔드포인트 없이 자연스럽게 흘러간다
  (`gospelfix/src/lib/api/me.ts`의 `getMe()` → `AuthMeResponse.profile`).
- **버그 발견**: `gospelfix/src/app/(public)/detail/[slug]/page.tsx`와
  `@modal/(.)detail/[slug]/page.tsx` 둘 다 `coupons.find(coupon => !coupon.is_used && ...)`로
  "유효한 쿠폰 중 배열 순서상 첫 번째"를 고른다. 지금은 사용자가 쿠폰을 최대 1개(가입
  쿠폰)만 가질 수 있어 문제가 없었지만, 이제 한 사용자가 20%(가입)+50%(추천)+20%(리뷰)
  등 여러 개를 동시에 보유할 수 있게 되므로 **할인율이 가장 높은 쿠폰을 고르도록 고쳐야
  한다** — 안 고치면 50% 추천 쿠폰이 있어도 먼저 발급된 20% 쿠폰이 적용될 수 있다.

## 변경 파일 목록

### A. `gospelfix.cms.api/supabase/migrations/040_add_profiles_referral_columns.sql` (신규)

- `profiles`에 `referral_code text`(nullable), `referred_by uuid references profiles(id)`
  (nullable) 추가
- `referral_code`에 unique 제약 추가 (unique 제약은 NULL 다중 허용이라 백필 전에 걸어도 안전)
- 기존 회원 백필: `referral_code is null`인 행에 8자리 랜덤 코드(`GF-XXXX-XXXX`가 아니라
  더 짧은 8자리 — 사용자가 직접 타이핑해야 하므로) 부여하는 `do $$ ... $$` 루프, 충돌 시
  재시도(최대 5회)
- **NOT NULL 제약은 걸지 않는다** — `handle_new_user()` 트리거가 `profiles` 행을 생성할 때
  `referral_code`를 채우지 않으므로(신규 코드는 가입 라우트에서 트리거 이후 별도 UPDATE로
  채움), NOT NULL이면 트리거 INSERT 자체가 실패해 가입이 깨진다. 가입 쿠폰 발급과 동일하게
  "베스트에포트, 실패해도 가입은 안 막음" 원칙 유지
- 롤백(DOWN) 섹션 포함 (기존 마이그레이션 컨벤션)

### B. `gospelfix.cms.api` — 쿼리 레이어

1. `src/libs/supabase/queries/coupons.ts`
   - `issueCoupon(userId, discountRate, validDays)` 공용 함수로 추출 (기존 `issueSignupCoupon`
     내부 로직 이동)
   - `issueSignupCoupon`은 `issueCoupon(userId, 20, 30)` 호출로 축소
2. `src/libs/supabase/queries/referrals.ts` (신규)
   - `generateReferralCode()` — 8자리 랜덤(`coupons.ts`의 `CODE_CHARSET`과 동일한
     혼동 문자 제외 문자셋 재사용)
   - `assignReferralCode(userId): Promise<string>` — `profiles.referral_code` UPDATE,
     unique 충돌 시 재시도(최대 5회, `issueCoupon`과 동일 패턴)
   - `findProfileIdByReferralCode(code): Promise<string | null>`
   - `applyReferral(newUserId, referralCode): Promise<void>` — 코드로 추천인 조회 →
     없거나 자기 자신이면 조용히 리턴(방어) → `profiles.referred_by` 갱신 →
     `issueCoupon`을 신규가입자/추천인 양쪽에 각각 호출(discountRate=50, validDays=30)
3. `src/libs/supabase/queries/reviews.ts`
   - `reviewExists(userId, productId): Promise<boolean>` 추가 (id만 select, maybeSingle)
4. `src/libs/supabase/queries/account.ts`
   - `getProfileById`의 select 컬럼 목록에 `referral_code` 추가, `Profile` 타입에도 반영

### C. `gospelfix.cms.api` — API 라우트

5. `src/app/api/v1/auth/signup/route.ts`
   - body에 `referralCode?: string` 추가
   - 세션 즉시 발급 분기(L67 이후) 안에서, 기존 `issueSignupCoupon` 호출과 같은 자리에:
     - `assignReferralCode(data.user.id)`를 항상 호출(모든 신규 회원이 자기 코드를 가짐),
       실패해도 가입은 진행 (try/catch)
     - `referralCode`가 왔으면 `applyReferral(data.user.id, referralCode.trim().toUpperCase())`
       호출, 마찬가지로 try/catch로 격리
6. `src/app/api/v1/reviews/route.ts`
   - `upsertReview` 호출 **전에** `reviewExists(user.id, productId)` 결과를 저장
   - `upsertReview` 성공 후, 위 결과가 `false`(최초 작성)였을 때만
     `issueCoupon(user.id, 20, 30)` 호출 — try/catch로 감싸 실패해도 리뷰 작성 자체는
     성공 처리
7. `src/libs/openapi/schemas/auth.schema.ts`
   - `SignupRequestSchema`에 `referralCode: z.string().optional()` 추가
   - `MeResponseSchema.profile`에 `referral_code: z.string().nullable()` 추가

### D. `gospelfix` — 타입/훅

8. `src/types/auth.types.ts` — `AuthMeResponse.profile`에 `referral_code: string | null;` 추가
9. `src/hooks/useAuth.ts` — `signUp()` 시그니처에 `referralCode?: string` 파라미터 추가,
   `/api/auth/signup` POST body에 포함
10. `src/app/api/auth/signup/route.ts` (BFF) — body에서 `referralCode` 추출해 cms.api
    호출 body에 그대로 전달

### E. `gospelfix` — 회원가입 UI

11. `src/components/auth/AuthModal/SignupForm.tsx`
    - `referralCode` state 추가, "추천인 코드 (선택)" input 필드 추가(비밀번호 확인 입력
      아래, 휴대폰 인증 섹션 위 또는 약관 동의 위 — 필수 아님을 명확히 표시)
    - `useSearchParams()`로 `ref` 쿼리 파라미터를 읽어 초기값으로 자동 채움(공유 링크로
      들어온 친구가 코드를 직접 타이핑할 필요 없게)
    - `handleSubmit`의 `signUp(...)` 호출에 `referralCode` 전달

### F. `gospelfix` — 내 추천인 코드 표시 + 링크 공유

12. `src/app/(mypage)/mypage/page.tsx` — "친구 초대" Card 섹션 추가: `profile.referral_code`
    표시 + "코드 복사" 버튼(클립보드, `CodePreviewSection.tsx`에서 이미 쓴
    `navigator.clipboard.writeText` + `sonner` toast 패턴 재사용) + "링크 공유" 버튼
    (`${origin}/register?ref=${code}` 클립보드 복사). `referral_code`가 아직 없는(백필
    실패 등 극히 드문 케이스) 사용자는 섹션을 숨김.

### G. `gospelfix` — 다중 쿠폰 보유 시 최적 쿠폰 선택 버그 수정

13. `src/lib/coupon.ts` (신규) — `getBestAvailableCoupon(coupons: Coupon[]): Coupon | null`:
    유효(미사용+미만료) 쿠폰 중 `discount_rate`가 가장 높은 것을 반환
14. `src/app/(public)/detail/[slug]/page.tsx`, `src/app/(public)/@modal/(.)detail/[slug]/page.tsx`
    — 두 곳의 `coupons.find(...)` 인라인 로직을 `getBestAvailableCoupon(coupons)` 호출로 교체
    (동일 로직이 두 파일에 중복돼 있던 것도 이번에 하나의 함수로 통합)

## 적용하지 않는 것 (범위 제외 확인)

- 결제/주문 로직(`orders.ts`, `orders/route.ts`)은 **변경 없음** — `discount_rate`를
  임의 % 값으로 이미 지원하므로 50%/20% 쿠폰도 기존 검증/차감/사용처리 로직을 그대로 탄다.
- 추천 횟수 제한, 리뷰 코drop 상한, 소멸 임박 알림 등은 이번 범위에서 제외(사용자가
  "기본 방어만" 선택).
- 마이페이지에 "보유 쿠폰 전체 목록" 페이지는 새로 만들지 않는다(이미 구매 시점에
  `/api/coupons`로 조회되는 기존 흐름을 그대로 사용; 이번엔 추천인 코드 공유 카드만 추가).

## 검증 방법

1. cms.api: `select column_name from information_schema.columns where table_name='profiles'
   and column_name in ('referral_code','referred_by');`로 마이그레이션 반영 확인, 기존
   회원 몇 명 골라 `referral_code`가 비어있지 않은지 확인
2. 신규 회원가입(A) → `profiles.referral_code` 채워졌는지 확인
3. 신규 회원가입(B)이 A의 코드 입력 → 가입 후 A/B 각각 `coupons`에 `discount_rate=50`
   행이 생겼는지, `profiles.referred_by`가 A의 id로 연결됐는지 확인
4. B가 구매한 상품에 리뷰 최초 작성 → `discount_rate=20` 쿠폰 1건 생성 확인, 같은 리뷰를
   수정(재작성) → 쿠폰이 추가로 생기지 않는지 확인
5. A 계정으로 로그인해 마이페이지 접속 → 추천인 코드 카드 노출, "코드 복사"/"링크 공유"
   동작 확인
6. `/register?ref=<A의코드>` 접속 → 회원가입 모달 오픈 시 추천인 코드 입력란에 자동
   채워지는지 확인
7. 20%+50% 쿠폰을 동시에 보유한 계정으로 유료 상품 상세페이지 접속 → 체크박스에
   50% 쿠폰이 적용되는지 확인(수정 전이었다면 먼저 발급된 20%가 잡혔을 케이스)
8. 두 저장소 모두 `yarn tsc --noEmit`, `yarn lint` 통과 확인
9. code-reviewer 에이전트 리뷰 → APPROVED 확인 후에만 커밋(이 저장소 CLAUDE.md 절대 규칙)
