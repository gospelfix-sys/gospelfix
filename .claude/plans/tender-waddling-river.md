# 프롬프트 파일 별도 판매 기능 추가

## Context

현재 GOSPELFIX는 "완성 소스 + 세팅까지 포함"(소상공인용) 템플릿 상품만 판매한다.
비즈니스 모델을 확장해 "프롬프트 파일도 별도 판매"(개발자·에이전시용)를 새 판매
상품군으로 추가하고 싶다.

사용자 아이디어는 기존 상품 상세페이지의 "코드 샘플이 보여지는 블럭"
(`CodePreviewSection`)을 활용해 "Prompt" 탭을 만드는 것이었다. 코드베이스를
조사한 결과, 이 아이디어는 **"프롬프트 일부를 미리보기로 보여주는 용도"**로는
정확히 맞는 재사용이지만, "별도 판매"의 핵심(결제·파일 전달)까지 이 컴포넌트가
처리해줄 수는 없다는 것이 확인됐다. 이유:

- `CodePreviewSection`은 로그인·구매 여부와 무관하게 **누구나 볼 수 있는 무료
  공개 프리뷰**로 설계되어 있다. 판매할 프롬프트 실물을 그대로 넣으면 결제 없이
  전체를 가져갈 수 있다.
- 이 시스템은 **"상품 1개 = 파일 1개(SKU 1개)" 구조**다. `purchase_options`는
  가격 표시용 껍데기일 뿐이며, 주문 생성 API(`orders/create`)에 옵션 식별자가
  전달되지 않고, 다운로드 API(`/api/downloads/[productId]`)도 상품당 파일 1개만
  지원한다. 완성 소스와 프롬프트를 "같은 상품의 옵션"으로 묶으면 결제해도 어떤
  옵션을 샀는지 기록되지 않고 파일도 구분해서 내려줄 수 없다.

사용자와 논의를 거쳐 다음 방향으로 확정했다:

1. **프롬프트 파일은 완성 소스와 완전히 별도의 독립 상품으로 등록한다.** 기존
   주문/결제/다운로드 파이프라인을 그대로 재사용할 수 있어 이 저장소만으로
   완결 가능하고, cms.api(별도 저장소) 쪽 스키마 변경이 필요 없다.
2. **미리보기는 프롬프트 전체가 아니라 일부만 공개한다.** 컴포넌트를 블러/워터마크
   처리하는 대신, `code_preview` 필드에 발췌본만 등록하는 **데이터 운영**으로
   해결한다 (코드 변경 없음).

## 아키텍처 제약

이 저장소(`gospelfix`, 포트 3000)는 Supabase에 직접 접근하지 않고, 별도 저장소
`gospelfix.cms.api`(포트 3001)를 서버사이드에서만 호출하는 BFF 구조다. 상품 등록
(CRUD)·파일 업로드는 전부 cms.api 저장소 책임이며, 이 계획은 **`gospelfix`
저장소(프론트/BFF) 안에서 처리 가능한 변경만** 다룬다.

## 사전 확인된 핵심 사실 (코드로 검증됨)

- `src/app/api/products/route.ts`는 cms.api에 `category` 파라미터를 전달하지
  않고 전체 상품을 받아온 뒤 **이 저장소가 직접** `sliced.filter((p) => p.category
  === category)`로 필터링한다. 즉 cms.api가 `category: "prompt"` 상품을
  반환하기만 하면 목록/필터는 코드 수정 없이 그대로 동작한다.
- `/api/downloads/[productId]`는 `productId`만 받아 cms.api의 signed URL을
  그대로 리다이렉트한다. 별도 상품으로 등록하면 자동으로 파일이 분리되므로 수정
  불필요.
- `CodePreviewSection`은 `src/components/products/ProductDetailView.tsx`
  단 한 곳에서만 호출된다. "공용 컴포넌트는 정의 파일 자체를 고친다" 원칙에 따라
  호출부(prop threading)를 건드릴 필요 없이 컴포넌트 내부에서 `product.category`로
  분기하면 된다.
- `EXTENSION_LANGUAGE_MAP`(`CodePreviewSection.tsx:41-54`)에 매핑 안 되는
  확장자(`.txt` 등)는 이미 `"markup"`으로 안전하게 폴백된다(58행). 크래시 없음.

## 이 저장소 밖에서 필요한 전제 조건 (cms.api, 실제 수정 대상 아님)

- 관리자에서 `category: "prompt"` 값으로 새 상품 등록 가능해야 함
- `code_preview` 필드에 프롬프트 **전체가 아닌 일부 발췌본**만 등록 (운영 정책)
- `production_solution`, `design_type` 등 프롬프트 상품에 맞는 값 입력
- 판매할 프롬프트 파일 자체를 상품에 업로드 (SKU 1개 = 파일 1개 구조 재사용)

## 변경 파일

### 1. `src/types/product.types.ts` — 카테고리 상수 3곳 모두 추가

카테고리를 추가하려면 반드시 아래 **3개** 상수를 모두 갱신해야 한다 (기존에
`blog`가 `PRODUCT_CATEGORY_LABELS`엔 있는데 `PRODUCT_CATEGORIES`엔 누락된
불일치가 이미 존재함 — 같은 실수를 반복하지 않도록 3곳 모두 명시적으로 확인).

```ts
export const PRODUCT_CATEGORY_LABELS: Record<string, string> = {
  landing: "랜딩페이지",
  dashboard: "대시보드",
  ecommerce: "이커머스",
  corporate: "기업·단체",
  blog: "블로그",
  prompt: "프롬프트", // 추가
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  { value: "all", label: "전체" },
  { value: "landing", label: PRODUCT_CATEGORY_LABELS.landing },
  { value: "dashboard", label: PRODUCT_CATEGORY_LABELS.dashboard },
  { value: "ecommerce", label: PRODUCT_CATEGORY_LABELS.ecommerce },
  { value: "corporate", label: PRODUCT_CATEGORY_LABELS.corporate },
  { value: "prompt", label: PRODUCT_CATEGORY_LABELS.prompt }, // 추가
];

export const PRODUCT_FORMAT_LABELS: Record<string, string> = {
  landing: "AI기반 랜딩페이지",
  dashboard: "AI기반 대시보드",
  ecommerce: "AI기반 쇼핑몰",
  blog: "AI기반 블로그",
  corporate: "AI기반 홈페이지",
  prompt: "프롬프트 파일", // 추가 — ProductInfoChips "제공형태" 칩용
};
```

- `PRODUCT_FORMAT_LABELS`를 빠뜨리면 `ProductInfoChips.tsx:57`의
  `PRODUCT_FORMAT_LABELS[category] ?? "AI기반 홈페이지"` 폴백 때문에 프롬프트
  상품 상세페이지 "제공형태" 칩에 엉뚱하게 "AI기반 홈페이지"가 뜬다.
- 기존 `blog` 카테고리가 `PRODUCT_CATEGORIES`에 누락된 버그는 이번 작업 범위와
  무관하므로 건드리지 않는다 (필요하면 별도로 요청).
- 이 상수들만 고치면 `CategoryFilter.tsx`, `ProductCard.tsx`(`getCategoryLabel`
  사용), `ProductInfoChips.tsx` 전부에 자동 반영된다.

### 2. `src/components/products/CodePreviewSection.tsx` — 제목을 카테고리 기반으로 분기

호출부(`ProductDetailView.tsx`)는 건드리지 않고, 컴포넌트가 이미 받고 있는
`product`에서 카테고리를 직접 참조해 제목만 조건부로 바꾼다.

```ts
const sectionTitle = product.category === "prompt" ? "프롬프트 미리보기" : "코드 미리보기";
```

`<h2>` 텍스트(101행)를 `{sectionTitle}`로 교체.

- **COPY 버튼은 그대로 유지한다.** 데이터 운영으로 발췌본만 노출하므로 복사돼도
  유출되는 건 발췌본뿐이고, "바로 써볼 수 있다"는 신뢰 신호로 작동할 수 있다.
- 파일 상단 주석(1행)과 `code_preview` 필드 주석(47행)이 "코드 미리보기 섹션"으로
  고정 서술되어 있는데, 이제 프롬프트 미리보기 용도로도 쓰이므로 주석을 범용
  표현으로 다듬는다 (선택, 코드 동작에는 영향 없음).

### 3. `/mall` 목록 페이지 — 코드 변경 불필요

`CategoryFilter.tsx`가 `PRODUCT_CATEGORIES` 배열을 순회할 뿐이라 1번 변경만으로
"프롬프트" 필터 탭이 자동 노출된다. `src/app/api/products/route.ts`의 필터링도
문자열 equality라 `category=prompt` 쿼리가 그대로 동작한다.

## 1차 범위 제외 (참고용, 이번엔 구현 안 함)

- **크로스셀** (완성 소스 상품 → 관련 프롬프트 상품 유도): 상품 간 관계를
  모델링하려면 새 필드와 cms.api 응답/관리자 UI 변경이 선행되어야 해서 이번
  세션 범위를 벗어난다. 추후 별도로 검토.
- **`ProductInfoChips`의 "구매대상: 누구나 가능", "진행방식: 전 과정 온라인"
  같은 나머지 칩**: 완성 소스 상품 기준으로 쓰인 문구라 프롬프트 상품에는 다소
  안 맞을 수 있다 ("제공형태" 칩만 이번에 수정). 필요하면 추후 카테고리별 칩
  세트 분기를 별도로 요청.

## 검증 절차

1. cms.api 쪽에 `category: "prompt"`인 테스트 상품이 최소 1개 등록되어 있다고
   가정 (전제 조건).
2. `yarn dev` 실행 후 `/mall`에서 "프롬프트" 필터 탭이 노출되고, 클릭 시
   `/mall?category=prompt`로 해당 상품만 표시되는지 확인.
3. 프롬프트 상품 상세페이지(`/detail/[slug]`) 진입 시:
   - 카테고리 배지 "프롬프트" 정상 표시
   - "제공형태" 칩이 "프롬프트 파일"로 표시 (기존 폴백 문구가 뜨지 않는지 확인)
   - `code_preview`에 발췌본이 등록돼 있으면 섹션 제목이 "프롬프트 미리보기"로 표시
   - 구매 → `/orders/create` → 결제/다운로드 흐름이 기존 상품과 동일하게
     동작하는지 확인 (수정하지 않은 경로이므로 회귀 없는지 확인 목적)
4. `npx tsc --noEmit`으로 타입 에러 없는지 확인, `yarn lint` 통과 확인.
5. code-reviewer 에이전트로 최종 리뷰 후 APPROVED 판정 확인.
