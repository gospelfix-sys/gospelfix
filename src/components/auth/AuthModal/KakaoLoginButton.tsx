"use client";

import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import SocialButton from "./SocialButton";

export default function KakaoLoginButton() {
  const { signInWithOAuth } = useAuth();

  return (
    <SocialButton
      icon={<MessageCircle className="size-4 fill-current" />}
      label="카카오로 계속하기"
      onClick={() => signInWithOAuth("kakao")}
      className="border-[#FEE500] bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
    />
  );
}
