---
name: feedback_swiper_loop_needs_enough_slides
description: Swiper loop:true + centeredSlides + 소수점 slidesPerView 조합은 슬라이드 개수가 적으면(3개 등) 마지막→처음 전환에서 멈춘다. loopAdditionalSlides는 역효과 — 슬라이드 배열 자체를 반복해야 함
metadata:
  type: feedback
---

Swiper(`swiper/react`, 이 프로젝트는 `components/ui/AppSwiper.tsx`로 래핑)에서
`loop: true` + `centeredSlides: true` + 소수점 `slidesPerView`(예: 1.7)를 같이 쓰면,
`node_modules/swiper/swiper.js`의 `loopFix()` 내부 검증식
`slides.length < slidesPerView(정수 올림) + loopedSlides`이 틀어져 "루프에 필요한
슬라이드 수가 부족하다"는 경고와 함께 loop가 무력화된다. `centeredSlides`가 켜지면
`slidesPerView`가 홀수로 강제 보정되고(예: 1.7 → ceil 2 → 짝수라 3으로 올림) 이게
`loopedSlides` 계산에도 들어가서, 실제 슬라이드가 3개뿐이면 최소 5개가 필요해 조건을
못 채운다. 증상은 정방향 전환(0→1→2)까지는 되다가 **마지막→처음으로 돌아가는 전환**에서만
멈추는 형태로 나타난다(`components/growth/HeroCarousel.tsx`에서 처음 발견, 2026-08-26).

**Why:** 처음엔 `loopAdditionalSlides`를 늘려서 고치려 했는데, 이 옵션이 바로
`loopedSlides` 값 자체를 더 키우는 옵션이라 필요 최소 개수를 오히려 더 늘려버려 문제를
악화시켰다 — 방향을 반대로 짚은 삽질이었다. Swiper 소스(`swiper.js`의 `loopFix` 함수)를
직접 읽고 나서야 정확한 조건식을 확인하고 근본 원인을 잡을 수 있었다.

**How to apply:** 이 조합(loop + centeredSlides + 적은 슬라이드 수 + 소수점
slidesPerView)을 다른 캐러셀에도 쓸 일이 생기면, `loopAdditionalSlides`를 만지지 말고
**렌더링용 데이터 배열 자체를 필요한 최소 개수 이상으로 반복**해서 Swiper에 넘길 것
(콘텐츠는 그대로 반복되므로 화면상 무한 루프처럼 보이는 데는 문제 없음). 최소 필요 개수는
`ceil(slidesPerView)`를 centeredSlides 보정(짝수면 +1) 후 `slidesPerView + loopedSlides`
공식으로 대략 역산 가능하지만, 정확히 계산하기보다 넉넉히(예: 원본을 3배) 반복하는 편이
실용적이다. `HeroCarousel.tsx`의 `LOOP_SLIDES`/`LOOP_REPEAT` 구현과 상단 주석 참고.
