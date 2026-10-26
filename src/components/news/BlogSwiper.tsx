"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Megaphone, Plus } from "lucide-react";
import type { Swiper as SwiperClass } from "swiper/types";
import AppSwiper, { SwiperSlide } from "@/components/ui/AppSwiper";
import { Button } from "@/components/ui/button";
import { SwiperSectionHeader } from "@/components/ui/SwiperSectionHeader";
import { cn } from "@/lib/utils";
import type { NewsListItem } from "@/types/news.types";

interface Props {
  news: NewsListItem[];
}

export default function BlogSwiper({ news }: Props) {
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

  return (
    <>
      <SwiperSectionHeader
        title="블로그"
        badgeLabel="Blog"
        subtitle="새로운 템플릿 출시, 업데이트, 이벤트 소식을 전해드립니다."
        actions={
          news.length > 0 && (
            <div className="flex items-center gap-2.5 shrink-0">
              {(
                [
                  {
                    Icon: ChevronLeft,
                    label: "이전 게시물",
                    disabled: isBeginning,
                    onClick: () => swiper?.slidePrev(),
                  },
                  {
                    Icon: ChevronRight,
                    label: "다음 게시물",
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
          )
        }
      />

      {news.length === 0 ? (
        <div className="px-6 lg:px-[60px]">
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl border gf-border gf-bg-white">
            <Megaphone width={32} height={32} className="gf-text-gray2 mb-3" />
            <p className="text-lg font-semibold mb-1 gf-text-black">아직 게시물이 없습니다</p>
            <p className="text-sm gf-text-gray2">새로운 콘텐츠가 올라오면 이곳에서 확인하세요.</p>
          </div>
        </div>
      ) : (
        <div className="pl-6 lg:pl-[60px]">
          <AppSwiper
            swiperClass="blog-swiper"
            navigation={false}
            slidesPerView="auto"
            spaceBetween={20}
            slidesPerGroup={1}
            onSwiper={handleSwiper}
          >
            {news.map((item) => (
              <SwiperSlide key={item.id} className="!w-[65vw] sm:!w-64 lg:!w-72">
                <Link
                  href={`/blog/${item.slug}`}
                  scroll={false}
                  className="relative flex aspect-[2/3] rounded-3xl overflow-hidden no-underline bg-black"
                >
                  {/* 이미지 (카드 전체를 채우는 배경) */}
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 65vw, (max-width: 1024px) 256px, 288px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                      <Megaphone width={32} height={32} className="text-gray-500" />
                    </div>
                  )}

                  {/* 텍스트 가독성을 위한 상단 그라데이션 오버레이 */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/80 via-black/30 to-transparent" />

                  {/* 텍스트 영역 (이미지 위에 오버레이) */}
                  <div className="relative z-10 px-5 pt-7 pb-5">
                    <p className="text-xs text-white/70 mb-1.5">{item.category}</p>
                    <h3 className="text-lg font-black text-white leading-snug line-clamp-2 min-h-[3.1rem]">
                      {item.title}
                    </h3>
                  </div>

                  {/* 원형 + 버튼 (장식용, 카드 전체가 Link) */}
                  <span className="pointer-events-none absolute bottom-6 right-6 z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center">
                    <Plus size={18} className="text-black" />
                  </span>
                </Link>
              </SwiperSlide>
            ))}
          </AppSwiper>
        </div>
      )}
    </>
  );
}
