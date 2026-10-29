import { atom } from "recoil";

// social: 구글·카카오 첫 화면, login/signup: "다른 방법으로 로그인"으로 진입하는 이메일 화면
export type AuthModalView = "social" | "login" | "signup" | null;

export const authModalAtom = atom<{
  view: AuthModalView;
  next: string;
  referralCode?: string;
  error?: string;
}>({
  key: "authModalAtom",
  default: { view: null, next: "/" },
});
