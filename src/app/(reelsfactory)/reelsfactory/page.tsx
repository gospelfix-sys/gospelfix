import type { Metadata } from "next";
import ReelsfactoryPage from "@/components/reelsfactory/ReelsfactoryPage";
import { getPortfolios } from "@/lib/api/portfolios";
import { mergeWorks } from "@/lib/reelsfactory/mergeWorks";

// serverFetch가 headers()를 쓰므로 동적 렌더링이 필요하다
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "소윤호 | 웹디자이너 포트폴리오",
  description:
    "기획부터 UI 디자인, 퍼블리싱, 배포까지 직접 맡은 웹디자이너 소윤호의 포트폴리오입니다.",
  // 연락처(전화번호)를 싣고 있어 검색 노출은 막고 링크 공유용으로만 쓴다
  robots: { index: false, follow: false },
};

export default async function ReelsfactoryRoute() {
  const portfolios = await getPortfolios();
  const works = mergeWorks(portfolios);

  return <ReelsfactoryPage works={works} />;
}
