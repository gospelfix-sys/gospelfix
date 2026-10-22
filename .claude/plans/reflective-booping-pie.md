# 회원가입 축하 할인 쿠폰 모달

## Context

사용자가 참고 이미지(보라→파랑 그라데이션의 "회원가입 40% 할인 쿠폰" 축하 화면)를 기반으로,
GospelFix에 "회원가입하면 50% 할인 쿠폰을 받았다"는 것을 알려주는 UI 화면을 요청했다.

조사 결과 참고 이미지의 그라데이션 카드 배경은 `docs/design.md`의 명시적 규칙
("카드 배경에 그라데이션·원색 채색 금지 — 카드/섹션은 항상 중립면, 컬러는 아이콘·라벨·텍스트
포인트로만", 106줄)과 정면으로 충돌하고, 프로젝트 전체에 카드 배경을 그라데이션으로 채운 사례가
전혀 없으며, `tailwind.config.ts`에도 보라/파랑 계열 브랜드 토큰이 없다. 사용자에게 확인한 결과
**GospelFix 디자인 시스템에 맞게 재해석**(레이아웃 구조는 유지하되 색은 오렌지 포인트로 치환)하기로
결정했다. 또한 표시할 할인율은 **실제 발급된 쿠폰 데이터**(`/api/coupons`)를 그대로 쓰기로 했고
(하드코딩 아님 — 실제 cms.api가 지금 몇 %를 발급하든 그 값을 그대로 보여준다), 노출 시점은
**회원가입 완료 직후 자동**으로 정했다.

## 디자인 재해석 방향

- 쿠폰 "티켓" 카드: 배경은 중립면(`bg-gf-white`, `border-gf-border`, `rounded-2xl`)으로 유지하고,
  참고 이미지의 좌우 원형 절취선(펀치홀) 장식은 형태 요소이므로 그대로 재현 가능(색이 아니라 모양).
  가운데 큰 퍼센트 숫자는 기존 `StatsSection`에서 이미 쓰는 패턴인
  `text-5xl sm:text-[clamp(44px,5vw,68px)] font-black text-gf-orange`를 그대로 재사용 — 컬러는
  "숫자 강조" 텍스트 포인트로만 쓰는 규칙을 그대로 만족한다.
- 상단 아이콘: `lucide-react`의 `Gift` 아이콘 + `w-14 h-14 rounded-full bg-gf-orange-bg` 원형
  배경(기존 아이콘 배지 패턴, design.md 90줄 "라인 아이콘 + 연한 오렌지 원형 배경").
- 유효기간 박스: `bg-gf-orange-bg rounded-xl p-4` 안에 라벨 + 카운트다운(분:초 또는 일/시:분:초).
- 하단 CTA: `CartModal`의 결제 버튼(`src/components/cart/CartModal/index.tsx:210-218`,
  `<Button size="lg" className="h-14 w-full rounded-2xl ...">`)과 동일한 기존 관례를 따라, shadcn
  `Button`에 `rounded-full h-14` className을 얹어 마케팅 CTA 룩을 낸다(모달 안에서도 이미 이렇게
  쓰는 선례가 있음 — 신규 예외 아님).
- "무제한 생성" 문구는 제외한다 — `types/coupon.types.ts`의 `Coupon`에 그런 필드가 없고
  (`discount_rate`/`expired_at`/`source`만 존재), 사용자 요청도 "50% 할인 쿠폰"까지만이었다.

## 변경 파일

### 1. `src/lib/countdown.ts` (신규)

`DiscountCountdown.tsx`(`src/components/products/DiscountCountdown.tsx:6-13`)에 이미 있는
`formatRemaining(ms)` 함수(일 단위 있으면 `N일 HH:MM:SS`, 없으면 `HH:MM:SS`)를 그대로 추출한다.
쿠폰 모달의 카운트다운도 동일한 포맷이 필요한데(쿠폰 `expired_at`은 참고 이미지처럼 분 단위가
아니라 실제로는 며칠 뒤일 수 있음), 두 번째 소비처가 생기는 시점이므로
`.claude/rules/shared-component-changes.md` 원칙대로 복붙 대신 공용 유틸로 뽑는다.

```ts
export function formatRemainingTime(ms: number): string { ... } // 기존 로직 그대로 이동
```

`DiscountCountdown.tsx`는 이 함수를 import해서 쓰도록 리팩터링(동작 변화 없음).

### 2. `src/store/atoms/couponAtom.ts` (신규)

```ts
import { atom } from "recoil";
import type { Coupon } from "@/types/coupon.types";

export const signupCouponAtom = atom<Coupon | null>({
  key: "signupCouponAtom",
  default: null,
});
```
`cartAtom.ts` 패턴과 동일한 형태.

### 3. `src/components/coupon/SignupCouponModal.tsx` (신규, features 레이어)

`components/coupon/`은 신규 도메인 폴더지만, `lib/coupon.ts`/`types/coupon.types.ts`/
`app/api/coupons/`가 이미 쿠폰을 독립 도메인으로 다루고 있어 `component-layers.md`의 features 판단
기준(특정 도메인 데이터에 결합)에 부합한다.

- `signupCouponAtom`을 읽어 `coupon !== null`일 때만 `Dialog`(`components/ui/dialog.tsx`) 렌더링
  (`AuthModal`과 동일하게 `open={coupon !== null}` / `onOpenChange={(open) => !open && reset()}`)
- 내부 구조: Gift 아이콘 배지 → 헤드라인(`{coupon.discount_rate}% 할인 쿠폰을 받았어요`, `font-black
  tracking-tight`) → 티켓형 카드(퍼센트 숫자 중심) → 유효기간 박스(`formatRemainingTime`으로
  `coupon.expired_at - Date.now()` 1초 간격 갱신, 만료 시 컴포넌트 자동 숨김 — `DiscountCountdown`과
  동일한 `useEffect`+`setInterval` 패턴) → 하단 CTA 버튼(클릭 시 atom을 `null`로 리셋해 닫기)
- 모든 className 조합은 `cn()` 사용, 인라인 `style=` 없음

### 4. `src/hooks/useAuth.ts` 수정 (70-99줄 `signUp` 콜백)

`refreshAuthUser()` 직후, `confirmationRequired`가 아닐 때만 `/api/coupons`를 조회해서
`source === "signup"`이고 `isCouponUsable()`(재사용: `lib/coupon.ts:33`)한 쿠폰이 있으면
`signupCouponAtom`에 세팅한다. 실패해도 가입 자체는 막지 않도록 별도 try/catch로 감싸고 콘솔
경고만 남긴다(기존 `referral-banners` 라우트처럼 "실패해도 핵심 흐름을 막지 않는다" 컨벤션과 동일).

```ts
if (!confirmationRequired) {
  await refreshAuthUser();
  try {
    const { data: coupons } = await axiosInstance.get<Coupon[]>("/coupons");
    const signupCoupon = coupons.find((c) => c.source === "signup" && isCouponUsable(c));
    if (signupCoupon) setSignupCoupon(signupCoupon);
  } catch {
    // 쿠폰 조회 실패는 가입 완료 자체를 막지 않는다
  }
}
```
`useSetRecoilState(signupCouponAtom)`을 훅 상단에 추가.

### 5. `src/components/auth/AuthProvider/index.tsx` 수정

`<AuthModal />` 옆에 `<SignupCouponModal />`을 나란히 마운트(전역 1회, `AuthModal`과 동일한 위치
패턴). `SignupForm.tsx`는 수정 불필요 — 이미 성공 시 `closeAuthModal()`을 호출하므로, `AuthModal`이
닫히고 나서 (atom이 세팅되어 있다면) `SignupCouponModal`이 이어서 뜬다.

## 검증 방법

1. `yarn dev`로 개발 서버 실행 후 실제 회원가입 플로우를 브라우저로 진행:
   - 신규 이메일로 가입 → 휴대폰 인증 → 제출 → `AuthModal`이 닫히고 이어서 쿠폰 모달이 뜨는지 확인
   - 쿠폰 모달의 할인율이 `/api/coupons` 응답의 실제 `discount_rate`와 일치하는지 확인
   - 카운트다운이 1초마다 갱신되는지, 만료 시각이 지나면 표시가 사라지는지 확인
   - CTA 클릭 시 모달이 닫히는지 확인
2. cms.api가 signup 쿠폰을 발급하지 않는 계정(또는 로컬 환경에 cms.api 연동이 없는 경우)으로
   가입해도 에러 없이 조용히 모달이 뜨지 않는지 확인(그레이스풀 디그레이드)
3. 이메일 인증이 필요한 가입 플로우(`confirmationRequired`)에서는 쿠폰 모달이 뜨지 않는지 확인
   (아직 계정이 활성화되지 않아 쿠폰이 없을 수 있음)
4. 모바일 뷰포트에서 `DialogContent`의 좌우 여백(`inset-x-4`)이 정상 동작하는지 확인
5. `yarn build`로 타입 에러 없는지 확인
6. 작업 완료 후 `code-review` 스킬로 코드 리뷰(공용 컴포넌트 규칙, 인라인 style 금지, `cn()` 사용
   여부 등 CLAUDE.md 규칙 준수 확인)
