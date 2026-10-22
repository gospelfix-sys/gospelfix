---
name: feedback_multi_repo_bash_cwd_caution
description: gospelfix와 gospelfix.cms.api를 오가며 작업할 때 Bash 세션의 작업 디렉토리가 이전 cd 상태로 남아있어, 절대경로 없는 명령(yarn lint, npx tsc 등)이 엉뚱한 저장소를 대상으로 실행될 뻔한 사례
metadata:
  type: feedback
---

`gospelfix`(프론트)와 `gospelfix.cms.api`(관리자)는 형제 디렉토리의 완전히 별도
저장소다(`/Users/mac/Documents/work/GospelFix/gospelfix`,
`/Users/mac/Documents/work/GospelFix/gospelfix.cms.api`). 같은 세션에서 두 저장소를
번갈아 수정할 때, Bash 도구의 작업 디렉토리는 명령 간에 유지되므로 한쪽에서
`cd .../gospelfix && ...`를 실행하면 이후 명령들이 명시적으로 `cd`하지 않는 한 계속 그
디렉토리에 머문다.

**Why:** 2026-08-13 세션에서 `gospelfix.cms.api` 파일을 Edit(절대경로라 안전)한 직후,
검증 단계에서 `cd` 없이 `npx tsc --noEmit`/`yarn lint`/`git diff --stat`을 실행했는데,
직전에 `gospelfix` 쪽으로 `cd`했던 상태가 그대로 남아 있어서 실제로는 `gospelfix`
프로젝트를 대상으로 타입체크·lint·diff를 확인하고 있었다. "타입 에러 없음"이라는 결과
자체는 사실이었지만 검증 대상이 틀렸던 것 — `pwd`로 뒤늦게 발견해서 다시 올바른
디렉토리에서 재검증함.

**How to apply:** 여러 저장소를 오가며 작업할 때는 (1) 절대경로 기반 명령을 우선
사용하거나, (2) `cd` 없이 매번 `cd <repo> && <command>` 형태로 한 명령 안에 묶거나,
(3) 최소한 검증 명령(tsc/lint/git diff) 직전에 `pwd`로 현재 위치를 먼저 확인할 것.
특히 "타입 에러 없음"/"lint 통과" 같은 결과를 사용자에게 보고하기 전에는 반드시 어느
저장소를 대상으로 확인했는지 스스로 재확인할 것.

**2026-08-27 재발**: [[project_category_taxonomy_overhaul_2026-08-27]] 작업 중 정확히
같은 패턴으로 다시 발생 — "gospelfix" 검증이라고 이름 붙인 `yarn lint`/`tsc` 호출 2개에
`cd` 없이 실행했는데, 직전에 cms.api Task로 `cd .../gospelfix.cms.api`한 상태가 남아있어
실제로는 cms.api를 두 번 검사하고 gospelfix는 전혀 검증하지 못했다. `pwd`로 뒤늦게
발견해 gospelfix를 명시적 경로로 재검증. **병렬로(한 메시지에 여러 Bash 호출) 두
저장소를 오갈 때 특히 취약** — 각 호출이 "이전 호출이 남긴 cwd"를 그대로 물려받으므로,
호출 순서를 눈으로 추적하지 않으면 실수를 알아채기 어렵다.
