---
name: admin FormWrapper ConfirmDialog + formRef 패턴
description: 저장/삭제 전 사용자 확인을 받는 admin 폼 래퍼의 표준 패턴
type: feedback
---

admin의 모든 FormWrapper 컴포넌트는 **ConfirmDialog + formRef.requestSubmit()** 패턴을 따른다.

```tsx
// FormWrapper 표준 구조
const formRef = useRef<HTMLFormElement | null>(null); // React 19: | null 필수

// 저장 버튼 클릭 → 다이얼로그 → 확인 시 폼 제출
function handleConfirmSave() {
  setSaveDialog(false);
  formRef.current?.requestSubmit(); // submit()이 아닌 requestSubmit() — HTML5 validation 유지
}

// onSubmit은 isRedirectError 처리 필수 (Form 컴포넌트 내부)
try {
  await onSubmit(form);
} catch (err) {
  if (isRedirectError(err)) throw err; // NEXT_REDIRECT 재던지기
  setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
}
```

**ConfirmDialog variant:**
- `variant="default"` — 저장 확인 (주황 버튼)
- `variant="danger"` — 삭제 확인 (빨간 버튼)

**Why:** 저장/삭제처럼 돌이킬 수 없는 작업에 사용자 확인 단계를 추가하여 실수 방지.
`requestSubmit()`은 HTML5 native validation을 trigger하므로 `submit()` 대신 사용.

**How to apply:** 새 도메인 FormWrapper 생성 시 동일 패턴 적용. news/portfolio/products 모두 동일 구조.
