import { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Truck, Coffee, Stethoscope, GraduationCap, LifeBuoy } from "lucide-react";
import { StatsSection } from "@/components/main/StatsSection";
import { ReservationAiShowcase } from "@/components/main/reservation-showcase/ReservationAiShowcase";
import PortfolioSwiper from "@/components/portfolio/PortfolioSwiper";
import BlogSwiper from "@/components/news/BlogSwiper";
import { serverFetch } from "@/lib/serverFetch";
import { sanitizeContentHtml } from "@/lib/sanitizeHtml";
import { PortfolioListItem } from "@/types/portfolio.types";
import { NewsListItem } from "@/types/news.types";

export const metadata: Metadata = {
  title: "GOSPELFIX | 공식홈페이지",
  description: "GOSPELFIX 공식홈페이지입니다. 블로그와 교육 콘텐츠를 제공합니다.",
};

const AUDIENCE = [
  {
    icon: Sparkles,
    title: "뷰티·헬스·필라테스를 운영 중이라면",
    description:
      "밤 11시에 온 예약 문의도 AI 챗봇이 즉시 응대합니다. 잠든 사이 놓치는 예약이 없어집니다.",
  },
  {
    icon: Truck,
    title: "이사·청소 업체를 운영 중이라면",
    description:
      "평수·층수만 입력하면 AI가 바로 견적을 계산해 드립니다. 전화 문의를 기다릴 필요가 없습니다.",
  },
  {
    icon: Coffee,
    title: "카페·요식업을 운영 중이라면",
    description: "메뉴 소개부터 예약, 주문 안내까지 AI가 24시간 손님을 맞이합니다.",
  },
  {
    icon: Stethoscope,
    title: "병원·한의원·치과를 운영 중이라면",
    description:
      "신뢰감 있는 첫인상과 정확한 안내를 함께 설계합니다. 의료 광고 규정도 꼼꼼히 챙깁니다.",
  },
  {
    icon: GraduationCap,
    title: "학원·교육 기관을 운영 중이라면",
    description: "상담 문의와 수강 신청까지 AI가 안내합니다. 신뢰감을 주는 디자인으로 완성합니다.",
  },
  {
    icon: LifeBuoy,
    title: "아임웹·카페24 같은 플랫폼도 어렵게 느껴진다면",
    description: "코드 한 줄 몰라도 됩니다. 템플릿을 고르고 결제만 하시면 배포까지 저희가 끝냅니다.",
  },
];

export default async function OfficialHomePage() {
  const [rawPortfolios, news] = await Promise.all([
    serverFetch<PortfolioListItem[]>("/api/portfolios"),
    serverFetch<NewsListItem[]>("/api/news"),
  ]);
  const portfolios = rawPortfolios.map((item) => ({
    ...item,
    description: item.description ? sanitizeContentHtml(item.description) : item.description,
  }));

  return (
    <div className="flex flex-col">
      {/* 히어로 */}
      <section className="min-h-[100vh] flex flex-col items-center justify-center gap-8 px-6 pt-28 pb-12 text-center">
        {/* 배지 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gf-border text-gf-black text-sm font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-gf-orange shrink-0" />
          GOSPELFIX — 예약 문의를 놓치지 않는 AI 시스템
        </div>

        {/* 헤드라인 */}
        <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-gf-black leading-none uppercase">
          YOUR
          <br />
          DIGITAL
          <br />
          <span className="font-playfair text-gf-orange normal-case">presence</span>
          <br />
          FIXED.
        </h1>

        {/* 설명 */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-gf-black text-base font-bold">
            밤에 온 문의를, 아침까지 기다리게 하지 마세요.
          </p>
          <p className="text-gf-gray2 max-w-sm leading-relaxed text-center">
            업종에 맞는 AI 홈페이지, 오늘 구매하면{" "}
            <strong className="text-gf-black font-bold">내일 바로 오픈.</strong>
            <br />
            AI 챗봇이 24시간 예약과 문의에 응대하는 동안, 대표님은 사장님 일에만 집중하세요.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/about"
            className="px-7 py-3.5 rounded-full border border-gf-orange text-gf-orange text-sm font-bold no-underline flex items-center justify-center"
          >
            솔루션 보기
          </Link>
        </div>

        {/* 모다 크로스링크 */}
        <p className="text-gf-gray2 text-sm">
          이미 완성된 템플릿을 바로 구매하고 싶다면{" "}
          <Link href="/" className="text-gf-orange font-bold underline underline-offset-2">
            모다(MODA)
          </Link>
          에서 둘러보세요.
        </p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* 블로그 */}
      <section id="blog" className="bg-gf-bg py-14 overflow-hidden">
        <BlogSwiper news={news} />
      </section>

      <StatsSection />
    </div>
  );
}
