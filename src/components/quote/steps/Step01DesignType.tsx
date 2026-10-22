"use client";

import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { quoteWizardAtom } from "@/store/atoms/quoteAtom";
import { DESIGN_CATEGORIES } from "@/lib/quote/constants";
import type { DesignCategory } from "@/types/quote.types";
import { cn } from "@/lib/utils";

interface Step01DesignTypeProps {
  onNext: () => void;
}

export function Step01DesignType({ onNext }: Step01DesignTypeProps) {
  const router = useRouter();
  const [state, setState] = useRecoilState(quoteWizardAtom);

  function selectCategory(id: DesignCategory) {
    setState((prev) => ({ ...prev, selectedCategories: [id] }));
  }

  const canNext = state.selectedCategories.length === 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">
          STEP 01 / 05
        </p>
        <h2 className="text-2xl font-bold text-gray-900">어떤 서비스가 필요해요?</h2>
        <p className="mt-2 text-sm text-gray-500">한 가지를 선택해주세요.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {DESIGN_CATEGORIES.map((cat) => {
          const isSelected = state.selectedCategories.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-5 text-center transition-all",
                isSelected
                  ? "border-[#ff5500] bg-[#fff5f0]"
                  : "border-gray-200 bg-white hover:border-gray-300",
              )}
            >
              <CategoryIcon icon={cat.icon} isSelected={isSelected} />
              <span
                className={cn(
                  "text-sm font-semibold",
                  isSelected ? "text-[#ff5500]" : "text-gray-800",
                )}
              >
                {cat.label}
              </span>
              <span className="text-xs text-gray-400">{cat.description}</span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          홈
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

function CategoryIcon({ icon, isSelected }: { icon: string; isSelected: boolean }) {
  const color = isSelected ? "#ff5500" : "#9ca3af";

  const icons: Record<string, React.ReactNode> = {
    cart: (
      <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    globe: (
      <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    robot: (
      <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M12 11V5M9 5h6" />
        <circle cx="12" cy="4" r="1" />
        <path d="M8 15h.01M16 15h.01M8 19h8" />
      </svg>
    ),
    skin: (
      <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M2 8h20M8 3v18" />
      </svg>
    ),
    refresh: (
      <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
    barchart: (
      <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.5" viewBox="0 0 24 24">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
  };

  return <span className="h-6 w-6">{icons[icon]}</span>;
}
