---
name: mypage_shared_layout_conventions
description: /mypage 그룹의 max-width 값은 두 개의 독립 파일에 나뉘어 있어 함께 바꿔야 하고, 여러 진입 경로를 가진 페이지의 뒤로가기는 router.back()을 쓴다
metadata:
  type: feedback
---

## max-width는 헤더와 본문이 서로 다른 파일에 각각 있다

`/mypage/**` 화면의 최대 너비는 한 곳이 아니라 **두 개의 독립된 파일**에 각각 지정돼 있다.

- `src/components/dashboard/DashboardHeader.tsx` — 헤더 내부(`<div className="mx-auto ...
  max-w-[...] ...">`)
- `src/app/(mypage)/layout.tsx` — 사이드바+본문을 감싸는 `<main className="mx-auto ...
  max-w-[...] ...">`

두 값은 시각적으로 위아래로 붙어 있어 하나의 컨테이너처럼 보이지만 실제로는 서로 다른
컴포넌트다. 사용자가 "여기 max-width를 1200px로 바꿔줘"라고 두 번(같은 세션에서 각 className을
따로 지정) 요청한 것도 이 둘이 별개 파일이기 때문이다.

**Why:** 헤더와 본문의 너비가 나눠져 있으면 향후 헤더만 풀블리드로 넓히는 등의 변형이
자연스럽게 가능해지는 장점이 있지만, 반대로 "정렬을 맞추려면 두 파일을 항상 함께 고쳐야 한다"는
동기화 리스크를 동반한다.

**How to apply:**
- `/mypage` 레이아웃의 최대 너비를 바꾸는 요청을 받으면, 사용자가 헤더/본문 중 하나만
  언급했더라도 다른 하나도 값이 어긋나 있지 않은지 먼저 확인한다(둘 다 같은 값으로 맞춰야
  좌우 정렬이 맞는다).
- 두 파일 모두 [`shared-component-changes.md`](../../rules/shared-component-changes.md)의
  "공용 정의 파일을 고친다" 원칙 대상이다 — 개별 mypage 페이지(`page.tsx`)에서 너비를
  재정의하지 않는다.

## 여러 진입 경로를 가진 페이지의 뒤로가기 버튼

`/mypage`는 growth 사이드바 프로필 메뉴, 직접 URL 접근 등 여러 경로에서 진입할 수 있는
페이지다. 이런 페이지에 "뒤로가기" 버튼을 추가할 때는 고정된 `href`(예: `/`) 대신
`next/navigation`의 `useRouter().back()`을 쓴다 — 실제로 어디서 왔는지와 무관하게 항상 같은
곳으로 보내면 "뒤로가기"라는 이름과 실제 동작이 어긋난다.

**참고 구현:** `src/components/mypage/BackButton.tsx`(client component, `router.back()`),
`src/app/(mypage)/layout.tsx`에 딱 한 번 배치해 모든 `/mypage/**` 라우트 상단에 자동으로
노출되도록 함(페이지마다 반복 배치하지 않음 — 공용 레이아웃 배치 원칙).
