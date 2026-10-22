"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { SwiperProps } from "swiper/react";
import { cn } from "@/lib/utils";

interface Props extends Omit<SwiperProps, "modules"> {
  children: React.ReactNode;
  navigation?: boolean;
  pagination?: boolean;
  swiperClass?: string;
}

export { SwiperSlide };

export default function AppSwiper({
  children,
  navigation = true,
  pagination = false,
  autoplay = false,
  swiperClass = "app-swiper",
  spaceBetween = 0,
  slidesPerView = 1,
  ...rest
}: Props) {
  const modules = [
    ...(navigation ? [Navigation] : []),
    ...(pagination ? [Pagination] : []),
    ...(autoplay ? [Autoplay] : []),
  ];

  return (
    <div className="relative w-full">
      <Swiper
        modules={modules}
        navigation={navigation}
        pagination={pagination ? { clickable: true } : false}
        autoplay={autoplay}
        spaceBetween={spaceBetween}
        slidesPerView={slidesPerView}
        grabCursor={true}
        simulateTouch={true}
        className={cn(swiperClass, "w-full")}
        {...rest}
      >
        {children}
      </Swiper>

      <style>{`
        .${swiperClass} .swiper-button-next,
        .${swiperClass} .swiper-button-prev {
          color: #111;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
        .${swiperClass} .swiper-button-next::after,
        .${swiperClass} .swiper-button-prev::after {
          font-size: 14px;
          font-weight: 900;
        }
        .${swiperClass} .swiper-pagination-bullet-active {
          background: #ff5500;
        }
      `}</style>
    </div>
  );
}
