---
name: button_radius_uniform_rounded_lg
description: shadcn Button의 size별 모서리 반경 — default/lg/icon/icon-lg는 rounded-lg(16px), sm/xs/icon-sm/icon-xs는 rounded-sm(8px)
metadata:
  type: feedback
---

`components/ui/button.tsx`의 `buttonVariants`는 size에 따라 두 그룹의 반경을 쓴다.

- `default`/`lg`/`icon`/`icon-lg` → `rounded-lg`(16px, `var(--radius)`)
- `sm`/`xs`/`icon-sm`/`icon-xs` → `rounded-sm`(8px, `tailwind.config.ts`의 `sm: '0.5rem'` 토큰)

이 규칙은 한 번의 시행착오를 거쳐 확정됐다(둘 다 2026-08-26):

1. 1차: 작은 size(`sm`/`xs`)가 자체 `rounded-[min(var(--radius-md),Npx)]` 오버라이드(10~12px)를 갖고
   있어 "새 상품 등록"/"수정"/"삭제" 같은 작은 액션 버튼이 각져 보인다는 피드백을 받고, 모든 size를
   `rounded-lg`로 통일했었다.
2. 2차(최종): 그런데 `sm`(`h-7`=28px)/`xs`(`h-6`=24px)처럼 높이가 낮은 버튼에 16px 반경을 쓰면
   반경이 높이의 절반을 넘어서 CSS가 사실상 필(pill) 모양으로 렌더링해버리는 부작용이 드러났다.
   그래서 작은 size만 다시 분리하되, 이번엔 새 임의값이 아니라 `tailwind.config.ts`에 이미 정의만
   되어 있고 실사용은 안 하던 `sm`(0.5rem=8px) 토큰을 재사용하는 것으로 확정했다.

**Why:** 버튼의 시각적 둥근 정도는 반경의 절댓값이 아니라 "반경/높이 비율"로 지각된다. 큰 버튼
(`h-9`=36px)에서 자연스럽던 16px 반경이 작은 버튼(24~28px)에서는 과도해서 의도(라운디드 코너)를
넘어 필 모양이 되어버린다 — 마케팅 CTA(`rounded-full`)와 기능성 버튼(`rounded-lg`)을 시각적으로
구분하는 [[shared-component-changes]] 원칙과도 충돌한다. `docs/design.md` 6장의 모서리 스케일에
`sm`(8px)을 다섯 번째 단계로 공식 추가해뒀다.

**How to apply:**
- 작은 Button(`size="sm"`/`"xs"`/`"icon-sm"`/`"icon-xs"`)을 쓸 때 반경을 신경 쓸 필요 없다 —
  공용 정의가 이미 `rounded-sm`을 적용한다. 호출부에서 `rounded-*`로 오버라이드하지 않는다.
- `default`/`lg`/`icon`/`icon-lg` 는 계속 `rounded-lg`다 — 이 둘을 같은 반경으로 통일하려는
  시도(과거 1차 시행착오)로 되돌리지 않는다. 시각적 비율 문제가 재발한다.
- 새로 작은 버튼 스타일이 필요해도 `rounded-[8px]` 같은 임의값을 쓰지 말고 `rounded-sm` 유틸리티를
  그대로 쓴다 — 이미 `tailwind.config.ts`에 정의된 토큰이라 임의값 금지 규칙에 걸리지 않는다.
