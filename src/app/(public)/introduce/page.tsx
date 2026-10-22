import { Metadata } from "next";
import Link from "next/link";
import { Hammer, Globe2, HandCoins } from "lucide-react";
import { LayerShell } from "@/components/layer/LayerShell";

export const metadata: Metadata = {
  title: "소개 | 모다(MODA)",
  description:
    "모다(MODA)는 만드는 사람과 그 결과물이 필요한 클라이언트가 만나는 크리에이터 마켓플레이스입니다.",
};

const VALUES = [
  {
    icon: Hammer,
    title: "하나의 작품에 담긴 시간",
    description:
      "완성된 템플릿 하나에도 수많은 고민과 손길이 들어갑니다. 모다는 그 과정 자체를 존중하는 곳에서 시작합니다.",
  },
  {
    icon: Globe2,
    title: "더 많은 사람에게 닿도록",
    description:
      "잘 만든 작품이 서랍 속에만 머물지 않도록, 그 결과물이 필요한 사람에게 곧바로 이어지는 자리를 만듭니다.",
  },
  {
    icon: HandCoins,
    title: "정당하게 거래되는 가치",
    description:
      "구매자는 검증된 완성형 템플릿을 즉시 오픈하고, 크리에이터는 만든 만큼 정당한 보상을 받습니다.",
  },
];

export default function IntroducePage() {
  return (
    <LayerShell>
      <section className="flex flex-col items-center gap-6 px-6 pt-20 pb-16 text-center">
        <span className="gf-section-label">About Moda</span>
        <h1 className="text-4xl leading-tight font-black tracking-[-0.03em] text-gf-black sm:text-5xl">
          만드는 사람이
          <br />
          <span className="text-gf-orange">주인공</span>이 되는 곳
        </h1>
        <p className="max-w-[560px] leading-relaxed text-gf-gray1">
          모다(MODA)는 다양한 포지션의 전문 크리에이터가 만든 작품과, 그 결과물이 필요한
          클라이언트가 만나는 마켓플레이스입니다. 업종별 AI 홈페이지부터 대시보드, 이커머스까지
          완성형 템플릿을 구매 즉시 오픈할 수 있습니다.
        </p>
      </section>

      <section className="border-t border-gf-border bg-white px-6 py-20">
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
        <h2 className="gf-section-title">지금 만든 작품, 모다에서 시작해보세요</h2>
        <p className="max-w-[480px] leading-relaxed text-gf-gray2">
          업로드한 템플릿은 검토 후 마켓플레이스에 노출되며, 판매될 때마다 정산됩니다.
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
