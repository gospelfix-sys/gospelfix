import { atom } from "recoil";
import type { Coupon } from "@/types/coupon.types";

export const signupCouponAtom = atom<Coupon | null>({
  key: "signupCouponAtom",
  default: null,
});
