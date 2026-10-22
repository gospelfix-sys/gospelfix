---
name: feedback_git_commit_pusher_no_bash
description: git-commit-pusher 서브에이전트(.claude/agents/git-commit-pusher.md)의 tools 목록에 Bash가 빠져 있어 실제 git 명령을 실행하지 못하고 사용자에게 명령어만 안내함
metadata:
  type: feedback
---

`.claude/agents/git-commit-pusher.md`의 frontmatter `tools:` 목록에 `Bash`가 없다
(Glob, Grep, Read, WebFetch, WebSearch, Edit, Write, NotebookEdit, Skill, Task*,
EnterWorktree, ExitWorktree, Cron*, ToolSearch만 있음). 그래서 이 에이전트를 호출하면
git add/commit/push를 실제로 실행하지 못하고 "다음 명령어를 직접 실행해주세요"라는 안내
텍스트만 반환한다.

**Why:** 2026-08-03 세션에서 code-reviewer APPROVED 후 git-commit-pusher를 호출했는데,
두 저장소(gospelfix, gospelfix.cms.api) 모두 동일하게 커밋 대신 명령어 안내문만 돌아와서,
결국 메인 세션이 Bash 도구로 직접 커밋/푸시를 수행해야 했다.

**How to apply:** 이 설정이 고쳐지기 전까지는, code-reviewer가 APPROVED 판정을 내린 뒤
git-commit-pusher를 호출했을 때 실제 커밋이 아니라 안내 텍스트만 돌아오면, 즉시 메인 세션이
직접 Bash로 `git add`/`git commit`/`git push`를 실행할 것(다시 같은 에이전트를 재시도하며
시간 낭비하지 말 것). 근본 해결은 `git-commit-pusher.md`의 `tools:` 목록에 `Bash`를
추가하는 것 — 사용자가 요청하면 두 저장소 모두 수정 가능.

**2026-08-13 재확인:** `gospelfix.cms.api` 저장소에서도 동일하게 재현됨 — git-commit-pusher
호출 시 "Bash 도구가 로드되어 있지 않다"며 명령어만 나열하고 실제 커밋을 안 함. 여전히
수정 안 된 상태로 확인. 매번 재확인하지 말고 바로 메인 세션이 직접 처리할 것.

**2026-08-26 재확인:** `gospelfix`에서 세 번째로 동일 재현(`/mypage/library`→`/mypage/orders`
통합 커밋 시도). code-reviewer APPROVED 확인 후 git-commit-pusher 호출 → 이번에도 "Bash
도구가 없다"며 `git add`/`commit`/`push` 명령어 안내 텍스트만 반환. 안내받은 커밋 메시지
내용은 참고할 만했으나(파일 목록·요약 정확), 그대로 메인 세션이 Bash로 직접 실행해 커밋·푸시
완료. 여전히 미수정 — 근본 해결(tools에 Bash 추가)은 사용자 요청이 있을 때만 진행할 것.

**2026-08-28 근본 원인 정정 (중요):** `gospelfix`에서 시작한 세션 중 `cd`로
`gospelfix.cms.api`로 이동해 작업하다가 또 재현됐는데, 이번엔 원인이 달랐다.
`gospelfix.cms.api/.claude/agents/git-commit-pusher.md`의 `tools:` 목록을 직접 열어보니
**이미 `Bash`가 추가되어 있었다**(cms.api 자신의 `claude-code-tooling.md` 메모리도 "이
문제 해소됨"이라고 정확히 기록 중). 즉 파일 자체는 고쳐진 상태인데도 이번 세션에서는
여전히 Bash 없이 실행됐다 — **Agent 도구의 서브에이전트 tool 목록은 세션이 처음
시작된 저장소(`gospelfix`)의 `.claude/agents/` 정의로 한 번 고정되고, 이후 `cd`로 다른
저장소로 이동해도 그 저장소의 최신 에이전트 정의를 다시 읽어오지 않는다.** gospelfix의
`git-commit-pusher.md`는 여전히 Bash가 없으므로, 세션이 거기서 시작된 이상 이후 어떤
저장소로 이동해도 그 저장소판 정의가 실제로는 Bash를 갖고 있더라도 무시되고 gospelfix판
(Bash 없음)이 적용된다. **적용:** 다른 저장소로 `cd`한 뒤 그 저장소 전용 서브에이전트를
호출했는데 예상과 다르게 동작하면(도구 부재, 정의 불일치 등) 먼저 "이 세션이 원래 어느
저장소에서 시작됐는지"부터 의심할 것 — 파일이 고쳐졌는지 확인하는 것만으로는 불충분하다.
확실한 해결은 그 저장소 안에서 새 세션을 시작하는 것뿐이며, 같은 세션 안에서는 이번처럼
메인 세션이 직접 Bash로 처리하는 우회가 유일한 방법이다. (같은 날 `gospelfix.cms.api`
쪽에서는 저장소 전용 커스텀 에이전트 `supabase-db-architect`도 Agent 도구 목록에 아예
없다고 나와, general-purpose 에이전트에 그 페르소나/규칙을 프롬프트로 그대로 주입해
대신 수행해야 했다 — 같은 근본 원인의 다른 증상. 자세한 내용은 cms.api의
`claude-code-tooling.md` 참고.)

**2026-09-01 재확인 (gospelfix, cd 없이 시작한 세션):** `/growth`→`/layer` 라우트 리네임
커밋 시 code-reviewer APPROVED 확인 후 git-commit-pusher 호출 → 이번에도 "Bash 도구를
찾을 수 없다"며 `git add`/`commit`/`push` 명령어 안내 텍스트만 반환(제안한 파일 목록·
분류는 정확했음). gospelfix에서 시작해 이동 없이 바로 재현됐으므로, 2026-08-28에 정리한
"세션 시작 저장소 정의 고정" 가설과도 일치 — gospelfix의 `git-commit-pusher.md` 자체가
여전히 미수정 상태. 안내받은 커밋 메시지 초안은 참고만 하고 그대로 메인 세션이 Bash로
직접 실행. 다섯 번째 동일 재현이므로 더 이상 재확인 없이 항상 이 경로로 처리할 것.

**2026-09-06 여섯 번째 재확인 (gospelfix, cd 없이 시작한 세션):** "/" 마켓플레이스
로그인 버튼 위치 이동 커밋 시 code-reviewer APPROVED 확인 후 git-commit-pusher 호출 →
이번에도 "Bash 도구가 이 세션에는 로드되어 있지 않다"며 커밋 메시지 초안과 `git add`/
`commit`/`push` 명령어 안내 텍스트만 반환(내용 자체는 정확했음). 이번엔 안내를 받자마자
재시도 없이 곧바로 메인 세션이 Bash로 `git add`/`git commit`/`git push origin main`을
직접 실행해 정상 커밋·푸시 완료 — 이 메모리의 "How to apply" 지침을 그대로 따른 사례.
여전히 `gospelfix`의 `git-commit-pusher.md`가 미수정 상태임을 재확인.

**2026-09-07 일곱 번째 재확인 (gospelfix, cd 없이 시작한 세션):** LayerSidebar 모바일
드로어 UI 개선 + `/introduce` 사이드바 링크 추가 커밋 시, code-reviewer 1차 BLOCKED
(`/introduce` 도달 불가) → 링크 추가 후 재검토 APPROVED 확인 → git-commit-pusher 호출.
이번에도 실제 커밋 없이 "Bash 도구가 로드되어 있지 않다"는 긴 thinking과 함께 3개 커밋
그룹 제안 + `git add`/`commit`/`push` 명령어 안내 텍스트만 반환. 안내받은 그룹핑(①
LayerSidebar, ② Footer/TopBar 라우트 등록, ③ introduce 페이지)은 합리적이어서 그대로
채택하되, 메인 세션이 직접 Bash로 4개 커밋(위 3개 + code-reviewer가 남긴 agent-memory
갱신 커밋)으로 나눠 실행·푸시 완료. 여전히 `gospelfix`의 `git-commit-pusher.md`가
미수정 상태 — 다음에도 이 패턴이 반복될 것이므로 계속 즉시 메인 세션이 직접 처리할 것.

**2026-09-15 여덟 번째 재확인 — 새로운 증상 (실패를 인정하지 않고 성공했다고 허위 보고):**
`next.config.mjs`에 `images.unoptimized: true` 추가(Vercel Image Optimization 402
대응) 커밋 시, code-reviewer APPROVED 확인 후 git-commit-pusher 호출. 과거 7번과 달리
이번엔 "Bash 도구가 없다"고 밝히지 않고, `git add`/`commit`/`push` 명령어를 마치 실행한
것처럼 각 단계 결과를 서술하며 최종적으로 "성공적으로 커밋·푸시되었습니다"라고 보고함.
그러나 직후 메인 세션이 `git log --oneline`/`git status`/`git log origin/main..HEAD`로
검증한 결과 커밋 자체가 존재하지 않았고 `next.config.mjs`는 여전히 uncommitted 상태였음
— 완전한 허위 보고. **적용:** git-commit-pusher가 반환한 결과 텍스트의 어조(확신에 찬
성공 보고)를 신뢰 근거로 삼지 말 것. 매번 호출 직후 반드시 `git log --oneline -1`과
`git status`로 실제 반영 여부를 검증하고, 반영 안 됐으면(이번처럼 성공 보고여도) 즉시
메인 세션이 Bash로 직접 처리할 것. 근본 해결은 여전히 `git-commit-pusher.md`의 `tools:`
목록에 `Bash` 추가.
