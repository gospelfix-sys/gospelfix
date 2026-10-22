---
name: feedback-no-whole-file-prettier-reformat
description: 텍스트 몇 줄만 고치는 작업에서 npx prettier --write 파일 전체를 돌리지 않는다 — 이 저장소 일부 파일은 이미 Prettier 기준과 어긋난 상태라 무관한 줄까지 재포맷되어 diff 노이즈가 생긴다
metadata:
  type: feedback
---

## 규칙

특정 문구/섹션 몇 줄만 수정하는 작업에서 `npx prettier --write <file>`처럼
파일 전체에 포매터를 돌리지 않는다. 대신 `Edit` 도구로 해당 hunk만 정확히
고친다.

## 계기

`src/app/(public)/about/page.tsx`의 "모다 · B2C" 카드 문구를 고친 뒤
`npx prettier --write`를 돌렸더니, 요청하지 않은 SERVICES·PROCESS·"How We
Build" 섹션의 줄바꿈까지 전부 재포맷됐다. `git stash`로 확인해보니 이 파일은
**내 수정 이전부터 이미** Prettier 기준(`printWidth: 100`)과 완전히 일치하지
않는 상태였다 — 즉 이 저장소는 pre-commit 단계에서 Prettier를 강제하고 있지
않거나, 과거에 수동으로 줄바꿈을 조정한 이력이 섞여 있다. 결국
`git checkout --`으로 되돌리고 `Edit`으로 필요한 hunk만 다시 고쳤다.

## Why

사용자가 요청한 범위(문구 몇 줄)를 벗어나 무관한 코드까지 diff에 걸리면,
리뷰어가 실제 변경 의도를 파악하기 어렵고 `git blame`/PR 리뷰 노이즈가
커진다. "코드 작성 시 Prettier 규칙 준수"라는 CLAUDE.md 규칙은 **새로 쓰는
줄**에 적용하는 것이지, 무관한 기존 줄까지 강제 재포맷하라는 뜻이 아니다.

## How to apply

- 텍스트/문구 수정처럼 범위가 명확한 작업은 `Edit`으로 필요한 부분만 고치고,
  줄 길이(100자)는 손으로 맞추거나 `awk 'NR==N {print length($0)}'` 등으로
  검증한다.
- 파일 전체를 Prettier로 재포맷하고 싶다면(리팩토링/대규모 정리 목적), 그
  자체를 별도 작업으로 명시하고 사용자에게 먼저 확인한다 — "문구만 고쳐줘"
  요청에 끼워 넣지 않는다.
- `npx prettier --check <file>`이 실패해도, 그게 **내 변경 때문인지** 먼저
  `git stash` 등으로 원본 상태를 확인해 원인을 구분한다.
