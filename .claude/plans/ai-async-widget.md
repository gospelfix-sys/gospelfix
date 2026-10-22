# 어드민 견적 신청 조회 기능 구현 플랜

## Context

사용자가 "AI로 견적 받기" 5단계 마법사를 완료하면 `quote_submissions` 테이블에 저장되지만,
어드민에서 이 데이터를 조회할 방법이 없다. IP·UA·Referer·UTM·로그인 여부 등 유입 메타데이터도
현재 수집하지 않는다. 이를 해결하기 위해:

1. `quote_submissions` 테이블에 메타데이터 컬럼 추가 (Supabase 대시보드 SQL)
2. `submitQuote`를 Server Action으로 전환하여 서버에서 IP/UA/Referer 캡처
3. 클라이언트에서 UTM 파라미터와 로그인 여부를 Server Action에 전달
4. 어드민에 견적 목록 + 상세 페이지 추가

---

## Step 0 — Supabase 대시보드 SQL (직접 실행)

```sql
ALTER TABLE quote_submissions
  ADD COLUMN ip_address   TEXT,
  ADD COLUMN user_agent   TEXT,
  ADD COLUMN referer      TEXT,
  ADD COLUMN is_authenticated BOOLEAN DEFAULT false,
  ADD COLUMN utm_params   JSONB DEFAULT '{}'::jsonb;
```

> **utm_params 예시**: `{"source":"instagram","medium":"social","campaign":"summer25"}`

---

## Step 1 — 타입 업데이트

**파일**: `main/src/types/quote.types.ts`

`QuoteSubmissionRow`에 추가:
```ts
ip_address: string | null;
user_agent: string | null;
referer: string | null;
is_authenticated: boolean;
utm_params: Record<string, string>;
```

---

## Step 2 — Server Action 생성 (IP 캡처 핵심)

**파일**: `main/src/app/actions/submitQuoteAction.ts` (신규)

```ts
"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { QuoteWizardState } from "@/types/quote.types";

interface SubmitMeta {
  utmParams: Record<string, string>;
  isAuthenticated: boolean;
}

export async function submitQuoteAction(
  state: QuoteWizardState,
  meta: SubmitMeta,
): Promise<string> {
  const hdrs = headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null;
  const userAgent = hdrs.get("user-agent") ?? null;
  const referer = hdrs.get("referer") ?? null;

  const supabase = await createClient();
  const id = crypto.randomUUID();

  const { error } = await supabase.from("quote_submissions").insert({
    id,
    selected_categories: state.selectedCategories,
    selected_items: state.selectedItems,
    schedule: state.schedule,
    style_preferences: state.stylePreferences,
    target_age: state.targetAge,
    contact_name: state.contactInfo.name,
    contact_value: state.contactInfo.contact,
    contact_email: state.contactInfo.email || null,
    business_number: state.contactInfo.businessNumber || null,
    project_summary: state.contactInfo.projectSummary || null,
    reference_urls: state.contactInfo.referenceUrls.filter(Boolean),
    estimated_total: state.estimatedTotal,
    ip_address: ip,
    user_agent: userAgent,
    referer,
    is_authenticated: meta.isAuthenticated,
    utm_params: meta.utmParams,
  });

  if (error) throw error;
  return id;
}
```

> `main/src/lib/supabase/quotes.ts`의 기존 `submitQuote()`는 제거 (대체됨)

---

## Step 3 — Step04ContactInfo 업데이트

**파일**: `main/src/components/quote/steps/Step04ContactInfo.tsx`

변경 사항:
- `submitQuote` import → `submitQuoteAction` import
- `onSubmit` 내부에서 제출 전:
  1. `sessionStorage.getItem("utm_params")`로 UTM 읽기 (없으면 `{}`)
  2. `useRecoilValue(isAuthenticatedSelector)`로 로그인 여부 확인
  3. `submitQuoteAction(updatedState, { utmParams, isAuthenticated })` 호출

---

## Step 4 — UTM 캡처 유틸

**파일**: `main/src/components/quote/QuoteWizard.tsx`

마운트 시 URL에서 UTM 파라미터를 읽어 sessionStorage에 저장:
```ts
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ["source", "medium", "campaign", "term", "content"].forEach((key) => {
    const val = params.get(`utm_${key}`);
    if (val) utm[key] = val;
  });
  if (Object.keys(utm).length > 0) {
    sessionStorage.setItem("utm_params", JSON.stringify(utm));
  }
}, []);
```

---

## Step 5 — Admin Supabase 쿼리 함수

**파일**: `admin/src/libs/supabase/quotes.ts` (신규)

```ts
import { requireAdmin } from "./auth";
import { createAdminClient } from "./admin";

export async function getQuoteSubmissions() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quote_submissions")
    .select(
      "id, contact_name, contact_value, contact_email, selected_categories, " +
      "estimated_total, ip_address, is_authenticated, utm_params, created_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getQuoteSubmissionById(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("quote_submissions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}
```

---

## Step 6 — 어드민 견적 목록 페이지

**파일**: `admin/src/app/(admin)/quotes/page.tsx` (신규)

- `export const dynamic = "force-dynamic"`
- `getQuoteSubmissions()` 호출
- 테이블 컬럼: **이름 / 연락처 / 서비스 / 예상 금액 / IP / 로그인 / 날짜**
- 서비스는 `selected_categories` 배열을 한글로 변환 (`쇼핑몰`, `홈페이지`, `AI/MVP`, `유지보수`)
- 금액은 `toLocaleString("ko-KR")` 포맷
- 행 클릭 시 `/quotes/[id]`로 이동

---

## Step 7 — 어드민 견적 상세 페이지

**파일**: `admin/src/app/(admin)/quotes/[id]/page.tsx` (신규)

섹션 구성:
1. **연락처 정보** — 이름, 연락처, 이메일, 사업자명
2. **견적 내역** — `selected_items`를 `LINE_ITEMS`에서 라벨 조회하여 항목별 금액 표시, 합계
3. **선호도** — 일정, 스타일, 타겟 연령
4. **프로젝트 설명** — `project_summary`
5. **레퍼런스 URL** — 클릭 가능한 링크 3개
6. **접속 정보** — IP, User-Agent, Referer, 로그인 여부
7. **유입 경로** — `utm_params` 키/값 뱃지 표시

---

## Step 8 — AdminNav에 메뉴 추가

**파일**: `admin/src/components/layout/AdminNav.tsx`

```ts
const navItems = [
  { href: "/users",      label: "유저" },
  { href: "/quotes",     label: "견적 신청" },  // ← 추가
  { href: "/blogs",      label: "소식 (Blog)" },
  { href: "/products",   label: "상품" },
  { href: "/portfolios", label: "포트폴리오" },
];
```

---

## 검증 방법

1. `yarn dev` (main, port 3000) → `/quote` 접속 시 `?utm_source=test` 쿼리 파라미터 붙여 접속
2. 5단계 마법사 완료 → Supabase 대시보드에서 `quote_submissions` 확인:
   - `ip_address`, `user_agent`, `referer` 값이 채워졌는지
   - `utm_params`에 `{"source":"test"}`가 들어갔는지
3. `yarn dev` (admin, port 3001) → `/quotes` 접속
   - 방금 제출한 행이 목록에 나타나는지
   - 행 클릭 시 상세 페이지에서 모든 정보 표시 확인
