---
name: hero_carousel_autoplay_loop_review
description: /growth 상단 HeroCarousel 중앙강조형+무한루프+타임라인바 재설계, AppSwiper autoplay prop 추가 리뷰. APPROVED (Minor만 존재)
type: project
---

`src/components/growth/HeroCarousel.tsx`를 "가운데 확대+양옆 축소·흐림" 중앙 강조형 무한
루프 캐러셀로 재설계하고, `components/ui/AppSwiper.tsx`(공용 Swiper 래퍼)에 `autoplay` prop을
`navigation`/`pagination`과 동일한 조건부 모듈 추가 패턴으로 지원 (2026-08-26, APPROVED).

**핵심 발견(버그 아님, 검증 완료 사항)**:
- Swiper `loop:true` + `centeredSlides` + 소수점 `slidesPerView`(1.7) 조합에서 실제 슬라이드가
  3개뿐이면 `loopFix()` 최소 슬라이드 수 요구사항 미충족으로 "마지막→처음" 전환에서 멈추는 버그가
  있었고, 원본 데이터 배열을 3배 반복(`LOOP_SLIDES`)해 Swiper에 넘기는 방식으로 해결함 — 상세 원인
  분석은 `.claude/memory/feedback_swiper_loop_needs_enough_slides.md`(사용자 메인 메모리) 참고.
  향후 이 캐러셀의 breakpoints(slidesPerView)가 바뀌면 `LOOP_REPEAT=3`이 여전히 충분한지 재검토
  필요 — 주석에 근거(최소 5개 요구, 현재 9개 제공)가 명시되어 있어 재검토 포인트가 코드에 드러남.
- `syncActiveVideo()`가 React ref 배열이 아니라 `instance.slides[instance.activeIndex]`(Swiper
  loop clone 포함 실제 DOM)로 활성 video를 직접 조회 — `instanceof HTMLVideoElement` 타입가드로
  안전하게 처리됨. loop 모드에서 ref 배열이 clone과 어긋나는 문제를 올바르게 우회한 패턴.
- `AppSwiper.tsx`의 autoplay prop 추가는 기존 3개 호출부(`NewsImageGallery`, `BlogSwiper`,
  `PortfolioSwiper`)가 autoplay를 넘기지 않아 기본값 false로 동작 변화 없음을 grep으로 확인.

**Minor 지적사항 (BLOCKED 아님)**:
1. `autoplay={{ delay, disableOnInteraction, pauseOnMouseEnter }}` 한 줄이 104자로 Prettier
   printWidth(100) 초과 — 객체 리터럴이라 실제로 `yarn lint`/prettier 실행 시 여러 줄로 재포맷될
   가능성 높음(className 문자열 초과와 달리 이건 진짜 포맷 차이가 남).
2. `bg-[radial-gradient(circle,rgba(255,85,0,0.18)_0%,transparent_65%)]`의 `rgba(255,85,0,...)`가
   `--gf-orange:#ff5500`과 정확히 동일한 값 — recurring_issues #14(등록된 토큰과 동일한 임의값
   하드코딩)와 같은 패턴. 다만 이 프로젝트 `tailwind.config.ts` 색상 토큰이 순수 hex 문자열이라
   `bg-gf-orange/18` opacity 모디파이어 자체가 동작하지 않는 구조적 한계(recurring_issues #20)가
   있어, radial-gradient 안에서 토큰을 재사용할 마땅한 방법이 없다는 점도 함께 감안해 낮은 우선순위로
   판단.
3. 타임라인 바 dot(`<button>`)이 raw 태그로 작성됨 — 다만 이번 건은 Button/Toggle 등 명시적으로
   열거된 아토믹 타입이 아니고 2곳 이상 중복도 아니라서(단일 위젯 전용, Swiper 내장 pagination과는
   별개의 커스텀 진행바) Major/BLOCKED로 격상하지 않고 Minor로 하향 판단 — recurring_issues #9/17/
   22/23/28(CTA·dismiss·옵션 토글처럼 기존 Button/컴포넌트 선례가 명확한 케이스)과는 성격이 다름을
   구분한 사례로 기록.
4. `slideToLoop(index)`가 항상 `LOOP_SLIDES`의 첫 번째 반복 구간(원본 배열 내 0~2 위치)으로
   이동하므로, 현재 재생 중인 dot을 다시 클릭하면 실제 activeIndex가 두 번째/세 번째 반복 구간에
   있을 경우 눈에 띄는 역방향 스킵 애니메이션이 발생할 수 있음(런타임 미검증, 코드 추론) — onClick에
   `index !== logicalIndex` 가드 추가를 제안.

**결론**: Critical/Major 0건, APPROVED.
