import { ArrowRight } from "lucide-react";
import { HeroCta, HeroReveal, HeroRevealItem } from "@/components/layer/HeroReveal";

// 홈 상단 정적 히어로. 갤러리(#gallery)로 앵커 이동하는 CTA를 둔다.
// 등장 stagger·CTA 피드백은 클라이언트 경계(HeroReveal)가 맡고, 이 파일은 서버 컴포넌트로 둔다.
export function HomeHero() {
  return (
    <HeroReveal className="flex flex-col items-center gap-6 px-6 pb-14 pt-16 text-center lg:pb-20 lg:pt-24">
      {/* 그라디언트 테두리 pill 배지: 바깥 래퍼의 1px 패딩이 테두리 역할 */}
      <HeroRevealItem
        as="span"
        className="rounded-full bg-gradient-to-r from-gf-orange to-purple-500 p-px"
      >
        <span className="block rounded-full bg-gf-bg px-4 py-1.5 text-xs font-semibold text-gf-gray1">
          브랜딩 디자인 소재 마켓
        </span>
      </HeroRevealItem>

      <HeroRevealItem
        as="h1"
        className="text-4xl font-black leading-[1.1] tracking-[-0.04em] text-gf-black sm:text-5xl lg:text-7xl"
      >
        브랜드를 완성하는
        <br />
        <span className="bg-gradient-to-r from-gf-orange to-purple-500 bg-clip-text text-transparent">
          모든 디자인 소재
        </span>
      </HeroRevealItem>

      <HeroRevealItem
        as="p"
        className="max-w-[560px] text-base leading-relaxed text-gf-gray1 sm:text-lg"
      >
        로고부터 목업, 웹사이트, 광고 소재까지. 처음부터 만들 시간에 바로 쓰고 바로 런칭하세요.
        파일을 여는 순간, 브랜드가 완성됩니다.
      </HeroRevealItem>

      <HeroCta
        href="#gallery"
        icon={<ArrowRight className="h-4 w-4" />}
        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black no-underline transition-colors hover:bg-white/90"
      >
        디자인 소재 둘러보기
      </HeroCta>
    </HeroReveal>
  );
}
