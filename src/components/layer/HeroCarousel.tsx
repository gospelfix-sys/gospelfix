"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Swiper as SwiperClass } from "swiper/types";
import AppSwiper, { SwiperSlide } from "@/components/ui/AppSwiper";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  bgClass: string;
  videoUrl?: string;
  badge: string;
  headline: string;
  headlineAccent: string;
  headlineSuffix: string;
  ctaLabel: string;
  ctaHref: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    bgClass: "bg-[#111111]",
    // TODO: 데모 영상 준비되면 videoUrl 채우기 — 있으면 가운데(활성) 슬라이드일 때 자동 재생됨
    badge: "New Release",
    headline: "예약 문의를 놓치지 않는",
    headlineAccent: "AI 시스템",
    headlineSuffix: "을 팝니다",
    ctaLabel: "지금 시작하기",
    ctaHref: "/?category=website",
  },
  {
    id: 2,
    bgClass: "bg-[#1A0A00]",
    badge: "Best Seller",
    headline: "대시보드 UI",
    headlineAccent: "완성형",
    headlineSuffix: " 패키지",
    ctaLabel: "대시보드 보기",
    ctaHref: "/?category=ux_ui",
  },
  {
    id: 3,
    bgClass: "bg-[#0A0A1A]",
    badge: "Popular",
    headline: "이커머스",
    headlineAccent: "결제 연동",
    headlineSuffix: " 완료",
    ctaLabel: "이커머스 보기",
    ctaHref: "/?category=website",
  },
];

// 슬라이드가 자동 전환되기까지 걸리는 시간. Swiper autoplay.delay와 아래 타임라인 바
// CSS 애니메이션(hero-timeline-fill) duration이 반드시 같은 값을 참조해야 진행바가
// 실제 전환 타이밍과 어긋나지 않는다.
const AUTOPLAY_DELAY_MS = 5000;

// Swiper loop 모드는 `slides.length >= slidesPerView(정수 올림) + loopedSlides`를
// 만족하지 못하면 "루프에 필요한 슬라이드 수가 부족하다"는 경고와 함께 마지막 슬라이드에서
// 멈춰버린다. centeredSlides + slidesPerView 1.7(desktop) 조합에서 필요한 최소 개수는
// 5개인데 실제 배너는 3개뿐이라, 데이터를 그대로 반복해 Swiper에게 "충분한 슬라이드 수"로
// 보이게 만든다(콘텐츠 자체는 3종류뿐이므로 화면상 무한 루프처럼 보이는 데는 문제 없음).
const LOOP_REPEAT = 3;
const LOOP_SLIDES: Slide[] = Array.from({ length: LOOP_REPEAT }, () => SLIDES).flat();

// 현재 활성 슬라이드(클론 포함) 안에 있는 video만 재생하고 나머지는 모두 정지한다.
// loop:true일 때 Swiper는 양 끝에 원본 슬라이드를 복제(clone)해 배치하므로, React가
// 들고 있는 ref 배열로는 "지금 화면에 보이는" DOM을 특정할 수 없다 — instance.slides
// (클론 포함 실제 DOM 목록)에서 activeIndex로 직접 조회해야 항상 정확하다.
function syncActiveVideo(instance: SwiperClass) {
  instance.el.querySelectorAll("video").forEach((video) => video.pause());
  const activeVideo = instance.slides[instance.activeIndex]?.querySelector("video");
  if (activeVideo instanceof HTMLVideoElement) {
    activeVideo.currentTime = 0;
    activeVideo.play().catch(() => {});
  }
}

// 모다(마켓플레이스) 홈(`/`) 상단 배너 — 가운데 슬라이드만 확대/선명하게, 좌우 슬라이드는 축소·반투명
// 상태로 흐려 보이는 중앙 강조형 무한 루프 캐러셀. 하단 타임라인 바가 다음 전환까지 남은
// 시간을 채워가며 보여주고, videoUrl이 있는 슬라이드는 가운데(활성) 상태일 때만 재생한다.
export function HeroCarousel() {
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(null);
  const [realIndex, setRealIndex] = useState(0);
  // Swiper는 slidesPerView/centeredSlides 레이아웃(슬라이드 너비, 가운데 정렬 transform)을
  // JS로 계산해 인라인 스타일로 적용한다. SSR 시점엔 이 계산이 아직 안 돼 있어 슬라이드가
  // 1단으로 붙어 보이다가, 클라이언트에서 초기화되는 순간 3단으로 "튀는" 현상(FOUC)이
  // 생긴다. 초기화 전에는 투명 처리해뒀다가 onSwiper(레이아웃 계산 완료 시점)에만 드러내면
  // 이미 정상 레이아웃인 상태로 페이드인되어 튀는 게 보이지 않는다.
  const [ready, setReady] = useState(false);
  const logicalIndex = realIndex % SLIDES.length;

  function handleSwiper(instance: SwiperClass) {
    setSwiperInstance(instance);
    setRealIndex(instance.realIndex);
    setReady(true);
    syncActiveVideo(instance);
    instance.on("slideChange", () => {
      setRealIndex(instance.realIndex);
      syncActiveVideo(instance);
    });
  }

  return (
    <div className="px-6 pt-6 lg:px-10">
      <div className={cn("transition-opacity duration-300", ready ? "opacity-100" : "opacity-0")}>
        <AppSwiper
          swiperClass="layer-hero-swiper"
          navigation={false}
          loop
          centeredSlides
          autoplay={{
            delay: AUTOPLAY_DELAY_MS,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          spaceBetween={16}
          slidesPerView={1.15}
          breakpoints={{
            768: { slidesPerView: 1.5, spaceBetween: 20 },
            1024: { slidesPerView: 1.7, spaceBetween: 24 },
          }}
          onSwiper={handleSwiper}
        >
          {LOOP_SLIDES.map((slide, index) => {
            const active = index === realIndex;
            return (
              <SwiperSlide key={`${slide.id}-${index}`} className="!h-auto pb-10">
                <div
                  className={cn(
                    "relative flex h-[320px] flex-col justify-between overflow-hidden rounded-2xl p-8 transition-all duration-500",
                    slide.bgClass,
                    active ? "origin-top scale-105 opacity-100" : "scale-[0.92] opacity-45",
                  )}
                >
                  {slide.videoUrl && (
                    <>
                      <video
                        src={slide.videoUrl}
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-black/40" />
                    </>
                  )}

                  <div className="pointer-events-none absolute -top-[120px] -right-[60px] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(255,85,0,0.18)_0%,transparent_65%)]" />

                  <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-gf-orange/30 bg-gf-orange/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-gf-orange">
                    <span className="h-[6px] w-[6px] shrink-0 animate-pulse rounded-full bg-gf-orange" />
                    {slide.badge}
                  </div>

                  <div className="relative z-10">
                    <h3 className="mb-6 text-[clamp(20px,2.2vw,26px)] font-black leading-[1.2] tracking-[-0.03em] text-white">
                      {slide.headline}
                      <span className="text-gf-orange">{slide.headlineAccent}</span>
                      {slide.headlineSuffix}
                    </h3>
                    <Link
                      href={slide.ctaHref}
                      className="inline-flex items-center gap-2 rounded-full bg-gf-orange px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
                    >
                      {slide.ctaLabel}
                      <ArrowRight width={15} height={15} />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </AppSwiper>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {SLIDES.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`${index + 1}번째 배너로 이동`}
            onClick={() => index !== logicalIndex && swiperInstance?.slideToLoop(index)}
            className="h-[3px] w-7 shrink-0 overflow-hidden rounded-full bg-gf-border"
          >
            <span
              key={index === logicalIndex ? "playing" : "idle"}
              className={cn(
                "block h-full rounded-full bg-gf-orange",
                index < logicalIndex && "w-full",
                index > logicalIndex && "w-0",
                index === logicalIndex && "hero-timeline-fill",
              )}
            />
          </button>
        ))}
      </div>

      <style>{`
        @keyframes hero-timeline-fill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .hero-timeline-fill {
          animation: hero-timeline-fill ${AUTOPLAY_DELAY_MS}ms linear forwards;
        }
      `}</style>
    </div>
  );
}
