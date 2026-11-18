"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperClass } from "swiper/types";
import AppSwiper, { SwiperSlide } from "@/components/ui/AppSwiper";
import { Button, buttonVariants } from "@/components/ui/button";
import type { GallerySlide } from "@/lib/sanitizeHtml";
import { cn } from "@/lib/utils";

interface ProductImageSliderProps {
  images: GallerySlide[];
  productName: string;
  // 상품의 데모 사이트. 있으면 상단에 열기 버튼을 보여준다.
  demoUrl?: string | null;
  // AppSwiper가 스타일을 이 클래스 셀렉터로 입히므로 슬라이더마다 고유해야 한다.
  sliderId: string;
}

type Device = GallerySlide["device"];

const DEVICE_TABS: { value: Device; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
];

// 상세 본문에서 판매자가 묶어 올린 이미지를 보여주는 좌우 슬라이더.
// 이미지마다 비율이 달라도 높이가 들쑥날쑥하지 않도록 고정 크기의 회색 상자 안에 비율을 유지해
// 가운데로 맞추고, 버튼은 사진을 가리지 않게 상자 양옆 여백에 둔다.
// 사진에 Desktop/Mobile 용도가 섞여 있으면 상단 토글로 용도별로 걸러 보여준다.
export function ProductImageSlider({
  images,
  productName,
  demoUrl,
  sliderId,
}: ProductImageSliderProps) {
  const swiperRef = useRef<SwiperClass | null>(null);
  // SSR 직후 Swiper가 초기화되기 전에는 슬라이드가 세로로 쌓여 보이므로 숨겨 둔다.
  const [ready, setReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasDesktop = images.some((image) => image.device === "desktop");
  const hasMobile = images.some((image) => image.device === "mobile");
  const hasDeviceToggle = hasDesktop && hasMobile;
  const [device, setDevice] = useState<Device>(hasDesktop ? "desktop" : "mobile");
  const visibleImages = hasDeviceToggle
    ? images.filter((image) => image.device === device)
    : images;

  // javascript: 등 위험한 스킴이 href에 들어가지 않도록 http(s)만 허용한다(ProductVisitNav와 동일).
  const isSafeDemoUrl = !!demoUrl && /^https?:\/\//.test(demoUrl);
  const hasHeader = hasDeviceToggle || isSafeDemoUrl;

  function handleSwiper(instance: SwiperClass) {
    swiperRef.current = instance;
    setActiveIndex(instance.activeIndex);
    instance.on("slideChange", () => setActiveIndex(instance.activeIndex));
    setReady(true);
  }

  function handleDeviceChange(next: Device) {
    if (next === device) return;
    setDevice(next);
    setActiveIndex(0);
    // key로 Swiper가 새로 만들어지는 동안 슬라이드가 세로로 쌓여 보이지 않게 다시 숨긴다.
    setReady(false);
  }

  const arrows = [
    {
      Icon: ChevronLeft,
      label: "이전 이미지",
      disabled: activeIndex === 0,
      onClick: () => swiperRef.current?.slidePrev(),
      side: "left-3 sm:left-4",
    },
    {
      Icon: ChevronRight,
      label: "다음 이미지",
      disabled: activeIndex >= visibleImages.length - 1,
      onClick: () => swiperRef.current?.slideNext(),
      side: "right-3 sm:right-4",
    },
  ] as const;

  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl bg-gf-gray3 transition-opacity",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      {hasHeader && (
        <div className="flex items-center justify-between gap-2 px-4 pt-4 sm:px-5">
          {hasDeviceToggle ? (
            <div className="flex items-center gap-1.5" role="tablist" aria-label="화면 종류">
              {DEVICE_TABS.map((tab) => (
                <Button
                  key={tab.value}
                  type="button"
                  role="tab"
                  aria-selected={device === tab.value}
                  // 선택된 탭은 다크 모드에서도 구분되도록 색이 고정된 floating을 쓴다.
                  variant={device === tab.value ? "floating" : "ghost"}
                  onClick={() => handleDeviceChange(tab.value)}
                  className={cn(
                    "h-8 px-4 text-sm font-medium",
                    device !== tab.value && "rounded-full text-gf-gray2 hover:text-gf-black",
                  )}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
          ) : (
            <span />
          )}

          {isSafeDemoUrl && (
            <a
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="데모 사이트 열기"
              className={buttonVariants({ variant: "floating", size: "icon-lg" })}
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
        </div>
      )}

      <div
        className={cn("relative px-14 pb-10 sm:px-20", hasHeader ? "pt-3 sm:pt-4" : "pt-6 sm:pt-8")}
      >
        {/* 용도를 바꾸면 슬라이드 목록이 통째로 달라지므로 key로 Swiper를 새로 만든다. */}
        <AppSwiper
          key={device}
          swiperClass={sliderId}
          navigation={false}
          pagination={false}
          onSwiper={handleSwiper}
        >
          {visibleImages.map((image, idx) => (
            <SwiperSlide key={`${sliderId}-${idx}`}>
              <div className="flex h-[280px] items-center justify-center sm:h-[460px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={`${productName} 상세 이미지 ${idx + 1}`}
                  className="max-h-full max-w-full rounded-lg object-contain"
                />
              </div>
            </SwiperSlide>
          ))}
        </AppSwiper>

        <p className="absolute bottom-3 right-5 text-xs text-gf-gray2">
          {activeIndex + 1} / {visibleImages.length}
        </p>

        {/* 버튼 위치는 -translate 대신 flex로 잡는다(세로 가운데 정렬). */}
        {arrows.map(({ Icon, label, disabled, onClick, side }) => (
          <div
            key={label}
            className={cn("pointer-events-none absolute inset-y-0 z-10 flex items-center", side)}
          >
            <Button
              type="button"
              variant="floating"
              size="icon-lg"
              onClick={onClick}
              disabled={disabled}
              aria-label={label}
              className="pointer-events-auto disabled:opacity-40"
            >
              <Icon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
