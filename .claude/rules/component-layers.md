# 컴포넌트 생성 규칙 — shared / widgets / features / pages

## 목적

새 컴포넌트를 만들 때 "이건 어느 계층에 속하는가"를 판단하는 사고 틀이다. **폴더명을
`shared/`, `widgets/`, `features/`, `pages/`로 실제 변경하는 마이그레이션은 하지 않는다** —
이 프로젝트는 이미 `components/ui/`, `components/[domain]/`, `components/layout/`,
`src/app/**/page.tsx` 구조를 쓰고 있고([`component-writer.md`](../agents/component-writer.md),
[`code-reviewer.md`](../agents/code-reviewer.md)의 "컴포넌트 위치 규칙" 참고), 아래 4개
계층은 그 기존 폴더에 매핑되는 **개념적 분류**일 뿐이다. 실제 판정 기준(어느 폴더에
파일을 놓을지)은 기존 두 문서의 표가 우선한다.

## 4개 계층 정의

### `shared` — 원자 컴포넌트

> 여러 프로젝트에서도 재사용 가능한 최소단위 컴포넌트, 유틸리티를 포함.

- 도메인 지식이 전혀 없다. props만으로 완전히 제어되고, 다른 프로젝트에 그대로 복사해도
  동작한다.
- 어떤 비즈니스 로직(구매, 인증, 주문 등)도 담지 않는다.
- **실제 위치**: `components/ui/`
- 예: `Button`, `Checkbox`, `Dialog`, `Input`, `Badge`

### `widgets` — 복합 컴포넌트

> 여러 기능이나 UI 요소를 독립적인 단위로 조합한 컴포넌트.

- `shared` 컴포넌트 여러 개(때로는 `features` 일부)를 조합해 하나의 완결된 UI 블록을
  이루지만, **특정 도메인 데이터/비즈니스 액션에 종속되지 않는다** — 여러 페이지에서 그대로
  재사용 가능해야 한다.
- `features`와 구분하는 핵심 질문: "이 컴포넌트를 다른 도메인 페이지에 옮겨 써도 의미가
  통하는가?" 통한다면 widgets, 특정 도메인(상품 구매, 리뷰 등)에서만 말이 된다면 features다.
- **실제 위치**: `components/layout/` (Header, Footer, Sidebar 등). 도메인과 무관한 복합
  UI가 새로 필요하면 `components/widgets/`를 신설해도 된다(현재는 아직 없음).
- 예: `Header`(로고+네비+검색+로그인 버튼 조합), `AppSwiper` 래퍼

### `features` — 도메인 컴포넌트

> 특정 행동과 사용자 상호작용에 관련된 기능을 포함.

- 특정 도메인의 데이터/액션(구매, 리뷰, 인증, 견적 등)에 강하게 결합된다.
- 서버 상태 조회, Recoil 상태, 폼 제출, API 호출 트리거 등 비즈니스 로직을 직접 담는다.
- **실제 위치**: `components/[domain]/` (`products/`, `orders/`, `auth/`, `reviews/`,
  `quotes/` 등)
- 예: `products/BuyButton.tsx`, `products/PurchaseOptionsPanel.tsx`,
  `products/OptionToggle.tsx`, `auth/AuthModal`

### `pages` — 페이지 단위 컴포넌트

> 위 세 계층을 실제 라우트에 조합해 하나의 화면으로 완성하는 최상위 컴포넌트.

- 데이터 페칭(`serverFetch`)과 `widgets`/`features`/`shared` 배치를 담당한다. 자체
  비즈니스 로직은 최소화하고 "조합"에 집중한다.
- **실제 위치**: `src/app/**/page.tsx` (App Router route segment)
- 예: `app/(public)/detail/[slug]/page.tsx`

## 매핑 표

| 계층 | 이 프로젝트의 실제 폴더 | 판단 기준 |
|------|------------------------|-----------|
| `shared` | `components/ui/` | 도메인 지식 zero, 다른 프로젝트에 그대로 재사용 가능 |
| `widgets` | `components/layout/` (신규 시 `components/widgets/`) | 도메인 무관, 여러 `shared`/`features`를 조합한 완결 블록, 여러 페이지에서 재사용 |
| `features` | `components/[domain]/` | 특정 도메인 데이터/액션에 결합 (구매·인증·주문·리뷰 등) |
| `pages` | `src/app/**/page.tsx` | 라우트 단위 조합, 데이터 페칭 담당 |

## 새 컴포넌트를 만들 때 판단 순서

1. **도메인 지식이 전혀 없고 props만으로 완전히 제어되는가?** → `shared` (`components/ui/`)
2. **특정 도메인 데이터/사용자 액션에 묶여 있는가?** (구매, 인증, 주문, 리뷰, 견적 등) →
   `features` (`components/[domain]/`)
3. **도메인에 묶이진 않았지만 여러 `shared`/`features`를 조합한, 다른 페이지에 옮겨도
   의미가 통하는 완결 블록인가?** → `widgets` (`components/layout/` 또는 신규
   `components/widgets/`)
4. **라우트 하나에만 쓰이는 최상위 조합인가?** → `pages` (`app/**/page.tsx`)

판단이 애매하면 1→4 순서로 먼저 맞는 계층에서 멈춘다 (더 좁은 계층부터 검토).

## 이 프로젝트 기존 컴포넌트로 본 분류 예시

| 파일 | 계층 | 이유 |
|------|------|------|
| `components/ui/dialog.tsx` | `shared` | 도메인 지식 없음, 어떤 프로젝트에도 이식 가능 |
| `components/ui/button.tsx` | `shared` | 원자 단위, props만으로 제어 |
| `components/layout/Header.tsx` (있다면) | `widgets` | 여러 shared 조합, 도메인 무관, 모든 페이지 재사용 |
| `components/products/OptionToggle.tsx` | `features` | 상품 구매 옵션이라는 특정 도메인 액션에 결합 |
| `components/products/PurchaseOptionsPanel.tsx` | `features` | 구매(주문) 도메인 로직과 상태에 결합 |
| `components/products/BuyButton.tsx` | `features` | 주문 생성이라는 특정 액션 트리거 |
| `app/(public)/detail/[slug]/page.tsx` | `pages` | serverFetch로 데이터 조회 + features/shared 배치 |

## 주의

- 이 문서는 **개념 정의와 기존 구조 매핑**만 제공한다. 실제 파일을 어느 폴더에 둘지는
  `component-writer.md`/`code-reviewer.md`의 "컴포넌트 위치 규칙" 표가 최종 기준이다.
- 공용 컴포넌트(주로 `shared`/`widgets`)를 수정할 때는
  [`shared-component-changes.md`](./shared-component-changes.md)의 원칙(개별 호출부가
  아니라 정의 파일 자체를 고친다)을 함께 따른다.
