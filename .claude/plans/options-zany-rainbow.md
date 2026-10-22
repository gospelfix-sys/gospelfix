# Options 섹션 상단 "구매 안내 칩" 추가

## Context

사용자가 다른 사이트(오프라인 UX/UI 클래스 상세페이지)의 참고 스크린샷을 제시했다 — 제목/태그
아래에 아이콘+라벨 형태의 3x3 정보 칩 그리드(오프라인 강의 / 8주 과정 / 30시간 이론 / 서울
합정 / 누구나 수강 가능 / 매 수업 실습 / 노트북·피그마 필수 / 포폴 1.5개 제작 / 매 수업 1:1
피드백)가 있고, 이를 참고해서 GOSPELFIX 상세페이지의 "Options" 섹션 상단에도 비슷한 형태로
"해당 상세페이지에 관한 것들"을 채워 넣고 싶어한다.

`Product` 타입(`src/types/product.types.ts`)에는 참고 이미지처럼 상품별로 다른 "8주 과정",
"서울 합정" 같은 세부 메타데이터 필드가 없다 — 카테고리, 상품코드, 제작솔루션, 디자인구분
정도만 있고 나머지는 옵션(`ProductOption`)에 종속된 `work_period_days` 뿐이다. 따라서 9개 칩은
상품마다 달라지는 스펙이 아니라, **이번 세션에서 이미 확정한 GOSPELFIX 구매 서비스의 공통
사실**(결제수단=카카오페이, 환불정책=7일 청약철회, 문의채널=카카오 채널, 콘텐츠 별도 제공 등)을
"한눈에 보는 요약 카드"로 보여주는 용도로 채운다. 사용자에게 확인 후 이 방향(서비스 공통 안내)
으로 확정했다.

목적: 구매 전 사용자가 결제수단·환불정책·제공범위 등 핵심 정보를 스크롤 없이 즉시 파악하게 해서
문의/오해로 인한 이탈·분쟁을 줄인다 (이번 세션에서 다룬 "단순복사 콘텐츠 미포함" 오해, 환불정책
수정 등과 같은 맥락).

## 구현 방식

### 1. 신규 컴포넌트: `src/components/products/ProductInfoChips.tsx`

`component-layers.md` 기준 `features` 계층(`components/products/`)에 해당 — GOSPELFIX
도메인 사실(카카오페이, 7일 철회 등)을 하드코딩하는 컴포넌트라 `components/ui/`에는 적합하지
않음. `OptionToggle.tsx`(같은 디렉토리, 같은 카드 스타일)와 형제 컴포넌트로 분리한다.

- Props: `{ purchaseOptions: ProductOption[] }` — `ProductOptionsSection.tsx`가 이미
  `usePurchaseOption()`으로 갖고 있는 값을 그대로 전달.
- 9개 칩 중 "작업기간" 1개만 실데이터 기반으로 계산(하드코딩 금지 — CMS에서
  `work_period_days`가 바뀌면 자동 반영되어야 함):
  ```ts
  const simpleOption = purchaseOptions.find((o) => !o.is_inquiry_only);
  const hasInquiryOption = purchaseOptions.some((o) => o.is_inquiry_only);
  const workPeriodValue =
    simpleOption?.work_period_days != null
      ? hasInquiryOption
        ? `단순복사 ${simpleOption.work_period_days}일 · 커스터마이징 협의`
        : `${simpleOption.work_period_days}일`
      : "구매 옵션 참고";
  ```
  나머지 8개는 플랫폼 공통 사실이라 정적 텍스트로 둔다.
- `"use client"` 불필요 (hooks/이벤트 없음, props만 받아 정적 렌더링).

### 2. 칩 콘텐츠 (3x3, 아이콘은 lucide-react — 전부 설치 버전에 존재 확인됨)

| # | 아이콘 | 라벨 | 값 |
|---|--------|------|-----|
| 1 | `Globe` | 진행방식 | 전 과정 온라인 |
| 2 | `Calendar` | 작업기간 | (동적) 단순복사 N일 · 커스터마이징 협의 |
| 3 | `Wallet` | 결제수단 | 카카오페이 |
| 4 | `Code2` | 제공형태 | 완성된 소스코드 |
| 5 | `PackageOpen` | 콘텐츠 | 별도 준비 필요 |
| 6 | `Users` | 구매대상 | 누구나 가능 |
| 7 | `ClipboardList` | 진행현황 | 마이페이지에서 확인 |
| 8 | `MessageCircle` | 문의 | 카카오 채널 |
| 9 | `RotateCcw` | 청약철회 | 제작 개시 전 7일 이내 |

라벨:값 표기는 `OptionToggle.tsx:75`(`작업기간 : {workPeriodDays}일`)의 기존 관례를 그대로
따른다.

### 3. JSX/스타일 구조

```tsx
<div className="rounded-2xl border border-gf-border bg-gf-white p-5">
  <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
    {chips.map(({ icon: Icon, label, value }) => (
      <div key={label} className="flex items-center gap-2">
        <Icon className="size-4 shrink-0 text-gf-gray2" />
        <p className="text-sm text-gf-gray1">
          <span className="font-medium text-gf-black">{label}</span> : {value}
        </p>
      </div>
    ))}
  </div>
</div>
```

- 카드 스타일(`rounded-2xl border-gf-border bg-gf-white`)은 `OptionToggle.tsx:49-51`과 동일
  토큰 — products 도메인 카드 관례를 그대로 따름 (legal 도메인의 `ContactCard`
  `rounded-xl`/`gf-line`과는 다름, 섞지 않는다).
- 아이콘 크기는 `size-4`(16px) — `ProductOptionsSection.tsx:39`의 `AlertCircle
  className="size-5"`와 같은 `size-*` 관례. `DevicePreviewFrame`의 `width={17}
  height={17}` 방식은 36px 터치 타깃 툴바 버튼용이라 여기(텍스트 옆 인라인 아이콘)엔
  맞지 않아 채택하지 않음.
- 모바일 1열 / `sm:` 2열 / `lg:` 3열. 칩 값 중 `청약철회`, `작업기간`이 문장형으로 길어서
  2열에서도 줄바꿈이 애매하게 깨질 수 있어 최소 폭 구간(모바일)은 1열로 시작.

### 4. `ProductOptionsSection.tsx` 수정 (2곳만)

- import 추가: `import { ProductInfoChips } from "@/components/products/ProductInfoChips";`
- 27번째 줄(`return (`) 다음, 현재 28번째 줄(`<div className="flex flex-wrap items-center
  gap-2">`, "Options" 제목이 있는 줄) **바로 앞**에 삽입:
  ```tsx
  <ProductInfoChips purchaseOptions={purchaseOptions} />
  ```
- 그 외 로직/상태/다른 JSX는 변경하지 않는다. `page.tsx`, `PurchaseOptionContext.tsx`는
  수정 불필요 (`purchaseOptions`는 이미 20번째 줄에서 destructure되어 있음).

## 중복 검토 (의도적으로 유지)

"작업기간"·"콘텐츠" 2개 칩은 아래 FAQ 다이얼로그/`OptionToggle` 카드와 내용이 겹치지만,
칩은 3~6단어의 telegraphic 요약이고 아래는 전체 문장 설명이라 "위에서 요약, 아래서 상세"
패턴으로 의도적으로 유지한다(TL;DR 칩 → 상세 설명 순서는 흔한 패턴). 나머지 7개(진행방식,
결제수단, 제공형태, 구매대상, 진행현황, 문의, 청약철회)는 이 페이지 어디에도 없거나
FAQ 안에 묻혀있던 정보라 새로 노출하는 가치가 있다.

## 검증 방법

1. `yarn lint` — ESLint 통과 확인.
2. `npx tsc --noEmit -p tsconfig.json` — 타입 에러 없는지 확인.
3. `curl -s http://localhost:3000/detail/mission-team-webapp`로 서버 렌더링 HTML을 받아
   9개 칩 라벨(`진행방식`, `작업기간`, `결제수단` 등)과 아이콘 SVG가 실제로 포함되는지,
   "작업기간" 값이 실제 `work_period_days`(단순복사 옵션 기준) 숫자와 일치하는지 확인.
4. Chrome 확장(`claude-in-chrome`)이 연결되어 있으면 실제 브라우저에서 데스크톱(3열)/모바일
   너비(1열)로 리사이즈해 그리드 반응형이 깨지지 않는지, "Options" 제목 바로 위에 카드가
   배치됐는지 시각 확인. 연결 안 되어 있으면 사용자에게 직접 확인 요청.
