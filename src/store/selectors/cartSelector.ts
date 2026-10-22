import { selector } from "recoil";
import { cartItemsAtom } from "@/store/atoms/cartAtom";

export const cartTotalPriceSelector = selector<number>({
  key: "cartTotalPriceSelector",
  get: ({ get }) => get(cartItemsAtom).reduce((sum, item) => sum + item.price, 0),
});

export const cartItemCountSelector = selector<number>({
  key: "cartItemCountSelector",
  get: ({ get }) => get(cartItemsAtom).length,
});
