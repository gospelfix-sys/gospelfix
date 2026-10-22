---
name: active_state_border
description: Tab/Button류 컴포넌트의 활성(active) 상태 스타일 — bg-gf-orange-bg + text-gf-orange에 border-gf-orange 1px를 항상 함께 준다
type: feedback
---

Tab이나 Button처럼 "선택됨/활성화됨" 상태를 표현하는 UI에서, 활성 상태 배경색으로
`bg-gf-orange-bg`(연한 오렌지 틴트) + `text-gf-orange`를 쓸 때는 **테두리도 `border-gf-orange`
1px(기본 `border` 클래스 폭)로 함께 넣는다.** 비활성 상태는 보통 `border-gf-border`(연회색
1px)를 쓰므로, 활성 상태만 `border-transparent`로 두면 두 상태 사이에 테두리 색만 바뀌고
"둘러싸인 느낌"이 없어 밋밋해 보인다.

**Why:** 사용자가 `/growth` 페이지의 `CategoryTabs`(카테고리 필터 pill 버튼)를 흰 배경
버튼 스타일로 바꾸는 과정에서 최초 구현(`border-transparent bg-gf-orange-bg text-gf-orange`)에
대해 명시적으로 "활성화될 때 border 1px 정도 추가해줘"라고 피드백을 줬다. 배경 틴트만으로는
비활성 pill(흰 배경 + 회색 보더)과의 대비가 약해서, 보더 색까지 오렌지로 채워야 활성 상태가
한눈에 도드라진다는 확인된 선호다.

**How to apply:**
- 이후 리뷰에서 Tab/Button/Chip류 컴포넌트의 활성 상태 className이
  `border-gf-orange bg-gf-orange-bg text-gf-orange` 세트를 따르는지 확인 기준으로 삼는다
  (비활성은 `border-gf-border bg-gf-white text-gf-black` 세트).
- 참고 구현: `src/components/growth/CategoryTabs.tsx`의 `isActive` 분기.
- `FilterDropdown.tsx`의 드롭다운 선택 항목(`bg-gf-orange-bg text-gf-orange`, 보더 없음)처럼
  이 규칙이 아직 반영 안 된 기존 활성 상태 UI가 있을 수 있다 — 사용자가 명시적으로 지적한 건
  `CategoryTabs`뿐이라 소급 변경을 강제할 사안은 아니지만, 새로 그 파일을 리뷰하게 되면 동일
  기준으로 개선을 제안할 수 있다(Minor).

**확장 사례 (2026-08-25):** `/mypage`의 `BackButton`(토글/선택 상태가 아닌 단순 액션 버튼)에
사용자가 참고 이미지로 이 동일한 pill 조합(`border-gf-orange bg-gf-orange-bg text-gf-orange` +
`rounded-full`)을 명시적으로 요청했다. 즉 이 클래스 세트는 "활성 상태 표시" 전용 규칙이
아니라, 이 프로젝트에서 브랜드 오렌지를 강조하는 **시그니처 pill 버튼 스타일**로도 쓰인다.
리뷰 시 이 패턴을 만나면 활성 상태 여부와 무관하게 정당한 디자인 선택으로 판단할 것 — 다만
`docs/design.md`의 기본 원칙(기능 UI 버튼은 `rounded-lg`)과는 다른 예외이므로, 사용자 확인
없이 다른 기능 버튼에 임의로 소급 적용됐다면 그건 오히려 지적 대상이 될 수 있다.
