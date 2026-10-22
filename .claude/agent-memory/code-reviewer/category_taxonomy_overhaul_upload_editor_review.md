---
name: category_taxonomy_overhaul_upload_editor_review
description: 2026-08-27 카테고리 taxonomy 전면 교체(website/ux_ui/branding 3종 + 15종 업종 소분류) + UploadWorkEditor.tsx 카테고리 팝업 UI + shadcn Calendar/Popover 신규 도입 배포 전 최종 게이트 리뷰
metadata:
  type: project
---

배포(커밋+푸시) 직전 최종 게이트 리뷰. 범위: `UploadWorkEditor.tsx`(카테고리 팝업+라이선스
팝업+할인기간 Calendar/시간 Select UI), `components/ui/select.tsx`(alignItemWithTrigger 기본값
변경), `components/ui/calendar.tsx`/`popover.tsx`(신규, shadcn CLI 생성 후 v3 호환 수정),
`lib/api/myProducts.ts`/`types/product.types.ts`(taxonomy 상수+매핑), `HeroCarousel.tsx`(카드
확대 스타일). 배경은 [[project_category_taxonomy_overhaul_2026-08-27]] 참고 — 이 리뷰는 그
작업의 최종 커밋 전 검증 라운드.

## 확인 완료(문제 없음)

- `UploadWorkEditor.tsx`의 카테고리 Dialog: `draftCategory`/`draftSubCategories`는 "선택"
  버튼 클릭 시(`onClick`)마다 현재 커밋된 `productCategory`/`subCategories`로 재동기화됨 —
  초기화 누락 없음. 최대 3개 제한(`MAX_SUB_CATEGORIES`)은 `toggleDraftSubCategory`에서
  `toast.error` + 상태 변경 거부로 서버 요청 이전에 완전히 차단(우회 경로 없음). `handleSubmit`의
  `SellerProductInput` 객체 19개 필드가 인터페이스 정의와 1:1 정확히 일치(누락 없음,
  recurring_issues #7 패턴 재발 없음).
- `priceType` "paid"↔"free" 전환 시 `handlePriceTypeChange`가 다운로드 파일 상태(`newZipFile`/
  `filePath`)를 즉시(저장 시점이 아니라 토글 시점에) 클리어 — `prompt_category_download_gate_regression`
  메모리에서 지적됐던 "카테고리/타입 전환 시 stale 파일 경로 잔존" 클래스의 버그가 이번엔
  선제적으로 방지되어 있음.
- `select.tsx`/`calendar.tsx`/`popover.tsx`: 이 프로젝트가 실제 설치한 `tailwindcss@3.4.19`
  소스(`node_modules/tailwindcss/lib/corePlugins.js`)의 `matchVariant`/`addVariant` 목록을
  직접 대조해 v4 전용 문법 잔존 여부를 실측 검증(Bash 없이 Read+Grep으로 tailwind 소스 자체를
  근거로 확인 — 단순 기억에 의존하지 않음). `w-(--var)` 괄호 단축 문법, `outline-hidden`,
  `[--cell-size]`(var() 누락) 등 이전에 실제로 발견됐던 v4 전용 패턴은 이번엔 전부 없음(모두
  `[var(--x)]` 형태로 올바르게 작성됨) — "Tailwind v4→v3 문법 수정" 작업 자체는 대체로 성공.
- `PopoverTrigger render={<button .../>}`, `SelectPrimitive.Icon render={...}` 등은 base-ui의
  공식 `render` prop 패턴이며 CLAUDE.md가 금지하는 shadcn `asChild`와는 다른 라이브러리 API —
  혼동 주의, 위반 아님.
- `style=` 인라인 속성, 템플릿 리터럴/배열 className 조합 없음(전부 `cn()` 사용). 홑따옴표 없음.
  `React.ChangeEvent` 등 네임스페이스 타입 참조는 `import React` 없이도 `@types/react`의
  `export as namespace React`로 정상 동작하는 이 코드베이스의 기존 확립된 패턴(6개 파일에서
  동일하게 사용 중) — 신규 버그 아님.

## 발견 및 조치 필요

- **Major(BLOCKED 사유)**: `HeroCarousel.tsx`(diff 포함 파일)의 히어로 배너 CTA 3개가
  구 taxonomy 값(`category=landing/dashboard/ecommerce`)을 하드코딩 — 신규 taxonomy에는
  해당 값이 존재하지 않아 `/api/products/route.ts:64`의 정확 일치 필터링으로 클릭 시 항상
  빈 배열(상품 없음 화면)로 귀결됨. 같은 패턴이 diff 밖의 `NavPopover.tsx`/`LeftSidebar.tsx`
  에도 사전에 이미 존재(taxonomy 교체 이전부터 방치돼 있었을 가능성). 상세 경위는
  recurring_issues.md #42 참고. **커밋 전 3개 CTA(및 가능하면 NavPopover/LeftSidebar까지)를
  `website`/`ux_ui`/`branding` 값으로 갱신 필요.**
- **Minor(비차단)**: `calendar.tsx:29-31`에 `in-data-[slot=card-content]:bg-transparent`,
  `in-data-[slot=popover-content]:bg-transparent`(v4 전용 `in-*` 변이형, tailwind 3.4.19
  corePlugins에 없음 확인), `rtl:**:[.rdp-button_next>svg]:rotate-180` 형태 2곳(v4 전용
  `**:` 전체 자손 결합자)이 남아있음. 실사용 지점(`UploadWorkEditor.tsx`의
  `<Calendar className="bg-transparent p-3" />`)이 `bg-transparent`를 className prop으로
  직접 덮어써서 오늘 당장의 시각적 영향은 없으나(cn()의 tailwind-merge가 마지막 값 우선),
  죽은 코드이며 이 프로젝트 RTL 미사용이라 `rtl:**:` 쪽도 영향 없음. `select.tsx:114`의
  `not-data-[variant=destructive]:focus:**:text-accent-foreground`도 동일 계열(v4 전용
  `not-*`+`**:`, tailwind 3.4.19에 매치되는 variant 없음) — `SelectItem`에 `data-variant`가
  세팅되는 호출부가 코드베이스 전체에 없어 오늘은 무해. 세 곳 모두 shadcn 레지스트리가 원래
  v4 기준으로 생성해주는 보일러플레이트를 이번 "v3 호환 수정"에서 완전히 잡아내지 못한 잔재로
  추정. 다음에 이 파일들을 다시 만질 때 함께 제거 제안.
- **Minor(비차단)**: `CodePreviewEditor`의 `<Plus className="h-3.5 w-3.5" />탭 추가` (줄바꿈
  없이 붙여 씀)만 다른 "항목 추가"/"표지 업로드" 버튼과 달리 아이콘-텍스트 사이 공백 없는
  코드 스타일 — `gap-1` 덕에 시각적으로는 차이 없음, 순수 코드 일관성 문제.

## 최종 판정

BLOCKED — Major 1건(`HeroCarousel.tsx` 구 taxonomy 카테고리 CTA 링크, recurring_issues #42)
때문. Critical 0건. 이 항목만 해결되면(및 원한다면 NavPopover.tsx/LeftSidebar.tsx도 함께)
재검증 없이 커밋 가능할 정도로 나머지는 깨끗함.
