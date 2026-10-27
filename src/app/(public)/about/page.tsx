import { Metadata } from "next";
import Link from "next/link";
import { Bot, Globe, Calculator, HelpCircle, Rocket, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "소개 | GOSPELFIX",
  description: "업종에 맞는 AI 홈페이지와 24시간 자동응대 챗봇, 오늘 구매하면 내일 오픈합니다.",
};

const SERVICES = [
  {
    icon: Bot,
    title: "AI 챗봇 자동응대",
    description:
      "밤 11시에 온 예약·문의도 AI가 즉시 응대합니다. 대표님이 잠든 사이에도 매장은 계속 열려 있습니다.",
  },
  {
    icon: Globe,
    title: "업종별 AI 홈페이지",
    description:
      "뷰티·이사·카페·병원·학원 등 업종 특성에 맞춘 홈페이지를 구매 즉시 받아보실 수 있습니다.",
  },
  {
    icon: Calculator,
    title: "AI 견적 자동화",
    description:
      "평수·옵션만 입력하면 견적이 바로 나옵니다. 이사·청소처럼 견적이 중요한 업종에 특화된 기능입니다.",
  },
  {
    icon: HelpCircle,
    title: "업종별 FAQ 자동 답변",
    description: "자주 묻는 질문에 AI가 먼저 답합니다. 반복되는 문의로 뺏기는 시간을 줄여드립니다.",
  },
  {
    icon: Rocket,
    title: "배포까지 한 번에",
    description: "코드 몰라도 됩니다. 구매부터 실제 서비스 오픈까지, 고객이 따로 할 일은 없습니다.",
  },
  {
    icon: RefreshCw,
    title: "유지보수 구독",
    description:
      "월정액으로 AI 기능과 홈페이지 운영을 계속 이어갑니다. 한 번 팔고 끝나는 서비스가 아닙니다.",
  },
];

const PROCESS = [
  {
    step: "01",
    timing: "DAY 1",
    title: "무료 상담",
    description: "현재 상황과 방향을 같이 정리합니다. 30분이면 충분합니다.",
  },
  {
    step: "02",
    timing: "3일 이내",
    title: "범위 확정 + 견적",
    description:
      "작업 범위·납기·금액을 문서로 드립니다. 숨겨진 비용 없습니다. (범위가 넓어지면 납품 기간도 함께 늘어날 수 있습니다.)",
  },
  {
    step: "03",
    timing: "주간 업데이트",
    title: "개발 + 공유",
    description: "매주 진행 상황을 공유합니다. 범위 외 변경은 협의 후 반영합니다.",
  },
  {
    step: "04",
    timing: "완성",
    title: "납품 + 인수인계",
    description: "소스코드·서버·사용법, 전부 대표님 손에 드립니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* 히어로 */}
      <section className="px-6 pt-28 pb-20 text-center">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-4">
          <span className="gf-section-label">About</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gf-black leading-tight">
            예약 문의를 놓치지 않는
            <br />
            AI 시스템을 팝니다.
          </h1>
          <p className="text-gf-gray2 leading-relaxed mt-2">
            밤 11시에 온 문의도 놓치지 않도록, 아임웹·카페24 같은 플랫폼도 어려운 사장님을 위해
            뷰티·이사·카페·병원·학원,{" "}
            <strong className="text-gf-black font-bold">업종에 맞는 홈페이지</strong>와
            <br className="sm:hidden" />{" "}
            <strong className="text-gf-black font-bold">24시간 자동응대 AI 챗봇</strong>까지
            가스펄픽스가 처음부터 끝까지 만들어 드립니다.
          </p>
        </div>
      </section>

      {/* 두 가지 방식 (B2B / B2C) */}
      <section className="px-6 pt-20 pb-24 bg-gf-bg">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="gf-section-label">Two Ways</span>
            <h2 className="gf-section-title">가스펄픽스와 모다, 두 가지 방식</h2>
            <p className="text-gf-gray2 text-sm mt-2">
              <strong className="text-gf-black font-bold">모다(MODA)</strong>는 가스펄픽스가 만든
              크리에이터 마켓플레이스입니다. 상단 내비게이션의{" "}
              <strong className="text-gf-black font-bold">가스펄픽스</strong>와{" "}
              <strong className="text-gf-black font-bold">모다</strong> 탭을 눌러 원하는 방식으로
              전환할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* B2B */}
            <div className="gf-feature-card rounded-2xl p-8 flex flex-col gap-4 border">
              <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-bold bg-gf-orange text-white">
                가스펄픽스 · B2B
              </span>
              <h3 className="text-2xl font-black text-gf-black leading-snug">
                우리 업종에 꼭 맞게,
                <br />
                처음부터 설계합니다.
              </h3>
              <p className="text-gf-gray2 text-sm leading-relaxed">
                업종에 특화된 홈페이지를 상담을 통해 우리 매장에 맞게 커스터마이징하고, AI 챗봇
                응대까지 세팅해 드립니다. 대표님과 한 팀처럼 움직이는 파트너십입니다.
              </p>
              <ul className="text-gf-gray2 text-sm leading-relaxed list-disc pl-4 flex flex-col gap-1">
                <li>무료 상담 → 견적 → 제작 → 납품, 투명한 4단계 프로세스</li>
                <li>업종별 홈페이지에 AI 챗봇 맞춤 커스터마이징을 추가합니다.</li>
                <li>완성 후에도 이어지는 운영·유지보수</li>
              </ul>
            </div>

            {/* B2C */}
            <div className="gf-feature-card rounded-2xl p-8 flex flex-col gap-4 border">
              <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full text-xs font-bold bg-gf-black text-white">
                모다(MODA) · B2C
              </span>
              <h3 className="text-2xl font-black text-gf-black leading-snug">
                이미 만들어진 업종별 템플릿을,
                <br />
                바로 구매합니다.
              </h3>
              <p className="text-gf-gray2 text-sm leading-relaxed">
                만드는 사람들이 모이는 곳, 모다는 AI·영상·그래픽·브랜딩·UI/UX·일러스트레이션 등
                다양한 포지션의 전문 크리에이터가 자신의 작품(포트폴리오)을 전시하고, 그 결과물이
                필요한 클라이언트가 함께 만나는 곳입니다.
              </p>
              <ul className="text-gf-gray2 text-sm leading-relaxed list-disc pl-4 flex flex-col gap-1">
                <li>AI·영상·그래픽·브랜딩·UI/UX·일러스트 등 다양한 포지션의 크리에이터 포트폴리오</li>
                <li>컨설팅·뷰티·이사·카페·병원·학원·꽃집·필라테스 등 업종별 AI 홈페이지 템플릿</li>
                <li>구매 즉시 사용 가능, AI 챗봇으로 24시간 문의·예약 자동 응대</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 서비스 */}
      <section className="px-6 pt-20 pb-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="gf-section-label">Services</span>
            <h2 className="gf-section-title">가스펄픽스가 하는 일</h2>
            <p className="text-gf-gray2 text-sm mt-2">
              AI로 속도를 높이고 사람이 디테일을 책임집니다 — 업종에 맞는 AI 홈페이지부터
              24시간 자동응대, 유지보수까지 하나의 흐름으로 이어집니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <div
                  key={i}
                  className="gf-feature-card rounded-2xl p-6 flex flex-col gap-4 border"
                >
                  <div className="w-10 h-10 rounded-xl bg-gf-orange-bg flex items-center justify-center shrink-0">
                    <Icon className="text-gf-orange w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-gf-black font-bold text-base">{service.title}</h3>
                    <p className="text-gf-gray2 text-sm leading-relaxed">{service.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 프로세스 */}
      <section className="px-6 pt-20 pb-24 bg-gf-bg">
        <div className="max-w-5xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-16">
            <span className="gf-section-label">진행 방식</span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] sm:leading-[1.1]">
              <span className="text-gf-black">상담부터 납품까지</span>
              <br />
              <span className="text-gf-orange">불확실한 구간은 없습니다.</span>
            </h2>
            <p className="text-gf-gray2 text-sm mt-4">모든 단계가 투명하게 공유됩니다.</p>
          </div>

          {/* 스텝 */}
          <div className="relative flex flex-col sm:flex-row gap-10 sm:gap-0">
            {/* 연결선 (데스크톱) */}
            <div className="hidden sm:block absolute top-[28px] left-[calc(12.5%)] right-[calc(12.5%)] h-px bg-gf-gray3 z-0" />
            {/* 이동하는 주황색 점 (데스크톱) */}
            <div className="process-line-dot hidden sm:block" />

            {PROCESS.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center text-center gap-4 relative z-10">
                {/* 원형 번호 */}
                <div className="w-14 h-14 rounded-full border-2 border-gf-orange bg-white flex items-center justify-center shrink-0 z-10">
                  <span className="text-gf-orange font-black text-lg leading-none">{item.step}</span>
                </div>

                {/* 내용 */}
                <div className="flex flex-col gap-1">
                  <p className="text-gf-orange text-xs font-bold">{item.timing}</p>
                  <h3 className="text-gf-black font-black text-base">{item.title}</h3>
                  <p className="text-gf-gray2 text-sm leading-relaxed max-w-[160px] mx-auto">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* AI 개발 방식 */}
      <section className="px-6 pt-20 pb-24 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="gf-section-label">How We Build</span>
            <h2 className="gf-section-title">우리는 AI와 함께, 이렇게 만듭니다</h2>
            <p className="text-gf-gray2 text-sm mt-2 max-w-xl mx-auto leading-relaxed">
              가스펄픽스는 Claude Code와 구조화된 워크플로우로 개발합니다. 역할별 전담
              에이전트, 자동으로 적용되는 코딩 규칙, 반복되는 실수를 막는 검증 단계까지 AI가
              속도를 내는 동안 품질은 그대로 지킵니다.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="gf-feature-card rounded-2xl p-6 flex flex-col gap-2 border">
              <h3 className="text-gf-black font-bold text-base">전담 에이전트</h3>
              <p className="text-gf-gray2 text-sm leading-relaxed">
                코드 리뷰, 컴포넌트 작성, 커밋까지 역할별로 나뉜 AI 에이전트가 각자의 전문
                영역을 책임집니다.
              </p>
            </div>
            <div className="gf-feature-card rounded-2xl p-6 flex flex-col gap-2 border">
              <h3 className="text-gf-black font-bold text-base">자동 적용 규칙</h3>
              <p className="text-gf-gray2 text-sm leading-relaxed">
                공용 컴포넌트·스타일 규칙을 문서화해, 같은 실수가 반복되지 않도록 매번 자동으로
                참고합니다.
              </p>
            </div>
            <div className="gf-feature-card rounded-2xl p-6 flex flex-col gap-2 border">
              <h3 className="text-gf-black font-bold text-base">일관된 품질</h3>
              <p className="text-gf-gray2 text-sm leading-relaxed">
                세션이 바뀌어도 프로젝트 맥락과 컨벤션을 그대로 기억해, 사람이 검수하는
                디테일만 남깁니다.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/blog/claude-code-project-setup"
              className="inline-flex items-center gap-1.5 text-gf-orange font-bold text-sm hover:underline"
            >
              이 워크플로우 자세히 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 bg-gf-black">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">
          <h2 className="text-white text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            당신이 잠든 사이에도,
            <br />
            <span className="text-gf-orange">가게는 계속 열려 있어야 합니다.</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-xl">
            AI 챗봇이 24시간 예약과 문의에 응대하는 동안, 대표님은 사장님 일에만 집중하세요.
            <br className="hidden sm:block" />
            가스펄픽스가 업종에 맞는 AI 홈페이지를 오늘 구매하면 내일 오픈까지 책임집니다.
          </p>
        </div>
      </section>
    </div>
  );
}
