---
name: active_state_border
description: Tab/Button류 컴포넌트의 활성(active) 상태 스타일 — bg-gf-orange-bg + text-gf-orange에 border-gf-orange 1px를 항상 함께 준다
metadata:
  type: feedback
---

Tab이나 Button처럼 "선택됨/활성화됨" 상태를 표현하는 UI에서, 활성 상태 배경색으로
`bg-gf-orange-bg`(연한 오렌지 틴트) + `text-gf-orange`를 쓸 때는 **테두리도 `border-gf-orange`
1px(기본 `border` 클래스 폭)로 함께 넣는다.** 비활성 상태는 보통 `border-gf-border`(연회색
1px)를 쓰므로, 활성 상태만 `border-transparent`로 두면 두 상태 사이에 테두리 색만 바뀌고
"둘러싸인 느낌"이 없어 밋밋해 보인다.

**Why:** 사용자가 `/layer`(당시 `/growth`, 2026-09-01 리네임) 페이지의 `CategoryTabs`(카테고리 필터 pill 버튼)를 흰 배경
버튼 스타일로 바꾸는 과정에서 최초 구현(`border-transparent bg-gf-orange-bg text-gf-orange`)에
대해 명시적으로 "활성화될 때 border 1px 정도 추가해줘"라고 피드백을 줬다. 배경 틴트만으로는
비활성 pill(흰 배경 + 회색 보더)과의 대비가 약해서, 보더 색까지 오렌지로 채워야 활성 상태가
한눈에 도드라진다는 확인된 선호다.

**How to apply:**
- 새로 만드는 Tab/Button/Chip류 컴포넌트에서 활성 상태 className을 작성할 때는
  `border-gf-orange bg-gf-orange-bg text-gf-orange` 세 클래스를 세트로 쓴다(비활성은
  `border-gf-border bg-gf-white text-gf-black` 세트).
- 참고 구현: `src/components/layer/CategoryTabs.tsx`의 `isActive` 분기.
- 기존 컴포넌트 중 `FilterDropdown.tsx`의 드롭다운 선택 항목(`bg-gf-orange-bg text-gf-orange`,
  보더 없음)처럼 이 패턴이 아직 적용 안 된 곳이 있을 수 있다 — 사용자가 명시적으로 지적한 건
  `CategoryTabs`뿐이므로 다른 곳은 임의로 소급 변경하지 말고, 활성 상태 스타일을 새로 만들거나
  리뷰할 일이 생기면 이 규칙을 기준으로 제안한다.

**확장 사례 (2026-08-25):** 사용자가 `/mypage`의 `BackButton`(단순 뒤로가기 버튼, 토글/선택
상태가 아님)에 대해 참고 이미지를 주며 "이런식으로 수정해줘"라고 요청했는데, 그 이미지가 바로
이 `border-gf-orange bg-gf-orange-bg text-gf-orange` pill 룩이었다. 즉 이 조합은 "활성 상태
표시" 전용이 아니라 **이 프로젝트에서 브랜드 오렌지를 강조하고 싶은 버튼/뱃지 전반에 재사용되는
시그니처 pill 스타일**로 자리잡았다(`rounded-full` + 세 클래스 세트). 새 컴포넌트에서 "눈에
띄는 오렌지 강조 버튼"이 필요하면 매번 새로 디자인하지 말고 이 조합을 먼저 제안해볼 만하다 —
단, `docs/design.md`의 기본 원칙(기능성 UI 버튼은 `rounded-lg`, `rounded-full`은 마케팅 CTA
전용)과는 다른 예외이므로 사용자의 명시적 확인 없이 임의로 적용하지는 않는다.
