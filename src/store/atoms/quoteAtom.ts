import { atom, AtomEffect } from "recoil";
import type { QuoteWizardState } from "@/types/quote.types";
import { DESIGN_CATEGORIES, CATEGORY_LINE_ITEMS } from "@/lib/quote/constants";

const QUOTE_INITIAL_STATE: QuoteWizardState = {
  currentStep: 1,
  selectedCategories: [],
  selectedItems: [],
  shopIndustry: null,
  shopStatus: null,
  productionScope: null,
  needsSystemDev: false,
  requiredFeatures: [],
  schedule: null,
  stylePreferences: [],
  targetAge: null,
  contactInfo: {
    name: "",
    contact: "",
    email: "",
    businessNumber: "",
    projectSummary: "",
    referenceUrls: ["", "", ""],
  },
  estimatedTotal: 0,
  submissionId: null,
};

const sessionStorageEffect: AtomEffect<QuoteWizardState> = ({ setSelf, onSet }) => {
  if (typeof window === "undefined") return;

  const saved = sessionStorage.getItem("quoteWizard");
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as QuoteWizardState;
      const validCategoryIds = new Set(DESIGN_CATEGORIES.map((c) => c.id));
      const validCategories = parsed.selectedCategories.filter((id) => validCategoryIds.has(id));
      const validItemIds = new Set(validCategories.flatMap((id) => CATEGORY_LINE_ITEMS[id] ?? []));
      setSelf({
        ...QUOTE_INITIAL_STATE,
        ...parsed,
        selectedCategories: validCategories,
        selectedItems: parsed.selectedItems.filter((item) => validItemIds.has(item.id)),
      });
    } catch {
      sessionStorage.removeItem("quoteWizard");
    }
  }

  onSet((newValue, _, isReset) => {
    if (isReset) {
      sessionStorage.removeItem("quoteWizard");
    } else {
      sessionStorage.setItem("quoteWizard", JSON.stringify(newValue));
    }
  });
};

export const quoteWizardAtom = atom<QuoteWizardState>({
  key: "quoteWizardAtom",
  default: QUOTE_INITIAL_STATE,
  effects: [sessionStorageEffect],
});

export { QUOTE_INITIAL_STATE };
