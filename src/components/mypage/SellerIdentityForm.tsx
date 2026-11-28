"use client";

import { useState } from "react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios/instance";
import { getErrorMessage } from "@/lib/axios/getErrorMessage";
import { cn } from "@/lib/utils";
import {
  EMAIL_REGEX,
  MOBILE_REGEX,
  isValidBusinessAddress,
  isValidBusinessNumber,
  isValidOpenedAt,
  onlyDigits,
} from "@/lib/sellerIdentityValidation";
import type { SellerIdentityInput, SellerType } from "@/types/seller.types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip } from "@/components/ui/Chip";
import { FieldLabel } from "@/components/ui/FieldLabel";
import { Input } from "@/components/ui/input";

interface SellerIdentityFormProps {
  onSubmitted: () => void;
}

type FieldKey =
  | "contactName"
  | "phone"
  | "email"
  | "businessName"
  | "representativeName"
  | "businessNumber"
  | "openedAt"
  | "businessAddress"
  | "consent";

// 입력칸 id. 제출이 막히면 FIELD_ORDER 순서로 첫 오류 칸에 포커스를 옮긴다.
const FIELD_IDS: Record<Exclude<FieldKey, "consent">, string> = {
  contactName: "sellerName",
  phone: "sellerPhone",
  email: "sellerEmail",
  businessName: "businessName",
  representativeName: "representativeName",
  businessNumber: "businessNumber",
  openedAt: "businessOpenedAt",
  businessAddress: "businessAddress",
};

const FIELD_ORDER: FieldKey[] = [
  "contactName",
  "phone",
  "email",
  "businessName",
  "representativeName",
  "businessNumber",
  "openedAt",
  "businessAddress",
  "consent",
];

// disabled: 아직 열지 않은 유형. 열 때는 해당 항목의 disabled를 지운다
const SELLER_TYPES: { key: SellerType; label: string; hint: string; disabled?: boolean }[] = [
  { key: "individual", label: "개인", hint: "사업자등록 없이 판매해요" },
  { key: "business", label: "사업자", hint: "사업자등록번호가 있어요", disabled: true },
];

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  inputMode?: "numeric" | "tel" | "email";
  maxLength?: number;
  optional?: boolean;
  hint?: string;
  error?: string | null;
}

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  inputMode,
  maxLength,
  optional,
  hint,
  error,
}: TextFieldProps) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id} optional={optional}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        className="h-11"
        value={value}
        inputMode={inputMode}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-required={optional ? undefined : true}
        aria-invalid={error ? true : undefined}
      />
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// 판매자 신청 폼. 연락처는 인증 없이 입력만 받는다. 개인은 관리자가 직접 확인해 승인하고,
// 사업자는 서버가 국세청에 진위확인한다. 사업자 정보는 전자상거래법상 주문 전 구매자에게 공개되므로 동의를 받는다.
// 필수 칸은 라벨 옆 빨간 점으로 표시하고, 오류는 칸을 벗어나거나 제출을 시도한 뒤에 보여준다.
export function SellerIdentityForm({ onSubmitted }: SellerIdentityFormProps) {
  const [sellerType, setSellerType] = useState<SellerType>("individual");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [businessOpenedAt, setBusinessOpenedAt] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [mailOrderReportNumber, setMailOrderReportNumber] = useState("");
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [attempted, setAttempted] = useState(false);

  const cleanPhone = onlyDigits(phone);
  const cleanEmail = email.trim();
  const isBusiness = sellerType === "business";
  const numberDigits = onlyDigits(businessNumber);
  const openedDigits = onlyDigits(businessOpenedAt);

  const errors: Partial<Record<FieldKey, string>> = {};
  // 사업자는 대표자명을 받으므로 개인만 이름을 입력받는다
  if (!isBusiness && !contactName.trim()) errors.contactName = "이름을 입력해주세요.";
  if (!cleanPhone) errors.phone = "휴대폰 번호를 입력해주세요.";
  else if (!MOBILE_REGEX.test(cleanPhone)) errors.phone = "올바른 휴대폰 번호를 입력해주세요.";

  if (!cleanEmail) errors.email = "이메일을 입력해주세요.";
  else if (!EMAIL_REGEX.test(cleanEmail)) errors.email = "올바른 이메일을 입력해주세요.";

  if (isBusiness) {
    if (!businessName.trim()) errors.businessName = "상호를 입력해주세요.";
    if (!representativeName.trim()) errors.representativeName = "대표자명을 입력해주세요.";
    if (!numberDigits) errors.businessNumber = "사업자등록번호를 입력해주세요.";
    else if (!isValidBusinessNumber(numberDigits)) {
      errors.businessNumber = "올바른 사업자등록번호가 아니에요. 10자리를 다시 확인해주세요.";
    }
    if (!openedDigits) errors.openedAt = "개업일자를 입력해주세요.";
    else if (!isValidOpenedAt(openedDigits)) {
      errors.openedAt = "개업일자를 8자리(예: 20240131)로 올바르게 입력해주세요.";
    }
    if (!businessAddress.trim()) errors.businessAddress = "사업장 주소를 입력해주세요.";
    else if (!isValidBusinessAddress(businessAddress)) {
      errors.businessAddress = "주소를 정확히 입력해주세요. (예: 서울특별시 강남구 테헤란로 123)";
    }
  }
  if (!consented) errors.consent = "구매자에게 표시되는 것에 동의해주세요.";

  function markTouched(key: FieldKey) {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }

  function shown(key: FieldKey): string | null {
    return touched[key] || attempted ? (errors[key] ?? null) : null;
  }

  // 필수 입력이 모두 맞게 채워질 때까지 신청 버튼을 잠근다
  const isFormValid = Object.keys(errors).length === 0;

  async function handleSubmit() {
    const firstInvalid = FIELD_ORDER.find((key) => errors[key]);
    if (firstInvalid) {
      setAttempted(true);
      toast.error("필수 입력을 확인해주세요.");
      if (firstInvalid !== "consent") {
        document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      }
      return;
    }

    setSubmitting(true);
    const reportNumber = mailOrderReportNumber.trim();
    const payload: SellerIdentityInput = {
      sellerType,
      ...(!isBusiness && { contactName: contactName.trim() }),
      contactPhone: cleanPhone,
      contactEmail: cleanEmail,
      ...(isBusiness && {
        businessName: businessName.trim(),
        representativeName: representativeName.trim(),
        businessAddress: businessAddress.trim(),
        businessNumber: numberDigits,
        businessOpenedAt: openedDigits,
        // 신고 면제 대상은 비워 두므로 입력했을 때만 보낸다
        ...(reportNumber && { mailOrderReportNumber: reportNumber }),
      }),
    };
    try {
      await axiosInstance.post("/auth/seller-request", payload);
      toast.success("판매자 신청이 접수되었어요. 검토에는 약 5일 정도 소요돼요.");
      onSubmitted();
    } catch (error) {
      toast.error(getErrorMessage(error, "판매자 신청에 실패했어요."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-destructive" />
        표시는 필수 입력이에요.
      </p>

      <div className="space-y-2">
        <p className="text-sm font-medium">판매자 유형</p>
        <div className="grid grid-cols-2 gap-2">
          {SELLER_TYPES.map((type) => (
            <Chip
              key={type.key}
              active={sellerType === type.key}
              aria-disabled={type.disabled}
              onClick={() => {
                // disabled 속성은 클릭 이벤트를 막아 안내를 띄울 수 없어 aria-disabled로 처리한다
                if (type.disabled) {
                  toast.info("준비 중입니다.");
                  return;
                }
                setSellerType(type.key);
              }}
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

      {!isBusiness && (
        <TextField
          id={FIELD_IDS.contactName}
          label="이름"
          value={contactName}
          onChange={setContactName}
          onBlur={() => markTouched("contactName")}
          placeholder="홍길동"
          maxLength={50}
          error={shown("contactName")}
        />
      )}
      <TextField
        id={FIELD_IDS.phone}
        label="휴대폰 번호"
        value={phone}
        onChange={setPhone}
        onBlur={() => markTouched("phone")}
        placeholder="01012345678"
        inputMode="tel"
        maxLength={13}
        error={shown("phone")}
      />
      <TextField
        id={FIELD_IDS.email}
        label="이메일"
        value={email}
        onChange={setEmail}
        onBlur={() => markTouched("email")}
        placeholder="seller@example.com"
        inputMode="email"
        maxLength={100}
        error={shown("email")}
      />

      {isBusiness && (
        <div className="space-y-4 rounded-xl border p-4">
          <p className="text-sm font-medium">사업자 정보</p>
          <TextField
            id={FIELD_IDS.businessName}
            label="상호"
            value={businessName}
            onChange={setBusinessName}
            onBlur={() => markTouched("businessName")}
            maxLength={100}
            error={shown("businessName")}
          />
          <TextField
            id={FIELD_IDS.representativeName}
            label="대표자명"
            value={representativeName}
            onChange={setRepresentativeName}
            onBlur={() => markTouched("representativeName")}
            maxLength={50}
            error={shown("representativeName")}
          />
          <TextField
            id={FIELD_IDS.businessNumber}
            label="사업자등록번호"
            value={businessNumber}
            onChange={setBusinessNumber}
            onBlur={() => markTouched("businessNumber")}
            placeholder="1234567890"
            inputMode="numeric"
            maxLength={12}
            error={shown("businessNumber")}
          />
          <TextField
            id={FIELD_IDS.openedAt}
            label="개업일자"
            value={businessOpenedAt}
            onChange={setBusinessOpenedAt}
            onBlur={() => markTouched("openedAt")}
            placeholder="20240131"
            inputMode="numeric"
            maxLength={10}
            error={shown("openedAt")}
          />
          <TextField
            id={FIELD_IDS.businessAddress}
            label="사업장 주소"
            value={businessAddress}
            onChange={setBusinessAddress}
            onBlur={() => markTouched("businessAddress")}
            maxLength={200}
            error={shown("businessAddress")}
          />
          <TextField
            id="mailOrderReportNumber"
            label="통신판매업 신고번호"
            value={mailOrderReportNumber}
            onChange={setMailOrderReportNumber}
            placeholder="2024-서울강남-00000"
            maxLength={50}
            optional
            hint="신고 면제 대상이면 비워두세요."
          />
          <p className="text-xs text-muted-foreground">
            대표자명·사업자등록번호·개업일자는 국세청 사업자등록정보와 일치해야 해요. 개업일자는
            확인에만 쓰고 저장하지 않아요.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-start gap-2 text-sm">
          <Checkbox
            checked={consented}
            onCheckedChange={(checked) => {
              setConsented(checked === true);
              markTouched("consent");
            }}
          />
          <span>
            {isBusiness
              ? "[필수] 상호·대표자·주소·사업자등록번호(입력한 경우 통신판매업 신고번호)가 주문 전 구매자에게 표시되는 것에 동의합니다."
              : "[필수] 입력한 휴대폰·이메일이 판매자 신원 확인 정보로 저장되는 것에 동의합니다. (번호 원문은 구매자에게 공개하지 않아요)"}
          </span>
        </label>
        {shown("consent") && (
          <p role="alert" className="text-xs text-destructive">
            {shown("consent")}
          </p>
        )}
      </div>

      <Button className="h-11 w-full" onClick={handleSubmit} disabled={submitting || !isFormValid}>
        {submitting ? "신청 중..." : "판매자 신청"}
      </Button>
    </div>
  );
}
