"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { normalizeLicense } from "@/components/layer/upload/uploadEditorUtils";
import { LICENSE_OPTIONS } from "@/types/product.types";
import { cn } from "@/lib/utils";

interface LicenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  priceType: "free" | "paid";
  draftLicense: string;
  onDraftLicenseChange: (value: string) => void;
  onConfirm: (license: string) => void;
}

export function LicenseDialog({
  open,
  onOpenChange,
  priceType,
  draftLicense,
  onDraftLicenseChange,
  onConfirm,
}: LicenseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">라이선스 설정</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {LICENSE_OPTIONS.map((option) => {
            const selected = option.value === draftLicense;
            // 무료 상품은 "구매 후 부여된 이용 범위"를 전제로 하는 판권소유 라이선스와
            // 정책상 양립할 수 없다 — FREE 선택 시 이 옵션만 선택 불가 처리한다.
            const disabled = priceType === "free" && option.value === "all-rights-reserved";
            return (
              <div
                key={option.value}
                role="radio"
                aria-checked={selected}
                aria-disabled={disabled}
                tabIndex={disabled ? -1 : 0}
                onClick={() => {
                  if (disabled) return;
                  onDraftLicenseChange(option.value);
                }}
                onKeyDown={(e) => {
                  if (disabled) return;
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onDraftLicenseChange(option.value);
                  }
                }}
                className={cn(
                  "flex items-start justify-between gap-4 rounded-xl p-4",
                  selected ? "border-2 border-gf-orange" : "border border-gf-border",
                  disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                )}
              >
                <div className="space-y-1">
                  <p className="font-bold text-gf-black">
                    {option.label}
                    {disabled && (
                      <span className="ml-2 text-xs font-normal text-gf-gray2">
                        (무료 상품에는 적용 불가)
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gf-gray1">{option.description}</p>
                </div>
                {selected && (
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gf-orange text-white">
                    <Check className="size-4" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="bg-gf-white sm:justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-full bg-gf-bg px-6 font-bold text-gf-black hover:bg-gf-border"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm(normalizeLicense(draftLicense, priceType === "free"));
              onOpenChange(false);
            }}
            className="h-11 rounded-full px-6 font-bold"
          >
            선택
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
