---
name: signup_coupon_countdown_hook_extraction
description: 회원가입 축하 쿠폰 모달(SignupCouponModal)과 DiscountCountdown의 카운트다운 인터벌 중복을 useCountdown 훅으로 통합한 리팩터 리뷰 — 1차 BLOCKED(Major 1건+Minor 2건) → 재검증 전부 해소, APPROVED
type: project
---

2026-08-18, 회원가입 축하 쿠폰(`src/components/coupon/SignupCouponModal.tsx`,
`src/store/atoms/couponAtom.ts`의 `signupCouponAtom`) 기능 리뷰에서 지적한 3건 모두 해소 확인.
[[coupon_feature_cart_leak]]에 기록된 "회원가입 20% 쿠폰"(할인가 적용) 기능과는 별개로, 이번
건은 가입 직후 뜨는 축하 쿠폰 **모달 UI + 만료 카운트다운** 쪽 리팩터다.

## 해소 내역

1. **Major(카운트다운 인터벌 중복)**: `src/hooks/useCountdown.ts` 신규 —
   `useCountdown(target: string | null): number | null`. 1초 tick, `target` null이면
   무동작, `ms <= 0`이면 `clearInterval`. `DiscountCountdown.tsx`와 `SignupCouponModal.tsx`
   둘 다 이 훅으로 교체, 각자의 `useEffect`/`useState` 인터벌 로직 제거. `formatRemainingTime`
   (포맷팅)은 `lib/countdown.ts`에 그대로 유지 — "언제 계산할지"(훅)와 "어떻게 보여줄지"(포맷
   함수)를 분리한 설계로, [[shared-component-changes]] 원칙에 부합.
2. **Minor(로그아웃 시 쿠폰 atom 미리셋)**: `useAuth.ts`의 `signOut()`에
   `resetSignupCoupon()`(`useResetRecoilState(signupCouponAtom)`) 추가.
3. **Minor(signUp 순차 fetch)**: `refreshAuthUser()`와 쿠폰 조회를 `Promise.all`로 병렬화.
   cms.api `/api/v1/auth/signup`가 응답을 반환하기 전에 `issueSignupCoupon()`을 이미 `await`
   완료하므로 두 fetch는 서로 독립적 — 안전.

## 검토 중 발견한 잔여 엣지케이스 (Minor, 미차단)

`Promise.all([refreshAuthUser(), fetchSignupCoupon()])`에서 `fetchSignupCoupon`은 내부
try/catch로 모든 에러를 흡수하지만 `refreshAuthUser()`는 그렇지 않다. `refreshAuthUser()`가
reject하면 `Promise.all` 전체가 reject하지만(기존 순차 코드와 동일하게 `signUp()` 호출부까지
에러가 전파됨), **reject 시점에 이미 `fetchSignupCoupon()`이 완료돼 `setSignupCoupon()`을
호출했을 수 있어**, 바깥에서 "가입 실패"로 처리하는 와중에도 축하 쿠폰 모달이 떠 있을 수
있다. 다만 `refreshAuthUser()`는 `axiosInstance.get(..., { validateStatus: () => true })`라
401 등 비정상 상태코드에서도 reject하지 않고, 진짜 네트워크 예외(오프라인 등) 상황에서만
reject하므로 실질 발생 가능성은 낮다 — 다음에 이 근처를 다시 만질 때만 참고.

## How to apply

- `target: string | null` 형태의 만료 시각 카운트다운이 새로 필요하면 `useCountdown()`을
  재사용할 것 — `setInterval`을 컴포넌트에 직접 쓰지 않는다.
- `SignupForm.tsx`(휴대폰 인증 재전송 타이머)는 "고정 초 단위 감소" 패턴이라 `useCountdown`과
  시그니처가 다름(target 타임스탬프가 아님) — 통합 대상 아님, 혼동 주의.
