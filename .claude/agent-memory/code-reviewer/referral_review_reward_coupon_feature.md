---
name: referral_review_reward_coupon_feature
description: 친구 초대(추천인 코드) + 리뷰 작성 보상 쿠폰 신규 기능(gospelfix+gospelfix.cms.api 폴리레포 합동 리뷰) — 리뷰 쿠폰 발급에 032/033과 동일 클래스의 TOCTOU 레이스 재발견, 1차 BLOCKED
type: project
---

2026-08-11, 기존 "회원가입 20% 쿠폰"(coupons 테이블) 위에 "추천인 코드 50% 쿠폰(추천인+피추천인
양쪽)" + "리뷰 최초 작성 20% 쿠폰" 보상을 얹는 작업 리뷰. 두 저장소 걸쳐 있음:

**gospelfix.cms.api**: `040_add_profiles_referral_columns.sql`(profiles.referral_code unique
nullable + referred_by, 백필 포함), `coupons.ts`의 `issueSignupCoupon` → 공용
`issueCoupon(userId, discountRate, validDays)` 추출, `referrals.ts`(신규,
`assignReferralCode`/`applyReferral`), `reviews.ts`(`reviewExists` 추가),
`auth/signup/route.ts`(referralCode 처리, 셋 다 try/catch로 가입 자체는 안 막음),
`reviews/route.ts`(최초 작성 시에만 20% 쿠폰).

**gospelfix**: `useAuth.ts`/`uiAtom.ts`(`authModalAtom.referralCode`),
`register/page.tsx`(`?ref=` → `openAuthModal` → Recoil 경유로 프론트 레이스 해소),
`SignupForm.tsx`(추천인 코드 입력 필드), `ReferralCodeCard.tsx`(신규, 마이페이지),
`lib/coupon.ts`(`getBestAvailableCoupon` — 기존 `coupons.find()`가 "첫 번째 유효 쿠폰"이라
최고 할인율이 아닐 수 있던 버그를 수정, `detail/[slug]/page.tsx` + `@modal` 양쪽 적용).

## Critical — reviews.ts/reviews/route.ts 리뷰 쿠폰 발급에 TOCTOU 레이스 (2026-08-11 발견)

`isFirstReview = !(await reviewExists(...))` → `upsertReview(...)` → 조건부
`issueCoupon(20,30)` 순서. `reviewExists`는 순수 SELECT이고 `upsertReview`는
`unique(product_id,user_id)` 기반 원자적 UPSERT라 리뷰 레코드 자체는 항상 1건이지만,
`isFirstReview`는 요청별 로컬 변수라서 동시에 두 번 POST하면(더블클릭/중복 탭/네트워크
재시도) 둘 다 "최초"로 판정해 쿠폰이 중복 발급된다.

**Why:** 이 저장소가 `032_add_coupons.sql`→`033_add_orders_coupon_active_unique_index.sql`에서
이미 한 번 Critical로 겪은 "쿠폰을 검증만 하고 예약/잠그지 않는" 결함과 정확히 같은 클래스.
당시는 `orders.coupon_id` 부분 유니크 인덱스 + `CouponConflictError`(`orders.ts:9-14`)로
해결했는데, 이번 리뷰 보상 로직에는 그 교훈이 반영되지 않고 새로 작성됨. `coupons` 테이블에는
"어떤 리뷰 때문에 발급됐는지" 추적할 컬럼이 없어 DB 레벨 방어도 전혀 없음.

**How to apply:** 다음 재검증 시 `reviews.ts`가 `insertOrUpdateReview`류의 함수로 바뀌었는지
확인 — "먼저 INSERT 시도 → unique_violation(23505)이면 UPDATE로 폴백"하는 방식으로 "최초
작성 여부"를 원자적으로 판별해야 한다(이 파일이 이미 쓰는 `issueCoupon`/`assignReferralCode`의
"unique_violation 캐치 후 분기/재시도" 패턴, 그리고 `orders.ts`의 `CouponConflictError` 패턴과
동일한 기법). `reviewExists` + 별도 `upsertReview` 조합(선-조회 후-쓰기)을 보면 항상 이 레이스를
의심할 것 — "발급 사유"를 추적할 컬럼이 없는 리워드 쿠폰 발급 로직 전반(향후 추가될 다른 보상
사유 포함)에 재발 가능한 패턴이므로, 새로운 쿠폰 지급 트리거를 리뷰할 때마다 "check-then-act"
구조인지 최우선 확인.

## Minor — 해소 대상 아님, 백로그

- 소프트 삭제 계정의 `referral_code`가 마스킹 안 되고 계속 유효(`account.ts`
  `softDeleteAccount`가 `referral_code` 미처리, `findProfileIdByReferralCode`도
  `deleted_at` 미필터) — 탈퇴 계정에 쓸 수 없는 쿠폰이 계속 쌓이는 낮은 임팩트 버그.
- `profiles.referred_by` FK가 `on delete` 미지정(`040` 마이그레이션) → 기본 `NO ACTION`이라
  추천받은 적 있는 계정을 관리자가 하드 삭제(`users.ts` `deleteUser`)하면 FK 위반으로 실패
  가능. `on delete set null` 권장.
- `signup/route.ts`가 `!data.session`(이메일 확인 대기)이면 추천인 코드 발급/적용을 통째로
  스킵 — 기존 `issueSignupCoupon`의 전제를 그대로 물려받은 것이라 이번 PR의 신규 결함은
  아니지만, 이메일 확인 설정이 바뀌면 세 호출부(`issueSignupCoupon`/`assignReferralCode`/
  `applyReferral`)를 함께 재검토해야 함을 기록.

## 확인된 양호 사항

- `applyReferral`의 `Promise.all` 병렬 쿠폰 발급 + try/catch로 가입을 막지 않는 설계는
  기존 `issueSignupCoupon` 컨벤션과 일관되고, 결제와 달리 되돌릴 수 없는 트랜잭션이 아니므로
  타당한 원칙 선택.
- `assignReferralCode`/`issueCoupon`의 재시도 루프(코드값 충돌 재시도)는 032/033 레이스와는
  다른 종류이며 올바르게 구현됨 — 문제는 리뷰 쿠폰의 "판별-행동" 레이스뿐.
- `referrerId === newUserId` 자기추천 체크는 신규 코드가 응답에 노출되지 않아 사실상
  도달 불가능하지만 안전장치로서 무해함. 마이그레이션 백필 루프(`for r in select ...`)는
  커서가 시작 시점에 고정되어 무한루프 위험 없음, 유니크 제약을 백필보다 먼저 거는 순서도 올바름.
- `SignupForm`이 `useSearchParams()` 대신 `authModalAtom.referralCode`를 경유하는 설계는
  `AuthModal/index.tsx`가 `authModalView==="signup"`일 때만 `SignupForm`을 마운트하므로
  원래의 URL-타이밍 레이스를 실제로 해소함(atom 갱신과 같은 렌더에서 최초 마운트, URL
  replace와 무관).
- `PurchaseOptionsPanel.tsx`의 기존 "쿠폰가 카트 유출 방지"(`handleAddToCart`가
  `basePrice` 사용)는 이번 diff로 회귀하지 않음. `orders/route.ts`의 `discountAmount`
  계산이 `coupon.discount_rate`를 동적으로 읽어 50%/20% 등 가변 할인율에 이미 대응됨(하드코딩
  20% 없음, grep 확인).
- 스타일 규칙(`style=`, `asChild`, raw `<button>`, `cn()` 미사용) 위반 0건 — `ReferralCodeCard.tsx`
  신규 파일도 `Button`/`Card` 정상 재사용.

## 판정 (2026-08-11, 1차)

BLOCKED — Critical 1건(리뷰 쿠폰 중복 발급 레이스). Bash 도구가 세션에 없어
([[no_bash_tool_constraint]]) git status/diff/tsc/lint를 직접 실행하지 못하고, 사용자가 알려준
변경 파일 목록을 전부 Read로 열람 + 과거 마이그레이션(032/033) 대조하는 정적 검증만 수행함.

## 2차 재검증 (2026-08-11, 같은 날) — Critical 해소, APPROVED

`reviews.ts`의 `upsertReview()`가 "INSERT 우선 시도 → `error.code==='23505'`일 때만 UPDATE
폴백" 구조로 재작성되어 `isFirstReview`를 INSERT 성공 여부만으로 원자적으로 판정하도록
바뀜(반환 타입 `Promise<void>` → `Promise<{ isFirstReview: boolean }>`). `reviewExists()` 함수
자체가 삭제되었고 `route.ts`도 두 단계 호출(`reviewExists` 별도 조회 + `upsertReview`)을
`const { isFirstReview } = await upsertReview(...)` 한 번의 원자적 호출로 통합. grep 재확인
결과 `reviewExists` 참조 `src` 전체에 0건. `orders.ts`의 `CouponConflictError`가 쓰던
"unique_violation 캐치로 레이스 제거" 패턴과 동일한 기법이라 기존 컨벤션과도 일관됨.
사용자가 `yarn tsc --noEmit`/`yarn lint`(cms.api) 로컬 통과 보고.

**최종 판정: APPROVED.** Minor 3건(소프트 삭제 계정 referral_code 미마스킹, referred_by FK
ON DELETE 미지정, 이메일 확인 대기 시 추천인 로직 스킵)은 백로그로 유지, 커밋 판정에는
영향 없음.

**패턴 기록**: 리워드/포인트/쿠폰류 지급 로직에서 "SELECT로 존재 여부 확인 → 조건부 지급"
형태(check-then-act)를 볼 때마다 이 사례를 해결 템플릿으로 참고 — INSERT를 먼저 시도하고
unique 제약 위반 여부로 "최초 여부"를 원자적으로 판정하는 방식이 이 저장소의 표준 해법.

## 후속 라운드 — ReferralCodeCard.tsx 플로팅 배너화 + 위치 충돌 (2026-08-12, 별도 세션 1~3차)

원래 승인된 `ReferralCodeCard.tsx`(스타일 위반 0건 확인됨, 위 "확인된 양호 사항" 참고)가 이후
세션에서 `Alert` 기반 **고정 위치 플로팅 배너**로 재구현됨(`dismissed` 상태 + 닫기 X 버튼 +
`useCookieConsent` 연동 + PC/모바일 반응형 top/bottom 오프셋 추가) — 원본 승인 시점에는 없던
새 기능. 1차 리뷰(agentId a7641b4a54c8e190e)에서 Major(PC `xl:top-6`가 `/growth` 헤더와 9px
여유로 타이트) BLOCKED.

**2026-08-12 3차 재검증(이번 라운드)**:
- Major(PC 상단 겹침) 해소 확인: `xl:top-6`(1280px) → `2xl:top-6`(1536px)로 변경. 1280~1535px
  구간은 `sm:top-24`(96px)로 되돌아가 애초에 헤더(하단 24+60=84px)와 12px 여유가 있어 안전.
  2xl 최소폭(1536px)에서 카트 버튼 포함 `/growth` 헤더(반폭 추정 ≈187px, 1차 리뷰의 9px 데이터
  포인트로 역산한 값과 동일 가정)와 카드(우측 정렬 420px) 사이 수평 간격 ≈137px로 재계산됨 —
  사용자가 주장한 "130px 이상"과 부합, 뷰포트가 넓어질수록 헤더는 고정폭·카드는 우측 고정이라
  간격은 계속 커지기만 함(단조 증가). 완전 해소.
- Minor(쿠키 배너 오프셋) 확인: `bottom-36`→`bottom-40`(160px). 배너 최악 높이(모바일 3줄
  wrap) 추정 ~148px([[nav_header_popover_menu]] 6차 리뷰의 계산 재사용) 대비 12px 여유 —
  `QuoteFloatingButton.tsx`의 `bottom-36`(144px, 이미 승인된 선례)보다 오히려 더 여유롭게
  잡음. Minor 수준 유지, BLOCKED 사유 아님. 정적 오프셋 대신
  `cookieConsent === "accepted" ? "bottom-4" : "bottom-40"` 동적 분기를 쓴 것은
  `QuoteFloatingButton`이 쓰는 `cookieBannerShown` 패턴과 동일한 정석 해법.
- **신규 Major 발견(1~2차 리뷰에서 미포착)**: 닫기(X) 버튼이 `raw <button>`으로 작성됨
  (`AlertAction` 안, `size-6 rounded-full border border-white bg-gf-black`). 원본 파일은
  스타일 위반 0건으로 승인됐었으므로 이 dismiss 버튼은 플로팅 배너화 과정에서 새로 추가된
  코드. `recurring_issues.md` #9/#17/#22/#23/#28/#32/#33과 동일한 "닫기/dismiss 아이콘
  버튼에 Button 컴포넌트 미사용" 패턴의 7번째 재발 — `Button variant="ghost" size="icon-sm"`
  (`dialog.tsx`/`RouteModal.tsx`/`AccountTransferCard.tsx`가 쓰는 기존 확립 패턴)로 교체 필요.
  최종 판정: **BLOCKED**(신규 Major 1건). `CategoryFilter.tsx`(같은 세션, 라이트 테마 전환)는
  독립적으로 이슈 없음 — Link 기반 필터라 raw button 해당 없음.

**How to apply**: "이미 스타일 위반 0건으로 승인된 파일"이라도 이후 세션에서 새 인터랙티브
기능(닫기 버튼, 토글 등)이 추가되면 다시 raw `<button>` 재발 여부를 확인해야 한다 — #32
(AccountTransferCard 복사 버튼)와 완전히 동일한 재발 유형.
