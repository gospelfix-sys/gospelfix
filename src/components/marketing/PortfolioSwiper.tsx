"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { toast } from "sonner";
import AppSwiper, { SwiperSlide } from "@/components/ui/AppSwiper";
import { Button } from "@/components/ui/button";
import { SwiperSectionHeader } from "@/components/ui/SwiperSectionHeader";
import type { PortfolioListItem } from "@/types/portfolio.types";
import { cn } from "@/lib/utils";

interface Props {
  // description은 반드시 호출부(Server Component)에서 sanitizeContentHtml()로 미리 살균된 값이어야 함
  portfolios: PortfolioListItem[];
}

// 계약 만료로 운영이 종료된 프로젝트 (title 기준, 대소문자 무시)
const CLOSED_SERVICE_TITLES = ["yezakeumak"];
const CLOSED_SERVICE_MESSAGE = "계약 만료로 인해 더 이상 운영하지 않는 서비스입니다.";

const SITE_LINK_CLASS =
  "text-gf-black text-sm font-bold no-underline hover:text-gf-orange hover:no-underline transition-colors mt-1";

const isClosedService = (title: string) =>
  CLOSED_SERVICE_TITLES.includes(title.trim().toLowerCase());

// description(CMS HTML) 안의 링크(SERVICE 등) 클릭을 가로채 운영 종료 안내를 띄운다
const handleClosedDescriptionClick = (e: MouseEvent<HTMLDivElement>) => {
  const anchor = (e.target as HTMLElement).closest("a");
  if (!anchor || !e.currentTarget.contains(anchor)) return;
  // auxclick은 우클릭에서도 발생하므로 가운데 클릭(button 1)만 처리
  if (e.type === "auxclick" && e.button !== 1) return;
  e.preventDefault();
  toast.info(CLOSED_SERVICE_MESSAGE);
};

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
        {portfolios.map((item) => {
          const isClosed = isClosedService(item.title);

          return (
            <div key={item.id} className="flex flex-col gap-8 py-16 first:pt-0">
              {/* 프로젝트 헤더 */}
              <div className="px-6 lg:px-[40px] flex flex-col sm:flex-row sm:items-start gap-8">
                {/* 좌측: 제목 */}
                <div className="flex flex-col gap-1 shrink-0">
                  <h3 className="text-gf-black text-xl font-black">{item.title}</h3>
                  {item.site_url &&
                    (isClosed ? (
                      <Button
                        type="button"
                        variant="link"
                        onClick={() => toast.info(CLOSED_SERVICE_MESSAGE)}
                        className={cn(SITE_LINK_CLASS, "h-auto justify-start p-0")}
                      >
                        사이트 보기 →
                      </Button>
                    ) : (
                      <Link
                        href={item.site_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={SITE_LINK_CLASS}
                      >
                        사이트 보기 →
                      </Link>
                    ))}
                </div>

                {/* 우측: 설명 */}
                {item.description && (
                  <div
                    className={cn("description text-gf-gray2 text-xs leading-relaxed max-w-sm")}
                    onClick={isClosed ? handleClosedDescriptionClick : undefined}
                    onAuxClick={isClosed ? handleClosedDescriptionClick : undefined}
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
                      <SwiperSlide
                        key={`${item.id}-${idx}`}
                        className="!w-60 sm:!w-80 lg:!w-[420px]"
                      >
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
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
