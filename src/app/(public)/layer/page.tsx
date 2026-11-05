import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Coffee, Stethoscope, GraduationCap } from "lucide-react";
import { HeroRollingWord } from "@/components/layer/HeroRollingWord";
import { QuoteFloatingButton } from "@/components/main/QuoteFloatingButton";
import { ReservationAiShowcase } from "@/components/main/reservation-showcase/ReservationAiShowcase";
import { PricingSection } from "@/components/main/PricingSection";
import PortfolioSwiper from "@/components/portfolio/PortfolioSwiper";
import { serverFetch } from "@/lib/serverFetch";
import { sanitizeContentHtml } from "@/lib/sanitizeHtml";
import { SITE_DESCRIPTION } from "@/lib/siteMetadata";
import type { PortfolioListItem } from "@/types/portfolio.types";

export const metadata: Metadata = {
  title: "GOSPELFIX | 공식홈페이지",
  description: SITE_DESCRIPTION,
};

// 히어로 알약 안에서 순서대로 롤링되는 단어. 가장 긴 단어 기준으로 알약 너비가 정해진다
const HERO_ROLLING_WORDS = [
  "CI 로고",
  "MOCKUP",
  "배너",
  "광고소재",
  "챗봇",
  "홈페이지",
  "쇼핑몰",
] as const;

const AUDIENCE = [
  {
    icon: Sparkles,
    title: "뷰티·헬스·필라테스를 운영 중이라면",
    description:
      "밤 11시에 온 예약 문의도 AI 챗봇이 즉시 응대합니다. 잠든 사이 놓치는 예약이 없어집니다.",
  },
  {
    icon: Coffee,
    title: "카페·요식업을 운영 중이라면",
    description: "메뉴 소개부터 예약, 주문 안내까지 AI가 24시간 손님을 맞이합니다.",
  },
  {
    icon: Stethoscope,
    title: "병원·한의원·치과를 운영 중이라면",
    description: "신뢰감 있는 첫인상과 정확한 안내를 함께 설계합니다.",
  },
  {
    icon: GraduationCap,
    title: "학원·교육 기관을 운영 중이라면",
    description: "상담 문의와 수강 신청까지 AI가 안내합니다. 신뢰감을 주는 디자인으로 완성합니다.",
  },
];

export default async function OfficialHomePage() {
  const rawPortfolios = await serverFetch<PortfolioListItem[]>("/api/portfolios");
  const portfolios = rawPortfolios.map((item) => ({
    ...item,
    description: item.description ? sanitizeContentHtml(item.description) : item.description,
  }));

  return (
    <div className="flex flex-col">
      {/* 히어로 */}
      <section className="min-h-[100vh] flex flex-col items-center justify-center gap-8 px-6 pt-16 pb-12 text-center">
        {/* 배지 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gf-border text-gf-black text-sm font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-gf-orange shrink-0" />
          GOSPELFIX 브랜딩부터 챗봇 홈페이지까지
        </div>

        {/* 헤드라인 */}
        <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-gf-black leading-none uppercase">
          브랜딩부터
          <br />
          온라인까지
          <br />
          <HeroRollingWord words={HERO_ROLLING_WORDS} />
          <br />한 번에.
        </h1>

        {/* 설명 */}
        <div className="flex flex-col items-center">
          <p className="text-gf-black text-base font-bold">
            로고·목업·배너·광고소재부터 예약 챗봇이 달린 홈페이지·쇼핑몰까지
          </p>
          <p className="text-gf-gray2 leading-relaxed text-center sm:whitespace-nowrap">
            사업에서 필요한 요소들 GOSPELFIX 함께 만들어 드립니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="#pricing"
            className="px-7 py-3.5 rounded-full border border-gf-orange text-gf-orange text-sm font-bold no-underline flex items-center justify-center"
          >
            솔루션 보기
          </Link>
        </div>
      </section>

      {/* 추천 대상 */}
      <section className="px-6 pt-20 pb-24 bg-white border-b border-gf-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="gf-section-label">For You</span>
            <h2 className="gf-section-title">이런 업종의 사장님께 추천드립니다</h2>
            <p className="text-gf-gray2 text-sm mt-2">
              SNS는 하고 있지만 홈페이지가 없거나 허름한 상태라면, 지금이 시작할 때입니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AUDIENCE.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="gf-feature-card rounded-2xl p-6 flex flex-col gap-4 border">
                  <div className="w-10 h-10 rounded-xl bg-gf-orange-bg flex items-center justify-center shrink-0">
                    <Icon className="text-gf-orange w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-gf-black font-bold text-base">{item.title}</h3>
                    <p className="text-gf-gray2 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 예약 통합 AI 쇼케이스 — 가스펄픽스 단독 기능 */}
      <ReservationAiShowcase />

      {/* 포트폴리오 */}
      <section className="pt-20 pb-24 bg-white overflow-hidden">
        {portfolios.length > 0 ? (
          <PortfolioSwiper portfolios={portfolios} />
        ) : (
          <p className="px-6 text-gf-gray2 text-sm">준비 중입니다.</p>
        )}
      </section>

      {/* 가격 — 구축/유지보수 탭 */}
      <PricingSection />
      <QuoteFloatingButton />
    </div>
  );
}
