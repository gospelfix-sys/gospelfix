---
name: referral_banner_rotation_feature
description: 추천인 배너가 싱글턴 문구 1개 → cms.api 리스트 기반 다중 배너(5초 회전) 구조로 전환된 프론트 diff 리뷰, 1차 BLOCKED(Major, bannerIndex 배열 범위 초과 크래시 위험) → 2차(같은 날) 수정 확인 APPROVED → 3차(같은 날) 배너별 show_referral_actions 토글 추가, APPROVED
type: project
---

2026-08-12, `gospelfix.cms.api`(자매 저장소)가 `referral_banner_config` 싱글턴 테이블([[referral_banner_config_feature]]에서 막 구축된 것)을 다시 리스트 기반 CRUD 리소스로 교체 — `GET /api/v1/referral-banners`(페이지네이션 `{data, total, page, limit}`, 각 item `{id, message, discount_rate, sort_order, created_at, updated_at}`)로 노출. 프론트([[referral_review_reward_coupon_feature]] 후속 라운드에서 승인됐던 단일 `message` 표시용 `ReferralCodeCard`)가 이를 소비하도록 이번 세션에서 재작업됨.

## 변경 파일
- `types/referralBanner.types.ts`: `{id, message, discount_rate}`로 `id` 필드 추가.
- `app/api/referral-banner/route.ts`(단수) 삭제 → `app/api/referral-banners/route.ts`(복수) 신설 — `cmsApiFetch('/api/v1/referral-banners?limit=50')` 호출, 실패 시 전부 캐치해 항상 `[]` 반환(throw 없음, `news`/`portfolios`/`products` route.ts와 동일한 로컬 `CmsListResponse<T>` 인라인 정의 컨벤션 준수).
- `lib/api/referralBanner.ts` 삭제 → `lib/api/referralBanners.ts` 신설 — `getReferralBanners()`, 이중 try/catch로 `[]` 폴백.
- `ReferralCodeCard.tsx`: prop `message: string` → `banners: ReferralBanner[]`. `bannerIndex` state + 5초 `setInterval` 회전, `AnimatePresence mode="wait"` + `motion.span key={banners[bannerIndex].id}`로 0.4s 크로스페이드. `dismissed || banners.length === 0`이면 `null` 반환(훅 호출 이후에 위치해 Rules of Hooks 위반 없음).
- `(mypage)/layout.tsx`, `(public)/growth/page.tsx`: `getReferralBanner()` → `getReferralBanners()`, `banner &&` → `banners.length > 0 &&`로 교체.

## 검증 결과 — 양호
- BFF 규칙 100% 준수: `cmsApiFetch`는 신규 `referral-banners/route.ts` 안에서만 호출, 나머지는 전부 `serverFetch`/`getReferralBanners()` 경유.
- `style=`, `asChild`, 홑따옴표, `cn()` 미사용 위반 0건.
- 회전 `useEffect`는 `banners.length`를 의존성 배열에 넣고 `setBannerIndex((i) => (i+1) % banners.length)` 함수형 업데이트를 사용 — stale closure 없음. `banners.length <= 1`이면 인터벌 자체를 등록하지 않아 불필요한 리렌더 방지. `AnimatePresence mode="wait"`와 5000ms 간격 vs 400ms 트랜지션은 겹칠 우려 없음.
- 삭제된 단수 모듈(`referral-banner/route.ts`, `lib/api/referralBanner.ts`) 참조 잔존 0건(grep 확인).

## Major — `bannerIndex`가 `banners` 배열 축소 시 범위를 벗어나 크래시 가능 (2026-08-12 발견)

`ReferralCodeCard.tsx:86`의 `const currentBanner = banners[bannerIndex];`가 인덱스를
클램프하지 않는다. `setInterval` 콜백(`:33`)은 `(i + 1) % banners.length`로 항상
안전하지만, **부모 Server Component가 새로 실행되어 더 짧은 `banners` 배열을 새 prop으로
내려보내는 시점**에는 `bannerIndex` state가 즉시 초기화되지 않는다 — React는 같은 트리
위치의 클라이언트 컴포넌트 state를 리렌더 간에 보존하므로, "prop 변경으로 인한 렌더"가
먼저 커밋되고 그 다음에야 `useEffect`(의존성 `banners.length`)가 실행돼 인터벌을
재생성한다. 그 사이 한 프레임 동안 `bannerIndex`가 새 배열 길이보다 크면
`banners[bannerIndex]`가 `undefined`이고, 곧이어 `currentBanner.id`(:102)에서 런타임
예외가 발생해 해당 라우트가 Next.js 에러 바운더리로 떨어진다.

**재현 조건**: `(mypage)/layout.tsx`는 `force-dynamic`이라 `/mypage/*` 서브라우트 간
클라이언트 내비게이션마다 이 레이아웃이 다시 실행돼 `banners`를 매번 새로 fetch한다.
`/growth/page.tsx`도 카테고리/정렬 필터 변경(searchParams 변경, 같은 라우트 소프트
내비게이션)마다 동일하게 재실행된다. 이 사이에 관리자가 cms.api에서 배너 개수를
줄이고(`referral-banners` 리소스가 CRUD 가능해졌으므로 언제든 가능), 사용자가 회전으로
`bannerIndex`를 새 배열 길이 이상으로 진행시킨 상태로 페이지 내 네비게이션을 하면 발생.
낮은 확률이지만 uncaught exception이라 발생 시 임팩트가 크다(페이지 전체가 에러 화면으로
전환).

**Why:** `setInterval` 콜백 쪽은 이미 modulo로 방어했으면서 render-time 읽기(`:86`)만
방어가 빠짐 — 방어 로직이 두 곳 중 한 곳에만 적용된 비대칭 패턴.

**How to apply:** 다음 재검증 시 `:86`이 아래처럼 클램프됐는지 확인.
```tsx
const currentBanner = banners[bannerIndex % banners.length];
```
(`banners.length === 0`은 이미 84행에서 `return null`로 걸러지므로 0으로 나누기 걱정 없음.)
향후 서버에서 내려주는 배열 길이가 클라이언트 로컬 인덱스 state보다 변덕스러울 수 있는
모든 회전/캐러셀류 컴포넌트에서 이 패턴(콜백은 클램프, render-time 읽기는 미클램프)을
우선 의심할 것.

## 판정 (2026-08-12, 1차)

BLOCKED — Major 1건(bannerIndex 배열 범위 초과 크래시 위험). Critical 없음. 사용자가
`yarn lint`/`yarn build` 로컬 통과 보고, Bash 도구 없어([[no_bash_tool_constraint]]) 직접
재실행은 못 함.

## 판정 (2026-08-12, 2차 재검증)

`ReferralCodeCard.tsx:86`이 정확히 제안한 형태(`banners[bannerIndex % banners.length]`)로
수정된 것을 소스 재확인. `banners.length === 0`은 84행 `if (dismissed || banners.length ===
0) return null;`으로 이미 걸러지므로 0으로 나누기 위험 없음. `bannerIndex`는 항상 0 이상(초기값
0, 회전 콜백에서도 `(i+1) % banners.length`로만 갱신)이라 modulo 결과가 항상 유효 인덱스 —
남은 엣지케이스 없음. 관련 파일(`app/api/referral-banners/route.ts`, `lib/api/referralBanners.ts`,
`types/referralBanner.types.ts`, `(mypage)/layout.tsx`, `(public)/growth/page.tsx`) 재대조 결과
1차 리뷰의 "양호" 판정 그대로 유지 — BFF 규칙 준수, style=/asChild/홑따옴표 위반 0건, 삭제된
단수 모듈(`referral-banner`) 참조 잔존 0건(grep 재확인). Critical/Major 0건 — **APPROVED**.
이 세션도 Bash 도구 없어 `yarn lint`/`yarn build` 직접 재실행은 못 함(정적 검증만).

관련: [[referral_banner_config_feature]](같은 배너 기능의 이전 백엔드 설계 — 이번에
싱글턴에서 리스트로 재차 교체됨), [[referral_review_reward_coupon_feature]](`ReferralCodeCard`
최초 도입 및 플로팅 배너화 히스토리).

## 판정 (2026-08-12, 3차 — `show_referral_actions` 배너별 토글 추가)

cms.api가 `referral-banners` 리소스에 컬럼을 추가해, 순수 홍보 문구 배너(예: "리뷰 작성하고
25% 할인 쿠폰 받아가세요!")는 코드 배지+복사/공유 버튼을 숨길 수 있게 됨.

**변경**: `types/referralBanner.types.ts`에 `show_referral_actions: boolean` 추가(기존
`is_active`/`is_used`/`is_published` 등과 동일하게 snake_case 그대로, 별도 camelCase 변환 없음
— 이 저장소의 기존 컨벤션과 일치). `ReferralCodeCard.tsx`는 크로스페이드 단위인
`motion.div`(`key={currentBanner.id}`) 안에서 `AlertDescription`(코드 배지+버튼 2개)을
`{currentBanner.show_referral_actions && (...)}`로 조건부 렌더링.

**레이아웃 검증 결과 — 문제 없음**:
- `Alert` 루트는 `grid gap-[1.125rem]`이지만 두 번째 자식 `AlertAction`이 `absolute`이므로
  CSS Grid 스펙상 grid item 배치·트랙 사이징에 관여하지 않음(absolutely-positioned grid
  item은 사이즈에 기여하지 않고 auto-placement에서도 제외) → grid는 사실상 1-트랙(motion.div만)
  으로 동작해 AlertDescription 유무와 무관하게 gap 관련 여백 문제 없음.
  motion.div 자체는 `flex flex-col gap-[1.125rem]`이고, AlertDescription이 없을 때는 자식이
  `AlertTitle` 하나뿄이라 flex gap도 자연히 사라짐(적용될 두 번째 아이템이 없으므로) — 리뷰
  요청에서 사용자가 추정한 근거가 정확했음, 잔여 여백/그리드 붕괴 없음.
- `AnimatePresence mode="wait"`는 배너 전환 시 이전 배너가 완전히 exit한 뒤 다음 배너가
  mount되므로 두 배너가 동시에 그려지는 경합은 없음. 다만 `motion.div`에 `layout` prop이 없어
  높이 변화(액션 블록 유무로 인한)가 애니메이션 없이 즉시 반영됨 — `bottom-4`/`bottom-6`
  fixed 배치라 위쪽 가장자리가 순간 이동하는 시각적 튐이 있을 수 있음. 다만 이는 배너 텍스트
  길이 차이만으로도 이미 발생하던 것과 같은 클래스의 기존 승인된 동작이라 이번 diff가
  새로 만든 회귀는 아님 — Minor 참고 수준.
- boolean 필드를 `&&`로 바로 truthy 체크하는 패턴은 이 저장소에서 이미 흔함
  (`is_active`, `is_published`, `is_used` 등 cms.api가 실제 JS boolean으로 내려주는 값들과
  동일 컨벤션) — 새로운 리스크 아님.
- BFF 규칙(`cmsApiFetch`는 route.ts 안에서만), `style=`/`asChild`/홑따옴표/`cn()` 위반 0건.
  `discount_rate` 필드가 이 컴포넌트에서 미사용인 것은 이번 diff 이전부터 있던 상태로 이번
  변경 범위 밖.

**Critical/Major 0건 — APPROVED.** Bash 도구 없어 `yarn lint`/`yarn build` 직접 재실행은
못 함(사용자가 로컬에서 둘 다 통과 보고, 정적 리뷰만 수행).
