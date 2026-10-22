"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { Product, ProductOption } from "@/types/product.types";

const DEFAULT_PURCHASE_OPTIONS: ProductOption[] = [
  {
    id: "simple",
    label: "단순복사",
    description: "디자인 수정작업 불포함",
    work_period_days: 1,
    is_inquiry_only: false,
  },
  {
    id: "custom",
    label: "커스터마이징(구매 전 카카오 채널로 문의 주세요.)",
    description: "단순복사 + 커스터마이징",
    work_period_days: 10,
    is_inquiry_only: true,
    detail:
      "컬러·레이아웃·폰트 등 디자인 전반의 커스터마이징과 기능 추가·변경 상담을 포함합니다. 정확한 견적과 작업 범위는 카카오 채널 문의 후 안내드립니다.",
  },
];

interface PurchaseOptionContextValue {
  purchaseOptions: ProductOption[];
  purchaseOptionId: string;
  setPurchaseOptionId: (id: string) => void;
  selectedOption: ProductOption;
}

const PurchaseOptionContext = createContext<PurchaseOptionContextValue | null>(null);

interface PurchaseOptionProviderProps {
  product: Product;
  children: React.ReactNode;
}

export function PurchaseOptionProvider({ product, children }: PurchaseOptionProviderProps) {
  const purchaseOptions =
    product.purchase_options && product.purchase_options.length > 0
      ? product.purchase_options
      : DEFAULT_PURCHASE_OPTIONS;

  const [purchaseOptionId, setPurchaseOptionId] = useState(purchaseOptions[0].id);

  const selectedOption = useMemo(
    () => purchaseOptions.find((option) => option.id === purchaseOptionId) ?? purchaseOptions[0],
    [purchaseOptions, purchaseOptionId],
  );

  const value = useMemo(
    () => ({ purchaseOptions, purchaseOptionId, setPurchaseOptionId, selectedOption }),
    [purchaseOptions, purchaseOptionId, selectedOption],
  );

  return (
    <PurchaseOptionContext.Provider value={value}>{children}</PurchaseOptionContext.Provider>
  );
}

export function usePurchaseOption() {
  const context = useContext(PurchaseOptionContext);
  if (!context) {
    throw new Error("usePurchaseOption은 PurchaseOptionProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
