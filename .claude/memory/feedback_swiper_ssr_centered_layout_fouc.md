---
name: feedback_swiper_ssr_centered_layout_fouc
description: centeredSlides+소수점 slidesPerView Swiper는 SSR/하이드레이션 직후 레이아웃 미계산 상태로 잠깐 그려져 "1단→3단"으로 튀어 보인다. onSwiper 콜백 전까지 opacity-0으로 감췄다가 페이드인해야 함
metadata:
  type: feedback
---

`components/ui/AppSwiper.tsx`로 감싼 Swiper가 `centeredSlides` + 소수점
`slidesPerView`(예: 1.15/1.5/1.7)를 쓰면, 각 슬라이드의 너비와 "가운데 슬라이드를
중앙 정렬"하는 transform은 Swiper JS가 브라우저에서 직접 계산해 인라인 스타일로
적용한다. Next.js는 `"use client"` 컴포넌트도 서버에서 먼저 HTML을 만들어 보내는데,
이 시점엔 그 계산이 아직 없어서 슬라이드들이 계산된 너비 없이 붙어 그려진다(사실상
1단처럼 보임). 브라우저에서 하이드레이션 후 Swiper가 초기화되며 그제서야 진짜
레이아웃(3단, 가운데 확대)이 적용돼 화면이 눈에 띄게 "튀는"(FOUC) 현상이 생긴다.
`components/growth/HeroCarousel.tsx`에서 발견(2026-08-28, 사용자가 스크린샷으로
직접 지적).

**Why:** `swiper/css`가 `.swiper-wrapper`의 `display: flex`는 즉시 적용하지만,
슬라이드별 width·transform은 어차피 JS 계산 값이라 CSS만으로는 사전에 맞출 수 없다.
CSS 미디어쿼리로 breakpoint별 너비를 근사해도 `centeredSlides`의 중앙 정렬 offset까지
맞추긴 어려워, "미리 비슷하게 그리기"보다 "계산 끝날 때까지 안 보이게" 쪽이 더 간단하고
확실하다.

**How to apply:** 이 조합(centeredSlides + 소수점 slidesPerView)을 쓰는 다른 캐러셀을
새로 만들거나 발견하면, `AppSwiper`를 감싸는 wrapper 엘리먼트에 `ready` 상태(초기값
`false`, 서버/클라이언트 동일해 하이드레이션 불일치 없음)를 두고
`opacity-0`↔`opacity-100 transition-opacity`로 토글한다. `ready`는 `onSwiper` 콜백
(Swiper 인스턴스 생성 = 레이아웃 계산 완료 시점)에서만 `true`로 바꾼다. 페이지네이션
dot 같은 정적 UI는 이 wrapper 밖에 둬서 항상 접근 가능하게 유지한다(HeroCarousel의
타임라인 dot 참고). `AppSwiper`에 직접 `className`을 넘기면 안 된다 — `AppSwiper.tsx`가
`<Swiper className={cn(swiperClass, "w-full")} {...rest} />` 순서로 spread해서, 넘긴
`className`이 `rest`를 통해 기존 `swiperClass`/`w-full`을 통째로 덮어써 버린다(별도
바깥 `div`로 감싸서 회피). 구현 참고: `HeroCarousel.tsx`의 `ready`/`handleSwiper`.

관련: [[feedback_swiper_loop_needs_enough_slides]] (같은 `HeroCarousel.tsx`의
`centeredSlides` 설정에서 발견된 또 다른 Swiper 함정).
