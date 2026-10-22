---
name: main-cms-api-migration
description: main(gospelfix) 앱의 주문/리뷰/견적/다운로드 로직이 Supabase 직접 호출에서 gospelfix.cms.api REST 서버 호출로 전환됨(2026-07-23 완료) — 새 파일 위치와 남은 이슈
metadata:
  type: project
---

main 앱(포트 3000)의 주문/리뷰/견적/다운로드 관련 로직을 `main/src/lib/supabase/*` 직접 쿼리에서
`gospelfix.cms.api`(포트 3001) REST API 호출(`main/src/lib/cmsApi/*`)로 전환하는 작업을 2026-07-23에
완료했다. main의 인증(로그인/세션)은 이미 이전에 별도로 cms.api 기반 BFF 패턴으로 전환되어 있었다
(`main/src/lib/cmsApi/session.ts`의 `getAccessToken()`, `main/src/lib/cmsApi/client.ts`의
`cmsApiFetch()`).

**Why:** Supabase 스키마/쿼리 로직을 하나의 백엔드(cms.api)로 집중시켜 main과 admin이 동일한
검증 로직(가격 재검증, 구매 여부 재검증 등)을 중복 구현하지 않도록 하기 위함.

**How to apply:**
- 새 파일: `main/src/lib/cmsApi/orders.ts`(`hasPurchasedProduct`, `getPurchasedOrders`,
  `PurchasedOrder` — 기존 `lib/supabase/orders.ts`와 동일한 export 시그니처 유지, 내부적으로
  `GET /api/v1/orders/me` 호출 후 camelCase→snake_case 매핑), `main/src/lib/cmsApi/reviews.ts`
  (`getReviewsByProductId`), 신규 Route Handler `main/src/app/api/reviews/route.ts`(브라우저의
  `ReviewForm.tsx`가 호출).
- `main/src/app/api/orders/create`, `notify-payment`, `main/src/app/api/downloads/[productId]`는
  모두 얇은 프록시로 전환되어 cms.api의 `/api/v1/orders`, `/api/v1/orders/{id}/notify-payment`,
  `/api/v1/downloads/{productId}`를 호출한다.
- `main/src/app/(dashboard)/dashboard/page.tsx`, `layout.tsx`는 Supabase `profiles` 직접 조회 대신
  `cmsApiFetch("/api/v1/auth/me", {accessToken})` 호출로 전환됨.
- **미해결 이슈**: cms.api의 `/api/v1/auth/me`가 반환하는 `profile` 객체는
  `id, email, full_name, avatar_url, role`만 있고 `created_at`이 없다
  (`gospelfix.cms.api/src/app/api/v1/auth/me/route.ts` 확인 완료). 따라서 대시보드의 "가입일" 카드는
  현재 항상 "-"로 표시된다. cms.api의 `/me` select 절에 `created_at`을 추가하거나, main 쪽에서
  이 필드 표시를 제거하는 후속 작업이 필요하다.
- 삭제 대상이었으나 이번 세션에 Bash/삭제 도구가 없어 실제로 삭제하지 못한 파일(다른 곳에서 더 이상
  import되지 않는 것은 확인함): `main/src/lib/supabase/orders.ts`, `main/src/lib/supabase/reviews.ts`,
  `main/src/lib/supabase/storage.ts`. 다음 세션에서 Bash 도구가 있으면 이 3개 파일을 삭제할 것.
