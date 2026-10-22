import { atom } from "recoil";

export const sidebarOpenAtom = atom<boolean>({
  key: "sidebarOpenAtom",
  default: true,
});

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

export const toastAtom = atom<{
  message: string;
  type: "success" | "error" | "info";
} | null>({
  key: "toastAtom",
  default: null,
});
