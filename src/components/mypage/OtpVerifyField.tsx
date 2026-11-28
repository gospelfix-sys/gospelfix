"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OtpVerifyFieldProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  inputMode: "tel" | "email";
  // 값 형식이 맞을 때만 인증번호 받기를 허용한다
  valueValid: boolean;
  // 휴대폰/이메일 BFF 경로와 요청·응답 키
  sendUrl: string;
  verifyUrl: string;
  valueKey: "phone" | "email";
  tokenKey: "phoneVerificationToken" | "emailVerificationToken";
  verified: boolean;
  onVerified: (token: string | null) => void;
}

const RESEND_COOLDOWN_SECONDS = 60;

// 값 입력 → 인증번호 받기 → 코드 확인으로 1회용 토큰을 받는 필드. 휴대폰(알림톡)과 이메일이 같은 흐름이라 공용으로 둔다.
// 값을 고치면 이미 받은 인증은 무효로 되돌려, 인증한 값과 제출하는 값이 달라지지 않게 한다.
export function OtpVerifyField({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  inputMode,
  valueValid,
  sendUrl,
  verifyUrl,
  valueKey,
  tokenKey,
  verified,
  onVerified,
}: OtpVerifyFieldProps) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // 유효성 검사는 정규화한 값 기준이라, 서버에도 같은 값을 보내야 공백·하이픈 입력이 400으로 튕기지 않는다.
  const normalizedValue = valueKey === "phone" ? value.replace(/\D/g, "") : value.trim();

  function handleValueChange(next: string) {
    onValueChange(next);
    if (verified) onVerified(null);
    setSent(false);
    setCode("");
  }

  async function handleSend() {
    setSending(true);
    try {
      await axiosInstance.post(sendUrl, { [valueKey]: normalizedValue });
      setSent(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success("인증번호를 보냈어요.");
    } catch (error) {
      toast.error(getErrorMessage(error, "인증번호 발송에 실패했어요."));
    } finally {
      setSending(false);
    }
  }

  async function handleVerify() {
    setVerifying(true);
    try {
      const res = await axiosInstance.post<Record<string, string>>(verifyUrl, {
        [valueKey]: normalizedValue,
        code,
      });
      const token = res.data[tokenKey];
      if (!token) throw new Error("missing token");
      onVerified(token);
      toast.success("인증이 완료됐어요.");
    } catch (error) {
      toast.error(getErrorMessage(error, "인증번호 확인에 실패했어요."));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <Input
          id={id}
          className="h-11"
          inputMode={inputMode}
          value={value}
          onChange={(event) => handleValueChange(event.target.value)}
          placeholder={placeholder}
          disabled={verified}
        />
        {verified ? (
          <div className="flex shrink-0 items-center gap-1 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            인증 완료
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0"
            onClick={handleSend}
            disabled={!valueValid || sending || cooldown > 0}
          >
            {cooldown > 0 ? `재전송 ${cooldown}초` : sent ? "다시 받기" : "인증번호 받기"}
          </Button>
        )}
      </div>
      {sent && !verified && (
        <div className="flex gap-2">
          <Input
            className="h-11"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            placeholder="인증번호 6자리"
            aria-label={`${label} 인증번호`}
          />
          <Button
            type="button"
            className="h-11 shrink-0"
            onClick={handleVerify}
            disabled={code.length !== 6 || verifying}
          >
            {verifying ? "확인 중..." : "확인"}
          </Button>
        </div>
      )}
    </div>
  );
}
