---
name: 코딩 컨벤션 위반 전수 점검 (2026-08-08)
description: 템플릿 리터럴 className→cn() 교체 7건, sonner.tsx style=→className 전환, shadcn 8개 파일 Prettier 재포맷 리뷰 결과
type: project
---

2026-08-08 세션에서 "코드 컨벤션 위반 전수 점검 및 수정" 작업을 진행하고 code-reviewer로
리뷰했다. 이 세션에서는 Bash 도구가 없어(`feedback_env_file_access.md` 패턴과 동일) `git
diff`를 직접 실행하지 못하고, 사용자가 설명한 변경 파일들을 Read로 직접 열어서 정적으로
검증했다.

## 변경 내용과 검증 결과

1. **템플릿 리터럴 className → cn() 교체** (`ProductCard.tsx` PICK/NEW 배지,
   `LeftSidebar.tsx` 5곳, `HeroBanner.tsx` 슬라이드 배경) — 각 cn() 호출의 베이스
   문자열과 조건부 분기 클래스 사이에 tailwind-merge 충돌 그룹이 없음을 직접 대조 확인.
   병합 결과 동일. Major 이슈 없음.

2. **`sonner.tsx`의 인라인 style= 제거** — `style={{"--normal-bg": "var(--popover)",
   ...}}`를 Tailwind 임의 속성 선언 문법(`[--normal-bg:var(--popover)]` 등, className
   안)으로 교체. `node_modules/sonner/dist/styles.css`를 직접 grep해서 sonner가
   `--normal-bg`/`--normal-text`/`--normal-border`/`--border-radius`를 순수 CSS 커스텀
   프로퍼티로만 참조(`var(--normal-bg)` 등)한다는 것을 확인 — 즉 이 값들은 런타임에 JS가
   계산하는 게 아니라 DOM 요소에 커스텀 프로퍼티를 선언하기만 하면 되므로, 선언 방식이
   `style=` 속성이든 Tailwind 임의 속성 className이든 자식 요소로의 CSS 상속이 동일하게
   작동한다. **이전 세션에서 겪었던 RichEditor `var()` 누락 버그와는 근본적으로 다른
   케이스**(그건 실제 동적 값이 빠진 문제였음) — 이번 판단은 맞았다. APPROVED.

3. **shadcn 생성 파일 8개 Prettier 재포맷** (`form,avatar,card,select,sonner.tsx`,
   `RecoilProvider.tsx`, `userAtom.ts`, `authSelector.ts`) — 전부 읽어서 `.prettierrc`
   규칙(쌍따옴표/세미콜론/trailingComma all)에 맞게 기계적으로만 바뀌었고 로직 변경
   없음을 확인.

4. **전수 점검**: `src/` 전체에서 `style={{`, `className={\`...\``, `.join(" ")` 배열
   조합, `asChild` prop 패턴을 grep했으나 전부 0건 — 이 세션 이전에 이미 다른 파일들도
   전수 정리가 끝난 상태였던 것으로 보임.

## 결과

Critical/Major 이슈 없음. 이 시점 기준 코드베이스에는 인라인 style=, 수동 className
배열/join 조합, asChild 위반이 전혀 남아있지 않았다.
