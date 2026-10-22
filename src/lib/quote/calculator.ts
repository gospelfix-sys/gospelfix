import type {
  SelectedLineItem,
  QuoteCalculationResult,
  QuoteLineBreakdown,
  QuoteWizardState,
  LineItemId,
} from "@/types/quote.types";
import { LINE_ITEM_OPTIONS } from "./constants";

function buildLineBreakdown(id: LineItemId, quantity = 1): QuoteLineBreakdown {
  const option = LINE_ITEM_OPTIONS[id];
  const subtotal = option.basePrice * quantity;
  return {
    itemId: id,
    label: option.label,
    quantity,
    unitPrice: option.basePrice,
    copywritingSubtotal: 0,
    subtotal,
  };
}

export function calculateQuote(
  itemsOrState: SelectedLineItem[] | QuoteWizardState,
): QuoteCalculationResult {
  // 배열이면 레거시 단순 계산 (다른 카테고리용)
  if (Array.isArray(itemsOrState)) {
    return calculateFromItems(itemsOrState);
  }
  return calculateFromState(itemsOrState);
}

function calculateFromItems(items: SelectedLineItem[]): QuoteCalculationResult {
  const lines: QuoteLineBreakdown[] = items.map((selected) => {
    const option = LINE_ITEM_OPTIONS[selected.id];
    const baseSubtotal = option.basePrice * selected.quantity;
    const copywritingSubtotal =
      selected.withCopywriting && option.copywritingPrice > 0
        ? option.copywritingPrice * selected.quantity
        : 0;
    return {
      itemId: selected.id,
      label: option.label,
      quantity: selected.quantity,
      unitPrice: option.basePrice,
      copywritingSubtotal,
      subtotal: baseSubtotal + copywritingSubtotal,
    };
  });

  const total = lines.reduce((acc, l) => acc + l.subtotal, 0);
  return { lines, total };
}

function calculateFromState(state: QuoteWizardState): QuoteCalculationResult {
  const lines: QuoteLineBreakdown[] = [];

  const hasShoppingMall = state.selectedCategories.includes("shopping_mall");

  // 쇼핑몰 선택 시 제작 범위 기반 동적 가격 계산
  if (hasShoppingMall) {
    // 기본 구축 항목은 항상 포함
    lines.push(buildLineBreakdown("shopping_cafe24"));

    // 제작 범위 add-on
    if (state.productionScope === "planning_copy") {
      lines.push(buildLineBreakdown("shop_scope_planning"));
    } else if (state.productionScope === "premium") {
      lines.push(buildLineBreakdown("shop_scope_planning"));
      lines.push(buildLineBreakdown("shop_scope_premium"));
    }

    // 현재 상황 add-on
    if (state.shopStatus === "renewal") {
      lines.push(buildLineBreakdown("shop_status_renewal"));
    } else if (state.shopStatus === "migration") {
      lines.push(buildLineBreakdown("shop_status_migration"));
    }

    // 필요 기능 add-on
    const featureMap: Record<string, LineItemId> = {
      coupon_point: "shop_feat_coupon",
      subscription: "shop_feat_subscription",
      wholesale: "shop_feat_wholesale",
      reservation: "shop_feat_reservation",
      review: "shop_feat_review",
      sns_login: "shop_feat_sns",
    };
    for (const feat of state.requiredFeatures) {
      const itemId = featureMap[feat];
      if (itemId) lines.push(buildLineBreakdown(itemId));
    }
  }

  // 홈페이지 제작 범위 add-on (productionScope 필드를 shopping_mall과 공유하므로 중복 방지)
  const hasHomepage = state.selectedCategories.includes("homepage");
  if (hasHomepage && !hasShoppingMall && state.productionScope === "planning_copy") {
    lines.push(buildLineBreakdown("homepage_scope_planning"));
  }

  // 나머지 카테고리 항목 (homepage 페이지·언어 선택, ai_mvp, maintenance) — 기존 방식 그대로
  const nonShopItems = state.selectedItems.filter(
    (item) => LINE_ITEM_OPTIONS[item.id]?.category !== "shopping_mall",
  );
  const otherResult = calculateFromItems(nonShopItems);
  lines.push(...otherResult.lines);

  const total = lines.reduce((acc, l) => acc + l.subtotal, 0);
  return { lines, total };
}

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString("ko-KR")}`;
}
