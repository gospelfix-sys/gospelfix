"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Mail, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import KakaoLoginButton from "./KakaoLoginButton";

// 가입 시 필수 동의 항목. 동의 여부는 클라이언트에서만 검증하고 서버에는 기록하지 않는다.
const REQUIRED_AGREEMENTS = [
  { key: "terms", label: "서비스 이용약관 동의(필수)", legal: "terms" },
  { key: "privacy", label: "개인정보 수집 및 이용 동의(필수)", legal: "privacy" },
  { key: "age", label: "만 14세 이상입니다.(필수)", legal: null },
] as const;

type AgreementKey = (typeof REQUIRED_AGREEMENTS)[number]["key"];

export default function SignupForm() {
  const {
    signUp,
    closeAuthModal,
    openAuthModal,
    authModalReferralCode,
    authModalError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [referralCode, setReferralCode] = useState(() => authModalReferralCode ?? "");
  const [agreements, setAgreements] = useState<Record<AgreementKey, boolean>>({
    terms: false,
    privacy: false,
    age: false,
  });
  const [error, setError] = useState(() => authModalError ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const allAgreed = REQUIRED_AGREEMENTS.every(({ key }) => agreements[key]);

  function handleToggleAll(checked: boolean) {
    setAgreements({ terms: checked, privacy: checked, age: checked });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!allAgreed) {
      setError("필수 약관에 모두 동의해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { confirmationRequired } = await signUp(
        email,
        password,
        referralCode.trim() || undefined,
      );
      if (confirmationRequired) {
        setDone(true);
        setLoading(false);
        return;
      }
      closeAuthModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <div className="mb-4 text-4xl">📧</div>
        <h2 className="text-lg font-bold text-gf-black">이메일을 확인해주세요</h2>
        <p className="mt-2 text-sm text-gf-gray2">
          <strong className="text-gf-black">{email}</strong> 로 인증 링크를 보냈습니다.
          <br />
          링크를 클릭하면 가입이 완료됩니다.
        </p>
        <Button variant="outline" className="mt-6 w-full" onClick={() => openAuthModal("login")}>
          로그인으로 이동
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Image src="/logo.webp" alt="GospelFix" width={48} height={48} className="mb-3 rounded-xl" />
      <h2 className="text-xl font-bold text-gf-black">회원가입</h2>
      <p className="mt-1 mb-6 text-sm text-gf-gray2">템플릿 마켓 계정을 만들어보세요</p>

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
            minLength={6}
            placeholder="비밀번호를 입력하세요. (6자 이상)"
            className="h-11 pl-9"
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gf-gray2" />
          <Input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={6}
            placeholder="비밀번호를 다시 입력하세요."
            className="h-11 pl-9"
          />
        </div>

        {passwordConfirm.length > 0 && password !== passwordConfirm && (
          <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다.</p>
        )}

        <div className="relative">
          <Users className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gf-gray2" />
          <Input
            type="text"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            placeholder="추천인 코드 (선택)"
            className="h-11 pl-9"
          />
        </div>

        <div className="mt-1 flex flex-col gap-2 text-sm text-gf-gray1">
          <label className="flex items-center gap-2 font-semibold text-gf-black">
            <Checkbox checked={allAgreed} onCheckedChange={handleToggleAll} />
            전체 동의
          </label>
          {REQUIRED_AGREEMENTS.map(({ key, label, legal }) => (
            <div key={key} className="flex items-center justify-between gap-2 pl-1">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={agreements[key]}
                  onCheckedChange={(checked) =>
                    setAgreements((prev) => ({ ...prev, [key]: checked }))
                  }
                />
                {label}
              </label>
              {legal && (
                <LegalDialogTrigger
                  type={legal}
                  className="shrink-0 text-xs underline underline-offset-2 hover:text-gf-gray2"
                >
                  보기
                </LegalDialogTrigger>
              )}
            </div>
          ))}
        </div>

        {error && (
          <p className="rounded-lg bg-[rgba(220,38,38,0.1)] px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || password !== passwordConfirm || !allAgreed}
          size="lg"
          className="mt-1 h-11 w-full"
        >
          {loading ? "가입 중..." : "회원가입"}
        </Button>
      </form>

      <KakaoLoginButton />

      <p className="mt-5 text-sm text-gf-gray2">
        이미 계정이 있으신가요?{" "}
        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="font-semibold text-gf-orange underline-offset-4 hover:underline outline-none"
        >
          로그인
        </button>
      </p>
    </div>
  );
}
