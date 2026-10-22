"use client";

import Image from "next/image";
import Link from "next/link";
import AppSwiper, { SwiperSlide } from "@/components/ui/AppSwiper";
import { SwiperSectionHeader } from "@/components/ui/SwiperSectionHeader";
import type { PortfolioListItem } from "@/types/portfolio.types";
import { cn } from "@/lib/utils";

interface Props {
  // description은 반드시 호출부(Server Component)에서 sanitizeContentHtml()로 미리 살균된 값이어야 함
  portfolios: PortfolioListItem[];
}

export default function PortfolioSwiper({ portfolios }: Props) {
  if (!portfolios.length) return null;

  return (
    <>
      <SwiperSectionHeader
        title="포트폴리오"
        badgeLabel="Portfolio"
        subtitle="GOSPELFIX가 실제로 기획하고 만든 프로젝트를 소개합니다."
        paddingClassName="px-6 lg:px-[40px]"
      />

      <div className="flex flex-col divide-y divide-gf-border">
        {portfolios.map((item) => (
          <div key={item.id} className="flex flex-col gap-8 py-16 first:pt-0">
            {/* 프로젝트 헤더 */}
            <div className="px-6 lg:px-[40px] flex flex-col sm:flex-row sm:items-start gap-8">
              {/* 좌측: 제목 */}
              <div className="flex flex-col gap-1 shrink-0">
                <h3 className="text-gf-black text-xl font-black">{item.title}</h3>
                {item.site_url && (
                  <Link
                    href={item.site_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gf-black text-sm font-bold no-underline hover:text-gf-orange transition-colors mt-1"
                  >
                    사이트 보기 →
                  </Link>
                )}
              </div>

              {/* 우측: 설명 */}
              {item.description && (
                <div
                  className={cn("description text-gf-gray2 text-xs leading-relaxed max-w-sm")}
                  dangerouslySetInnerHTML={{
                    __html: item.description,
                  }}
                />
              )}
            </div>

            {/* 갤러리 이미지 Swiper */}
            {item.images && item.images.length > 0 ? (
              <div className="pl-6 lg:pl-[40px]">
                <AppSwiper
                  swiperClass={`portfolio-img-${item.id}`}
                  navigation={false}
                  slidesPerView="auto"
                  spaceBetween={12}
                  slidesPerGroup={1}
                >
                  {item.images.map((src, idx) => (
                    <SwiperSlide key={`${item.id}-${idx}`} className="!w-60 sm:!w-80 lg:!w-[420px]">
                      <div className="relative rounded-xl overflow-hidden bg-gf-gray3 border border-gf-border aspect-[4/5]">
                        <Image
                          src={src}
                          alt={`${item.title} — Image ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 420px"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </AppSwiper>
              </div>
            ) : item.thumbnail_url ? (
              <div className="px-6 lg:px-[40px]">
                <div className="relative w-full rounded-2xl overflow-hidden bg-gf-gray3 border border-gf-border aspect-[4/5]">
                  <Image src={item.thumbnail_url} alt={item.title} fill className="object-cover" />
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
