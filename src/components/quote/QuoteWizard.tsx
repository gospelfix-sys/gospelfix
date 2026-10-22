"use client";

import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { quoteWizardAtom, QUOTE_INITIAL_STATE } from "@/store/atoms/quoteAtom";
import { calculateQuote } from "@/lib/quote/calculator";
import { LINE_ITEM_OPTIONS } from "@/lib/quote/constants";
import { QuoteProgressBar } from "./QuoteProgressBar";
import { Step01DesignType } from "./steps/Step01DesignType";
import { Step02ScopeDetail } from "./steps/Step02ScopeDetail";
import { Step03ScheduleStyle } from "./steps/Step03ScheduleStyle";
import { Step04ContactInfo } from "./steps/Step04ContactInfo";
import { Step05Result } from "./steps/Step05Result";

interface QuoteWizardProps {
  scrollToTop: () => void;
}

export function QuoteWizard({ scrollToTop }: QuoteWizardProps) {
  const [state, setState] = useRecoilState(quoteWizardAtom);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    ["source", "medium", "campaign", "term", "content"].forEach((key) => {
      const val = params.get(`utm_${key}`);
      if (val) utm[key] = val;
    });
    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem("utm_params", JSON.stringify(utm));
    }
  }, []);

  useEffect(() => {
    const { total } = calculateQuote(state);
    setState((prev) => {
      if (prev.estimatedTotal === total) return prev;
      return { ...prev, estimatedTotal: total };
    });
  }, [state, setState]);

  function goNext() {
    scrollToTop();
    setState((prev) => {
      const nextStep = Math.min(5, prev.currentStep + 1) as 1 | 2 | 3 | 4 | 5;
      // Step1→2 전환 시 카테고리가 실제로 변경된 경우에만 필드 초기화
      if (prev.currentStep === 1) {
        const cat = prev.selectedCategories[0];
        const prevCat =
          prev.selectedItems.length > 0
            ? (LINE_ITEM_OPTIONS[prev.selectedItems[0].id]?.category ?? null)
            : null;

        // 같은 카테고리 재선택 시 입력 내용 보존
        if (prevCat === cat) {
          return { ...prev, currentStep: nextStep };
        }

        // shopping_mall은 state 기반 동적 가격 계산 — base 항목만 세팅
        const autoItems =
          cat === "shopping_mall"
            ? [{ id: "shopping_cafe24" as const, quantity: 1, withCopywriting: false }]
            : [];
        return {
          ...prev,
          currentStep: nextStep,
          selectedItems: autoItems,
          shopIndustry: null,
          shopStatus: null,
          productionScope: null,
          needsSystemDev: false,
          requiredFeatures: [],
        };
      }
      return { ...prev, currentStep: nextStep };
    });
  }

  function goBack() {
    scrollToTop();
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1) as 1 | 2 | 3 | 4 | 5,
    }));
  }

  function restart() {
    setState(QUOTE_INITIAL_STATE);
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      {/* 진행 바 */}
      <div className="mb-8">
        <QuoteProgressBar currentStep={state.currentStep} />
      </div>

      {/* 스텝 컴포넌트 */}
      {state.currentStep === 1 && <Step01DesignType onNext={goNext} />}
      {state.currentStep === 2 && <Step02ScopeDetail onNext={goNext} onBack={goBack} />}
      {state.currentStep === 3 && <Step03ScheduleStyle onNext={goNext} onBack={goBack} />}
      {state.currentStep === 4 && <Step04ContactInfo onNext={goNext} onBack={goBack} />}
      {state.currentStep === 5 && <Step05Result onRestart={restart} />}
    </div>
  );
}
