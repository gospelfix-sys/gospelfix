---
name: React 19 useRef 타입 변경 — HTMLFormElement | null
description: React 19에서 useRef 반환 타입이 RefObject<T | null>로 변경되어 Props 타입 선언 방식이 달라짐
type: feedback
---

React 19에서 `useRef<HTMLFormElement>(null)`의 반환 타입이 `RefObject<HTMLFormElement | null>`로 변경됐다. Props에서 `React.RefObject<HTMLFormElement>`로 선언하면 TypeScript 빌드 에러가 발생한다.

**올바른 선언 방식:**

```tsx
// Props 인터페이스
interface Props {
  formRef?: React.RefObject<HTMLFormElement | null>; // ✅ | null 필수
}

// useRef 선언
const formRef = useRef<HTMLFormElement | null>(null); // ✅
```

**Why:** admin ProductFormWrapper에서 formRef를 ProductForm에 넘길 때 `Type 'RefObject<HTMLFormElement | null>' is not assignable to type 'RefObject<HTMLFormElement>'` 빌드 에러 발생. React 19(admin은 React 19 사용)의 breaking change.

**How to apply:** admin/ 내 모든 formRef props 타입 선언에 `| null`을 포함한다. main/(React 18)은 해당 없음.
