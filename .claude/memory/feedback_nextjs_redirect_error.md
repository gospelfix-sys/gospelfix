---
name: Next.js redirect() 에러 처리 패턴
description: Server Action에서 redirect()가 던지는 NEXT_REDIRECT를 catch하면 화면에 텍스트로 표시되는 버그와 수정 패턴
type: feedback
---

Next.js의 `redirect()`는 내부적으로 특수 에러(`NEXT_REDIRECT`)를 throw한다. `try-catch`로 잡히면 `.message`가 화면에 렌더링되는 버그가 발생한다.

**수정 패턴**: 모든 Form 컴포넌트의 catch 블록에 반드시 re-throw를 추가한다.

```ts
import { isRedirectError } from "next/dist/client/components/redirect-error";

try {
  await onSubmit(form);
} catch (err) {
  if (isRedirectError(err)) throw err; // 반드시 먼저 re-throw
  setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
}
```

**Why:** admin 편집 페이지에서 저장 후 "NEXT_REDIRECT" 텍스트가 화면에 출력되는 버그가 발생했고, 원인이 Server Action의 redirect()를 catch가 삼켜버린 것이었다.

**How to apply:** `onSubmit` prop이 Server Action인 모든 클라이언트 폼 컴포넌트(NewsForm, PortfolioForm, ProductForm 등)에 적용한다.
