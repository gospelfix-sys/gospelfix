# 커밋/배포 계획: CLAUDE.md 최적화 + 관련 정리

## 배경
이전 대화에서 완료한 작업:
1. `CLAUDE.md` 최적화 — 실제 코드베이스(라우트 구조, Recoil atoms, `.env`, `package.json`)와
   대조해 발견한 문서-코드 불일치 수정 (누락된 `api/cart`/`api/coupons`/`api/referral-banners`
   라우트, `cartAtom`/`quoteAtom` 등 Recoil 상태, 도메인별 부가 기능 표, 환경변수, 라이브러리 표 추가).
2. `.env.example` 갱신 — 구버전(Supabase 변수) 삭제 후 실제 사용 변수
   (`CMS_API_BASE_URL`, `CMS_API_KEY`, `NEXT_PUBLIC_PAYMENT_*`, `NEXT_PUBLIC_POSTHOG_*`)로 재작성.
   1차 code-reviewer 리뷰에서 "완전 삭제는 `.gitignore`의 `!.env.example` 예외 규칙 및
   `infra-architect.md` 컨벤션 위반"이라는 Major 지적을 받아 삭제 대신 최신화로 수정함.
3. `package.json`/`yarn.lock` — 미사용 패키지 `tw-animate-css` 제거 (`yarn remove`),
   `yarn build` 성공 확인 완료.
4. `src/app/(auth)/login`, `(auth)/register` 빈 폴더 삭제 완료(이미 반영됨, 재작업 불필요).

세션 중 permission mode가 plan으로 리셋되면서 Bash/Read(.env.*)가 막혀, `.env.example`이
실제로 재작성된 상태인지 자체 확인이 안 되는 상황이 발생했다. 별도로 실행한 code-reviewer
서브에이전트가 큐에 걸려 1시간 넘게 응답하지 않아 중단시켰다.

## 이번에 할 일 (plan mode 해제 후)
1. `.env.example`을 아래 내용으로 다시 `Write`해 확실한 상태로 맞춘다 (덮어쓰기라 안전, 파괴적 아님):
   ```env
   CMS_API_BASE_URL=http://localhost:3001
   CMS_API_KEY=your-internal-api-key

   NEXT_PUBLIC_PAYMENT_BANK=
   NEXT_PUBLIC_PAYMENT_ACCOUNT=
   NEXT_PUBLIC_PAYMENT_HOLDER=

   NEXT_PUBLIC_POSTHOG_KEY=
   NEXT_PUBLIC_POSTHOG_HOST=
   ```
2. `git status`/`git diff --stat`로 실제 스테이징 대상 재확인 (`CLAUDE.md`, `.env.example`,
   `package.json`, `yarn.lock`만 — `.claude/settings.json`, `.mcp.json`은 이번 작업 범위
   밖이라 제외).
3. 새로운 code-reviewer 서브에이전트를 (막혔던 이전 것 재사용하지 않고) 새로 실행해 최종
   APPROVED 판정을 받는다.
4. APPROVED 확인 후 4개 파일만 `git add` → 한국어 커밋 메시지로 `git commit` → `git push`.
5. "배포"는 이 저장소가 Vercel(`vercel.json` 존재) 기반이라 `main` 브랜치 push 시 자동
   배포되는 구조로 판단된다 — 별도 수동 배포 명령 없이 push로 트리거될 것으로 예상.
   수동 트리거가 필요하면 사용자에게 확인 후 진행한다.

## 실행 안 하는 것 (범위 밖, 별도 안내만)
- `.claude/settings.json`의 `Read(./.env.*)` deny 규칙이 `.env.example`까지 막고 있는 문제는
  이번 커밋과 무관한 별도 설정 이슈이므로, 사용자가 원할 때만 손댄다.
