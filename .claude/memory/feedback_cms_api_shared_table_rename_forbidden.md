---
name: feedback_cms_api_shared_table_rename_forbidden
description: gospelfix.cms.api의 profiles/auth_api_configs/content_api_configs/phone_verifications/referral_banners 5개 공유 인프라 테이블은 리네임 절대 금지 — 이 저장소에서 유사 요청이 오면 먼저 확인할 것
metadata:
  type: feedback
---

사용자가 Supabase `profiles` 테이블을 "공통으로 쓰인다는 의미로" `common_profiles`로
리네임해달라고 요청해 작업에 착수했다가, cms.api 저장소를 조사하던 중 과거에 이미
**정반대의 명시적 결정**이 기록돼 있는 걸 뒤늦게 발견했다.

- `gospelfix.cms.api/supabase/backups/2026-08-15/047_rename_gospelfix_lineup_tables.sql`의
  코멘트: "profiles/auth_api_configs/content_api_configs/phone_verifications/
  referral_banners는 두 라인업이 공유하는 인프라/공용 테이블이므로 이번 리네이밍 대상에서
  제외한다(**절대 리네임 금지**)."
- `gospelfix.cms.api/CLAUDE.md`의 "핵심 규칙 요약"에도 동일 내용이 현재진행형 절대
  규칙으로 남아 있다: "두 라인업이 공유하는 인프라 테이블(`profiles`, `content_api_configs`
  등)만 예외"(접두사 없음 자체가 "공유 테이블"이라는 의도적 신호).

즉 이 5개 테이블의 "접두사 없음"은 버그나 방치가 아니라, `gospelfix_`/`moda_` 접두사
체계를 도입하면서 의도적으로 남겨둔 공용 인프라 표시였다. 사용자에게 이 사실을 공유하자
"그래도 common_ 접두사로 5개 전부 통일" 쪽으로 한 번 더 진행 의사를 밝혔으나, 추가로
"이 세션(gospelfix)에서는 cms.api의 `supabase-db-architect` 서브에이전트(Supabase MCP로
직접 DDL 실행)를 호출할 수 없다 — DB rename 실행 자체가 cms.api 디렉토리에서 새 세션을
열어야 가능하다"는 두 번째 제약까지 확인된 시점에 사용자가 전체 작업을 취소시켰다
("해당 작업은 일단 없는걸로 한다").

**Why:** 과거 결정이 날짜 박힌 백업 마이그레이션 파일의 주석에만 있었다면 놓치기 쉬웠겠지만,
이번엔 cms.api 자신의 CLAUDE.md "절대 규칙"에도 동일 내용이 살아있는 문서로 올라가 있었다
— 즉 코드/스키마를 먼저 고치기 전에 관련 저장소의 CLAUDE.md부터 읽었다면 애초에 작업
착수 전에 막을 수 있었던 혼선이다.

**How to apply:** gospelfix(이 저장소)에서 cms.api의 테이블명·스키마 변경과 관련된 요청이
오면, 코드 조사보다 먼저 `gospelfix.cms.api/CLAUDE.md`와
`gospelfix.cms.api/.claude/agents/supabase-db-architect.md`를 읽어 "리네임 금지" 같은
절대 규칙이 있는지 확인한다. 또한 cms.api의 Supabase 스키마 변경(DDL/DML)은 2026-09-05
정책 변경 이후 `supabase-db-architect` 서브에이전트가 Supabase MCP(`apply_migration`/
`execute_sql`)로 직접 실행하는 방식으로 바뀌었고, 이 MCP 연결은 cms.api 저장소에만
구성돼 있어 gospelfix 세션에서는 접근 불가하다 — 실제 DB 변경이 필요하면 사용자에게
cms.api 디렉토리에서 새 세션을 열도록 안내해야 한다.
