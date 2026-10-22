"use client";

import { cn } from "@/lib/utils";

interface QuoteProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
}

const STEPS = [
  { num: 1, label: "디자인 유형" },
  { num: 2, label: "세부 범위" },
  { num: 3, label: "일정·스타일" },
  { num: 4, label: "연락처" },
  { num: 5, label: "견적서" },
] as const;

export function QuoteProgressBar({ currentStep }: QuoteProgressBarProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isDone = step.num < currentStep;
        const isActive = step.num === currentStep;

        return (
          <div key={step.num} className="flex flex-1 flex-col items-center">
            <div className="relative flex w-full items-center">
              {/* 왼쪽 연결선 — 첫 번째 스텝은 invisible로 공간 유지 */}
              <div
                className={cn(
                  "h-0.5 flex-1 transition-colors",
                  i === 0 ? "invisible" : isDone || isActive ? "bg-[#ff5500]" : "bg-gray-200",
                )}
              />

              {/* 스텝 원 */}
              <div
                className={cn(
                  "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                  isDone
                    ? "border-[#ff5500] bg-[#ff5500] text-white"
                    : isActive
                      ? "border-[#ff5500] bg-white text-[#ff5500]"
                      : "border-gray-200 bg-white text-gray-400",
                )}
              >
                {isDone ? (
                  <svg width="12" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 12 10">
                    <path d="M1 5l3.5 3.5L11 1" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>

              {/* 오른쪽 연결선 — 마지막 스텝은 invisible로 공간 유지 */}
              <div
                className={cn(
                  "h-0.5 flex-1 transition-colors",
                  i === STEPS.length - 1 ? "invisible" : isDone ? "bg-[#ff5500]" : "bg-gray-200",
                )}
              />
            </div>

            {/* 레이블 */}
            <p
              className={cn(
                "mt-1.5 hidden text-center text-[10px] font-medium sm:block",
                isActive ? "text-[#ff5500]" : isDone ? "text-gray-500" : "text-gray-300",
              )}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
