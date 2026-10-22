"use client";

import { useState } from "react";
import { useRecoilState } from "recoil";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { quoteWizardAtom } from "@/store/atoms/quoteAtom";
import { submitQuoteAction } from "@/app/actions/submitQuoteAction";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  contact: z.string().min(1, "연락처를 입력해주세요"),
  email: z.string().email("올바른 이메일 형식이 아닙니다").or(z.literal("")).optional(),
  businessNumber: z.string().optional(),
  projectSummary: z.string().optional(),
  ref0: z.string().optional(),
  ref1: z.string().optional(),
  ref2: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Step04ContactInfoProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step04ContactInfo({ onNext, onBack }: Step04ContactInfoProps) {
  const [state, setState] = useRecoilState(quoteWizardAtom);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: state.contactInfo.name,
      contact: state.contactInfo.contact,
      email: state.contactInfo.email,
      businessNumber: state.contactInfo.businessNumber,
      projectSummary: state.contactInfo.projectSummary,
      ref0: state.contactInfo.referenceUrls[0],
      ref1: state.contactInfo.referenceUrls[1],
      ref2: state.contactInfo.referenceUrls[2],
    },
  });

  function formatPhoneNumber(digits: string): string {
    if (digits.startsWith("02")) {
      if (digits.length <= 2) return digits;
      if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
      if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
      return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
    }
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  }

  function handleContactChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (/[a-zA-Z_.]/.test(raw)) {
      setValue("contact", raw, { shouldValidate: true });
      return;
    }
    const digits = raw.replace(/\D/g, "");
    setValue("contact", formatPhoneNumber(digits), { shouldValidate: true });
  }

  async function onSubmit(values: FormValues) {
    const updatedState = {
      ...state,
      contactInfo: {
        name: values.name,
        contact: values.contact,
        email: values.email ?? "",
        businessNumber: values.businessNumber ?? "",
        projectSummary: values.projectSummary ?? "",
        referenceUrls: [values.ref0 ?? "", values.ref1 ?? "", values.ref2 ?? ""] as [
          string,
          string,
          string,
        ],
      },
    };

    setState(updatedState);

    // submissionId가 이미 있으면 중복 제출 방지
    if (state.submissionId) {
      onNext();
      return;
    }

    setIsSubmitting(true);
    try {
      let utmParams: Record<string, string> = {};
      try {
        const raw = sessionStorage.getItem("utm_params");
        if (raw) utmParams = JSON.parse(raw) as Record<string, string>;
      } catch {
        // corrupt sessionStorage value — proceed without UTM
      }
      const id = await submitQuoteAction(updatedState, { utmParams });
      setState((prev) => ({ ...prev, submissionId: id }));
      onNext();
    } catch {
      toast.error("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#ff5500]">
          STEP 04 / 05
        </p>
        <h2 className="text-2xl font-bold text-gray-900">연락처를 남겨주세요</h2>
        <p className="mt-2 text-sm text-gray-500">상담 연결을 위해 아래 정보를 입력해주세요.</p>
      </div>

      <div className="space-y-4">
        {/* 필수 */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            이름 <span className="text-[#ff5500]">*</span>
          </label>
          <input
            {...register("name")}
            placeholder="홍길동"
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]",
              errors.name ? "border-red-400" : "border-gray-200",
            )}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            연락처 <span className="text-[#ff5500]">*</span>
          </label>
          <input
            {...register("contact", { onChange: handleContactChange })}
            placeholder="010-0000-0000 또는 카카오톡 ID"
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]",
              errors.contact ? "border-red-400" : "border-gray-200",
            )}
          />
          {errors.contact && (
            <p className="mt-1 text-xs text-red-500">{errors.contact.message}</p>
          )}
        </div>

        {/* 선택 */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            이메일 <span className="font-normal text-gray-400">(선택)</span>
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="hello@example.com"
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]",
              errors.email ? "border-red-400" : "border-gray-200",
            )}
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            사업자명 / 브랜드명 <span className="font-normal text-gray-400">(선택)</span>
          </label>
          <input
            {...register("businessNumber")}
            placeholder="(주)가스펄픽스"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            프로젝트 소개 <span className="font-normal text-gray-400">(선택)</span>
          </label>
          <textarea
            {...register("projectSummary")}
            rows={3}
            placeholder="간단하게 프로젝트를 소개해주세요. 업종, 목적, 특별히 원하는 방향 등"
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            레퍼런스 URL <span className="font-normal text-gray-400">(선택 · 최대 3개)</span>
          </label>
          <div className="space-y-2">
            {([0, 1, 2] as const).map((i) => (
              <input
                key={i}
                {...register(`ref${i}`)}
                placeholder={`https://example.com (${i + 1})`}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#ff5500] focus:ring-1 focus:ring-[#ff5500]"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-40"
        >
          이전
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 rounded-xl bg-[#ff5500] py-4 text-sm font-bold text-white transition hover:bg-[#e04d00] disabled:opacity-40"
        >
          {isSubmitting ? "제출 중..." : "가견적서 보기 →"}
        </button>
      </div>
    </form>
  );
}
