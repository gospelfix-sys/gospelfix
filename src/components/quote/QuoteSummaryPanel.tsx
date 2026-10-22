"use client";

import { useRecoilValue } from "recoil";
import { quoteWizardAtom } from "@/store/atoms/quoteAtom";
import { calculateQuote, formatKRW } from "@/lib/quote/calculator";

export function QuoteSummaryPanel() {
  const state = useRecoilValue(quoteWizardAtom);
  const breakdown = calculateQuote(state.selectedItems);

  if (state.selectedItems.length === 0) return null;

  return (
    <div className="rounded-2xl border border-[#ff5500]/20 bg-[#fff8f5] px-5 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#ff5500]">현재 예상 금액</p>
          <p className="mt-0.5 text-lg font-black text-gray-900">{formatKRW(breakdown.total)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{state.selectedItems.length}개 항목 선택</p>
          <p className="text-[10px] text-gray-300">VAT 별도</p>
        </div>
      </div>
    </div>
  );
}
