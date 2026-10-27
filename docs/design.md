# Design Guide — GOSPELFIX

> 이 문서는 이 프로젝트의 디자인 기준이다.
> 모든 화면과 컴포넌트는 이 문서를 먼저 읽고 따른다.
> 규칙과 어긋나면 만들기 전에 멈추고 나에게 물어본다.
>
> 이 문서는 `tailwind.config.ts`, `src/app/globals.css`, 실제 컴포넌트 코드를 직접 조사해서
> 정리한 것이다 — 이상적인 목표가 아니라 지금 코드가 실제로 지키고 있는 규칙이다.

## 1. Overview (브랜드 한 줄·무드)

- 브랜드명: GOSPELFIX (공식 사이트) · 모다(MODA, 마켓플레이스 서브 브랜드)
- 한 문장: 업종에 맞는 AI 홈페이지와 24시간 자동응대 AI 챗봇으로, 예약 문의를 하나도 놓치지 않게 한다
- 무드 키워드: 대문자 임팩트 헤드라인 / 웜 오렌지 포인트 / 절제된 뉴트럴 면
- 느낌 비교: 굵은 산세리프 헤드라인 + 오렌지 하나로 포인트를 주는 절제된 브랜드 O · 파스텔 그라데이션·사탕색 카드 X

## 2. Colors (컬러)

`src/app/globals.css`의 `:root`에 정의된 실제 값 (`tailwind.config.ts`가 `gf-*` 네임스페이스로 그대로 매핑):

| 토큰 | 값 | 용도 |
|------|-----|------|
| Primary (포인트) | `--gf-orange` `#FF5500` | 아이콘 · 라벨 · 버튼 · 강조 텍스트 |
| Primary hover | `--gf-orange2` `#FF6B1A` | 버튼/링크 호버 |
| Orange tint | `--gf-orange-bg` `rgba(255,85,0,.07)` | 아이콘 원형/사각 배경, 배지 배경 |
| Ink (제목·본문) | `--gf-black` `#111111` | 헤드라인, 본문 기본 텍스트 |
| Body gray | `--gf-gray1` `#444444` | 서브 본문 |
| Muted (보조 텍스트) | `--gf-gray2` `#888888` | 캡션, 보조 설명 |
| Disabled gray | `--gf-gray3` `#CCCCCC` | 카드 보더 등 옅은 경계 |
| Border | `--gf-border` `#E8E5DF` | 카드·섹션 보더 |
| Line | `--gf-line` `#E0E0E0` | 구분선 |
| Surface (카드) | `--gf-surface` `#F9F9F9` / `--gf-white` `#FFFFFF` | 카드·팝업 면 |
| Background | `--gf-bg` `#F3F3F4` | 페이지 배경(`body`) |

- 규칙: 색은 위계에만. 오렌지 포인트는 아이콘·라벨·버튼·강조 텍스트에만 쓰고, 카드와 섹션은 항상 중립면(`gf-bg`/`gf-white`/`gf-surface`)으로 유지한다.
- 다크모드는 지원하지 않는다 — `.dark` 전용 변수 블록이 없고, `next-themes`의 `ThemeProvider`가 앱에 연결돼 있지도 않다. `dark:` 클래스를 새로 추가하지 않는다.

## 3. Typography (타이포그래피)

폰트 3종을 역할별로 엄격히 분리해서 쓴다 (`globals.css` `@font-face` 로컬 로드, `next/font` 미사용):

- **Pretendard** (`--font-kr`) — 한글 본문·헤드라인 전체 (weight 100~900)
- **DM Sans** (`--font-en`, `font-en` 클래스) — 영문 헤드라인·CTA 문구 (HeroBanner, CtaBanner, ProductCard, OptionToggle, PurchaseOptionsPanel)
- **Playfair Display Bold Italic** (`--font-playfair`, `font-playfair` 클래스) — 브랜드 악센트 단어 1곳에만 (예: 홈 히어로의 `presence`)

| 레벨 | 크기 | 굵기 | 비고 |
|------|------|------|------|
| H1 (히어로) | `text-6xl sm:text-8xl` (~60–96px) | `font-black`(900) | `tracking-tight`, `uppercase` |
| H2 (섹션 타이틀, `.gf-section-title`) | `clamp(24px,3vw,36px)` | `font-black`(900) | `tracking: -0.04em`, `line-height: 1.1` |
| H3 (카드 타이틀) | `text-2xl` | `font-black`~`font-bold` | `leading-snug` |
| 본문 | `16px` | Regular | `line-height: 1.6`, `word-break: keep-all` |
| 섹션 라벨 (`.gf-section-label`) | `11px` | `700` | `uppercase`, `letter-spacing: .13em`, 오렌지 필 배지 |
| 숫자 강조 (StatsSection) | `text-5xl sm:clamp(44px,5vw,68px)` | `font-black` | `text-gf-orange`, `tracking-tight` |

- 전역 규칙(`globals.css` `h1~h6`): `letter-spacing: -0.03em; font-weight: 700;`
- 규칙: 위계는 크기·굵기·자간으로만 만든다. h1/h2급은 예외 없이 `font-black`(900) + 음수 `tracking`. Playfair는 브랜드 악센트 단어 이외에는 쓰지 않는다.

## 4. Layout (간격·여백)

별도의 커스텀 spacing/container 확장은 없다(Tailwind 기본 스케일 그대로 사용) — 대신 실제로 반복되는 값 몇 가지가 사실상의 표준이다.

- 섹션 좌우 패딩: `px-6`(모바일) + `lg:px-[60px]`(데스크톱)
- 섹션 상하 패딩: `pt-20 pb-24` 또는 `py-20`
- 콘텐츠 최대 너비: `max-w-5xl`(1024px)이 표준 섹션 폭. 히어로/CTA처럼 좁게 읽혀야 하는 텍스트 블록은 `max-w-[640px]`/`max-w-[460px]` 등 개별 지정, 상세페이지 본문처럼 넓어야 하는 예외는 별도 값 사용
- 카드 grid 간격: `gap-4`가 표준, 2열 레이아웃은 `gap-6`
- 규칙: 섹션을 새로 만들 때는 위 반복 값(`px-6`/`lg:px-[60px]`, `pt-20 pb-24`, `max-w-5xl`, `gap-4`)을 먼저 재사용하고, 정말 그 섹션만의 예외적 폭/여백이 필요할 때만 새 임의값을 만든다.

## 5. Elevation & Depth (그림자·깊이)

카드 기본 상태는 그림자를 최소화하고, 인터랙션(호버)이나 확실히 위계가 높은 요소에만 뚜렷한 그림자를 쓴다.

- 카드 기본(`.gf-feature-card`): 보더(`gf-gray3`/`gf-border`)만, 그림자 없음
- 카드 호버: `box-shadow: 0 8px 32px rgba(0,0,0,.06)` + `translateY(-3px)` (살짝 떠오름)
- 상품 카드: 기본 `shadow-[0_4px_16px_rgba(0,0,0,.09)]` → 호버 시 `shadow-[0_12px_40px_rgba(0,0,0,.08)]` + `-translate-y-1`
- 모달/드롭다운/토스트/플로팅 버튼: `shadow-lg`~`shadow-2xl`로 뚜렷하게 띄움 (드롭다운, 결제 확인 모달, 알림 미리보기, 플로팅 GNB 버튼)
- 섹션 간 경계는 그림자 대신 `border-t`/`border-b`(`gf-border`)로 나눈다
- 규칙: 카드 기본 상태에 그림자를 남용하지 않는다. 호버/모달/드롭다운처럼 "떠 있어야 하는" 요소에만 그림자를 쓴다.

## 6. Shapes (모서리·형태)

모서리는 사실상 5단계로 통일돼 있다 (`tailwind.config.ts`: `--radius: 1rem` 기준 `lg`/`md`/`sm` 매핑 + Tailwind 기본 스케일):

- **pill (`rounded-full`)**: 버튼(마케팅 CTA), 배지, 칩, 아바타/번호 원
- **`rounded-2xl`**: 카드 (강조 카드·CTA 패널은 `rounded-3xl`)
- **`rounded-xl`**: 모달, 아이콘 사각 배경(`w-10 h-10 rounded-xl bg-gf-orange-bg`)
- **`rounded-lg`**: 기능성 UI 버튼(`components/ui/button.tsx`의 shadcn `Button` 기본값 중 `default`/`lg`/`icon`/`icon-lg`), 인풋
- **`rounded-sm`**: `Button`의 작은 size(`sm`/`xs`/`icon-sm`/`icon-xs`) 전용 — 높이가 낮아 `rounded-lg`를 쓰면 필(pill) 모양이 되어버리는 문제를 피하기 위함

마케팅 랜딩의 CTA(`<Link>`/`<button>`)는 항상 pill, 반면 폼·모달·툴바 안의 shadcn `Button`은 `rounded-lg` — 마케팅 문맥과 기능성 UI 문맥을 의도적으로 구분해서 쓴다.

`Button`의 모서리는 size에 따라 두 그룹으로 나뉜다 — `default`/`lg`/`icon`/`icon-lg`는 `rounded-lg`(16px)를, `sm`/`xs`/`icon-sm`/`icon-xs`는 `rounded-sm`(`tailwind.config.ts`의 `sm: 0.5rem` 토큰, 8px)을 쓴다. 과거엔 작은 사이즈만 별도로 더 각진 반경(`rounded-md` 계열)을 써서 "수정"/"삭제"처럼 작은 액션 버튼이 각져 보인다는 피드백을 받았고(2026-08-26), 이를 모든 size `rounded-lg` 통일로 한 차례 고쳤으나 `h-6`/`h-7`(24~28px) 높이에 16px 반경은 절반을 넘어 사실상 필(pill) 모양이 되어 버리는 부작용이 있었다. 그래서 다시 한 번 조정해, 작은 사이즈는 새 임의값이 아니라 기존에 정의만 되어 있던 `sm`(8px) 토큰을 재사용하는 것으로 확정했다(2026-08-26). 작은 버튼이라고 임의로 더 각진 하드코딩 값을 넣지 않는다 — `rounded-sm` 유틸리티를 그대로 쓴다.

- 아이콘: lucide-react 라인 아이콘 + 연한 오렌지 원형/사각 배경(`bg-gf-orange-bg`) 조합이 기본 패턴. 별도 stroke 커스터마이징은 하지 않는다.
- 규칙: 모서리 값은 위 5단계(`full`/`2xl`/`xl`/`lg`/`sm`)로만 쓴다. 새 컴포넌트를 만들 때 임의의 `rounded-[...]` 값을 새로 만들지 않는다.

## 7. Components (컴포넌트)

- **Primary 버튼 (마케팅 CTA)**: 배경 `gf-orange`, 흰 글자, `rounded-full`, `px-[30px] py-[14px]` 안팎
- **shadcn Button (기능 UI)**: 기본 높이 `h-8`(`size: default`)는 `rounded-lg`, 작은 size(`sm`/`xs`/`icon-sm`/`icon-xs`)는 `rounded-sm`, `variant: default/outline/secondary/ghost/destructive/link`
- **카드 (`.gf-feature-card`)**: 배경 `gf-bg`, 보더 `gf-gray3`, `rounded-2xl`, 호버 시 그림자+살짝 떠오름
- **상품 카드**: 배경 `gf-white`, 보더 `gf-border`, `rounded-2xl`, 썸네일 호버 시 `scale-105`
- **통계 숫자**: `text-5xl sm:text-[clamp(44px,5vw,68px)] font-black text-gf-orange` + 보조 라벨 `text-gf-gray2 text-xs`
- **라벨/배지 (`.gf-section-label`)**: `rounded-full`, `px-3.5~4 py-1~1.5`, `text-[11px] font-bold uppercase`, 오렌지 톤
- **Tab**: `components/ui/Tab.tsx` — 도메인 지식 없는 원자 컴포넌트. 구조(`border-b-2 px-4 py-3 text-sm font-semibold`)만 제공하고 활성/비활성 색상은 호출부가 className으로 넘긴다.

## 8. Do's and Don'ts (지킬 것·하지 말 것)

- 폰트는 역할별 3종(한글 Pretendard / 영문·숫자 DM Sans / 브랜드 악센트 Playfair Display Bold Italic)만 쓴다 — 그 외 폰트 새로 도입 금지
- 카드 배경에 그라데이션·원색 채색 금지 — 카드/섹션은 항상 중립면, 컬러는 아이콘·라벨·텍스트 포인트로만
- 마케팅 CTA는 pill, 기능성 UI 버튼은 `rounded-lg` — 문맥을 바꿔 쓰지 않는다
- 다크모드용 `dark:` 클래스를 새로 추가하지 않는다 (라이트 전용, ThemeProvider 미연결)
- 카드 기본 상태에 그림자 남용 금지 — 그림자는 호버·모달·드롭다운 등 위계가 필요한 곳에만
- 모션은 페이드+슬라이드(`opacity 0→1`, `translateY 8~24px`) 정도로 절제하되, 구현은 인터랙션·전환·로딩 표시 등 움직이는 모든 것을 `motion`(`motion/react`, 구 framer-motion)으로 한다. CSS `@keyframes`/`tailwindcss-animate`(`animate-in` 등)로 새 애니메이션을 만들지 않는다 — 이 프로젝트는 Tailwind 3.4라 `data-open:animate-in` 같은 v4 문법은 CSS가 생성되지 않는다. 기존 CSS 애니메이션은 해당 코드를 수정할 때 함께 `motion`으로 옮긴다. 기준 구현은 `components/ui/dialog.tsx`
- 모션·인터랙션·움직임에 해당하는 UI 작업은 반드시 `motion-designer` 에이전트(`.claude/agents/motion-designer.md`)가 맡는다. 새 모션의 타이밍·이징·퇴장 처리·reduced motion 기준은 이 에이전트의 원칙을 따른다
