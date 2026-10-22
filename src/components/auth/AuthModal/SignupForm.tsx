"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Lock, Mail, Phone, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import KakaoLoginButton from "./KakaoLoginButton";

const CODE_TTL_SECONDS = 180;
const PHONE_REGEX = /^01[0-9]{8,9}$/;

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function SignupForm() {
  const {
    signUp,
    sendPhoneCode,
    verifyPhoneCode,
    closeAuthModal,
    openAuthModal,
    authModalReferralCode,
    authModalError,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState(() => authModalReferralCode ?? "");
  const [code, setCode] = useState("");
  const [phoneVerificationToken, setPhoneVerificationToken] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState("");
  const [error, setError] = useState(() => authModalError ?? "");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isPhoneVerified = !!phoneVerificationToken;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  async function handleSendCode() {
    setPhoneMessage("");
    const normalizedPhone = phone.replace(/-/g, "");
    if (!PHONE_REGEX.test(normalizedPhone)) {
      setPhoneMessage("올바른 휴대폰 번호를 입력해주세요.");
      return;
    }
    setSendingCode(true);
    try {
      await sendPhoneCode(normalizedPhone);
      setCodeSent(true);
      setCountdown(CODE_TTL_SECONDS);
      setPhoneMessage("인증번호를 발송했습니다.");
    } catch (err) {
      setPhoneMessage(err instanceof Error ? err.message : "인증번호 발송에 실패했습니다.");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleVerifyCode() {
    setPhoneMessage("");
    setVerifyingCode(true);
    try {
      const token = await verifyPhoneCode(phone.replace(/-/g, ""), code);
      setPhoneVerificationToken(token);
      setPhoneMessage("휴대폰 인증이 완료되었습니다.");
    } catch (err) {
      setPhoneMessage(err instanceof Error ? err.message : "인증번호가 올바르지 않습니다.");
    } finally {
      setVerifyingCode(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!phoneVerificationToken) {
      setError("휴대폰 인증을 완료해주세요.");
      return;
    }

    setLoading(true);
    try {
      const { confirmationRequired } = await signUp(
        email,
        password,
        "",
        phone.replace(/-/g, ""),
        phoneVerificationToken,
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

  const phoneButtonDisabled = isPhoneVerified || sendingCode || (codeSent && countdown > 0);
  const phoneButtonLabel = sendingCode
    ? "발송 중..."
    : codeSent && countdown > 0
      ? formatCountdown(countdown)
      : codeSent
        ? "재전송"
        : "인증";

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

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gf-gray2" />
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={isPhoneVerified || codeSent}
              placeholder="휴대폰 번호를 입력하세요."
              className="h-11 pl-9"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0"
            disabled={phoneButtonDisabled}
            onClick={handleSendCode}
          >
            {isPhoneVerified ? (
              <CheckCircle2 className="size-4 text-gf-orange" />
            ) : (
              phoneButtonLabel
            )}
          </Button>
        </div>

        {codeSent && !isPhoneVerified && (
          <div className="flex gap-2">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="인증번호 6자리"
              className="h-11 flex-1"
            />
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0"
              disabled={verifyingCode || code.length === 0}
              onClick={handleVerifyCode}
            >
              {verifyingCode ? "확인 중..." : "확인"}
            </Button>
          </div>
        )}

        {phoneMessage && (
          <p className={cn("text-xs", isPhoneVerified ? "text-gf-orange" : "text-gf-gray2")}>
            {phoneMessage}
          </p>
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

        {error && (
          <p className="rounded-lg bg-[rgba(220,38,38,0.1)] px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || password !== passwordConfirm}
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

      <p className="mt-3 text-center text-xs text-gf-gray3">
        가입 시,{" "}
        <LegalDialogTrigger
          type="terms"
          className="underline underline-offset-2 hover:text-gf-gray2"
        >
          이용약관
        </LegalDialogTrigger>{" "}
        및{" "}
        <LegalDialogTrigger
          type="privacy"
          className="underline underline-offset-2 hover:text-gf-gray2"
        >
          개인정보처리방침
        </LegalDialogTrigger>
        에 동의합니다.
      </p>
    </div>
  );
}
