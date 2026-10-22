---
name: project_stack
description: gospelfix 저장소 기술 스택 및 핵심 아키텍처 결정사항 (2026-07-23 admin 분리 이후)
type: project
---

**2026-07-23부로 아키텍처 변경**: gospelfix는 더 이상 main/admin 모노레포가 아니다.
admin 앱 전체가 별도 저장소 `gospelfix.cms.api`(포트 3001)로 완전히 이전되었고,
이 저장소(`gospelfix`)에는 Next.js 14 + Tailwind v3 + shadcn base-nova 단일 앱만 존재한다.

**추가 변경 (같은 날, 평탄화 작업)**: `main/` 서브폴더 자체도 제거되어, 이제 저장소
루트가 곧 앱 루트다 (`src/`, `package.json`, `tsconfig.json` 등이 모두 루트에 위치).
즉 "admin 분리"와 "main/ 평탄화"는 별개의 두 단계였고, 현재는 두 단계 모두 완료된
상태 — 저장소에 서브폴더 구분이 전혀 없다. `.github/workflows/ci.yml`(구 ci-main.yml)도
루트 기준 경로로 갱신되어 `working-directory`/`paths` 필터 없이 동작하며,
`CMS_API_BASE_URL`/`CMS_API_KEY`를 build 시크릿으로 정확히 주입한다 (과거 메모에
남아있던 "ci-main.yml이 갱신되지 않아 Supabase/Toss 키를 잘못 주입한다"는 내용은
이제 stale — 확인 결과 해소됨).

**Why:** 관리자 기능(상품/소식/포트폴리오 CRUD, 주문 승인, 회원 관리)을 별도 배포 단위로
분리하기 위해 P6 단계에서 admin/ 폴더(85개 tracked 파일)와 `.github/workflows/ci-admin.yml`을
삭제. 같은 단계(P5)에서 main의 `@supabase/supabase-js`, `@supabase/ssr` 의존성도 완전히
제거하고, main은 서버 사이드에서만 `gospelfix.cms.api`의 REST API(`/api/v1/*`, `lib/cmsApi/`)를
호출하는 BFF 구조로 전환됨.

**2026-07-27 아이콘 라이브러리 교체**: `iconoir-react` → `lucide-react`로 전면 통일(20개 파일 +
`yarn remove iconoir-react`). shadcn select.tsx가 이미 lucide-react를 쓰고 있어 두 라이브러리 공존을
피하기 위한 결정. 코드/의존성 마이그레이션은 완전하나, `CLAUDE.md`(설치된 라이브러리 표)와
`.claude/agents/nextjs-style-auditor.md`(Step 5, "Iconoir가 표준"이라고 명시)는 아직 구버전 서술이
남아있어 다음 리뷰 시 재확인 필요 — 자세한 내용은 [[recurring_issues]] #19 참고.

**How to apply:**
- admin/, main/src/lib/supabase/ 등 과거 경로를 언급하는 오래된 메모리(project_admin_components.md,
  feedback_confirm_dialog_pattern.md 등 `.claude/memory/`, `.claude/agent-memory/` 하위 다수)는
  이제 이 저장소가 아니라 `gospelfix.cms.api` 저장소 기준으로 읽어야 한다 — 혼동 주의.
- 패키지 매니저는 yarn만 허용 (npm 금지).
- main은 Supabase JS SDK에 의존하지 않지만, `next.config.mjs`의 `images.remotePatterns`에
  `**.supabase.co`는 여전히 필요하다 (Supabase Storage에 저장된 이미지 URL을 next/image로
  표시하기 위함 — SDK 제거와 이미지 호스팅은 별개 문제).
- `.github/workflows/ci-main.yml`은 P5/P6 이후에도 업데이트되지 않아 이제 쓰이지 않는
  `NEXT_PUBLIC_SUPABASE_URL`/`TOSS_SECRET_KEY`를 build 시크릿으로 주입하고, 정작 필요한
  `CMS_API_BASE_URL`/`CMS_API_KEY`는 빠져 있다 (현재는 정적 생성 시점에 cms.api를 호출하는
  페이지가 없어 빌드가 깨지진 않지만, 향후 generateStaticParams 등으로 빌드 타임 fetch가
  추가되면 CI에서만 실패할 수 있음 — 리뷰 시 재확인 필요).
