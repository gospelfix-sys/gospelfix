"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Lock, Mail, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import KakaoLoginButton from "./KakaoLoginButton";

const CODE_TTL_SECONDS = 180;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

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
    sendEmailCode,
    verifyEmailCode,
    closeAuthModal,
    openAuthModal,
    authModalReferralCode,
    authModalError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [code, setCode] = useState("");
  const [emailVerificationToken, setEmailVerificationToken] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [referralCode, setReferralCode] = useState(() => authModalReferralCode ?? "");
  const [agreements, setAgreements] = useState<Record<AgreementKey, boolean>>({
    terms: false,
    privacy: false,
    age: false,
  });
  const [error, setError] = useState(() => authModalError ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isEmailVerified = !!emailVerificationToken;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 이메일을 잘못 썼거나 토큰이 만료됐을 때 처음부터 다시 인증할 수 있도록 상태를 모두 비운다.
  function resetEmailVerification() {
    setEmailVerificationToken(null);
    setCodeSent(false);
    setCode("");
    setCountdown(0);
    setEmailMessage("");
  }

  async function handleSendCode() {
    setEmailMessage("");
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailMessage("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    setSendingCode(true);
    try {
      await sendEmailCode(trimmedEmail);
      setCodeSent(true);
      setCode("");
      setCountdown(CODE_TTL_SECONDS);
      setEmailMessage("인증번호를 이메일로 발송했습니다.");
    } catch (err) {
      setEmailMessage(err instanceof Error ? err.message : "인증메일 발송에 실패했습니다.");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyCode() {
    setEmailMessage("");
    setVerifyingCode(true);
    try {
      const token = await verifyEmailCode(email.trim(), code.trim());
      setEmailVerificationToken(token);
      setEmailMessage("이메일 인증이 완료되었습니다.");
    } catch (err) {
      setEmailMessage(err instanceof Error ? err.message : "인증번호가 올바르지 않습니다.");
    } finally {
      setVerifyingCode(false);
    }
  }

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

    if (!emailVerificationToken) {
      setError("이메일 인증을 완료해주세요.");
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
        emailVerificationToken,
        referralCode.trim() || undefined,
      );
      if (confirmationRequired) {
        setDone(true);
        setLoading(false);
        return;
      }
      closeAuthModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : "회원가입에 실패했습니다.";
      // 인증 토큰이 만료(30분)된 경우 UI가 "인증 완료"에 머물러 막히지 않도록 인증을 되돌린다.
      if (message.includes("이메일 인증")) resetEmailVerification();
      setError(message);
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
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gf-gray2" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={codeSent || isEmailVerified}
              placeholder="이메일 주소를 입력하세요."
              className="h-11 pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0"
            disabled={isEmailVerified || sendingCode || (codeSent && countdown > 0) || !email}
            onClick={handleSendCode}
          >
            {isEmailVerified ? (
              <>
                <CheckCircle2 className="size-4 text-gf-orange" aria-hidden="true" />
                <span className="sr-only">이메일 인증 완료</span>
              </>
            ) : sendingCode ? (
              "발송 중..."
            ) : codeSent ? (
              "재전송"
            ) : (
              "인증메일 전송"
            )}
          </Button>
        </div>

        {codeSent && !isEmailVerified && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  // 인증 전에는 가입 버튼이 비활성이라 Enter로 submit되지 않으므로 인증 확인에 연결한다.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (!verifyingCode && countdown > 0 && code.trim()) handleVerifyCode();
                  }
                }}
                aria-label="이메일 인증번호"
                placeholder="인증번호를 입력해주세요."
                className="h-11 pr-14"
              />
              {countdown > 0 && (
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-gf-orange tabular-nums">
                  {formatCountdown(countdown)}
                </span>
              )}
            </div>
            <Button
              type="button"
              className="h-11 shrink-0"
              disabled={verifyingCode || code.trim().length === 0 || countdown <= 0}
              onClick={handleVerifyCode}
            >
              {verifyingCode ? "확인 중..." : "인증하기"}
            </Button>
          </div>
        )}

        {(emailMessage || codeSent) && (
          <div className="flex items-center justify-between gap-2">
            <p
              role="status"
              className={cn("text-xs", isEmailVerified ? "text-gf-orange" : "text-gf-gray2")}
            >
              {emailMessage}
            </p>
            {codeSent && (
              <Button
                type="button"
                variant="link"
                size="xs"
                className="shrink-0 px-0 text-gf-gray2"
                onClick={resetEmailVerification}
              >
                이메일 변경
              </Button>
            )}
          </div>
        )}

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
          <p
            role="alert"
            className="rounded-lg bg-[rgba(220,38,38,0.1)] px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || password !== passwordConfirm || !allAgreed || !isEmailVerified}
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
