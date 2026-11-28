import { selector } from "recoil";
import { cartItemsAtom } from "@/store/atoms/cartAtom";
import { calcVat } from "@/lib/vat";

export const cartTotalPriceSelector = selector<number>({
  key: "cartTotalPriceSelector",
  get: ({ get }) =>
    get(cartItemsAtom).reduce(
      (sum, item) => sum + calcVat(item.price, item.vatApplicable).total,
      0,
    ),
});

export const cartItemCountSelector = selector<number>({
  key: "cartItemCountSelector",
  get: ({ get }) => get(cartItemsAtom).length,
});
