import { ArrowRight } from "lucide-react";
import { HeroCta, HeroReveal, HeroRevealItem } from "@/components/marketing/hero/HeroReveal";
import { HeroTypingTitle } from "@/components/marketing/hero/HeroTypingTitle";

// 판매 카테고리 순서와 맞춘다. 가장 긴 문구가 모바일 한 줄 폭의 기준이 된다.
const HERO_PHRASES = ["LOGOS.", "MOCKUPS.", "WEBSITES.", "AD CREATIVES."] as const;

// 홈 상단 정적 히어로. 갤러리(#gallery)로 앵커 이동하는 CTA를 둔다.
// 등장 stagger·CTA 피드백은 클라이언트 경계(HeroReveal)가 맡고, 이 파일은 서버 컴포넌트로 둔다.
interface HomeHeroProps {
  // loading.tsx 폴백용. 스트리밍 초기 HTML에는 폴백과 본문이 함께 실려 h1이 2개로 잡히므로
  // 폴백은 h1 대신 p로 렌더한다.
  isFallback?: boolean;
}

export function HomeHero({ isFallback = false }: HomeHeroProps) {
  return (
    <HeroReveal className="flex flex-col items-center gap-6 px-6 pb-14 pt-16 text-center lg:pb-20 lg:pt-24">
      {/* 스크린리더·검색엔진에는 한국어 문장을, 화면에는 움직이는 영문 타이틀을 보여준다 */}
      {/* h1은 globals.css 기본 규칙으로 letter-spacing -0.03em을 받는다. p 폴백도 같은 값을 명시해
          트래킹 클래스가 없는 "Buy your brand" 줄 폭이 폴백→본문 교체 때 달라지지 않게 한다 */}
      <HeroRevealItem as={isFallback ? "p" : "h1"} className="w-full tracking-[-0.03em]">
        <span className="sr-only">당신만의 브랜드를 구매하세요</span>
        <HeroTypingTitle label="GOSPELFIX" script="Buy your brand" phrases={HERO_PHRASES} />
      </HeroRevealItem>

      <HeroCta
        href="#gallery"
        icon={<ArrowRight className="h-4 w-4" />}
        className="inline-flex items-center gap-2 rounded-full bg-gf-black px-6 py-3 text-sm font-bold text-gf-white no-underline transition-opacity hover:opacity-90"
      >
        디자인 소재 둘러보기
      </HeroCta>
    </HeroReveal>
  );
}
