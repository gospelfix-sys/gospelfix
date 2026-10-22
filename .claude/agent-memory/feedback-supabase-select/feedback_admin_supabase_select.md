---
name: Supabase select 와일드카드 금지
description: admin/src/libs/supabase/ 및 main/src/lib/supabase/ 내 쿼리에서 select("*") 와일드카드 사용 금지 규칙
type: feedback
---

`admin/src/libs/supabase/` 및 `main/src/lib/supabase/` 내 모든 쿼리 함수에서 `select("*")` 와일드카드 사용을 지양한다. 반드시 필요한 컬럼을 명시적으로 열거할 것.

```ts
// ❌ 지양
supabase.from("products").select("*")

// ✅ 권장
supabase.from("products").select("id, slug, name, category, price, is_active, created_at")
```

**Why:** 컬럼 명시 시 스키마 변경에 따른 타입 불일치를 조기에 감지할 수 있고, 불필요한 데이터 전송을 방지할 수 있다.

**How to apply:** admin과 main 양쪽 모두 Supabase 쿼리 함수를 작성하거나 수정할 때 항상 컬럼을 명시한다. API 호출 경로(`app/api/` 포함)에서도 동일하게 적용한다.
