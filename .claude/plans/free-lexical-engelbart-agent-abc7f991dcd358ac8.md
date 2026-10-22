# 상품별 코드 미리보기(HTML/CSS/JS) — cms.api 관리자 입력 → gospelfix 상세페이지 노출

## 1. 스키마 판단 검증

**3개 flat nullable text 컬럼(`code_preview_html`, `code_preview_css`, `code_preview_js`) — 확정. jsonb 반대.**
근거: `purchase_options`가 jsonb인 이유는 "배열(가변 개수) + 반복 가능한 행 구조"이기 때문. 이번 3필드는 개수·이름·순서가 고정이고 `product_code`/`design_type`/`production_solution`/`content_html`과 완전히 동일한 성격(단일 텍스트, optional). jsonb로 가면 `ADMIN_SELECT_COLUMNS`의 별칭 처리(`purchase_options:options`류), zod에서 nested optional object 처리, admin form에서 `{...codePreview, html: v}` 식 불필요한 spread가 늘어나고 실제 이점이 없음. flat 컬럼이 맞다.

**`duplicateProduct()`에서 복사(copy) — 확정.**
근거: `file_path`를 복사 안 하는 이유는 "실제 업로드된 바이너리 파일의 Storage 참조 공유 위험"과 "구매 인증 흐름과 결합된 자산"이기 때문. `product_code`를 null로 리셋하는 이유는 "상품 고유 SKU 성격"이라 복제본과 값이 겹치면 안 되기 때문. code_preview 3필드는 순수 텍스트 발췌본이고 SKU 성격도, 파일 참조도 아니므로 `content_html`/`production_solution`과 같은 그룹 — 복사하는 것이 맞다.

## 2. Admin 폼 UI: 탭 vs 세로 나열 → **세로 나열 채택**
어드민은 3개를 동시에 채워 넣고 서로 대조하며 검증해야 하는 "입력" 화면인 반면, 프론트 탭 UI는 "열람" 화면이라 목적이 다르다. 탭으로 만들면 관리자가 HTML 작성 중 CSS를 참조하려 할 때마다 전환이 필요해 비효율적이고, 상태(`activeTab`) 관리 코드도 불필요하게 늘어난다. `textarea` 3개를 세로로 순서대로(HTML→CSS→JS) 배치, 각 `rows={8~10}`, `font-mono`, 기존 `INPUT_CLASS` 확장 or 별도 모노스페이스 클래스 적용.

## 3. 변경 파일 목록 (실행 순서)

### A. 마이그레이션 (gospelfix.cms.api/supabase/migrations/) — supabase-db-architect 서브에이전트에게 위임
1. `036_add_products_code_preview_columns.sql` — `code_preview_html/css/js text null` 3개 추가 (034 파일의 헤더 주석 스타일: 배경/이유/후속 마이그레이션 참조/롤백 DOWN 포함, `add column if not exists`로 멱등)
2. `037_add_code_preview_to_products_select_columns.sql` — `content_api_configs` products row의 `select_columns`에 `code_preview_html,code_preview_css,code_preview_js` 추가 (035 파일과 동일한 `regexp_replace` 기반 멱등 append 패턴, 컬럼 3개이므로 루프 없이 3번 반복하거나 한 번에 concat)

CLAUDE.md 규칙상 메인 세션이 SQL을 직접 작성하면 안 되므로, 이 두 파일은 `supabase-db-architect` 서브에이전트 호출로 작성 위임.

### B. gospelfix.cms.api — 타입/스키마/쿼리
3. `src/types/product.ts`
   - `Product` interface: `file_path: string | null;` 다음 줄에 추가
     ```ts
     code_preview_html: string | null;
     code_preview_css: string | null;
     code_preview_js: string | null;
     ```
   - `ProductFormInput` interface: `file_path: string | null;` 다음 줄에 추가
     ```ts
     code_preview_html: string;
     code_preview_css: string;
     code_preview_js: string;
     ```
4. `src/libs/openapi/schemas/product.schema.ts` — `ProductSchema`에 `product_code`(라인 123 부근) 패턴 그대로 3개 추가
   ```ts
   code_preview_html: z.string().nullable().openapi({ ... }),
   code_preview_css: z.string().nullable().openapi({ ... }),
   code_preview_js: z.string().nullable().openapi({ ... }),
   ```
5. `src/libs/supabase/queries/products.admin.ts`
   - `ADMIN_SELECT_COLUMNS`(라인 12-13)에 `,code_preview_html,code_preview_css,code_preview_js` 추가
   - `toPayload()`에 추가:
     ```ts
     code_preview_html: input.code_preview_html || null,
     code_preview_css: input.code_preview_css || null,
     code_preview_js: input.code_preview_js || null,
     ```
   - `duplicateProduct()` insert 객체에 추가:
     ```ts
     code_preview_html: original.code_preview_html,
     code_preview_css: original.code_preview_css,
     code_preview_js: original.code_preview_js,
     ```

### C. gospelfix.cms.api — Admin 폼
6. `src/components/admin/ProductForm/index.tsx`
   - state 추가 (productCode/designType 옆, 라인 85-90 부근):
     ```ts
     const [codePreviewHtml, setCodePreviewHtml] = useState(
       initialValues?.code_preview_html ?? '',
     );
     const [codePreviewCss, setCodePreviewCss] = useState(
       initialValues?.code_preview_css ?? '',
     );
     const [codePreviewJs, setCodePreviewJs] = useState(
       initialValues?.code_preview_js ?? '',
     );
     ```
   - UI: zip 섹션 `{priceType === 'free' && (...)}` 블록의 `)}` 직후(707번째 줄), 데모 URL 섹션(710번째 줄) 이전에 별도 `{priceType === 'free' && (...)}` 블록 신설. 라벨 "코드 미리보기 (HTML/CSS/JS)" + 세 개 `<textarea>` 세로 나열(HTML→CSS→JS 순), `rows={8}` 내외, `font-mono text-xs`, `placeholder`에 `<!DOCTYPE html>...` / `.hero { ... }` / `document.querySelector...` 같은 힌트 문구
   - `handleSave`의 `ProductFormInput` 객체 리터럴(라인 199-218)에 3필드 추가

### D. gospelfix — 타입/컴포넌트
7. `src/types/product.types.ts` — `Product` interface에 추가
   ```ts
   code_preview_html?: string | null;
   code_preview_css?: string | null;
   code_preview_js?: string | null;
   ```
8. `src/components/products/CodePreviewSection.tsx` — 전면 재작성
   - `CODE_TABS` 하드코딩 상수 제거
   - `product: Product` prop 추가, import `Product` from `@/types/product.types`
   - 내부에서 탭 배열 생성:
     ```ts
     const tabs = [
       { key: "html", label: "index.html", code: product.code_preview_html },
       { key: "css", label: "style.css", code: product.code_preview_css },
       { key: "js", label: "script.js", code: product.code_preview_js },
     ].filter((t) => (t.code ?? "").trim().length > 0);
     if (tabs.length === 0) return null;
     ```
   - 나머지 탭 전환/COPY 로직은 기존 그대로 재사용 (activeKey를 `tabs[0].key`로 초기화하되 tabs가 조건부라 컴포넌트 최상단에서 `null` early-return 전에 hooks 순서 깨지지 않도록 주의: `useState`/`useEffect` 호출 이후에 early return 하거나, tabs 계산을 `product` 기준으로 먼저 하고 `useState<string | null>(null)`로 시작 후 `useEffect`에서 첫 유효 탭 세팅 — Rules of Hooks 위반 방지가 이 파일 재작성의 핵심 리스크)
9. `src/components/products/ProductDetailView.tsx` — 라인 67 `<CodePreviewSection />` → `<CodePreviewSection product={product} />`

## 4. Hooks 순서 관련 주의사항 (신규 발견)
현재 컴포넌트는 `useState`/`useEffect`를 컴포넌트 최상단에서 호출한 뒤 JSX만 조건부로 렌더링하는 구조가 아니라, 함수 컴포넌트 자체이므로 "코드가 없으면 null 반환"을 `useState` 호출들보다 먼저 배치하면 안 됨(다른 상품 렌더링 시 hooks 개수가 달라지는 문제는 없지만, 동일 컴포넌트 내에서 early return이 hooks 호출보다 앞에 있으면 안 된다는 일반 규칙). 구현 시: tabs 배열 계산 → `useState(tabs[0]?.key ?? "")` → `useEffect` (복사 타이머) → `if (tabs.length === 0) return null;`을 모든 hook 호출 이후에 배치.

## 5. 검증 방법
1. `supabase-db-architect`가 작성한 SQL 2개를 Supabase 대시보드 SQL Editor에서 순서대로 수동 실행 (이 프로젝트 컨벤션상 마이그레이션 자동 적용 없음, 034/035와 동일)
2. 실행 후 대시보드에서 `select resource_slug, select_columns from content_api_configs where resource_slug='products';`로 3개 컬럼명이 들어갔는지 직접 확인
3. 두 저장소 dev 서버 동시 기동: 터미널 2개(또는 `run_in_background`)로
   - `cd gospelfix.cms.api && npm run dev` (포트 3001 고정, package.json에 명시됨)
   - `cd gospelfix && npm run dev` (포트 3000, 기본값)
   - gospelfix가 cms.api를 호출하는 base URL 환경변수(`.env.local`의 `CMS_API_URL` 등)가 `http://localhost:3001`을 가리키는지 확인 필요
4. `localhost:3001/products`에서 무료(priceType=free) 상품 하나 편집 진입 → 코드 미리보기 3개 textarea에 실제 예시 코드 입력 → 저장
5. `localhost:3000/detail/[해당-slug]` 접속 → "코드 미리보기" 섹션에 방금 입력한 실제 코드가 탭별로 보이는지, COPY 버튼이 해당 탭 코드를 클립보드에 복사하는지 확인
6. 3필드 모두 빈 상태인 다른 상품 상세페이지에서 "코드 미리보기" 섹션 전체가 렌더링되지 않는지(null 반환) 확인
7. 상품 복제(duplicate) 기능으로 코드가 입력된 상품을 복제 → 복제본에도 3필드가 그대로 복사됐는지 admin 폼에서 확인
8. `GET localhost:3001/api/v1/products/{slug}` 직접 호출(curl)해서 응답 JSON에 `code_preview_html/css/js` 키가 포함되는지 확인 (select_columns 누락 함정 재확인용 — 과거 실제로 겪은 실수)
