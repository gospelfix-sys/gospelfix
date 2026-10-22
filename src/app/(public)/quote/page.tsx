import type { Metadata } from "next";
import { QuoteMain } from "@/components/quote/QuoteMain";

export const metadata: Metadata = {
  title: "가견적 신청 | GOSPELFIX",
  description:
    "홈페이지, 상세페이지, SNS 콘텐츠, 회사소개서 등 디자인 서비스 예상 견적을 5단계로 즉시 확인하세요.",
};

export default function QuotePage() {
  return <QuoteMain />;
}
