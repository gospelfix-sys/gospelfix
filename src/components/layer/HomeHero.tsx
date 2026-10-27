import { ArrowRight } from "lucide-react";
import { HeroCta, HeroReveal, HeroRevealItem } from "@/components/layer/HeroReveal";
import { HeroTypingTitle } from "@/components/layer/HeroTypingTitle";

// 판매 카테고리 순서와 맞춘다. 가장 긴 문구가 모바일 한 줄 폭의 기준이 된다.
const HERO_PHRASES = ["LOGOS.", "MOCKUPS.", "WEBSITES.", "AD CREATIVES."] as const;

// 홈 상단 정적 히어로. 갤러리(#gallery)로 앵커 이동하는 CTA를 둔다.
// 등장 stagger·CTA 피드백은 클라이언트 경계(HeroReveal)가 맡고, 이 파일은 서버 컴포넌트로 둔다.
export function HomeHero() {
  return (
    <HeroReveal className="flex flex-col items-center gap-6 px-6 pb-14 pt-16 text-center lg:pb-20 lg:pt-24">
      {/* 스크린리더·검색엔진에는 한국어 문장을, 화면에는 움직이는 영문 타이틀을 보여준다 */}
      <HeroRevealItem as="h1" className="w-full">
        <span className="sr-only">당신만의 브랜드를 구매하세요</span>
        <HeroTypingTitle label="GOSPELFIX" script="Buy your brand" phrases={HERO_PHRASES} />
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
