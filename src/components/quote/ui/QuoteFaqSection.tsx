"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "가견적과 실제 견적은 다른가요?",
    a: "가견적은 단가표 기반 자동 산출 결과입니다. 실제 프로젝트 규모·난이도에 따라 최종 견적은 상담 후 확정됩니다.",
  },
  {
    q: "견적 상담은 어떻게 진행되나요?",
    a: "카카오톡 채널로 문의 주시면 24시간 내 답변드립니다. 프로젝트 방향 확인 후 맞춤 제안서를 전달해드립니다.",
  },
  {
    q: "작업 기간은 얼마나 걸리나요?",
    a: "홈페이지는 평균 2~4주, 상세페이지는 5~10일 내외입니다. 희망 일정을 알려주시면 최대한 맞춰드립니다.",
  },
  {
    q: "수정은 몇 번까지 가능한가요?",
    a: "기본 2회 수정이 포함됩니다. 추가 수정은 별도 협의하며 카피라이팅 패키지 포함 시 전략 조율도 함께 진행합니다.",
  },
];

export function QuoteFaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="rounded-2xl bg-[#1a1007] p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#ff5500]">
        Still have questions?
      </p>
      <h3 className="mb-1 text-lg font-bold text-white">더 궁금한 게 있으신가요?</h3>
      <p className="mb-5 text-sm text-gray-400">자주 묻는 질문에서 확인해 보세요.</p>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="rounded-xl bg-white/5 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span className="text-sm font-medium text-white">{item.q}</span>
              <span
                className={cn(
                  "ml-2 shrink-0 text-gray-400 transition-transform",
                  openIndex === i && "rotate-180",
                )}
              >
                ▾
              </span>
            </button>
            {openIndex === i && (
              <p className="px-4 pb-3 text-sm text-gray-400 leading-relaxed">{item.a}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
