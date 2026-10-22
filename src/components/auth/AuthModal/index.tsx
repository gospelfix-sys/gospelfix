"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthModal() {
  const { authModalView, closeAuthModal } = useAuth();

  return (
    <Dialog open={authModalView !== null} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="p-6 sm:max-w-sm">
        <DialogTitle className="sr-only">
          {authModalView === "signup" ? "회원가입" : "로그인"}
        </DialogTitle>
        {authModalView === "signup" ? <SignupForm /> : <LoginForm />}
      </DialogContent>
    </Dialog>
  );
}
