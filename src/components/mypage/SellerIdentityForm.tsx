"use client";

import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { cn } from "@/lib/utils";
import type { SellerIdentityInput, SellerType } from "@/types/seller.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/input";
import { OtpVerifyField } from "@/components/mypage/OtpVerifyField";

interface SellerIdentityFormProps {
  onSubmitted: () => void;
}

const MOBILE_REGEX = /^01[0-9]{8,9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 사업장 전화는 지역번호·대표번호(15xx)도 허용한다
const BUSINESS_PHONE_REGEX = /^(0\d{1,2}\d{3,4}\d{4}|1\d{3}\d{4})$/;

const SELLER_TYPES: { key: SellerType; label: string; hint: string }[] = [
  { key: "individual", label: "개인", hint: "사업자등록 없이 판매해요" },
  { key: "business", label: "사업자", hint: "사업자등록번호가 있어요" },
];

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: "numeric" | "tel";
  error?: string | null;
}

function TextField({ id, label, value, onChange, placeholder, inputMode, error }: TextFieldProps) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Input
        id={id}
        className="h-11"
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

// 판매자 신청 폼. 휴대폰(알림톡)·이메일은 인증번호로 소유를 확인하고, 사업자는 서버가 국세청에 진위확인한다.
// 사업자 정보는 전자상거래법상 주문 전 구매자에게 공개되므로 동의를 받는다.
export function SellerIdentityForm({ onSubmitted }: SellerIdentityFormProps) {
  const [sellerType, setSellerType] = useState<SellerType>("individual");
  const [phone, setPhone] = useState("");
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [businessOpenedAt, setBusinessOpenedAt] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessPhone, setBusinessPhone] = useState("");
  const [mailOrderReportNumber, setMailOrderReportNumber] = useState("");
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cleanPhone = onlyDigits(phone);
  const cleanEmail = email.trim();
  const isBusiness = sellerType === "business";

  const numberDigits = onlyDigits(businessNumber);
  const openedDigits = onlyDigits(businessOpenedAt);
  const businessPhoneDigits = onlyDigits(businessPhone);
  const businessNumberError =
    businessNumber !== "" && numberDigits.length !== 10
      ? "사업자등록번호 10자리를 입력해주세요."
      : null;
  const openedAtError =
    businessOpenedAt !== "" && openedDigits.length !== 8
      ? "개업일자 8자리(예: 20240131)를 입력해주세요."
      : null;
  const businessPhoneError =
    businessPhone !== "" && !BUSINESS_PHONE_REGEX.test(businessPhoneDigits)
      ? "올바른 전화번호를 입력해주세요."
      : null;

  const businessReady =
    !isBusiness ||
    (businessName.trim() !== "" &&
      representativeName.trim() !== "" &&
      numberDigits.length === 10 &&
      openedDigits.length === 8 &&
      businessAddress.trim() !== "" &&
      BUSINESS_PHONE_REGEX.test(businessPhoneDigits) &&
      mailOrderReportNumber.trim() !== "");

  const canSubmit =
    phoneToken !== null && emailToken !== null && businessReady && consented && !submitting;

  async function handleSubmit() {
    if (!phoneToken || !emailToken) return;
    setSubmitting(true);
    const payload: SellerIdentityInput = {
      sellerType,
      contactPhone: cleanPhone,
      phoneVerificationToken: phoneToken,
      contactEmail: cleanEmail,
      emailVerificationToken: emailToken,
      ...(isBusiness && {
        businessName: businessName.trim(),
        representativeName: representativeName.trim(),
        businessAddress: businessAddress.trim(),
        businessPhone: businessPhoneDigits,
        businessNumber: numberDigits,
        businessOpenedAt: openedDigits,
        mailOrderReportNumber: mailOrderReportNumber.trim(),
      }),
    };
    try {
      await axiosInstance.post("/auth/seller-request", payload);
      toast.success("판매자 신청이 접수되었어요. 검토 후 승인해드릴게요.");
      onSubmitted();
    } catch (error) {
      toast.error(getErrorMessage(error, "판매자 신청에 실패했어요."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium">판매자 유형</p>
        <div className="grid grid-cols-2 gap-2">
          {SELLER_TYPES.map((type) => (
            <Chip
              key={type.key}
              active={sellerType === type.key}
              onClick={() => setSellerType(type.key)}
              className={cn(
                "rounded-xl p-3 text-left",
                sellerType === type.key ? "border-gf-orange bg-gf-orange-bg" : "border-border",
              )}
            >
              <span className="block text-sm font-semibold">{type.label}</span>
              <span className="block text-xs text-muted-foreground">{type.hint}</span>
            </Chip>
          ))}
        </div>
      </div>

      <OtpVerifyField
        id="sellerPhone"
        label="휴대폰 번호"
        value={phone}
        onValueChange={setPhone}
        placeholder="01012345678"
        inputMode="tel"
        valueValid={MOBILE_REGEX.test(cleanPhone)}
        sendUrl="/seller-identity/phone/send-code"
        verifyUrl="/seller-identity/phone/verify-code"
        valueKey="phone"
        tokenKey="phoneVerificationToken"
        verified={phoneToken !== null}
        onVerified={setPhoneToken}
      />

      <OtpVerifyField
        id="sellerEmail"
        label="이메일"
        value={email}
        onValueChange={setEmail}
        placeholder="seller@example.com"
        inputMode="email"
        valueValid={EMAIL_REGEX.test(cleanEmail)}
        sendUrl="/seller-identity/email/send-code"
        verifyUrl="/seller-identity/email/verify-code"
        valueKey="email"
        tokenKey="emailVerificationToken"
        verified={emailToken !== null}
        onVerified={setEmailToken}
      />

      {isBusiness && (
        <div className="space-y-4 rounded-xl border p-4">
          <p className="text-sm font-medium">사업자 정보</p>
          <TextField id="businessName" label="상호" value={businessName} onChange={setBusinessName} />
          <TextField
            id="representativeName"
            label="대표자명"
            value={representativeName}
            onChange={setRepresentativeName}
          />
          <TextField
            id="businessNumber"
            label="사업자등록번호"
            value={businessNumber}
            onChange={setBusinessNumber}
            placeholder="1234567890"
            inputMode="numeric"
            error={businessNumberError}
          />
          <TextField
            id="businessOpenedAt"
            label="개업일자"
            value={businessOpenedAt}
            onChange={setBusinessOpenedAt}
            placeholder="20240131"
            inputMode="numeric"
            error={openedAtError}
          />
          <TextField
            id="businessAddress"
            label="사업장 주소"
            value={businessAddress}
            onChange={setBusinessAddress}
          />
          <TextField
            id="businessPhone"
            label="사업장 전화번호"
            value={businessPhone}
            onChange={setBusinessPhone}
            placeholder="0212345678"
            inputMode="tel"
            error={businessPhoneError}
          />
          <TextField
            id="mailOrderReportNumber"
            label="통신판매업 신고번호"
            value={mailOrderReportNumber}
            onChange={setMailOrderReportNumber}
            placeholder="2024-서울강남-00000"
          />
          <p className="text-xs text-muted-foreground">
            대표자명·사업자등록번호·개업일자는 국세청 사업자등록정보와 일치해야 해요. 개업일자는 확인에만
            쓰고 저장하지 않아요.
          </p>
        </div>
      )}

      <label className="flex items-start gap-2 text-sm">
        <Checkbox checked={consented} onCheckedChange={(checked) => setConsented(checked === true)} />
        <span>
          {isBusiness
            ? "[필수] 상호·대표자·주소·전화번호·사업자등록번호·통신판매업 신고번호가 주문 전 구매자에게 표시되는 것에 동의합니다."
            : "[필수] 휴대폰·이메일 확인 결과가 판매자 신원 확인 정보로 저장·표시되는 것에 동의합니다. (번호 원문은 구매자에게 공개하지 않아요)"}
        </span>
      </label>

      <Button className="h-11 w-full" onClick={handleSubmit} disabled={!canSubmit}>
        {submitting ? "신청 중..." : "판매자 신청"}
      </Button>
    </div>
  );
}
