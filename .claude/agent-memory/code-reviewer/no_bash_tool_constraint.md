---
name: no_bash_tool_constraint
description: 이 프로젝트 세션에는 Bash 도구가 아예 없을 때가 있어 tsc/eslint/build를 실제로 실행할 수 없음 — 대체 검증 방법과 보고 의무
type: feedback
---

code-reviewer 페르소나 지침은 리뷰 전 `npx tsc --noEmit`, `npx eslint`, `npm run build`를 실행해
빨간 오류를 자동 수정하라고 요구하지만, 세션에 따라 Bash 도구 자체가 로드되어 있지 않을 수 있다
(ToolSearch로 "select:Bash" 조회 시 "No matching deferred tools found").

**Why:** 실행 도구가 없는 상태에서 "tsc를 돌려 오류를 다 고쳤다"고 보고하면 사용자가 이를 신뢰하고
그대로 커밋/푸시하게 되어, 실제로는 검증되지 않은 타입 오류나 빌드 실패가 방치될 위험이 있다.
(component-writer 에이전트도 동일한 제약을 별도로 기록함: `.claude/agent-memory/component-writer/no-bash-tool-verify-manually.md`)

**How to apply:**
- 리뷰 시작 시 Bash 사용 가능 여부를 먼저 확인한다. 없으면 최종 보고에 "tsc/eslint/build를 실행하지
  못했다"는 사실을 명시적으로 남기고, 사용자에게 로컬에서 `yarn build`/`yarn lint` 실행을 권고한다.
- 이 세션에는 Read/Edit/Write/Glob/Grep은 정상적으로 로드되어 있었다 (component-writer 메모의
  "grep/glob도 없다"는 기록과 달리, code-reviewer 세션에서는 Glob/Grep이 사용 가능했음 — 세션마다
  로드되는 도구 목록이 다를 수 있으니 매번 실제로 확인할 것).
- tsc 대체: tsconfig.json의 `paths`/`include`, 실제 import 구문(`@/...`)이 파일 이동 후에도 가리키는
  경로가 실재하는지 Glob/Read로 대조 확인.
- eslint 대체: `.eslintrc.json`/`.prettierrc` 설정 자체가 올바른지 확인하고, Grep으로 흔한 위반 패턴
  (`style={{`, `asChild`, 홑따옴표 등)을 표본 검색.
