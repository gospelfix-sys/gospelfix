"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import KakaoLoginButton from "./KakaoLoginButton";

export default function LoginForm() {
  const { signIn, authModalNext, authModalError, closeAuthModal, openAuthModal } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() => authModalError ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password, authModalNext);
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <Image src="/logo.webp" alt="GospelFix" width={48} height={48} className="mb-3 rounded-xl" />
      <h2 className="text-xl font-bold text-gf-black">로그인</h2>
      <p className="mt-1 mb-6 text-sm text-gf-gray2">템플릿 마켓에 오신 걸 환영합니다</p>

      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gf-gray2" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="이메일 주소를 입력하세요."
            className="h-11 pl-9"
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gf-gray2" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="비밀번호"
            className="h-11 pl-9"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-[rgba(220,38,38,0.1)] px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading} size="lg" className="mt-1 h-11 w-full">
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <KakaoLoginButton />

      <p className="mt-5 text-sm text-gf-gray2">
        계정이 없으신가요?{" "}
        <button
          type="button"
          onClick={() => openAuthModal("signup")}
          className="font-semibold text-gf-orange underline-offset-4 hover:underline outline-none"
        >
          회원가입
        </button>
      </p>
    </div>
  );
}
