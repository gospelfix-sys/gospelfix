# Memory Index

- [2026-08-27 cms.api 실전 테스트에서 확인된 저장소 무관 harness 함정](project_cross_repo_findings_20260827.md) — EnterWorktree는 호출 시점 cwd 기준으로 바인딩(세션 시작시 고정 아님), ExitWorktree(remove)는 재진입 worktree엔 불가, bgIsolation은 Write/Edit만 막고 Bash git은 안 막음
