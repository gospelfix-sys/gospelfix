"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AuthModalView } from "@/store/atoms/uiAtom";
import AuthViewTransition from "./AuthViewTransition";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import SocialLoginView from "./SocialLoginView";

const VIEW_TITLES = {
  social: "소셜 로그인",
  login: "로그인",
  signup: "회원가입",
} as const;

export default function AuthModal() {
  const { authModalView, closeAuthModal } = useAuth();
  // 닫히는 동안(view가 null) 내용이 로그인 폼으로 바뀌며 전환 모션이 재생되지 않도록 마지막 뷰를 유지한다
  const [lastView, setLastView] = useState<Exclude<AuthModalView, null>>("social");
  if (authModalView !== null && authModalView !== lastView) setLastView(authModalView);
  const displayView = authModalView ?? lastView;

  return (
    <Dialog open={authModalView !== null} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="p-6 sm:max-w-sm">
        <DialogTitle className="sr-only">
          {authModalView ? VIEW_TITLES[authModalView] : "로그인"}
        </DialogTitle>
        <AuthViewTransition view={displayView}>
          {displayView === "social" ? (
            <SocialLoginView />
          ) : displayView === "signup" ? (
            <SignupForm />
          ) : (
            <LoginForm />
          )}
        </AuthViewTransition>
      </DialogContent>
    </Dialog>
  );
}
