"use client";

import { useState } from "react";
import { useRecoilValue } from "recoil";
import { quoteWizardAtom } from "@/store/atoms/quoteAtom";
import { calculateQuote, formatKRW } from "@/lib/quote/calculator";
import { Button } from "@/components/ui/button";
import { QuoteFaqSection } from "../ui/QuoteFaqSection";
import {
  DESIGN_CATEGORIES,
  LINE_ITEM_OPTIONS,
  SHOP_INDUSTRY_OPTIONS,
  SHOP_STATUS_OPTIONS,
  REQUIRED_FEATURE_OPTIONS,
} from "@/lib/quote/constants";

interface Step05ResultProps {
  onRestart: () => void;
}

export function Step05Result({ onRestart }: Step05ResultProps) {
  const state = useRecoilValue(quoteWizardAtom);
  const [isDownloading, setIsDownloading] = useState(false);

  const breakdown = calculateQuote(state);

  async function handleDownloadPdf() {
    setIsDownloading(true);
    try {
      const { downloadQuotePdf } = await import("@/lib/quote/pdfGenerator");
      await downloadQuotePdf(state, breakdown);
    } catch {
      // 다운로드 실패 시 조용히 처리 (사용자 UX 저해 방지)
    } finally {
      setIsDownloading(false);
    }
  }

  const selectedCategoryLabels = state.selectedCategories.map(
    (id) => DESIGN_CATEGORIES.find((c) => c.id === id)?.label ?? id,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">
          STEP 05 / 05
        </p>
        <h2 className="text-2xl font-bold text-gray-900">견적서가 완성됐어요! 🎉</h2>
        <p className="mt-2 text-sm text-gray-500">
          견적서를 다운받아 확인하시고, 궁금한 점은 카카오톡으로 상담하세요.
        </p>
      </div>

      {/* 예상 금액 카드 */}
      <div className="rounded-2xl bg-[#ff5500] px-6 py-7 text-white">
        <p className="mb-1 text-sm font-semibold opacity-80">예상 견적 합계</p>
        <p className="text-4xl font-black tracking-tight">{formatKRW(breakdown.total)}</p>
        <p className="mt-2 text-xs opacity-60">VAT 별도 · 실제 금액은 상담 후 확정됩니다</p>
      </div>

      {/* 포함 서비스 카드 */}
      <div className="space-y-4">
        {state.selectedCategories.map((catId) => {
          const cat = DESIGN_CATEGORIES.find((c) => c.id === catId);
          if (!cat) return null;
          const itemIds = breakdown.lines
            .map((l) => l.itemId)
            .filter((id) => LINE_ITEM_OPTIONS[id]?.category === catId);
          if (itemIds.length === 0) return null;
          return (
            <div key={catId} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm font-bold text-[#ff5500]">
                  <span>●</span> {cat.label}
                </p>
                {cat.priceFrom && (
                  <span className="text-xs text-gray-400">최소 {cat.priceFrom} · 부가세 별도</span>
                )}
              </div>
              <div className="space-y-2">
                {itemIds.map((itemId) => {
                  const option = LINE_ITEM_OPTIONS[itemId];
                  const line = breakdown.lines.find((l) => l.itemId === itemId);
                  if (!option || !line) return null;
                  return (
                    <div
                      key={itemId}
                      className="flex items-center justify-between rounded-xl border border-[#ff5500]/30 bg-white px-4 py-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded border-2 border-[#ff5500] bg-[#ff5500]">
                          <svg width="10" height="8" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 10 8">
                            <path d="M1 4l3 3 5-6" />
                          </svg>
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </div>
                      <span className="ml-3 shrink-0 text-sm font-bold text-gray-800">
                        {formatKRW(line.subtotal)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 견적 합계 */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">합계</span>
          <span className="text-base font-black text-[#ff5500]">{formatKRW(breakdown.total)}</span>
        </div>
      </div>

      {/* 선택 요약 */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 text-sm">
        <p className="mb-3 font-bold text-gray-700">선택 요약</p>
        <div className="space-y-2 text-gray-600">
          <div className="flex gap-2">
            <span className="w-24 shrink-0 text-gray-400">서비스</span>
            <span>{selectedCategoryLabels.join(", ")}</span>
          </div>
          {state.shopIndustry && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">업종</span>
              <span>{SHOP_INDUSTRY_OPTIONS.find((o) => o.id === state.shopIndustry)?.label}</span>
            </div>
          )}
          {state.shopStatus && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">현재 상황</span>
              <span>{SHOP_STATUS_OPTIONS.find((o) => o.id === state.shopStatus)?.label}</span>
            </div>
          )}
          {state.productionScope && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">제작 범위</span>
              <span>
                {
                  {
                    basic: "기본 제작 중심",
                    planning_copy: "기획·콘텐츠 포함",
                    premium: "프리미엄 풀패키지",
                  }[state.productionScope]
                }
              </span>
            </div>
          )}
          {state.requiredFeatures.length > 0 && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">필요 기능</span>
              <span>
                {state.requiredFeatures
                  .map((id) => REQUIRED_FEATURE_OPTIONS.find((o) => o.id === id)?.label)
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
          {state.needsSystemDev && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">추가 항목</span>
              <span>시스템 개발 (별도 문의)</span>
            </div>
          )}
          {state.schedule && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">오픈 일정</span>
              <span>
                {{ within_2weeks: "5주 내", within_1month: "2개월 내", flexible: "미정 / 여유 있음" }[
                  state.schedule
                ]}
              </span>
            </div>
          )}
          {state.targetAge && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">타겟 고객</span>
              <span>
                {{ "10s_20s": "10~20대", "30s_40s": "30~40대", "50s_plus": "50대+", all_ages: "전 연령" }[
                  state.targetAge
                ]}
              </span>
            </div>
          )}
          {state.contactInfo.name && (
            <div className="flex gap-2">
              <span className="w-24 shrink-0 text-gray-400">의뢰인</span>
              <span>{state.contactInfo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA 버튼 */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="h-auto w-full gap-2 rounded-xl border-2 border-[#ff5500] bg-transparent py-4 text-sm font-bold text-[#ff5500] hover:bg-[#fff5f0]"
        >
          {isDownloading ? (
            "생성 중..."
          ) : (
            <>
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              견적서 다운로드 받기
            </>
          )}
        </Button>

        <a
          href="https://pf.kakao.com/_CqKlX/chat"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fee500] py-4 text-sm font-bold text-[#3a1d1d] transition hover:brightness-95"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1C4.58 1 1 3.91 1 7.5c0 2.32 1.47 4.36 3.7 5.54L3.8 16.3a.3.3 0 0 0 .44.33l4.08-2.73c.22.02.45.03.68.03 4.42 0 8-2.91 8-6.5S13.42 1 9 1z"
              fill="#3a1d1d"
            />
          </svg>
          카카오톡으로 상담 시작하기
        </a>
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={onRestart}
        className="h-auto w-full p-0 text-center text-xs text-gray-400 underline underline-offset-2 hover:bg-transparent hover:text-gray-600"
      >
        처음부터 다시 입력하기
      </Button>

      <QuoteFaqSection />
    </div>
  );
}
