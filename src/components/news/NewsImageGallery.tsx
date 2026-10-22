"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Swiper as SwiperClass } from "swiper/types";
import AppSwiper, { SwiperSlide } from "@/components/ui/AppSwiper";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NewsImageGalleryProps {
  images: string[];
  title: string;
  galleryId: string;
}

export default function NewsImageGallery({ images, title, galleryId }: NewsImageGalleryProps) {
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  function handleSwiper(instance: SwiperClass) {
    setSwiper(instance);
    setIsBeginning(instance.isBeginning);
    setIsEnd(instance.isEnd);
    instance.on("slideChange", () => {
      setIsBeginning(instance.isBeginning);
      setIsEnd(instance.isEnd);
    });
    instance.on("breakpoint", () => {
      setIsBeginning(instance.isBeginning);
      setIsEnd(instance.isEnd);
    });
  }

  if (images.length === 0) return null;

  return (
    <div className="mt-14 border-t gf-border pt-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-3xl font-black gf-text-black">갤러리</h2>
        <div className="flex items-center gap-2.5">
          {(
            [
              {
                Icon: ChevronLeft,
                label: "이전 이미지",
                disabled: isBeginning,
                onClick: () => swiper?.slidePrev(),
              },
              {
                Icon: ChevronRight,
                label: "다음 이미지",
                disabled: isEnd,
                onClick: () => swiper?.slideNext(),
              },
            ] as const
          ).map(({ Icon, label, disabled, onClick }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              size="icon-lg"
              onClick={onClick}
              disabled={disabled}
              aria-label={label}
              className={cn(
                "rounded-full bg-white text-gf-black shadow-md hover:bg-white hover:text-gf-gray2",
                "disabled:bg-white disabled:text-gf-gray3 disabled:shadow-sm disabled:hover:text-gf-gray3",
              )}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </div>

      <AppSwiper
        swiperClass={galleryId}
        navigation={false}
        pagination={false}
        slidesPerView={1.15}
        spaceBetween={16}
        breakpoints={{ 640: { slidesPerView: 2.2, spaceBetween: 24 } }}
        onSwiper={handleSwiper}
      >
        {images.map((src, idx) => (
          <SwiperSlide key={`${galleryId}-${idx}`}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-gf-border bg-gf-gray3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${title} 이미지 ${idx + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </AppSwiper>
    </div>
  );
}
