import { atom } from "recoil";
import type { CartItem } from "@/types/cart.types";

export const cartModalOpenAtom = atom<boolean>({
  key: "cartModalOpenAtom",
  default: false,
});

export const cartItemsAtom = atom<CartItem[]>({
  key: "cartItemsAtom",
  default: [],
});
