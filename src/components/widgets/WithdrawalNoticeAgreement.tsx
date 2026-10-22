"use client";

import { Checkbox } from "@/components/ui/checkbox";
import LegalDialogTrigger from "@/components/legal/LegalDialogTrigger";
import { cn } from "@/lib/utils";

interface WithdrawalNoticeAgreementProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function WithdrawalNoticeAgreement({
  checked,
  onCheckedChange,
  className,
}: WithdrawalNoticeAgreementProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-2 rounded-xl border border-yellow-400 bg-yellow-50 p-3 text-xs leading-relaxed text-gf-gray1",
        className,
      )}
    >
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
      <span>
        <span aria-hidden="true">⚠️</span> 제작(용역) 제공이 개시된 이후에는 청약철회가 제한될
        수 있다는 안내를 확인하였으며 동의합니다. (
        <LegalDialogTrigger type="refund" className="text-gf-orange underline underline-offset-2">
          환불정책
        </LegalDialogTrigger>
        )
      </span>
    </label>
  );
}
