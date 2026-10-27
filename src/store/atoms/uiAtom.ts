import { atom } from "recoil";

export type AuthModalView = "login" | "signup" | null;

export const authModalAtom = atom<{
  view: AuthModalView;
  next: string;
  referralCode?: string;
  error?: string;
}>({
  key: "authModalAtom",
  default: { view: null, next: "/" },
});
