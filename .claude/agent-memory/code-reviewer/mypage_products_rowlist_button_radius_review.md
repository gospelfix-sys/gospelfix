---
name: mypage_products_rowlist_button_radius_review
description: /mypage/products 카드→row-list 재설계 + button.tsx size별 rounded-sm/lg 분리, 전역 파급 확인 후 APPROVED(조건부)
type: feedback
---

`MyProductCard.tsx`(CardHeader/Footer 제거 후 CardContent 단일 row 레이아웃) +
`MyProductsList.tsx`(신규, 상태 필터 탭+카운트) + `components/ui/button.tsx`의
`sm`/`xs`/`icon-sm`/`icon-xs` → `rounded-sm`(8px) 분리를 리뷰함. Critical/Major 0건,
Minor 3건으로 APPROVED(조건부).

## button.tsx 반경 분리는 안전하게 전파됨 (걱정했던 리스크, 실제로는 문제 없음)

`button.tsx`의 size 변형에 `rounded-sm`을 추가하는 변경은 이 앱 전역에서 `size="sm"`/
`"xs"`/`"icon-sm"`/`"icon-xs"`를 쓰는 모든 호출부(`dialog.tsx` 닫기, `RouteModal.tsx`,
`CartModal`, `DashboardHeader`, `ProfileSettingsForm`, `PendingOrderCard`, `ReviewForm`,
`UploadWorkEditor`, `RichTextEditor` 등 10곳 이상)에 자동 전파된다 — 이는 버그가 아니라
`.claude/rules/shared-component-changes.md` 원칙(공용 정의 파일 자체를 고쳐 전체에 반영)을
정확히 따른 의도된 디자인 시스템 변경이다. `docs/design.md` 6장/7장에도 반영되어
문서-코드 불일치 없음(`tailwind.config.ts`의 `sm: '0.5rem'`과 실제 일치 확인).
호출부 중 `ReferralCodeCard.tsx`처럼 `className="rounded-full ..."`로 이미 오버라이드한
곳은 `cn()`(twMerge)이 마지막 값을 우선하므로 영향 없음. 자세한 배경은 컴포넌트 작성자
메모리 [[button_radius_uniform_rounded_lg]](component-writer 쪽) 참고.

**How to apply:** 앞으로 `button.tsx`의 size별 base class(`rounded-lg`/`rounded-sm`)를
건드리는 diff를 보면, 개별 호출부 오버라이드가 있는지만 grep(`size="(sm|xs|icon-sm|icon-xs)"`)
으로 확인하고, 없으면 전역 반영을 정상 동작으로 간주할 것 — 매번 새로 걱정할 필요 없음.

## Minor 발견 (비차단)

1. **`bg-white` 하드코딩 vs `bg-gf-white` 토큰** — `MyProductCard.tsx`의 "수정"/"삭제"
   버튼이 `outline` variant의 기본 `bg-background`(베이지 `#f7f5f0`)를 흰 카드 위에서
   덮어쓰려고 `bg-white`를 씀. `--gf-white`(`#ffffff`)와 값은 완전히 동일하지만, 이
   프로젝트는 "surface white" 의미로 `bg-gf-white`를 30곳 이상에서 이미 관례로 쓰고
   있다(`ProductCard.tsx`, `Footer.tsx`, `DashboardHeader.tsx` 등). CLAUDE.md의
   "등록된 토큰 우선" 취지상 `bg-gf-white`로 교체하는 편이 일관적.
2. **`rejected` 상태 배지가 새 raw 팔레트(`bg-red-50 text-red-600`) 도입** —
   같은 파일의 `pending` 배지는 이미 등록된 `gf-orange-bg`/`gf-orange` 토큰을 쓰는데
   `rejected`만 새로운 raw red를 도입함. `button.tsx`의 `destructive` variant가
   이미 같은 "에러/위험" 의미로 `bg-[rgba(220,38,38,0.1)] text-destructive`(shadcn
   `--destructive` 토큰)를 쓰고 있어, 같은 의미의 빨강이 두 가지 다른 정의로 공존하게
   됨(recurring_issues #14 "등록된 토큰과 동일 색의 임의값/별도 팔레트 중복" 패턴의 변형).
   `approved`(에메랄드)는 프로젝트에 대응 토큰이 아직 없어 최초 도입이라 문제 없음.
3. 삭제 버튼 `hover:text-destructive`만 추가되고 `outline` variant의
   `hover:bg-muted`는 그대로 남아, 호버 시 회색 배경+빨간 텍스트 조합이 됨 — 의도된
   디자인일 수 있으나 시각적으로 한 번 확인 권장(코드 결함은 아님).

## 그 외 확인한 정상 사항

- `getStatusBucket()`은 `SellerProduct`(`Product` 상속으로 `is_active: boolean` 포함)와
  타입 완전 일치, `Exclude<StatusFilter, "all">` 반환도 `Record<StatusFilter, number>`
  인덱싱과 호환.
- raw `<button>`/`asChild`/템플릿 리터럴 className/인라인 `style=` 전부 없음 — `cn()`
  일관 사용, `Link`+`buttonVariants()` 패턴 준수.
- `DELETE /api/my-products/[id]`는 이번 diff와 무관한 기존 라우트로 이미 정상 존재.
