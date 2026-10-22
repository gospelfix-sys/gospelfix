---
name: feedback_route_rename_docs_memory_triage
description: 라우트 경로를 리네임/스왑할 때 .md 문서·메모리를 어디까지 고칠지 판단하는 기준 — "지금도 참조되는 살아있는 문서"만 갱신하고, "특정 시점의 사건 기록"은 그대로 둔 채 인덱스 최상단에 날짜 기준점 메모리 하나만 추가
metadata:
  type: feedback
---

"/"↔"/growth" 라우트 콘텐츠 스왑(2026-08-28, [[project_root_growth_route_content_swap_2026-08-28]]
참고) 작업 중, 사용자가 "코드 말고 서브에이전트 메모리나 다른 md 파일도 다 수정된 거냐"고
재차 확인했다. 이 저장소엔 `/growth`를 마켓플레이스로 서술하는 `.md`가 30개 넘게 있었는데,
전부 훑어보니 두 종류로 나뉘었다.

1. **살아있는 문서** — `CLAUDE.md`(프로젝트 지침), `.claude/agent-memory/**`의 컨벤션/패턴
   문서(예: `mypage_shared_layout_conventions.md`의 코드 예시 `href="/growth"`) — 지금
   이 순간 "사실"로 참조된다. 갱신 안 하면 다음에 이 문서를 읽는 에이전트가 틀린 정보로
   판단한다.
2. **특정 시점의 사건 기록** — `mall_to_growth_route_rename.md`(제목 자체가 과거 사건),
   `growth_sidebar_redesign_review.md` 같은 code-reviewer의 과거 리뷰 로그, 날짜가 박힌
   `project_*.md`(예: `project_business_model_vertical_ai_pivot.md`), `docs/*.md` 중
   `[폐기됨]`으로 명시된 아카이브 — 그 시점엔 정확했던 기록이라 지금 기준으로 고쳐 쓰면
   오히려 역사가 왜곡된다.

**Why:** `mall_to_growth_route_rename.md`처럼 제목 자체가 과거형 사건인 문서를 "지금
기준"으로 고치면, 그 문서가 존재하는 이유(그 시점의 정확한 경위 보존)가 사라진다. 반대로
`CLAUDE.md`의 라우트 다이어그램처럼 매 세션 자동으로 읽히는 문서를 안 고치면 즉시 잘못된
판단으로 이어진다(이미 `doc_auth_redirect_mismatch.md`에 기록된, CLAUDE.md 미동기화로
반복됐던 실패 패턴과 같은 종류).

**How to apply:** 다음에 또 라우트/URL을 리네임하거나 스왑할 때:
1. `grep -rl "<옛경로>" --include="*.md" .`로 전체 `.md`를 훑는다(사용자가 "md 파일도
   다 됐냐"고 물어볼 걸 기다리지 말고 먼저 할 것).
2. 각 매치를 "지금도 참조되는 살아있는 사실"인지 "그 시점 기록"인지 판정한다 — 제목이
   과거 사건이거나(`*_route_rename.md`, `*_review.md`), 파일 상단에 날짜/폐기 표시가
   있으면 대부분 후자.
3. 살아있는 문서만 실제로 고친다(CLAUDE.md, 컨벤션 문서의 예시 코드/경로).
4. 과거 기록은 하나하나 쫓아가며 고치지 않는 대신, `.claude/memory/`(또는 해당
   서브에이전트 인덱스) 최상단에 "이 날짜부터 반대/변경됨"이라는 포인터 메모리 **하나만**
   추가한다 — 이후 오래된 `/growth` 등의 서술을 보는 쪽(사람이든 에이전트든)이 날짜만
   비교하면 재해석할 수 있게 만드는 게 목적이다. 실행 예시:
   `project_root_growth_route_content_swap_2026-08-28.md` + `MEMORY.md` 최상단 항목.
