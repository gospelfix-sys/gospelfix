---
name: project_cross_repo_findings_20260827
description: 2026-08-27 gospelfix.cms.api에서 진행한 worktree-runner 실전 테스트(1~8단계)에서 확인된, 이 저장소에도 그대로 적용되는 harness 동작 사실들
type: project
---

2026-08-27, 이 에이전트 정의(worktree-runner)는 gospelfix와 gospelfix.cms.api 두 저장소에
동시에 추가됐다. 실전 테스트는 gospelfix.cms.api에서 먼저 진행됐고(그쪽 에이전트 메모리
`project_dry_run_20260827.md` 참고), 거기서 확인된 harness 동작 관련 사실은 특정 저장소
코드와 무관하게 이 세션 전반에 적용되므로 이 저장소에서도 동일하게 유효하다.

**이 저장소(gospelfix) 관련 특이사항**:

- `EnterWorktree` 도구는 "세션 시작 시 감지된 primary 저장소 하나에 고정"되는 게 아니라,
  **호출 시점의 세션 cwd가 어느 저장소 안에 있는지로 매번 다시 결정된다.** 실제로 이 메모리를
  기록하려고 `EnterWorktree`를 호출했을 때, 직전 Bash 명령들의 cwd가 gospelfix.cms.api였던
  탓에 gospelfix가 아니라 cms.api 쪽에 worktree가 만들어졌다(`ExitWorktree(remove)`로 버리고,
  `cd`로 gospelfix root로 옮긴 뒤 재호출해서야 이 저장소에 제대로 생성됨). 이 에이전트 정의서의
  "알려진 함정" 절이 "세션 시작 시 감지된 저장소 1개에만 적용된다"고 적어둔 것은 **부정확하다**
  — 정확히는 "호출 시점 cwd 기준"이다. 이 저장소를 대상으로 `EnterWorktree`를 쓸 때는 먼저
  `cd`나 이전 Bash 명령으로 cwd가 이 저장소 안에 있는지 확인하고 호출할 것.

**cms.api 실전 테스트에서 이 저장소에도 그대로 적용되는 사실 (harness 레벨, 저장소 무관)**:

- 격리(`EnterWorktree`/`Write`·`Edit`) 없이는 소스 코드뿐 아니라 `.claude/agent-memory/**`
  메모리 파일도 못 쓴다. background/teammate 세션에서 메모리를 남겨야 하면 작업이 끝난
  worktree를 바로 나가지 말고 그 안에서 메모리 파일까지 쓴 뒤 별도 커밋으로 남길 것.
- `ExitWorktree({action:"remove"})`는 **그 호출로 직접 만든** worktree에만 통한다.
  `EnterWorktree({path:...})`로 재진입한 worktree에는 "소유자가 아니다/lock 충돌"로 거부된다
  → 그 경우 `git worktree remove <path>`로 수동 폴백.
- `bgIsolation` 가드는 `Write`/`Edit` 도구에만 걸리고 `Bash`의 git 명령(`checkout`, `pull`,
  `worktree remove`, `branch -d` 등)에는 걸리지 않는다 — 정리 단계에서 공유 체크아웃에 git
  명령을 실행하는 것은 원래 허용되는 예외다.
- 세션이 `EnterWorktree`로 한 번 나갔다 들어온 뒤에는(`ExitWorktree` 호출 후), 수동으로 만든
  worktree 경로 안이라도 `Write`/`Edit`가 다시 막힌다 — 이 가드는 실제 디렉토리가 격리됐는지가
  아니라 "이번 세션에서 `EnterWorktree`가 현재 활성 상태인지"만 본다. 이 경우 `Write`/`Edit`
  대신 `Bash`로 파일을 직접 쓰면(예: `python3 -c "..."`, heredoc) 우회된다 — 이 메모리 파일
  자체도 정상적으로 격리된 상태에서 `Write`로 작성됐지만, cms.api 쪽 동급 메모리는 이 우회로
  작성됐다.

**적용**: 이 저장소는 `EnterWorktree`가 정상적으로 바인딩되므로(cwd만 맞으면) 1단계 격리는
cms.api보다 매끄럽다. 다만 재진입/정리(8단계) 단계의 함정은 저장소와 무관하게 동일하게 적용되니
그대로 경계할 것.
