"use client";

import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function KakaoLoginButton() {
  const { signInWithOAuth } = useAuth();

  return (
    <div className="mt-1 flex w-full flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gf-line" />
        <span className="text-xs text-gf-gray2">또는</span>
        <div className="h-px flex-1 bg-gf-line" />
      </div>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => signInWithOAuth("kakao")}
        className="h-11 w-full gap-2 border-gf-black text-gf-black hover:bg-gf-black/5"
      >
        <MessageCircle className="size-4" />
        카카오로 1초만에 시작하기
      </Button>
    </div>
  );
}
