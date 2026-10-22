"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { ScrollBadge } from "@/components/main/ScrollBadge";

const QuoteWizard = dynamic(
  () => import("@/components/quote/QuoteWizard").then((m) => m.QuoteWizard),
  { ssr: false },
);

export function QuoteMain() {
  const mainRef = useRef<HTMLElement>(null);

  function scrollToTop() {
    mainRef.current?.scrollIntoView({ behavior: "instant" });
  }

  return (
    <main ref={mainRef} className="min-h-screen">
      <div className="border-b border-gray-100 bg-white px-6 pt-24 pb-8 text-center">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.13em] text-gf-orange">
          AI Quote
        </p>
        <h1 className="text-2xl font-bold text-gray-900">AI로 견적 받기</h1>
        <p className="mt-2 text-sm text-gray-500">
          몇 가지 질문에 답하면 1분 안에 예상 견적을 확인할 수 있어요.
        </p>
      </div>
      <QuoteWizard scrollToTop={scrollToTop} />
      <ScrollBadge />
    </main>
  );
}
