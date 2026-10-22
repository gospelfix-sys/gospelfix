---
name: code_preview_section_review
description: 상품 상세 "코드 미리보기" 기능(CodePreviewSection.tsx, react-syntax-highlighter) 신규 리뷰 — 1차 BLOCKED(Critical customStyle 인라인 스타일 우회 + Major raw button 탭 미분리 + Major @types 버전 불일치) → 같은 날 재검증 전부 해소, APPROVED
metadata:
  type: project
---

2026-08-11 상품 상세페이지에 "코드 미리보기" 섹션(`src/components/products/CodePreviewSection.tsx`,
신규) 추가. `product.code_preview: ProductCodePreviewItem[]` 배열을 탭으로 렌더링하고
`react-syntax-highlighter`의 `PrismLight`로 신택스 하이라이팅. `ProductDetailView.tsx`의 grid
왼쪽 컬럼(`lg:order-1`) 안에 정확히 배치되어 [[detail_page_grid_content_placement]] 버그가
재발하지 않음.

**1차 리뷰 BLOCKED 사유 (2026-08-11)**:
1. **Critical**: `<CodeBlock customStyle={{ margin: 0, borderRadius: 0, maxHeight: "20rem",
   fontSize: "13px" }}>` — `style=` 리터럴 문자열은 아니지만 정적 CSS를 인라인 객체로 주입하는
   동일한 패턴. `node_modules/react-syntax-highlighter/dist/esm/highlight.js`를 직접 읽어
   `className`이 `<pre>`로 그대로 포워딩됨을 확인해, dnd-kit 같은 정당한 예외가 아니라 순수
   회피 가능한 위반임을 증명. 자세한 재발 방지 지침은 [[recurring_issues]] #34 참고.
2. **Major**: 탭 트리거가 `components/ui/`에 분리되지 않고 raw `<button>`으로 작성됨(CLAUDE.md
   아토믹 UI 목록에 `Tab`이 명시적으로 포함, `recurring_issues` #9/#17/#22/#23/#28/#32/#33과 동일
   패턴의 8번째 반복). 프로젝트에 `Tab` 계열 컴포넌트가 아예 없었던 최초 도입 지점이었음.
3. **Major**: `package.json`에 `react-syntax-highlighter@^16.1.1` + `@types/react-syntax-
   highlighter@^15.5.13`(메이저 버전 불일치)를 설치하고, `as unknown as FC<SyntaxHighlighterProps>`
   캐스팅으로 타입 체크를 완전히 우회. 코드 주석은 원인을 "@types/react 버전 불일치"로 잘못
   진단했었음.

**같은 날 재검증 — 전부 해소, APPROVED**:
1. `customStyle` → `className="m-0 max-h-80 rounded-none text-[13px]"`로 교체(`node_modules`
   실제 소스로 재확인, v15/v16 동일 동작). `style={oneDark}`(Prism 토큰별 컬러 매핑 — Tailwind로
   표현 불가능한 진짜 예외)에는 dnd-kit과 동일한 관례로 예외 명시 주석 추가됨.
2. `src/components/ui/Tab.tsx` 신설 확인 — `active: boolean` + `role="tab"`/`aria-selected`만
   내장하고 색상은 className으로 호출부가 주입하는 도메인 무관(`shared` 계층) 설계. 탭 컨테이너에
   `role="tablist"`도 추가되어 접근성까지 함께 해소.
3. **실제 근본 원인이 처음 진단과 달랐음**: `react-syntax-highlighter`를 v15로 다운그레이드해도
   동일 타입 에러가 재현되어 재조사한 결과, 진짜 원인은 `@types/react-syntax-highlighter`가
   `@types/react@19.2.18`을 별도 **중첩 의존성**으로 물고 있어 프로젝트의 `@types/react@18.3.28`과
   구조적으로 어긋난 것이었음(`npm ls @types/react`로 진단). `package.json`에
   `"resolutions": {"@types/react-syntax-highlighter/@types/react": "18.3.28"}` 추가로 중첩
   타입을 강제 통일 — `node_modules/@types/react-syntax-highlighter/`에 중첩 `node_modules`가
   더 이상 없음을 확인(dedup 성공), `yarn.lock`에도 `@types/react@18.3.28` 단일 항목으로 통합됨.
   `as unknown as FC<...>` 캐스팅 및 관련 import 완전 제거 확인.
4. (Minor) `useState(tabs[0]?.id)` 미동기화 문제도 `useEffect(() => setActiveKey(tabs[0]?.id),
   [product.id])`로 방어 완료(기존 `login/page.tsx`/`register/page.tsx`와 동일한
   `eslint-disable-next-line react-hooks/exhaustive-deps` 관례 사용, 새로운 패턴 아님).

**Why**: 이번 건은 두 가지를 보여줌 — (1) "style=" 리터럴 검색만으로는 인라인 스타일 규칙 위반을
전부 잡을 수 없다([[recurring_issues]] #34), (2) 사용자가 처음 제시한 원인 진단이 재조사 후
정정될 수 있으므로, "이미 고쳤다"는 보고를 받아도 실제 `node_modules`/`yarn.lock` 상태를
Read/Grep으로 재검증해야 한다(이 세션은 Bash 없이도 `node_modules` 내부 파일을 직접 읽어
`resolutions` 필드의 실효성과 dedup 여부를 검증할 수 있었음 — [[no_bash_tool_constraint]] 참고).
**How to apply**: `resolutions` 필드로 중첩 `@types/*` 버전 충돌을 해결하는 패턴이 이 프로젝트에
처음 등장했으므로, 앞으로 유사한 "동일 타입 패키지가 여러 버전으로 중첩 설치되어 타입 에러가
나는" 상황을 리뷰할 때 이 해법(yarn `resolutions`)을 먼저 참고할 것.
