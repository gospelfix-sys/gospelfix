"use client";

import { useRecoilState } from "recoil";
import { quoteWizardAtom } from "@/store/atoms/quoteAtom";
import {
  SCHEDULE_OPTIONS,
  STYLE_OPTIONS,
  TARGET_AGE_OPTIONS,
  REQUIRED_FEATURE_OPTIONS,
} from "@/lib/quote/constants";
import type { Schedule, StylePreference, TargetAge, RequiredFeature } from "@/types/quote.types";
import { cn } from "@/lib/utils";

interface Step03ScheduleStyleProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step03ScheduleStyle({ onNext, onBack }: Step03ScheduleStyleProps) {
  const [state, setState] = useRecoilState(quoteWizardAtom);
  const category = state.selectedCategories[0];

  // 쇼핑몰·홈페이지는 타겟 고객 필수, AI/유지보수는 일정만 필수
  const needsTargetAge = category === "shopping_mall" || category === "homepage";
  // 필요 기능 섹션은 쇼핑몰 전용
  const showFeatures = category === "shopping_mall";
  // 디자인 방향은 디자인 작업이 있는 카테고리
  const showStyle = category === "shopping_mall" || category === "homepage";
  // 타겟 고객 섹션 표시 여부
  const showTargetAge = category === "shopping_mall" || category === "homepage";

  function setSchedule(id: Schedule) {
    setState((prev) => ({ ...prev, schedule: id }));
  }

  function toggleFeature(id: RequiredFeature) {
    setState((prev) => {
      const exists = prev.requiredFeatures.includes(id);
      return {
        ...prev,
        requiredFeatures: exists
          ? prev.requiredFeatures.filter((f) => f !== id)
          : [...prev.requiredFeatures, id],
      };
    });
  }

  function toggleStyle(id: StylePreference) {
    setState((prev) => {
      const exists = prev.stylePreferences.includes(id);
      return {
        ...prev,
        stylePreferences: exists
          ? prev.stylePreferences.filter((s) => s !== id)
          : [...prev.stylePreferences, id],
      };
    });
  }

  function setTargetAge(id: TargetAge) {
    setState((prev) => ({ ...prev, targetAge: id }));
  }

  const canNext =
    state.schedule !== null && (!needsTargetAge || state.targetAge !== null);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">
          STEP 03 / 05
        </p>
        <h2 className="text-2xl font-bold text-gray-900">기능과 스타일을 알려주세요</h2>
        <p className="mt-2 text-sm text-gray-500">더 정확한 제안을 위해 조금만 더 알려주세요.</p>
      </div>

      {/* 필요한 기능 — 쇼핑몰 전용 */}
      {showFeatures && (
        <section>
          <p className="mb-1 text-sm font-semibold text-gray-700">
            필요한 기능{" "}
            <span className="font-normal text-gray-400">(중복 선택 가능 · 선택 안 해도 됩니다)</span>
          </p>
          <p className="mb-3 text-xs text-gray-400">
            선택하신 기능은 상담 시 우선적으로 안내드립니다.
          </p>
          <div className="flex flex-col gap-2">
            {REQUIRED_FEATURE_OPTIONS.map((opt) => {
              const selected = state.requiredFeatures.includes(opt.id as RequiredFeature);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleFeature(opt.id as RequiredFeature)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                    selected
                      ? "border-[#ff5500] bg-[#fff5f0]"
                      : "border-gray-200 bg-white hover:border-gray-300",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                      selected ? "border-[#ff5500] bg-[#ff5500]" : "border-gray-300 bg-white",
                    )}
                  >
                    {selected && (
                      <svg width="10" height="8" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 10 8">
                        <path d="M1 4l3 3 5-6" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className={cn("text-sm font-semibold", selected ? "text-[#ff5500]" : "text-gray-800")}>
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-400">{opt.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 희망 일정 */}
      <section>
        <p className="mb-3 text-sm font-semibold text-gray-700">
          희망 오픈 일정 <span className="text-[#ff5500]">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {SCHEDULE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSchedule(opt.id as Schedule)}
              className={cn(
                "rounded-full border-2 px-5 py-2.5 text-sm font-medium transition-all",
                state.schedule === opt.id
                  ? "border-[#ff5500] bg-[#ff5500] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* 선호 디자인 방향 — 디자인 작업이 있는 카테고리만 */}
      {showStyle && (
        <section>
          <p className="mb-3 text-sm font-semibold text-gray-700">
            선호 디자인 방향{" "}
            <span className="font-normal text-gray-400">(중복 선택 가능)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleStyle(opt.id as StylePreference)}
                className={cn(
                  "rounded-full border-2 px-5 py-2.5 text-sm font-medium transition-all",
                  state.stylePreferences.includes(opt.id as StylePreference)
                    ? "border-[#ff5500] bg-[#ff5500] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 타겟 고객 — 쇼핑몰·홈페이지만 */}
      {showTargetAge && (
        <section>
          <p className="mb-3 text-sm font-semibold text-gray-700">
            주요 타겟 고객 <span className="text-[#ff5500]">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {TARGET_AGE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTargetAge(opt.id as TargetAge)}
                className={cn(
                  "rounded-full border-2 px-5 py-2.5 text-sm font-medium transition-all",
                  state.targetAge === opt.id
                    ? "border-[#ff5500] bg-[#ff5500] text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="flex-1 rounded-xl bg-[#ff5500] py-4 text-sm font-bold text-white transition hover:bg-[#e04d00] disabled:opacity-40"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
