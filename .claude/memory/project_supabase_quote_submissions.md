---
name: quote_submissions 테이블 스키마 누락 컬럼
description: Supabase quote_submissions 테이블에 누락된 5개 컬럼 — ALTER TABLE 실행 여부 미확인
type: project
---

`submitQuoteAction.ts`는 다음 5개 컬럼을 insert하지만 테이블에 없으면 500 에러가 발생한다.

**추가 필요한 컬럼 (ALTER TABLE 미실행 시 500 에러):**
```sql
ALTER TABLE public.quote_submissions
  ADD COLUMN IF NOT EXISTS shop_industry TEXT,
  ADD COLUMN IF NOT EXISTS shop_status TEXT,
  ADD COLUMN IF NOT EXISTS production_scope TEXT,
  ADD COLUMN IF NOT EXISTS required_features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS needs_system_dev BOOLEAN DEFAULT FALSE;
```

**Why:** 2026-07-14 견적 마법사 쇼핑몰 관련 필드가 Server Action에 추가됐으나 DB 테이블에는 반영되지 않아 500 에러 발생.

**How to apply:** 사용자가 Supabase 대시보드 SQL Editor에서 위 SQL을 실행했는지 다음 대화에서 확인할 것. 실행 완료 후 이 메모리 삭제 또는 업데이트.
