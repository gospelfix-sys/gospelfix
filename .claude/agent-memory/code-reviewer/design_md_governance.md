---
name: design_md_governance
description: docs/design.md 신규 디자인 가이드 문서 도입 및 CLAUDE.md 연동 — 향후 UI 리뷰 시 근거 문서로 참조
type: project
---

`docs/design.md`가 신규 도입되어 프로젝트의 공식 디자인 가이드(컬러/타이포/레이아웃/그림자/모서리/
컴포넌트/Do's and Don'ts)로 자리잡았고, `CLAUDE.md`에 "## 디자인 가이드 (`docs/design.md`)" 섹션이
추가되어 "화면/컴포넌트를 새로 만들기 전에 먼저 읽고 따른다"는 문서로 참조된다 (2026-08-17 도입,
같은 날 재검증 후 APPROVED).

**Why:** `docs/design.md`는 이상적 목표가 아니라 "지금 코드가 실제로 지키고 있는 규칙"을 표방하는
문서다. 즉 향후 새 컴포넌트/UI 리뷰 시 이 문서에 적힌 값(hex/px/클래스명)을 코드 리뷰의 기준선으로
써도 된다 — 단, 문서 자체도 사실 오류가 있을 수 있으니 애매하면 `tailwind.config.ts`/
`globals.css`/실제 컴포넌트로 교차 검증한다.

**1차 리뷰에서 발견 후 해소된 사실 오류 (재발 방지용 기록):**
- StatsSection(`components/main/StatsSection.tsx`) 통계 숫자 클래스가 실제로는
  `text-5xl sm:text-[clamp(44px,5vw,68px)] font-black text-gf-orange`인데, 초안은
  `font-en`이 붙어있다고 오기재(실제로 이 요소엔 `font-en` 미적용) + 모바일 기본값
  `text-5xl` 누락. → 수정 확인됨.
- `font-en`(DM Sans) 실제 사용처는 `HeroBanner`, `CtaBanner`, `ProductCard`, `OptionToggle`,
  `PurchaseOptionsPanel` 5곳뿐 — StatsSection은 포함되지 않는다. 새 컴포넌트가 영문/숫자
  강조에 `font-en`을 쓸 때 이 목록을 참고.
- `CLAUDE.md`의 "인라인 style= 금지" 예시(133~149행)가 원래 `text-[#ff5500]`(하드코딩 hex)를
  "허용" 예시로 들고 있어, `docs/design.md`가 규정한 `gf-orange` 토큰 우선 원칙과 충돌했음.
  → `text-gf-orange`로 수정 + "브랜드 토큰이 있으면 하드코딩 hex 임의값 대신 토큰을 우선
  사용한다"는 문장과 `docs/design.md` 링크 추가로 해소.

**How to apply:** 앞으로 이 프로젝트에서 새 UI 컴포넌트나 스타일 관련 diff를 리뷰할 때
`docs/design.md`의 컬러 토큰 표(`gf-*`)/모서리 4단계(`full`/`2xl`/`xl`/`lg`)/그림자 규칙을
1차 기준으로 삼는다. 특히 브랜드 오렌지 계열(`#FF5500`, `#FF6B1A`)을 하드코딩 hex/rgba로 쓰는
코드를 보면 `text-gf-orange`/`bg-gf-orange-bg` 등 토큰 사용을 권고할 근거가 이제 명시적으로
문서화되어 있다 (단, 기존 Quote 위저드(`components/quote/steps/*`)처럼 이미 존재하는 하드코딩
hex는 이번 리뷰 스코프 밖이라 미수정 상태로 남아있음 — 향후 그 파일들을 건드릴 일이 있으면
`gf-orange` 토큰으로 정리할 기회로 삼을 것).
