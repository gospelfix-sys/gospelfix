import { atom } from "recoil";
import type { CmsUser } from "@/types/auth.types";

export const authUserAtom = atom<CmsUser | null>({
  key: "authUserAtom",
  default: null,
});

export const authLoadingAtom = atom<boolean>({
  key: "authLoadingAtom",
  default: true,
});
