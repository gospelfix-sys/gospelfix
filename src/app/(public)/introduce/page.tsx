import { Metadata } from "next";
import Link from "next/link";
import { Hammer, Globe2, HandCoins } from "lucide-react";
import { LayerShell } from "@/components/layer/LayerShell";

export const metadata: Metadata = {
  title: "소개 | 가스펄픽스",
  description:
    "가스펄픽스는 CI 로고, 목업, 홈페이지, 대시보드, 이커머스 템플릿, 광고 소재까지 브랜딩에 필요한 디자인 소재를 크리에이터와 클라이언트가 거래하는 마켓입니다.",
};

const VALUES = [
  {
    icon: Hammer,
    title: "하나의 소재에 담긴 시간",
    description:
      "로고 하나, 목업 한 장에도 수많은 고민과 손길이 들어갑니다. 가스펄픽스는 그 과정 자체를 존중하는 곳에서 시작합니다.",
  },
  {
    icon: Globe2,
    title: "필요한 사람에게 바로 닿도록",
    description:
      "잘 만든 소재가 서랍 속에만 머물지 않도록, 브랜드가 필요한 사람에게 곧바로 이어지는 자리를 만듭니다.",
  },
  {
    icon: HandCoins,
    title: "정당하게 거래되는 가치",
    description:
      "구매자는 검증된 완성형 소재를 바로 열어 쓰고, 크리에이터는 만든 만큼 정당한 보상을 받습니다.",
  },
];

export default function IntroducePage() {
  return (
    <LayerShell>
      <section className="flex flex-col items-center gap-6 px-6 pt-20 pb-16 text-center">
        <span className="gf-section-label">About GOSPELFIX</span>
        <h1 className="text-4xl leading-tight font-black tracking-[-0.03em] text-gf-black sm:text-5xl">
          당신만의 브랜드를
          <br />
          <span className="text-gf-orange">바로 구매</span>하세요
        </h1>
        <p className="max-w-[560px] leading-relaxed text-gf-gray1">
          가스펄픽스는 다양한 포지션의 전문 크리에이터가 만든 디자인 소재와, 그 소재가 필요한
          클라이언트가 만나는 마켓입니다. CI 로고, 목업, 홈페이지, 대시보드, 이커머스 템플릿, 광고
          소재(PSD·AI)까지. 처음부터 만들 시간에 바로 쓰고 바로 런칭하세요.
        </p>
      </section>

      <section className="border-t border-gf-border bg-gf-white px-6 py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
          {VALUES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="gf-feature-card flex flex-col gap-4 rounded-2xl border p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gf-orange-bg">
                  <Icon className="h-5 w-5 text-gf-orange" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-base font-bold text-gf-black">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-gf-gray2">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col items-center gap-5 px-6 py-20 text-center">
        <h2 className="gf-section-title">지금 만든 작품, 가스펄픽스에서 시작해보세요</h2>
        <p className="max-w-[480px] leading-relaxed text-gf-gray2">
          업로드한 소재는 검토 후 마켓에 노출되며, 판매될 때마다 정산됩니다.
        </p>
        <Link
          href="/upload"
          className="flex items-center justify-center gap-2 rounded-full bg-gf-black px-7 py-3.5 text-sm font-bold text-gf-orange no-underline"
        >
          작품 업로드하기
        </Link>
      </section>
    </LayerShell>
  );
}
